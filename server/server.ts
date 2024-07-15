import * as dotenv from 'dotenv';
import * as path from 'path';

if(process.env['APP_ENV'] !== 'PROD') {
  dotenv.config({
    path: path.resolve(__dirname, './config/.env')
  });
}

import { config } from './config/config';
import * as express from 'express';
import { rateLimit } from 'express-rate-limit';
import * as passport from 'passport';
import * as passportLocal from 'passport-local';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { default as helmet } from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as swagger from 'swagger-ui-express';
import * as swaggerDoc from './routes/swagger.json';
import { appApi } from './routes/api.routes';
import { errorHandler } from './util/error-handler';
import MongoHelper from './util/mongo-helper';
import AwsHelper from './util/aws-helper';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { IUserSchema } from './routes/user/user.interface';
import { ObjectId } from 'mongodb';

const LocalStrategy = passportLocal.Strategy;

const app = express();
app.set('trust proxy', 1);
app.disable("x-powered-by");

// limit apis to 100 requests per minute per ip
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100
});

// limit file system access requests to 500 requests per minute per ip
const fileSystemLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500
});

//*****************************************************
// Static files
//*****************************************************
app.use(express.static(path.join(path.resolve('.'), 'dist'), {
  setHeaders: (res: any, path: any, stat: any) => {
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }
}));

//*****************************************************
// Passport (passport and passport-local)
//*****************************************************
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username: string, password: any, done: any) => {
    const user = await MongoHelper.findOne<IUserSchema>('users', { username });
    done(null, user);
  }
));

passport.use(new JwtStrategy(
  { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.appSecret! },
  async (jwtPayload, done) => {
    const user = await MongoHelper.findOne<IUserSchema>('users', { _id: new ObjectId(jwtPayload._id) });
    done(null, user || undefined);
  }
));

passport.serializeUser((user: any, done: any) => {
  // delete sensitive info just in case
  delete user.hash;

  done(null, user);
});

passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});

//*****************************************************
//Parsers (body-parser)
//*****************************************************
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "connect-src": ["'self'", "*"],
      "default-src": ["'self'"],
      "font-src": ["'self'", "data:", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:"],
      "frame-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "script-src-attr": ["'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      "worker-src": ["'self'", "blob:"],
      upgradeInsecureRequests: null
    }
  },
  hsts: {
    includeSubDomains: true,
    preload: true,
    maxAge: 31536000
  },
  frameguard: {
    action: "deny"
  }
}));

//*****************************************************
// Setup passport sessions
//*****************************************************
app.use(passport.initialize());

//*****************************************************
// API Endpoints
//*****************************************************
app.use('/api', apiLimiter, appApi);
app.use('/api-docs', swagger.serve, swagger.setup(swaggerDoc));
app.use(errorHandler);

//*****************************************************
//send all other request to the Angular App
//*****************************************************
app.all('*', fileSystemLimiter, (req: any, res: any) => {
  res.sendFile(path.join(path.resolve('.'), 'dist/index.html'));
});

// check aws sqs every x hours only in prod
if(config.isProd) {
  setInterval(() => AwsHelper.checkQueues(), config.email.pollingIntervalHours * 60 * 60 * 1000);
}

process.on('uncaughtException', (err) => {
  console.log(err.stack);
});

//Set port
const port = process.env['PORT'] || '8081';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on port ${port}`));

module.exports = app;

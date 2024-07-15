import { IUserSchema } from 'server/routes/user/user.interface';

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: IUserSchema;
    }
  }
}

declare module 'express' {
  interface Request {
    user?: IUserSchema | Express.User;
  }
}

export const config = {
  appSecret: process.env['APP_SECRET'],
  isProd: process.env['APP_ENV'] === 'PROD',
  crypto: {
    rounds: 12 // calculations will be done 2^12 times
  },
  email: {
    superAdminEmail: process.env['EMAIL_SUPER_ADMIN_EMAIL'],
    server: process.env['EMAIL_SERVER'],
    username: process.env['EMAIL_USERNAME'],
    password: process.env['EMAIL_PASSWORD'],
    bounceUrl: process.env['EMAIL_BOUNCE_URL'],
    complaintsUrl: process.env['EMAIL_COMPLAINTS_URL'],
    supportUrl: process.env['EMAIL_SUPPORT_URL'],
    pollingIntervalHours: 12,
    supportAddress: process.env['EMAIL_SUPPORT_ADDRESS'],
    supportFrom: 'Angular Template Support',
    bounceSubject: 'Angular Template - Bounced email'
  },
  awsRegion: 'us-east-1',
  mongo: {
    connectionString: process.env['MONGO_CONNECTION_STR'],
    db: process.env['MONGO_DB']
  }
};

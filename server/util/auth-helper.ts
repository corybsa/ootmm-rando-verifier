import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as passport from 'passport';
import { config } from '../config/config';
import { IUserSchema } from '../routes/user/user.interface';
import * as Auth from '../routes/auth/auth.model';
import { ErrorState } from '../util/error-state';
import MongoHelper from '../util/mongo-helper';
import { IAuthRefSchema } from 'server/routes/auth/auth.interface';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

class AuthHelper {
  private static readonly JwtExpirationTime = '30m';

  public static readonly Roles = {
    Admin: 1,
    Member: 2,
    SuperAdmin: 5
  };

  /**
   * Get available user roles
   * @returns available user roles
   */
  getRoles(): typeof AuthHelper.Roles {
    return AuthHelper.Roles;
  }

  /**
   * Logs in a user.
   */
  login(req: Request, res: Response, next: Function) {
    passport.authenticate('local', { session: false }, (err: Error, user: IUserSchema, info: unknown) => {
      if(err || !user) {
        console.log(err, user, info);
        res.status(400).json({ message: '0xDEADBEEF: oops' });
        return;
      }

      Auth.login(req, res, (err: Error, user: IUserSchema) => {
        if(err) {
          res.status(500).json(err);
        } else {
          const token = AuthHelper.GenerateJwt(user._id.toString());
          res.status(200).json({ ...this.cleanUserData(user), token });
        }
      });
    })(req, res, next);
  }

  static GenerateJwt(userId: string): string {
    return jwt.sign({ _id: userId }, config.appSecret!, { expiresIn: AuthHelper.JwtExpirationTime });
  }

  /**
   * Refreshes the jwt token
   */
  refresh(req: Request, res: Response, next: Function) {
    const token = AuthHelper.GenerateJwt(req.body._id);
    res.status(200).json({ token });
  }

  /**
   * Creates a cookie that will be used to try to automatically log the user
   * in on their next visit.
   */
  createSessionCookie(user: IUserSchema, req: Request, res: Response, next: Function) {
    const prefs = req.cookies['prefs'];

    if(prefs) {
      const prefsJson = JSON.parse(req.cookies['prefs']);

      if(!prefsJson.saveFunctionalityCookies) {
        next(null, user);
        return;
      }
    }

    const selector = Math.floor(Math.random() * 1000000000000);
    const validator = this.generateCode(20);
    const cookie = `${selector}:${validator}`;

    this.hashPassword(validator, async (err: Error | null, hash: string) => {
      await MongoHelper.deleteMany<IAuthRefSchema>('authRef', { userId: new ObjectId(user._id) });
      await MongoHelper.insertOne<Partial<IAuthRefSchema>>('authRef', { userId: new ObjectId(user._id), selector, validator: hash });

      res.cookie('validator', cookie, {
        httpOnly: true,
        sameSite: true,
        secure: config.isProd
      });

      next(null, user);
    });
  }

  /**
   * Rotates the auto-login cookie.
   */
  updateSessionCookie(user: IUserSchema, req: Request, res: Response, next: Function) {
    const selector = req.cookies['validator'].split(':')[0];
    const validator = this.generateCode(20);
    const cookie = `${selector}:${validator}`;

    this.hashPassword(validator, async (err: Error | null, hash: string) => {
      await MongoHelper.updateOne<IAuthRefSchema>('authRef', { selector }, { $set: { validator } });

      res.cookie('validator', cookie, {
        httpOnly: true,
        sameSite: true,
        secure: config.isProd
      });

      req.user = user;

      next(null, req, res, next);
    });
  }

  /**
   * Checks if the auto-login cookie is present. If it is the user object
   * from the database is returned.
   */
  static async AttemptAutoLogin(req: Request, res: Response, next: Function): Promise<Response | void> {
    const selector = +req.cookies['validator'].split(':')[0];
    const validator = req.cookies['validator'].split(':')[1];
    
    const authRef = await MongoHelper.findOne<IAuthRefSchema>('authRef', { selector });

    if(!authRef) {
      return res.status(403).json(null);
    }
    
    bcrypt.compare(validator, authRef?.validator, async (err, success) => {
      if(err || !success) {
        AuthHelper.Logout(req, res, true);
      } else {
        const user = await MongoHelper.findOne<IUserSchema>('users', { _id: authRef.userId });

        if(!user) {
          AuthHelper.Logout(req, res, true);
        } else {
          req.body.password = ' ';
          
          passport.authenticate('local', { session: false }, (err: Error, user: IUserSchema, info: unknown) => {
            if(err || info || !user) {
              next(err || info);
            } else {
              req.login(user, { session: false }, (err) => {
                if(err) {
                  next(err);
                } else {
                  const token = AuthHelper.GenerateJwt(req.body._id);
                  res.setHeader('refresh-token', token);
                  next(null, req, res, next);
                }
              });
            }
          })(req, res, next);
        }
      }
    });
  }

  /**
   * Clears cookies and logs out of the passport session.
   */
  static Logout(req: Request, res: Response, fromAutoLogin: boolean) {
    if(req.logout) {
      req.logout(() => { });
    }

    res.clearCookie('validator', { httpOnly: true });
    res.clearCookie('sessionId', { httpOnly: true });
    res.clearCookie('cusId', { httpOnly: true });

    if(fromAutoLogin) {
      res.status(204);
    } else {
      res.status(200).json(null);
    }
  }

  /**
   * Clears cookies and logs out of the passport session.
   */
  logout(req: Request, res: Response, fromAutoLogin: boolean) {
    AuthHelper.Logout(req, res, fromAutoLogin);
  }

  /**
   * Removes sensitive data from user object.
   */
  cleanUserData(user: IUserSchema) {
    delete user.hash;
    delete user.passwordResetCode;

    return Object.assign({}, user);
  }

  /**
   * Shuffle a string.
   */
  shuffleString(str: string): string {
    const strArray = str.split('');
    const length = strArray.length;

    for(let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * (i + 1));
      let temp = strArray[i];
      strArray[i] = strArray[index];
      strArray[index] = temp;
    }

    return strArray.join('');
  }

  /**
   * Generates a code of numbers and letters
   */
  generateCode(length: number = 6): string {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    return this.shuffleString(str).substring(0, length);
  }

  /**
   * Hashes a password using bcrypt.
   */
  hashPassword(password: string, callback: (err: Error | null, hash: string) => void) {
    bcrypt.hash(password, config.crypto.rounds, callback);
  }

  /**
   * Verifies a password against a hash.
   */
  verifyPassword(password: string, hash: string, callback: (err: Error | null, success: boolean) => void) {
    bcrypt.compare(password, hash, callback);
  }

  /**
   * Checks if the user is logged in and has a valid session.
   */
  isAuthenticated(req: Request, res: Response, next: Function): any {
    passport.authenticate('jwt', { session: false }, async (err: Error, user: IUserSchema, info: { name: string, message: string }) => {
      if(info?.name === 'TokenExpiredError') {
        if(req.cookies['validator']) {
          await AuthHelper.AttemptAutoLogin(req, res, next);
          return;
        }
      }

      if(!user) {
        return next({ state: ErrorState.UserNotLoggedIn, message: 'Session expired' }, null);
      } else {
        req.user = user;
        next(null, req, res, next);
      }
    })(req, res, next);
  }

  /**
   * Checks if the user has admin role.
   */
  hasAdminRole(req: Request, res: Response, next: Function) {
    const user = req.user as IUserSchema;

    if(user.userRoleId !== AuthHelper.Roles.Admin && user.userRoleId !== AuthHelper.Roles.SuperAdmin) {
      throw {
        state: ErrorState.WrongRole,
        message: 'You don\'t have access to this feature.'
      };
    } else {
      next();
    }
  }

  /**
   * Checks if the user has super admin role.
   */
  hasSuperAdminRole(req: Request, res: Response, next: Function) {
    const user = req.user as IUserSchema;

    if(+user.userRoleId !== AuthHelper.Roles.SuperAdmin) {
      throw {
        state: ErrorState.WrongRole,
        message: 'You don\'t have access to this feature.'
      };
    } else {
      next();
    }
  }
}

export default new AuthHelper();

import { Request, Response } from 'express';
import AuthHelper from '../../util/auth-helper';
import { IUserSchema } from '../user/user.interface';
import MongoHelper from '../../util/mongo-helper';
import { ErrorState } from '../../util/error-state';
import { ObjectId } from 'mongodb';
import { IAuthRefSchema } from './auth.interface';

export const login = async (req: Request, res: Response, next: Function) => {
  try {
    const rememberMe = !!req.body.rememberMe;
    const user = await MongoHelper.findOne<IUserSchema>('users', { username: req.body.username });

    if(!user) {
      return next({ message: 'Invalid username or password.' }, null);
    }

    AuthHelper.verifyPassword(req.body.password, user.hash!, async (err: Error | null, success: boolean) => {
      if(err) {
        next(err, null);
      } else if(!success) {
        next({ message: 'Invalid username or password' }, null);
      } else {
        // logged in successfully

        // if the passwordResetCode is set that means there was a password reset request
        // but since the user logged in that means they remembered their password
        // since they remembered their password they don't need to reset it anymore
        // so we'll clear passwordResetCode
        await MongoHelper.updateOne<IUserSchema>(
          'users',
          { _id: user._id },
          {
            $set: { passwordResetCode: undefined }
          }
        );

        if(rememberMe) {
          AuthHelper.createSessionCookie(user, req, res, next);
        } else {
          next(null, user);
        }
      }
    });
  } catch(e) {
    next(e, null);
  }
};

export const register = async (req: Request, next: Function) => {
  try {
    if(req.body.password.length < 8) {
      next({ message: 'Password must be at least 8 characters long' }, null);
    }

    if(req.body.password !== req.body.confirmPassword) {
      next({ message: 'Passwords do no match.' }, null);
    }

    const existingUser = await MongoHelper.findOne<IUserSchema>('users', { username: req.body.username });

    if(existingUser) {
      throw { message: 'Username is in use.', state: ErrorState.UsernameInUse };
    }

    const existingEmail = await MongoHelper.findOne<IUserSchema>('users', { email: req.body.email });

    if(existingEmail) {
      throw { message: 'Email is in use.', state: ErrorState.UsernameInUse };
    }

    AuthHelper.hashPassword(req.body.password, async (err: Error | null, hash: string) => {
      const userId = new ObjectId();
      const newUser: IUserSchema = {
        _id: userId,
        username: req.body.username,
        hash,
        email: req.body.email,
        userRoleId: AuthHelper.getRoles().Member,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        lastLoggedIn: new Date()
      };
  
      await MongoHelper.insertOne<IUserSchema>('users', newUser);

      const userRes = await MongoHelper.findOne<IUserSchema>('users', { _id: userId });

      next(null, userRes);
    });
  } catch(e) {
    next(e, null);
  }
};

export const logout = async (req: Request, res: Response, next: Function) => {
  try {
    const selector = req.cookies['validator']?.split(':')[0];

    if(selector) {
      await MongoHelper.deleteOne<IAuthRefSchema>('authRef', { selector });
    }
    
    AuthHelper.logout(req as Request, res, false);
  } catch(e) {
    next(e, null);
  }
};

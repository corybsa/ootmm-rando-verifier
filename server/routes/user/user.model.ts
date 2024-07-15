import AwsHelper from '../../util/aws-helper';
import AuthHelper from '../../util/auth-helper';
import { Request } from 'express';
import { IUserSchema } from './user.interface';
import { ObjectId } from 'mongodb';
import MongoHelper from '../../util/mongo-helper';
import { ErrorState } from '../../util/error-state';

const fs = require('fs');
const path = require('path');

export const forgotPassword = async (req: Request, next: Function) => {
  try {
    const code = AuthHelper.generateCode(16);
    const to = req.body.email;
    const user = await MongoHelper.findOne<IUserSchema>('users', { email: to });

    if(!user) {
      throw { state: ErrorState.Other, message: 'Email not found.' };
    }

    const update = await MongoHelper.updateOne<IUserSchema>(
      'users',
      { _id: new ObjectId(user._id) },
      {
        $set: {
          passwordResetCode: code
        }
      }
    );

    if(update.modifiedCount > 0) {
      const subject = 'Angular Template - Forgot password';
      let email = fs.readFileSync(path.resolve(__dirname, '../../email-templates/forgot-password.html'), 'utf8');
      email = email.replace('##PASSWORD_TOKEN##', code);

      AwsHelper.sendEmail(to, subject, email);
    }

    next(null, {});
  } catch(e) {
    next(e, null);
  }
};

export const resetPassword = async (req: Request, next: Function) => {
  try {
    const code = req.body.code;
    const password = req.body.password;
    const user = await MongoHelper.findOne<IUserSchema>('users', { passwordResetCode: code });

    if(!user) {
      throw { state: ErrorState.Other, message: 'Invalid code. Please contact an admin.' };
    }

    AuthHelper.hashPassword(password, async (err: Error | null, hash: string) => {
      if(!err) {
        const update = await MongoHelper.updateOne<IUserSchema>(
          'users',
          { _id: new ObjectId(user._id) },
          {
            $set: {
              passwordResetCode: undefined,
              hash
            }
          }
        );

        if(update.modifiedCount > 0) {
          const to = user.email;
          const subject = 'Angular Template - Password reset';
          let email = fs.readFileSync(path.resolve(__dirname, '../../email-templates/reset-password.html'), 'utf8');
          
          AwsHelper.sendEmail(to, subject, email);

          next(null, { email: user.email });
        } else {
          next({ message: 'Something went wrong. Please contact an admin.', state: ErrorState.Other });
        }
      } else {
        next({ message: err }, null);
      }
    });
  } catch(e) {
    next(e, null);
  }
};

import { Router } from 'express';
import * as Users from './user.model';

const userEndpoints = Router();

userEndpoints.post('/forgot-password', (req, res, next) => {
  Users.forgotPassword(req, (err: Error, data: {}) => {
    if(!err) {
      res.status(200).json(data);
    } else {
      next(err);
    }
  });
});

userEndpoints.post('/reset-password', (req, res, next) => {
  Users.resetPassword(req, (err: Error, data: { email: string }) => {
    if(!err) {
      res.status(200).json(data);
    } else {
      next(err);
    }
  });
});

export default userEndpoints;

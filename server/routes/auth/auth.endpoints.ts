import { Request, Router } from 'express';
import AuthHelper from '../../util/auth-helper';
import * as Auth from './auth.model';

const authEndpoints = Router();

authEndpoints.post('/login', (req: Request, res, next) => {
  AuthHelper.login(req, res, next);
});

authEndpoints.post('/refresh', (req, res, next) => {
  AuthHelper.refresh(req, res, next);
});

authEndpoints.post('/register', (req, res, next) => {
  Auth.register(req as Request, (err: Error) => {
    if(!err) {
      AuthHelper.login(req as Request, res, next);
    } else {
      next(err);
    }
  });
});

authEndpoints.post('/logout', (req, res, next) => {
  Auth.logout(req, res, next);
});

export default authEndpoints;

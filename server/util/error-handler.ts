import { ErrorState } from './error-state';
import { Request, Response } from 'express';

interface IError {
  code: string;
  message: string;
  state: number;
}

export const errorHandler = async (err: IError, req: Request, res: Response, next: Function): Promise<any> => {
  if(err) {
    if(err.state) {
      switch(err.state) {
        case ErrorState.UsernameInUse:
        case ErrorState.InvalidParameter:
          return res.status(400).json({ message: err.message });
        case ErrorState.UserIsInactive:
          req.logout(() => {});
          res.clearCookie('sessionId', { httpOnly: true });
          return res.status(403).json({ message: err.message });
        case ErrorState.WrongRole:
          return res.status(401).json({ message: err.message });
        case ErrorState.UserNotLoggedIn:
          return res.status(440).json(null);
        case ErrorState.Other:
        default:
          return res.status(500).json({ message: err.message.toString() });
      }
    } else {
      return res.status(500).json({ message: err.message ?? 'Something went wrong.' });
    }
  } else {
    next();
  }
};

import { createAction, props } from '@ngrx/store';
import { IUser } from 'src/app/models/user/user';

export const userActions = {
  setCurrentUser: createAction('[User] Set Current User', props<{ user?: IUser }>()),
  userLogin: createAction('[User] Login', props<{ username: string, password: string, rememberMe: boolean }>()),
  userRegister: createAction('[User] Register', props<{ username: string, password: string, confirmPassword: string, email: string, firstname: string, lastname: string }>()),
};

import { createReducer, on } from '@ngrx/store';
import { Helper } from 'src/app/models/helper';
import { IUser } from 'src/app/models/user/user';
import { userActions } from './user.actions';

export interface IUserState {
  current?: IUser;
}

export const initialState: IUserState = {
  current: undefined
};

export const userReducer = createReducer(
  initialState,
  on(userActions.setCurrentUser, (state, { user }) => {
    const newState: IUserState = Helper.copy(state);
    newState.current = user;
    return newState;
  })
);

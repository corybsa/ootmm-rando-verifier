import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IUserState } from './user.reducer';

export const userSelectors = {
  currentUser: createSelector(createFeatureSelector<IUserState>('user'), (user) => user.current),
  currentUserRole: createSelector(createFeatureSelector<IUserState>('user'), (user) => user.current?.userRoleId)
};

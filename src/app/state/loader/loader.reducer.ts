import { createReducer, on } from '@ngrx/store';
import { Helper } from 'src/app/models/helper';
import { loaderActions } from './loader.actions';

export interface LoaderState {
  fullRequests: number;
  smallRequests: number;
}

export const initialState: LoaderState = {
  fullRequests: 0,
  smallRequests: 0
};

export const loaderReducer = createReducer(
  initialState,
  on(loaderActions.showFullScreenLoader, (state, { show }) => {
    const newState: LoaderState = Helper.copy(state);
    newState.fullRequests += show ? 1 : -1;
    newState.fullRequests = Math.max(0, newState.fullRequests);
    return newState;
  }),
  on(loaderActions.showSmallLoader, (state, { show }) => {
    const newState: LoaderState = Helper.copy(state);
    newState.smallRequests += show ? 1 : -1;
    newState.smallRequests = Math.max(0, newState.smallRequests);
    return newState;
  })
);

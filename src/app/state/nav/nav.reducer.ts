import { createReducer, on } from '@ngrx/store';
import { Helper } from 'src/app/models/helper';
import { navActions } from './nav.actions';

export interface NavState {
  show: boolean;
}

export const initialState: NavState = {
  show: false
};

export const navReducer = createReducer(
  initialState,
  on(navActions.showNavPanel, (state, { show }) => {
    const newState: NavState = Helper.copy(state);
    newState.show = show;
    return newState;
  })
);

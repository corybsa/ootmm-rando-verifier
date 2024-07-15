import { createAction, props } from '@ngrx/store';

export const navActions = {
  showNavPanel: createAction('[Nav] Show Nav', props<{ show: boolean }>())
};

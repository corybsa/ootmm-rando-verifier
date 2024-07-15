import { createAction, props } from '@ngrx/store';

export const loaderActions = {
  showFullScreenLoader: createAction('[Loader] Set Full Screen Status', props<{ show: boolean }>()),
  showSmallLoader: createAction('[Loader] Set Small Status', props<{ show: boolean }>())
};

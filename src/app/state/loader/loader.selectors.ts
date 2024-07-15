import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoaderState } from './loader.reducer';

export const loaderSelectors = {
  fullRequests: createSelector(createFeatureSelector<LoaderState>('loader'), (loader) => loader.fullRequests),
  smallRequests: createSelector(createFeatureSelector<LoaderState>('loader'), (loader) => loader.smallRequests)
};

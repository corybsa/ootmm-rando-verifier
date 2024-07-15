import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NavState } from './nav.reducer';

export const navSelectors = {
  show: createSelector(createFeatureSelector<NavState>('nav'), (nav) => nav.show)
};

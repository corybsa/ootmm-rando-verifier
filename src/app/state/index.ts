import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { loaderReducer, LoaderState } from './loader/loader.reducer';
import { navReducer, NavState } from './nav/nav.reducer';
import { userReducer, IUserState } from './user/user.reducer';

export interface AppState {
  nav: NavState;
  user: IUserState;
  loader: LoaderState;
}

export const reducers: ActionReducerMap<AppState> = {
  nav: navReducer,
  user: userReducer,
  loader: loaderReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

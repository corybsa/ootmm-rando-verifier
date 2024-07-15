import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, mergeMap, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UserService } from 'src/app/services/user/user.service';
import { loaderActions } from '../loader/loader.actions';
import { userActions } from './user.actions';

@Injectable()
export class UserEffects {
  actions = inject(Actions);
  authService = inject(AuthService);
  userService = inject(UserService);
  store = inject(Store);
  router = inject(Router);

  login = createEffect(() => this.actions.pipe(
    ofType(userActions.userLogin),
    tap(() => this.store.dispatch(loaderActions.showFullScreenLoader({ show: true }))),
    mergeMap(data => {
      return this.authService.login(data.username, data.password, data.rememberMe).pipe(
        map(user => userActions.setCurrentUser({ user }))
      );
    }),
    tap(user => {
      if(user) {
        this.router.navigateByUrl('/home');
      }

      this.store.dispatch(loaderActions.showFullScreenLoader({ show: false }));
    })
  ));

  register = createEffect(() => this.actions.pipe(
    ofType(userActions.userRegister),
    tap(() => this.store.dispatch(loaderActions.showFullScreenLoader({ show: true }))),
    mergeMap(data => this.userService.register(
      data.username,
      data.password,
      data.confirmPassword,
      data.email,
      data.firstname,
      data.lastname
      ).pipe(
      map(user => userActions.setCurrentUser({ user }))
    )),
    tap(user => {
      this.store.dispatch(loaderActions.showFullScreenLoader({ show: false }));
      this.router.navigateByUrl('/home');
    })
  ));
}

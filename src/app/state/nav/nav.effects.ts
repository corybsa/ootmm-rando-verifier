import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, of } from 'rxjs';
import { navActions } from './nav.actions';

@Injectable()
export class NavEffects {
  toggleNav = createEffect(() => this.actions.pipe(
    ofType(navActions.showNavPanel),
    mergeMap(data => {
      if(data.show) {
        this.router.navigate([{ outlets: { nav: 'nav-main' } }]);
      } else {
        this.router.navigate([{ outlets: { nav: null } }]);
      }

      return of({ type: 'toggled nav' });
    })
  ));

  constructor(
    private actions: Actions,
    private router: Router
  ) {}
}

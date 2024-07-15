import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IUser } from 'src/app/models/user/user';
import { EUserRoles } from 'src/app/models/user/user-roles';
import { userSelectors } from 'src/app/state/user/user.selectors';
import { navActions } from '../../state/nav/nav.actions';
import { navSelectors } from '../../state/nav/nav.selectors';
import * as moment from 'moment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  store = inject(Store);

  show$ = this.store.select(navSelectors.show).pipe(takeUntilDestroyed());
  user$ = this.store.select(userSelectors.currentUser).pipe(takeUntilDestroyed());

  currentUrl = '';

  isChristmas = moment.utc().month() === 11;

  ngOnInit(): void {
    this.currentUrl = this.router.url.replace(/\(.+\)/gi, '');

    this.router.events.subscribe(res => {
      if(res instanceof NavigationEnd) {
        const children = this.route.snapshot.children;
        let isNavOpen = false;
        
        for(let child of children) {
          if(child.outlet === 'nav') {
            isNavOpen = true;
          }
        }

        const newUrl = res.url.replace(/\(.+\)/gi, '');

        // close nav on nav item click
        if(this.currentUrl !== newUrl) {
          isNavOpen = false;
        }

        this.currentUrl = newUrl;

        this.store.dispatch(navActions.showNavPanel({ show: isNavOpen }));
      }
    });
  }

  showHamburger(user: IUser) {
    return !!user;
  }

  openDrawer() {
    this.store.dispatch(navActions.showNavPanel({ show: true }));
  }

  closeDrawer() {
    this.store.dispatch(navActions.showNavPanel({ show: false }));
  }
}

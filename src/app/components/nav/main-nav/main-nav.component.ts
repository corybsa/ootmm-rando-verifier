import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { EUserRoles } from 'src/app/models/user/user-roles';
import { AuthService } from 'src/app/services/auth/auth.service';
import { userSelectors } from 'src/app/state/user/user.selectors';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  store =inject(Store);
  authService =inject(AuthService);

  user$ = this.store.select(userSelectors.currentUser).pipe(takeUntilDestroyed());

  roles = EUserRoles;

  logout() {
    this.authService.logout().subscribe();
  }
}

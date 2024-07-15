import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from 'src/app/services/auth/auth.service';
import { userActions } from 'src/app/state/user/user.actions';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {
  @Input() showBack = true;

  router = inject(Router);
  authService = inject(AuthService);
  store = inject(Store);

  ngOnInit(): void {
    const user = this.authService.isLoggedIn();

    if(!user) {
      this.showBack = false;
    } else {
      this.store.dispatch(userActions.setCurrentUser({ user }));
    }
  }

  back() {
    this.router.navigateByUrl('/settings');
  }
}

import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppComponent } from 'src/app/app.component';
import { userSelectors } from 'src/app/state/user/user.selectors';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  @ViewChild('cookiePreferencesDialogRef') cookiePreferencesDialogRef!: TemplateRef<any>;

  store = inject(Store);
  router = inject(Router);
  dialogRef = inject(MatDialog);

  user$ = this.store.select(userSelectors.currentUser).pipe(takeUntilDestroyed());

  editCookies() {
    this.dialogRef.open(this.cookiePreferencesDialogRef);
  }
  
  viewPrivacyPolicy() {
    this.router.navigateByUrl('/legal/privacy');
  }

  viewCookiePolicy() {
    this.router.navigateByUrl('/legal/cookies');
  }

  viewTermsOfUse() {
    this.router.navigateByUrl('/legal/terms-of-use');
  }

  viewDisclaimer() {
    this.router.navigateByUrl('/legal/disclaimer');
  }

  submitDsar() {
    window.location.href = 'https://app.termly.io/notify/21747064-79f3-4373-8daa-090f67164a1e';
  }

  toggleDarkMode() {
    AppComponent.toggleDarkMode();
  }
}

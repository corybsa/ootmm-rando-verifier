import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CookiePreferencesComponent } from '../cookie-preferences/cookie-preferences.component';

@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {
  dialogRef = inject(MatDialog);

  private _showBanner = true;

  hasDecided = false;
  isPreferencesChanged = false;

  set showBanner(value: boolean) {
    this._showBanner = value;
  }
  
  get showBanner() {
    if(!this._showBanner) {
      return false;
    }

    return !this.hasDecided;
  }

  @ViewChild('cookiePolicyDialogRef') cookiePolicyDialogRef!: TemplateRef<any>;
  @ViewChild('cookiePreferencesDialogRef') cookiePreferencesDialogRef!: TemplateRef<any>;

  ngOnInit(): void {
    this.hasDecided = CookiePreferencesComponent.HasPrefs();
  }

  hideBanner(e: any) {
    const target = e.target;

    if(target.classList.contains('banner-backdrop')) {
      CookiePreferencesComponent.DeclineAll();
      this.showBanner = false;
    }
  }

  reset(preferences: CookiePreferencesComponent) {
    preferences.reset();
    this.isPreferencesChanged = false;
  }

  onCookiePreferenceChange() {
    this.isPreferencesChanged = true;
  }

  openCookiePolicy() {
    this.dialogRef.open(this.cookiePolicyDialogRef, {
      panelClass: 'full-screen-dialog'
    });
  }

  openPreferences() {
    this.dialogRef.open(this.cookiePreferencesDialogRef);
  }

  declineCookies() {
    CookiePreferencesComponent.DeclineAll();
    this.showBanner = false;
  }

  acceptCookies() {
    CookiePreferencesComponent.AcceptAll();
    this.showBanner = false;
  }
}

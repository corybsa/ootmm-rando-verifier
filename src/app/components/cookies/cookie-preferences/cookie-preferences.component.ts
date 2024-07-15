import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cookie-preferences',
  templateUrl: './cookie-preferences.component.html',
  styleUrls: ['./cookie-preferences.component.scss']
})
export class CookiePreferencesComponent implements OnInit {
  public static readonly CookiePreferencesKey = 'cookiePreferences';

  dialogRef = inject(MatDialog);

  cookiePrefs = {
    saveFunctionalityCookies: true,
    saveAnalyticCookies: true,
    saveAdvertisingCookies: true,
    saveSocialNetworkingCookies: true,
    saveUnclassifiedCookies: true
  };

  @ViewChild('cookiePolicyDialogRef') cookiePolicyDialogRef!: TemplateRef<any>;
  @ViewChild('privacyPolicyDialogRef') privacyPolicyDialogRef!: TemplateRef<any>;
  @ViewChild('essentialCookiesDialogRef') essentialCookiesDialogRef!: TemplateRef<any>;
  @ViewChild('functionalCookiesDialogRef') functionalCookiesDialogRef!: TemplateRef<any>;
  @ViewChild('otherCookiesDialogRef') otherCookiesDialogRef!: TemplateRef<any>;

  @Output() change = new EventEmitter();

  essentialCookies = [
    {
      name: 'prefs',
      purpose: 'To save user cookie preferences.',
      type: 'first party',
      expires: 'Never'
    },
    {
      name: 'cusId',
      purpose: 'To make the registration process smoother.',
      type: 'first party',
      expires: '5 minutes'
    }
  ];

  functionalCookies = [
    {
      name: 'validator',
      purpose: 'To attempt to automatically log the user in if they chose the \'Stay logged in\' option when logging in.',
      type: 'http',
      expires: 'When the browsing session ends'
    }
  ];

  ngOnInit(): void {
    const cookie = CookiePreferencesComponent.GetPrefsCookie();
    let prefs;

    if(cookie) {
      prefs = JSON.parse(cookie);

      this.cookiePrefs = prefs;
    } else {
      this.cookiePrefs.saveFunctionalityCookies = true;
      this.cookiePrefs.saveAnalyticCookies = true;
      this.cookiePrefs.saveAdvertisingCookies = true;
      this.cookiePrefs.saveSocialNetworkingCookies = true;
      this.cookiePrefs.saveUnclassifiedCookies = true;
    }
  }

  public static Init() {
    const cookie = this.GetPrefsCookie();
    let prefs;

    if(cookie) {
      prefs = JSON.parse(cookie);
    } else {
      CookiePreferencesComponent.AcceptAll();
    }
  }

  private static GetPrefsCookie() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; prefs=`);
    let res = '';

    if(parts.length === 2) {
      res = parts.pop()!.split(';').shift()!;
    }

    return res;
  }

  public static HasPrefs(): boolean {
    return this.GetPrefsCookie() !== '';
  }

  public static AcceptAll() {
    const prefs = {
      saveFunctionalityCookies: true,
      saveAnalyticCookies: true,
      saveAdvertisingCookies: true,
      saveSocialNetworkingCookies: true,
      saveUnclassifiedCookies: true
    };

    this.SavePrefsCookie(prefs);
  }

  public static DeclineAll() {
    const prefs = {
      saveFunctionalityCookies: false,
      saveAnalyticCookies: false,
      saveAdvertisingCookies: false,
      saveSocialNetworkingCookies: false,
      saveUnclassifiedCookies: false
    };

    this.SavePrefsCookie(prefs);
  }

  public static SavePrefsCookie(prefs: any) {
    document.cookie = `prefs=${JSON.stringify(prefs)};path=/;expires=Fri, 31 Dec 9999 23:59:59 GMT;secure`;
  }

  openCookiePolicy() {
    this.dialogRef.open(this.cookiePolicyDialogRef, {
      panelClass: 'full-screen-dialog'
    });
  }

  openPrivacyPolicy() {
    this.dialogRef.open(this.privacyPolicyDialogRef, {
      panelClass: 'full-screen-dialog'
    });
  }

  openEssentialCookiesDetails() {
    this.dialogRef.open(this.essentialCookiesDialogRef);
  }

  openFunctionalCookiesDetails() {
    this.dialogRef.open(this.functionalCookiesDialogRef);
  }

  openOtherCookiesDetails() {
    this.dialogRef.open(this.otherCookiesDialogRef);
  }

  reset() {
    this.cookiePrefs.saveFunctionalityCookies = true;
    this.cookiePrefs.saveAnalyticCookies = true;
    this.cookiePrefs.saveAdvertisingCookies = true;
    this.cookiePrefs.saveSocialNetworkingCookies = true;
    this.cookiePrefs.saveUnclassifiedCookies = true;
    this.onChange();
  }

  acceptAll() {
    this.reset();
  }

  declineAll() {
    this.cookiePrefs.saveFunctionalityCookies = false;
    this.cookiePrefs.saveAnalyticCookies = false;
    this.cookiePrefs.saveAdvertisingCookies = false;
    this.cookiePrefs.saveSocialNetworkingCookies = false;
    this.cookiePrefs.saveUnclassifiedCookies = false;
    this.onChange();
  }

  onChange() {
    CookiePreferencesComponent.SavePrefsCookie(this.cookiePrefs);

    this.change.emit();
  }
}

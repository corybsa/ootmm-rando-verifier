import { AfterContentInit, Component, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { CookiePreferencesComponent } from './components/cookies/cookie-preferences/cookie-preferences.component';
import { IUser } from './models/user/user';
import { userSelectors } from './state/user/user.selectors';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentInit {
  private static readonly DarkModeKey = 'darkMode';
  
  updates = inject(SwUpdate);
  snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  store = inject(Store);

  user$ = this.store.select(userSelectors.currentUser).pipe(takeUntilDestroyed());

  @HostListener('mousemove')
  detectUserInput() {
    const isActivityResumed = AuthService.SetUserIsActive();
    
    if(isActivityResumed) {
      this.authService.refresh().subscribe();
    }
  }

  ngOnInit() {
    AuthService.SetUserIsActive();
    CookiePreferencesComponent.Init();

    this.updates.versionUpdates.subscribe(event => {
      if(event.type === 'VERSION_READY') {
        this.snackBar.open('Update available', 'Refresh').onAction().subscribe(() => {
          this.updates.activateUpdate().then(() => {
            document.location.reload();
          });
        });
      }
    });
  }

  ngAfterContentInit(): void {
    AppComponent.applyDarkMode();
  }

  showBottomBar(user: IUser) {
    return !!user;
  }

  public static toggleDarkMode() {
    const darkMode = (window.localStorage.getItem(AppComponent.DarkModeKey) ?? 'off') === 'off' ? 'on' : 'off';
    window.localStorage.setItem(AppComponent.DarkModeKey, darkMode);
    this.applyDarkMode(darkMode);
  }

  public static applyDarkMode(darkMode?: string): void {
    darkMode = darkMode || (window.localStorage.getItem(AppComponent.DarkModeKey) ?? 'off');

    if(darkMode === 'on') {
      document.querySelector('body')?.classList.add('dark-mode');
    } else {
      document.querySelector('body')?.classList.remove('dark-mode');
    }
  }
}

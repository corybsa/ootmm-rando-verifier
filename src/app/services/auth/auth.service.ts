import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable, of, tap } from 'rxjs';
import { Helper } from 'src/app/models/helper';
import { IUser } from 'src/app/models/user/user';
import { userActions } from 'src/app/state/user/user.actions';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private router = inject(Router);

  private static JwtKey = 'jwt';
  private static UserKey = 'user';
  private static StayLoggedInKey = 'stayLoggedIn';
  private static IsUserActive = false;
  private static InactivityTimeout: number;
  private static TimeoutTime = 1 * 60000; // 1 minute
  private static TokenExpirationPadding = 10 * 60000; // 10 minutes

  public static GetJwt(): string {
    return localStorage.getItem(AuthService.JwtKey) || '';
  }

  public static SetJwt(value: string = ''): void {
    localStorage.setItem(AuthService.JwtKey, value);
  }

  public static RemoveJwt(): void {
    localStorage.removeItem(AuthService.JwtKey);
  }

  public static GetUser(): IUser {
    return JSON.parse(localStorage.getItem(AuthService.UserKey) || 'null');
  }

  public static SetUser(value: IUser): void {
    localStorage.setItem(AuthService.UserKey, JSON.stringify(value));
  }

  public static RemoveUser(store?: Store): void {
    localStorage.removeItem(AuthService.UserKey);

    if(store) {
      store.dispatch(userActions.setCurrentUser({ user: undefined }));
    }
  }

  public static ClearCredentials(store?: Store): void {
    AuthService.RemoveJwt();
    AuthService.RemoveUser(store);
    AuthService.RemoveStayLoggedIn();
  }

  public static SetUserIsActive(): boolean {
    let res = false;

    // going from false to true
    if(!AuthService.IsUserActive && AuthService.GetUser() && !AuthService.IsTokenAboutToExpire()) {
      res = true;
    }

    AuthService.IsUserActive = true;
    window.clearTimeout(AuthService.InactivityTimeout);

    AuthService.InactivityTimeout = window.setTimeout(() => {
      AuthService.IsUserActive = false;
    }, AuthService.TimeoutTime);

    return res;
  }

  public static IsTokenAboutToExpire(): boolean {
    const token = new JwtHelperService().decodeToken(AuthService.GetJwt());
    const tokenExpPad = moment.utc(token.exp * 1000).subtract(AuthService.TokenExpirationPadding, 'milliseconds');

    return moment.utc().isSameOrAfter(tokenExpPad);
  }

  public static SetStayLoggedIn(value: boolean): void {
    localStorage.setItem(AuthService.StayLoggedInKey, value ? value.toString() : '');
  }

  public static GetStayLoggedIn(): boolean {
    return Boolean(localStorage.getItem(AuthService.StayLoggedInKey));
  }

  public static RemoveStayLoggedIn(): void {
    localStorage.removeItem(AuthService.StayLoggedInKey);
  }

  public isLoggedIn(): IUser | null {
    const user = AuthService.GetUser();

    return user;
  }

  login(username: string, password: string, rememberMe: boolean): Observable<IUser> {
    const url = '/api/auth/login';
    const options = {
      username,
      password,
      rememberMe
    };

    AuthService.SetStayLoggedIn(rememberMe);

    return this.http.post<IUser>(url, options).pipe(
      tap(res => {
        AuthService.SetJwt(res.token);
        const user: IUser = Helper.copy(res);
        delete user.token;
        AuthService.SetUser(user);
      })
    );
  }

  refresh(): Observable<{ token: string }> {
    const url = '/api/auth/refresh';
    const options = {
      _id: AuthService.GetUser()._id
    };

    return this.http.post<{ token: string }>(url, options).pipe(
      tap(res => {
        AuthService.SetJwt(res.token);
      })
    );
  }

  logout(): Observable<null> {
    const url = '/api/auth/logout';

    return this.http.post<null>(url, null).pipe(
      tap(() => {
        AuthService.ClearCredentials();
        this.store.dispatch(userActions.setCurrentUser({ user: undefined }));
        this.router.navigateByUrl('/auth/login');
      })
    );
  }
}

import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
import { Helper } from '../models/helper';
import { loaderActions } from '../state/loader/loader.actions';
import { userActions } from '../state/user/user.actions';
import { AuthService } from './auth/auth.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private store = inject(Store);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`
      }
    });

    return next.handle(req).pipe(
      tap((res: HttpEvent<any>) => {
        if(res.type === HttpEventType.Response) {
          const refreshToken = res.headers.get('refresh-token');

          if(refreshToken) {
            AuthService.SetJwt(refreshToken);
          }
        }
      }),
      catchError(err => {
        this.store.dispatch(loaderActions.showFullScreenLoader({ show: false }));
        this.store.dispatch(loaderActions.showSmallLoader({ show: false }));
        let message;
        
        switch(err.status) {
          case 400:
            this.snackBar.open(err.error.message, undefined, { duration: Helper.SnackBarDurations.Long });
            break;
          case 401: // wrong role
            this.snackBar.open(err.error.message, undefined, { duration: Helper.SnackBarDurations.Long });
            this.store.dispatch(userActions.setCurrentUser({ user: undefined }));
            this.router.navigateByUrl('/auth/login');
            break;
          case 403: // unauthorized
            AuthService.ClearCredentials();
            this.store.dispatch(userActions.setCurrentUser({ user: undefined }));
            this.snackBar.open('Session expired. Please login again.', undefined, { duration: Helper.SnackBarDurations.Long });
            this.router.navigateByUrl('/auth/login');
            break;
          case 440: // unauthenticated
            AuthService.ClearCredentials();
            this.store.dispatch(userActions.setCurrentUser({ user: undefined }));
            message = err?.error?.message ?? 'Please log in again.';
            this.snackBar.open(message, undefined, { duration: Helper.SnackBarDurations.Long });
            this.router.navigateByUrl('/auth/login');
            break;
          case 500:
            this.snackBar.open(err.error.message, undefined, { duration: Helper.SnackBarDurations.Long });
            break;
          default:
            AuthService.ClearCredentials();
            this.store.dispatch(userActions.setCurrentUser({ user: undefined }));
            this.router.navigateByUrl('/auth/login');
            this.snackBar.open(err.error.message, 'OK');
            break;
        }

        if((<string>err.message).match('Http failure during parsing for') !== null) {
          this.snackBar.open('Session expired', undefined, { duration: Helper.SnackBarDurations.Long });
          this.router.navigateByUrl('/auth/login');
        }

        // just emit complete() and nothing else
        return EMPTY;
      })
    );
  }
}

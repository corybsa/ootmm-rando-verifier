import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, of } from 'rxjs';
import { IUser } from 'src/app/models/user/user';
import { EUserRoles } from 'src/app/models/user/user-roles';
import { userActions } from 'src/app/state/user/user.actions';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  private jwtService = inject(JwtHelperService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const user: IUser = AuthService.GetUser();
    const isAuthRoutes: boolean = route.data['isAuthRoutes'];
    
    // do we not have a user in storage?
    if(!user) {
      // are we not on auth routes?
      if(!isAuthRoutes) {
        AuthService.ClearCredentials();
        this.router.navigateByUrl('/auth/login');
        return of(false);
      } else {
        // let the user through on auth routes
        return of(true);
      }
    }
    
    const token = AuthService.GetJwt();
    const isExpired = this.jwtService.isTokenExpired(token);

    if(!token || isExpired) {
      // if the user check the 'keep me logged in' checkbox at login
      // we need to try to get a refresh token here
      const stayLoggedIn = AuthService.GetStayLoggedIn();
      
      if(stayLoggedIn) {
        return this.authService.refresh().pipe(
          map(() => this.checkAdmin(user, route, isAuthRoutes))
        );
      } else {
        AuthService.ClearCredentials(this.store);
        this.router.navigateByUrl('/auth/login');
        return of(false);
      }
    }

    if(AuthService.IsTokenAboutToExpire()) {
      return this.authService.refresh().pipe(
        map(() => this.checkAdmin(user, route, isAuthRoutes))
      );
    }

    return of(this.checkAdmin(user, route, isAuthRoutes));
  }

  private checkAdmin(user: IUser, route: ActivatedRouteSnapshot, isAuthRoutes: boolean): boolean {
    if(user._id) {
      this.store.dispatch(userActions.setCurrentUser({ user }));
    }

    if(route.data) {
      if(route.data['isAdmin'] && user.userRoleId !== EUserRoles.Admin && user.userRoleId !== EUserRoles.SuperAdmin) {
        this.snackBar.open('Unauthorized', 'OK');
        this.router.navigateByUrl('/recipes/all');
        return false;
      }

      if(route.data['isSuperAdmin'] && user.userRoleId !== EUserRoles.SuperAdmin) {
        this.snackBar.open('Unauthorized', 'OK');
        this.router.navigateByUrl('/recipes/all');
        return false;
      }
    }

    if(user && isAuthRoutes) {
      this.router.navigateByUrl('/home');
    }

    return true;
  }
}

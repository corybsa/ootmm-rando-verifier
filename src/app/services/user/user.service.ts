import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/models/user/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private http: HttpClient
  ) {}

  forgotPassword(email: string): Observable<null> {
    const url = '/api/user/forgot-password';
    const data = { email };

    return this.http.post<null>(url, data);
  }

  resetPassword(password: string, code: string): Observable<null> {
    const url = '/api/user/reset-password';
    const data = { password, code };

    return this.http.post<null>(url, data);
  }

  register(
    username: string,
    password: string,
    confirmPassword: string,
    email: string,
    firstName: string,
    lastName: string
  ): Observable<IUser> {
    const url = '/api/auth/register';
    const data = {
      username,
      password,
      confirmPassword,
      email,
      firstName,
      lastName
    };

    return this.http.post<IUser>(url, data);
  }
}

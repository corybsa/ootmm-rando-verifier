import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  userService = inject(UserService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  model = {
    newPassword: '',
    newPasswordVerify: ''
  };

  resetCode = '';

  showNewPasswordError = false;
  showNewPasswordVerifyError = false;

  ngOnInit(): void {
    this.resetCode = this.route.snapshot.paramMap.get('code')!;
  }

  getControlError(control: UntypedFormControl, prop: string): string {
    if(control && control.errors) {
      return control.errors[prop];
    }

    return '';
  }

  submit(form: NgForm) {
    const newPassword = form.controls['password'];
    const newPasswordVerify = form.controls['confirm-password'];

    this.showNewPasswordError = !newPassword.valid;
    this.showNewPasswordVerifyError = !newPasswordVerify.valid;

    if(!form.valid) {
      return;
    }

    this.userService.resetPassword(this.model.newPassword, this.resetCode).subscribe(() => {
      this.snackBar.open('Password reset!', 'Login').onAction().subscribe(() => {
        this.router.navigateByUrl('/auth/login');
      });
    });
  }
}

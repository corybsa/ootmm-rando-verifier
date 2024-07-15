import { Component, OnInit, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  userService = inject(UserService);
  snackBar = inject(MatSnackBar);

  email?: string;

  ngOnInit(): void {
  }

  submit(form: NgForm) {
    if(form.valid) {
      this.userService.forgotPassword(this.email!)
        .subscribe(() => this.snackBar.open('Look out for an email from us!', 'OK'));
    }
  }
}
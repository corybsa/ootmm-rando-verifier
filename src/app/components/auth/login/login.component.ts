import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { userActions } from 'src/app/state/user/user.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  store = inject(Store);
  formBuilder = inject(UntypedFormBuilder);

  formGroup!: UntypedFormGroup;

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  login() {
    const username = this.formGroup.get('username')!.value;
    const password = this.formGroup.get('password')!.value;
    const rememberMe = this.formGroup.get('rememberMe')!.value;

    this.store.dispatch(userActions.userLogin({ username, password, rememberMe }));
  }
}

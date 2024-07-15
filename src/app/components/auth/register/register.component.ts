import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { userActions } from 'src/app/state/user/user.actions';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  store = inject(Store);
  formBuilder = inject(UntypedFormBuilder);
  dialog = inject(MatDialog);

  nameGroup!: UntypedFormGroup;
  accountInfoGroup!: UntypedFormGroup;

  @ViewChild('privacyDialogRef') privacyDialogRef!: TemplateRef<any>;
  @ViewChild('termsDialogRef') termsDialogRef!: TemplateRef<any>;

  ngOnInit(): void {
    this.nameGroup = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required]
    });

    this.accountInfoGroup = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required, this.validatePassword],
      confirmPassword: ['', Validators.required, this.validateConfirmPassword.bind(this)],
      // accept: [false, Validators.requiredTrue] // TODO: uncomment this if the app is going to be used by the general public
    });
  }

  getControlError(control: UntypedFormControl, prop: string): string {
    if(control && control.errors) {
      return control.errors[prop];
    }

    return '';
  }

  validatePassword(control: AbstractControl) {
    let errors: any = null;

    if(control.value === null || control.value.length < 8) {
      errors = Object.assign({}, errors, { length: 'Must be at least 8 characters long' });
    }

    if(errors) {
      return of(errors);
    }

    return of(null);
  }

  getPasswordErrors() {
    const errors = this.accountInfoGroup.get('password')!.errors!;

    if(errors['length']) {
      return errors['length'];
    }

    return '';
  }

  validateConfirmPassword(control: AbstractControl) {
    if(control.value === null || control.value !== this.accountInfoGroup?.get('password')!.value) {
      return of({ match: 'Passwords do not match' });
    }

    return of(null);
  }

  getConfirmPasswordError() {
    const errors = this.accountInfoGroup.get('confirmPassword')!.errors!

    if(errors['match']) {
      return errors['match'];
    }

    return '';
  }

  register() {
    if(!this.nameGroup.valid) {
      return;
    }

    if(!this.accountInfoGroup.valid) {
      return;
    }

    const firstname = this.nameGroup.get('firstname')!.value;
    const lastname = this.nameGroup.get('lastname')!.value;
    const email = this.nameGroup.get('email')!.value;

    const username = this.accountInfoGroup.get('username')!.value;
    const password = this.accountInfoGroup.get('password')!.value;
    const confirmPassword = this.accountInfoGroup.get('confirmPassword')!.value;

    this.store.dispatch(userActions.userRegister({
      username,
      password,
      confirmPassword,
      email,
      firstname,
      lastname
    }));
  }

  openPrivacyDialog() {
    this.dialog.open(this.privacyDialogRef, {
      panelClass: 'full-screen-dialog'
    });
  }

  openTermsDialog() {
    this.dialog.open(this.termsDialogRef, {
      panelClass: 'full-screen-dialog'
    });
  }
}

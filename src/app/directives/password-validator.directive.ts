import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordValidatorDirective, multi: true }]
})
export class PasswordValidatorDirective {
  @Input('appPasswordValidator') password?: string;

  lowercase = new RegExp(/[a-z]/);
  uppercase = new RegExp(/[A-Z]/);
  number = new RegExp(/\d/);
  special = new RegExp(/[!@#$%^&*?]/);

  constructor() { }

  validate(control: AbstractControl): ValidationErrors | null {
    let errors: any = null;

    if(this.password && this.password !== control.value) {
      errors = Object.assign({}, errors, { match: 'Passwords do not match.' });
    }

    if(control.value === null || control.value.length < 8) {
      errors = Object.assign({}, errors, { length: 'Password must be at least 8 characters long.' });
    }

    if(errors) {
      return errors;
    }

    return null;
  }
}

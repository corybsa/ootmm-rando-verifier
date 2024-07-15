import { NgModule } from '@angular/core';
import { LetDirective } from './let.directive';
import { PasswordValidatorDirective } from './password-validator.directive';

@NgModule({
  imports: [],
  declarations: [
    PasswordValidatorDirective,
    LetDirective
  ],
  exports: [
    PasswordValidatorDirective,
    LetDirective
  ]
})
export class DirectivesModule {}

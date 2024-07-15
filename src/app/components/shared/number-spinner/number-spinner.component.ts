import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-number-spinner',
  templateUrl: './number-spinner.component.html',
  styleUrl: './number-spinner.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => NumberSpinnerComponent)
  }]
})
export class NumberSpinnerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() min: number = 0;
  @Input() step: number = 5;

  protected value: number = 0;

  onChange = (value: number) => {};
  onChangeTouch = (value: number) => {};

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onChangeTouch = fn;
  }

  writeValue(value: number): void {
    this.value = value;
  }

  increment(): void {
    this.value += this.step;
    this.onChange(this.value);
  }

  decrement(): void {
    if(this.value <= this.min) {
      return;
    }
    
    this.value -= this.step;
    this.onChange(this.value);
  }
}

import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';

interface AppLetContext {
  $implicit: any;
  appLet: any;
}

@Directive({
  selector: '[appLet]'
})
export class LetDirective {
  @Input()
  set appLet(value: any) {
    this.viewContainerRef.clear();
    this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: value,
      appLet: value
    });
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<AppLetContext>
  ) {}
}
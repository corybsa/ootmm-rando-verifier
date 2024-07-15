import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarComponent } from './bar/bar.component';
import { MatIconModule } from '@angular/material/icon';
import { BarActionComponent } from './bar-action/bar-action.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    BarComponent,
    BarActionComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  exports: [
    BarComponent
  ]
})
export class BottomBarModule { }

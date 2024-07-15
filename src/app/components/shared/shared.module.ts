import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardsComponent } from './cards/cards.component';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ChristmasComponent } from './christmas/christmas.component';
import { NumberSpinnerComponent } from './number-spinner/number-spinner.component';

@NgModule({
  declarations: [
    CardsComponent,
    ChristmasComponent,
    NumberSpinnerComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    DragDropModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule
  ],
  exports: [
    CardsComponent,
    ChristmasComponent,
    NumberSpinnerComponent
  ]
})
export class SharedModule { }

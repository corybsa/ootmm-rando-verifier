import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavRoutingModule } from './nav-routing.module';
import { MainNavComponent } from './main-nav/main-nav.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NavItemComponent } from './nav-item/nav-item.component';
import { EffectsModule } from '@ngrx/effects';
import { NavEffects } from 'src/app/state/nav/nav.effects';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { DirectivesModule } from 'src/app/directives/directives.module';


@NgModule({
  declarations: [
    MainNavComponent,
    NavItemComponent
  ],
  imports: [
    CommonModule,
    NavRoutingModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatCardModule,
    DirectivesModule,
    EffectsModule.forFeature([NavEffects])
  ]
})
export class NavModule { }

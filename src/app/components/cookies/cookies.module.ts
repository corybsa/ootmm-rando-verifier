import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CookiesRoutingModule } from './cookies-routing.module';
import { CookieBannerComponent } from './cookie-banner/cookie-banner.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { LegalModule } from '../legal/legal.module';
import { CookiePreferencesComponent } from './cookie-preferences/cookie-preferences.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    CookieBannerComponent,
    CookiePreferencesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CookiesRoutingModule,
    LegalModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTableModule,
    MatCardModule
  ],
  exports: [
    CookieBannerComponent,
    CookiePreferencesComponent
  ]
})
export class CookiesModule { }

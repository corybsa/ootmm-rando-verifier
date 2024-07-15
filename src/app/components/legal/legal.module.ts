import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LegalRoutingModule } from './legal-routing.module';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    PrivacyPolicyComponent,
    CookiePolicyComponent,
    TermsOfUseComponent,
    DisclaimerComponent
  ],
  imports: [
    CommonModule,
    LegalRoutingModule,
    NgxExtendedPdfViewerModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    PrivacyPolicyComponent,
    CookiePolicyComponent,
    TermsOfUseComponent,
    DisclaimerComponent
  ]
})
export class LegalModule { }

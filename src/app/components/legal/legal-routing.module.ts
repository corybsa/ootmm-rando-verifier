import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

const routes: Routes = [
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'cookies', component: CookiePolicyComponent },
  { path: 'terms-of-use', component: TermsOfUseComponent },
  { path: 'disclaimer', component: DisclaimerComponent },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'privacy'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LegalRoutingModule { }

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavComponent } from './components/nav/nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './state';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { BottomBarModule } from './components/bottom-bar/bottom-bar.module';
import { NavModule } from './components/nav/nav.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ResponseInterceptor } from './services/response.interceptor';
import { LoaderModule } from './components/loader/loader.module';
import { EffectsModule } from '@ngrx/effects';
import { AppEffects } from './app.effects';
import { CookiesModule } from './components/cookies/cookies.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SharedModule } from './components/shared/shared.module';
import { JWT_OPTIONS, JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './services/auth/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent
  ],
  imports: [
    SharedModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NavModule,
    BottomBarModule,
    LoaderModule,
    CookiesModule,
    MatSidenavModule,
    MatIconModule,
    MatSnackBarModule,
    ScrollingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production , connectInZone: true}),
    EffectsModule.forRoot([AppEffects]),
    JwtModule.forRoot({
      config: { tokenGetter: AuthService.GetJwt, allowedDomains: ['TODO.com'] }
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

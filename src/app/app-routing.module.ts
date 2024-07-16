import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { MainNavComponent } from './components/nav/main-nav/main-nav.component';
import { AuthGuard } from './services/auth/auth.guard';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule),
    canActivate: [AuthGuard], // auth guard calls check, which checks for 'remember me'
    data: { isAuthRoutes: true }
  },
  {
    path: 'settings',
    loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  { path: 'nav-main', outlet: 'nav', component: MainNavComponent },
  {
    path: 'legal',
    loadChildren: () => import('./components/legal/legal.module').then(m => m.LegalModule)
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

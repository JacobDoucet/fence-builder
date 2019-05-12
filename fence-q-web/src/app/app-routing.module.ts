import { LandingPageModule } from './views/landing-page/landing-page.module';
import { LandingPageComponent } from './views/landing-page/landing-page.component';
import { LoginPageComponent } from './views/login-page/login-page.component';
import { ProfileComponent } from './views/profile/profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SandboxComponent } from './components/sandbox/sandbox/sandbox.component';
import { SandboxModule } from './components/sandbox/sandbox.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { ExplorerModule } from './views/explorer/explorer.module';
import { ProfileModule } from './views/profile/profile.module';
import { LoginPageModule } from './views/login-page/login-page.module';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: LoginPageComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    LandingPageModule,
    ExplorerModule,
    ProfileModule,
    LoginPageModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

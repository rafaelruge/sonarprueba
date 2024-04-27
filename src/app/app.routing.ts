import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { LoginGuard } from './services/guards/login.guard';

const routes: Routes = [

  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'panel',
    loadChildren: () => import('./modules/pages/pages.module').then(m => m.PagesModule),
    canActivate: [ LoginGuard ]
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})

export class AppRouting { }

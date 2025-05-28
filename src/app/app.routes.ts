import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'start',
    loadComponent: () => import('./start/start.page').then((m) => m.StartPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
];

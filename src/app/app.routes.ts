import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPageComponent)
  },
  {
    path: 'games',
    loadComponent: () => import('./pages/games-page/games-page').then((m) => m.GamesPageComponent)
  },
  {
    path: 'games/:id',
    loadComponent: () => import('./pages/game-detail-page/game-detail-page').then((m) => m.GameDetailPageComponent)
  },
  { path: '**', redirectTo: '' }
];

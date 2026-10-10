import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPageComponent)
  },
  {
    path: 'games',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/games-page/games-page').then((m) => m.GamesPageComponent)
  },
  {
    path: 'games/:id',
    loadComponent: () => import('./pages/game-detail-page/game-detail-page').then((m) => m.GameDetailPageComponent)
  },
  {
    path: 'external-games',
    loadComponent: () => import('./pages/external-games-page/external-games-page').then((m) => m.ExternalGamesPageComponent)
  },
  {
    path: 'external-games/:id',
    loadComponent: () =>
      import('./pages/external-game-detail-page/external-game-detail-page').then((m) => m.ExternalGameDetailPageComponent)
  },
  { path: '**', redirectTo: '' }
];

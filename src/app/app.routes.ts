import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/game-catalog/game-catalog').then((m) => m.GameCatalogComponent)
  },
  {
    path: 'leaderboard/:gameId',
    loadComponent: () =>
      import('./components/organisms/leaderboard/leaderboard').then((m) => m.LeaderboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
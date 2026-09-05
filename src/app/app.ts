import { Component } from '@angular/core';
import { LeaderboardComponent } from './components/leaderboard/leaderboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LeaderboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'portal-indie-front';
}
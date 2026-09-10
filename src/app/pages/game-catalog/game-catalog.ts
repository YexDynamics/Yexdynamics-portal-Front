import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game';
import { Game, CreateGame } from '../../models/game';

@Component({
  selector: 'app-game-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game-catalog.html',
  styleUrl: './game-catalog.css'
})
export class GameCatalogComponent implements OnInit {
  games: Game[] = [];
  isSubmitting: boolean = false;

  newGame: CreateGame = {
    title: '',
    description: ''
  };

  constructor(
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarJuegos();
  }

  cargarJuegos(): void {
    this.gameService.getAllGames().subscribe({
      next: (data: Game[]) => (this.games = data),
      error: (err: unknown) => console.error(err)
    });
  }

  crearJuego(): void {
    if (this.isSubmitting) return;

    const cleanTitle = this.newGame.title.trim();
    if (!cleanTitle) return;

    this.isSubmitting = true;

    this.gameService.createGame({ ...this.newGame, title: cleanTitle }).subscribe({
      next: () => {
        this.cargarJuegos();
        this.newGame = { title: '', description: '' };
        this.isSubmitting = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  goToLeaderboard(gameId: number): void {
    this.router.navigate(['/leaderboard', gameId]);
  }
}
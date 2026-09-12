import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { LeaderboardService, LeaderboardResponseDTO, LeaderboardDTO } from '../../../services/leaderboard';
import { GameService } from '../../../services/game';
import { Game } from '../../../models/game';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  gameId!: number;
  currentGame?: Game;
  scores: LeaderboardResponseDTO[] = [];

  nickname: string = '';
  scoreValue: number = 0;
  message: string = '';
  isSubmitting: boolean = false;

  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private leaderboardService: LeaderboardService,
    private gameService: GameService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.gameId = Number(this.route.snapshot.paramMap.get('gameId'));

    if (this.gameId) {
      this.loadGameDetails();
      this.loadScores();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  loadGameDetails(): void {
    this.gameService.getGameById(this.gameId).subscribe({
      next: (game: Game) => {
        this.currentGame = game;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Error al cargar detalle del juego:', err)
    });
  }

  loadScores(): void {
    this.leaderboardService.getScoresByGame(this.gameId).subscribe({
      next: (data: LeaderboardResponseDTO[]) => {
        this.scores = data.sort((a, b) => b.scoreValue - a.scoreValue);
        this.cdr.detectChanges();
      },
      error: (err: unknown) => console.error('Error al cargar puntajes:', err)
    });
  }

  submitScore(): void {
    if (this.isSubmitting) return;

    const cleanNickname = this.nickname.trim();
    if (!cleanNickname || this.scoreValue <= 0) {
      this.message = 'Por favor ingresa un nickname y un puntaje válido.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const payload: LeaderboardDTO = {
      gameId: this.gameId,
      nickname: cleanNickname,
      scoreValue: this.scoreValue
    };

    this.leaderboardService.saveScore(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.message = '¡Puntaje guardado con éxito!';
          this.loadScores();
          this.nickname = '';
          this.scoreValue = 0;

          if (this.timeoutId) clearTimeout(this.timeoutId);
          this.timeoutId = setTimeout(() => {
            this.message = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: unknown) => {
          console.error('Error al guardar puntaje:', err);
          this.message = 'Error al guardar el puntaje.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
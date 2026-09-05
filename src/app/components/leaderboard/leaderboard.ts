import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService, LeaderboardDTO, LeaderboardResponseDTO } from '../../services/leaderboard'; 

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.html'
})
export class LeaderboardComponent implements OnInit {
  scores: LeaderboardResponseDTO[] = [];
  targetGameId: number = 1;
  newScore: LeaderboardDTO = { nickname: '', gameId: 1, gameTitle: 'PuntoBall', scoreValue: 0 };
  message: string = '';

  constructor(
    private leaderboardService: LeaderboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarScores();
  }

  cargarScores(): void {
    this.leaderboardService.getScoresByGame(this.targetGameId).subscribe({
      next: (data) => {
        this.scores = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando lista', err);
        this.scores = [];
        this.cdr.detectChanges();
      }
    });
  }

  guardarPuntaje(): void {
    if (!this.newScore.nickname || !this.newScore.scoreValue) {
      this.message = 'Por favor completa nickname y puntaje.';
      return;
    }

    // Aseguramos que siempre lleve el gameId fijo al guardar
    this.newScore.gameId = this.targetGameId;

    this.leaderboardService.saveScore(this.newScore).subscribe({
      next: () => {
        this.message = '¡Puntaje registrado exitosamente!';
        this.newScore.nickname = '';
        this.newScore.scoreValue = 0;
        this.cargarScores();
      },
      error: (err) => {
        console.error('Error al guardar puntaje', err);
        this.message = 'Error al registrar puntaje.';
        this.cdr.detectChanges();
      }
    });
  }
}
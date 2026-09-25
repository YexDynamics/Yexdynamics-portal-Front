import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardDTO, LeaderboardResponseDTO, LeaderboardService } from '../../services/leaderboard';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class LeaderboardComponent implements OnInit, OnChanges {
  @Input({ required: true }) gameId!: number;
  @Input() gameTitle: string | null = null;

  scores: LeaderboardResponseDTO[] = [];
  newScore: LeaderboardDTO = { nickname: '', scoreValue: 0 };
  message: string = '';

  constructor(
    private leaderboardService: LeaderboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarScores();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gameId'] && !changes['gameId'].firstChange) {
      this.cargarScores();
    }
  }

  cargarScores(): void {
    this.leaderboardService.getScoresByGame(this.gameId).subscribe({
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

    this.newScore.gameId = this.gameId;
    if (this.gameTitle) {
      this.newScore.gameTitle = this.gameTitle;
    }

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

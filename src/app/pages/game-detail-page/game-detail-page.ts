import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { LeaderboardComponent } from '../../organisms/leaderboard/leaderboard';
import { GameDetailPanelComponent } from '../../organisms/game-detail-panel/game-detail-panel';
import { GameDTO, GameService } from '../../services/game';
import { GameDetailTemplateComponent } from '../../templates/game-detail-template/game-detail-template';

@Component({
  selector: 'app-game-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GameDetailTemplateComponent,
    SpinnerComponent,
    AlertComponent,
    ButtonComponent,
    GameDetailPanelComponent,
    LeaderboardComponent
  ],
  templateUrl: './game-detail-page.html',
  styleUrl: './game-detail-page.css'
})
export class GameDetailPageComponent implements OnInit {
  protected readonly game = signal<GameDTO | null>(null);
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.notFound.set(true);
        return;
      }
      this.loadGame(id);
    });
  }

  protected retry(): void {
    const id = this.game()?.id ?? Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadGame(id);
    }
  }

  private loadGame(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);

    this.gameService
      .getGameById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (game) => this.game.set(game),
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.notFound.set(true);
            return;
          }
          this.error.set(
            err.status === 0
              ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
              : 'No se pudo cargar el juego.'
          );
        }
      });
  }
}

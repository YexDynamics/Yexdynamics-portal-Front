import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AlertComponent, AlertVariant } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { ModalComponent } from '../../molecules/modal/modal';
import { ConfirmDialogComponent } from '../../organisms/confirm-dialog/confirm-dialog';
import { GameFormComponent } from '../../organisms/game-form/game-form';
import { GameListComponent } from '../../organisms/game-list/game-list';
import { CreateGameDTO, GameDTO, GameService } from '../../services/game';
import { GamesTemplateComponent } from '../../templates/games-template/games-template';

interface Feedback {
  type: AlertVariant;
  text: string;
}

const FEEDBACK_DURATION_MS = 5000;

@Component({
  selector: 'app-games-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GamesTemplateComponent,
    ButtonComponent,
    AlertComponent,
    ModalComponent,
    GameListComponent,
    GameFormComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './games-page.html',
  styleUrl: './games-page.css'
})
export class GamesPageComponent implements OnInit, OnDestroy {
  protected readonly games = signal<GameDTO[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly feedback = signal<Feedback | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editingGame = signal<GameDTO | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly gameToDisable = signal<GameDTO | null>(null);
  protected readonly disabling = signal(false);

  protected readonly sortedGames = computed(() => [...this.games()].sort((a, b) => b.id - a.id));
  protected readonly formTitle = computed(() => (this.editingGame() ? 'Editar juego' : 'Registrar juego'));
  protected readonly disableMessage = computed(() => {
    const game = this.gameToDisable();
    return game ? `¿Deshabilitar "${game.title}"? Dejará de mostrarse en el catálogo.` : '';
  });

  private feedbackTimer?: ReturnType<typeof setTimeout>;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimer);
  }

  protected loadGames(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.gameService
      .getGames()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (games) => this.games.set(games),
        error: (err: HttpErrorResponse) =>
          this.loadError.set(this.resolveErrorMessage(err, 'No se pudo cargar el catálogo de juegos.'))
      });
  }

  protected openCreateForm(): void {
    this.editingGame.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected openEditForm(game: GameDTO): void {
    this.editingGame.set(game);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    this.formOpen.set(false);
    this.editingGame.set(null);
    this.formError.set(null);
  }

  protected saveGame(dto: CreateGameDTO): void {
    if (this.saving()) {
      return;
    }

    const editing = this.editingGame();
    const request$ = editing ? this.gameService.updateGame(editing.id, dto) : this.gameService.createGame(dto);

    this.saving.set(true);
    this.formError.set(null);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (saved) => {
        this.games.update((games) =>
          editing ? games.map((game) => (game.id === saved.id ? saved : game)) : [...games, saved]
        );
        this.closeForm();
        this.showFeedback(
          'success',
          editing ? `Juego "${saved.title}" actualizado correctamente.` : `Juego "${saved.title}" registrado correctamente.`
        );
      },
      error: (err: HttpErrorResponse) => {
        if (editing && err.status === 404) {
          this.removeGame(editing.id);
          this.closeForm();
          this.showFeedback('error', 'El juego ya no está disponible en el catálogo.');
          return;
        }
        this.formError.set(this.resolveErrorMessage(err, 'No se pudo guardar el juego.'));
      }
    });
  }

  protected requestDisable(game: GameDTO): void {
    this.gameToDisable.set(game);
  }

  protected cancelDisable(): void {
    if (!this.disabling()) {
      this.gameToDisable.set(null);
    }
  }

  protected confirmDisable(): void {
    const game = this.gameToDisable();
    if (!game || this.disabling()) {
      return;
    }

    this.disabling.set(true);

    this.gameService
      .deleteGame(game.id)
      .pipe(finalize(() => this.disabling.set(false)))
      .subscribe({
        next: () => {
          this.removeGame(game.id);
          this.gameToDisable.set(null);
          this.showFeedback('success', `Juego "${game.title}" deshabilitado correctamente.`);
        },
        error: (err: HttpErrorResponse) => {
          this.gameToDisable.set(null);
          if (err.status === 404) {
            this.removeGame(game.id);
            this.showFeedback('error', 'El juego ya no existe o ya estaba deshabilitado.');
            return;
          }
          this.showFeedback('error', this.resolveErrorMessage(err, 'No se pudo deshabilitar el juego.'));
        }
      });
  }

  protected dismissFeedback(): void {
    clearTimeout(this.feedbackTimer);
    this.feedback.set(null);
  }

  private removeGame(id: number): void {
    this.games.update((games) => games.filter((game) => game.id !== id));
  }

  private showFeedback(type: AlertVariant, text: string): void {
    clearTimeout(this.feedbackTimer);
    this.feedback.set({ type, text });

    if (type === 'success') {
      this.feedbackTimer = setTimeout(() => this.feedback.set(null), FEEDBACK_DURATION_MS);
    }
  }

  private resolveErrorMessage(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    }
    if (err.status < 500 && typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }
    if (err.status === 400) {
      return 'Los datos enviados no son válidos. Revisa el formulario.';
    }
    return fallback;
  }
}

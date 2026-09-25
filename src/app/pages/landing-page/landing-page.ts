import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { ExternalGameListComponent } from '../../organisms/external-game-list/external-game-list';
import { GameListComponent } from '../../organisms/game-list/game-list';
import { HeroBannerComponent } from '../../organisms/hero-banner/hero-banner';
import { ExternalGameResponseDTO, ExternalGameService } from '../../services/external-game';
import { GameDTO, GameService } from '../../services/game';
import { LandingTemplateComponent } from '../../templates/landing-template/landing-template';

const EXTERNAL_GAMES_LIMIT = 8;

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LandingTemplateComponent, HeroBannerComponent, GameListComponent, ExternalGameListComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent implements OnInit {
  protected readonly games = signal<GameDTO[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly externalGames = signal<ExternalGameResponseDTO[]>([]);
  protected readonly externalLoading = signal(false);
  protected readonly externalError = signal<string | null>(null);

  constructor(
    private gameService: GameService,
    private externalGameService: ExternalGameService
  ) {}

  ngOnInit(): void {
    this.loadGames();
    this.loadExternalGames();
  }

  protected loadGames(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gameService
      .getGames()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (games) => this.games.set(games),
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.status === 0
              ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
              : 'No se pudo cargar el catálogo de juegos.'
          )
      });
  }

  protected loadExternalGames(): void {
    this.externalLoading.set(true);
    this.externalError.set(null);

    this.externalGameService
      .getPopularIndieGames(EXTERNAL_GAMES_LIMIT)
      .pipe(finalize(() => this.externalLoading.set(false)))
      .subscribe({
        next: (games) => this.externalGames.set(games),
        error: () => this.externalError.set('No se pudieron cargar los indies externos por ahora.')
      });
  }
}

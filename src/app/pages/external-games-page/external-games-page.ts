import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { ExternalGameListComponent } from '../../organisms/external-game-list/external-game-list';
import { ExternalGameResponseDTO, ExternalGameService } from '../../services/external-game';
import { GamesTemplateComponent } from '../../templates/games-template/games-template';

const CATALOG_LIMIT = 40;

@Component({
  selector: 'app-external-games-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GamesTemplateComponent, ExternalGameListComponent],
  templateUrl: './external-games-page.html',
  styleUrl: './external-games-page.css'
})
export class ExternalGamesPageComponent implements OnInit {
  protected readonly games = signal<ExternalGameResponseDTO[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(private externalGameService: ExternalGameService) {}

  ngOnInit(): void {
    this.loadGames();
  }

  protected loadGames(): void {
    this.loading.set(true);
    this.error.set(null);

    this.externalGameService
      .getPopularIndieGames(CATALOG_LIMIT)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (games) => this.games.set(games),
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.status === 0
              ? 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.'
              : 'No se pudo cargar el catálogo externo.'
          )
      });
  }
}

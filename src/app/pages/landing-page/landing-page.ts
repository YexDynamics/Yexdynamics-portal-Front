import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { GameListComponent } from '../../organisms/game-list/game-list';
import { HeroBannerComponent } from '../../organisms/hero-banner/hero-banner';
import { GameDTO, GameService } from '../../services/game';
import { LandingTemplateComponent } from '../../templates/landing-template/landing-template';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LandingTemplateComponent, HeroBannerComponent, GameListComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPageComponent implements OnInit {
  protected readonly games = signal<GameDTO[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGames();
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
}

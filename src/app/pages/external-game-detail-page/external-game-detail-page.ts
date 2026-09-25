import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { ExternalGameDetailPanelComponent } from '../../organisms/external-game-detail-panel/external-game-detail-panel';
import { ExternalGameDetailDTO, ExternalGameService } from '../../services/external-game';
import { ExternalGameDetailTemplateComponent } from '../../templates/external-game-detail-template/external-game-detail-template';

@Component({
  selector: 'app-external-game-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ExternalGameDetailTemplateComponent,
    SpinnerComponent,
    AlertComponent,
    ButtonComponent,
    ExternalGameDetailPanelComponent
  ],
  templateUrl: './external-game-detail-page.html',
  styleUrl: './external-game-detail-page.css'
})
export class ExternalGameDetailPageComponent implements OnInit {
  protected readonly game = signal<ExternalGameDetailDTO | null>(null);
  protected readonly loading = signal(false);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private externalGameService: ExternalGameService
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

    this.externalGameService
      .getExternalGameById(id)
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

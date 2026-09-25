import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExternalGameResponseDTO } from '../../services/external-game';

@Component({
  selector: 'app-external-game-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './external-game-card.html',
  styleUrl: './external-game-card.css'
})
export class ExternalGameCardComponent {
  readonly game = input.required<ExternalGameResponseDTO>();

  private readonly failedCoverUrl = signal<string | null>(null);

  protected readonly showCover = computed(() => {
    const url = this.game().coverImageUrl;
    return !!url && url !== this.failedCoverUrl();
  });

  protected readonly genresLabel = computed(() => this.game().genres.slice(0, 2).join(', '));

  protected onCoverError(): void {
    this.failedCoverUrl.set(this.game().coverImageUrl);
  }
}

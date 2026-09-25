import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { GameDTO } from '../../services/game';

@Component({
  selector: 'app-game-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-detail-panel.html',
  styleUrl: './game-detail-panel.css'
})
export class GameDetailPanelComponent {
  readonly game = input.required<GameDTO>();

  private readonly failedCoverUrl = signal<string | null>(null);

  protected readonly showCover = computed(() => {
    const url = this.game().coverImageUrl;
    return !!url && url !== this.failedCoverUrl();
  });

  protected onCoverError(): void {
    this.failedCoverUrl.set(this.game().coverImageUrl);
  }
}

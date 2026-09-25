import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ExternalGameDetailDTO } from '../../services/external-game';

interface StoreLink {
  url: string;
  label: string;
}

@Component({
  selector: 'app-external-game-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './external-game-detail-panel.html',
  styleUrl: './external-game-detail-panel.css'
})
export class ExternalGameDetailPanelComponent {
  readonly game = input.required<ExternalGameDetailDTO>();

  private readonly failedCoverUrl = signal<string | null>(null);

  protected readonly showCover = computed(() => {
    const url = this.game().coverImageUrl;
    return !!url && url !== this.failedCoverUrl();
  });

  protected readonly storeLinks = computed<StoreLink[]>(() =>
    this.game().storeUrls.map((url) => ({ url, label: this.hostnameOf(url) }))
  );

  protected onCoverError(): void {
    this.failedCoverUrl.set(this.game().coverImageUrl);
  }

  private hostnameOf(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'Tienda';
    }
  }
}

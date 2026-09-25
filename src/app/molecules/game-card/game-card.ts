import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../atoms/button/button';
import { GameDTO } from '../../services/game';

@Component({
  selector: 'app-game-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css'
})
export class GameCardComponent {
  readonly game = input.required<GameDTO>();
  readonly showActions = input(true, { transform: booleanAttribute });
  readonly editRequested = output<GameDTO>();
  readonly disableRequested = output<GameDTO>();

  private readonly failedCoverUrl = signal<string | null>(null);

  protected readonly showCover = computed(() => {
    const url = this.game().coverImageUrl;
    return !!url && url !== this.failedCoverUrl();
  });

  protected onCoverError(): void {
    this.failedCoverUrl.set(this.game().coverImageUrl);
  }
}

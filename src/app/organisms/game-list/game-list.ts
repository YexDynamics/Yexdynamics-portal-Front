import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { GameCardComponent } from '../../molecules/game-card/game-card';
import { GameDTO } from '../../services/game';

@Component({
  selector: 'app-game-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, ButtonComponent, SpinnerComponent, GameCardComponent],
  templateUrl: './game-list.html',
  styleUrl: './game-list.css'
})
export class GameListComponent {
  readonly games = input.required<GameDTO[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
  readonly showActions = input(true, { transform: booleanAttribute });
  readonly editRequested = output<GameDTO>();
  readonly disableRequested = output<GameDTO>();
  readonly retryRequested = output<void>();
}

import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { ExternalGameCardComponent } from '../../molecules/external-game-card/external-game-card';
import { ExternalGameResponseDTO } from '../../services/external-game';

@Component({
  selector: 'app-external-game-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, ButtonComponent, SpinnerComponent, ExternalGameCardComponent],
  templateUrl: './external-game-list.html',
  styleUrl: './external-game-list.css'
})
export class ExternalGameListComponent {
  readonly games = input.required<ExternalGameResponseDTO[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
  readonly compact = input(false, { transform: booleanAttribute });
  readonly retryRequested = output<void>();
}

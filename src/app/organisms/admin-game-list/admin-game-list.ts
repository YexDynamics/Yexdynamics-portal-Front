import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { AlertComponent } from '../../atoms/alert/alert';
import { BadgeComponent } from '../../atoms/badge/badge';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { AdminGameDTO } from '../../services/game';

@Component({
  selector: 'app-admin-game-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, BadgeComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './admin-game-list.html',
  styleUrl: './admin-game-list.css'
})
export class AdminGameListComponent {
  readonly games = input.required<AdminGameDTO[]>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
  readonly busy = input(false, { transform: booleanAttribute });
  readonly toggleRequested = output<AdminGameDTO>();
  readonly deleteRequested = output<AdminGameDTO>();
  readonly retryRequested = output<void>();
}

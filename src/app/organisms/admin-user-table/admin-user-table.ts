import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { AlertComponent } from '../../atoms/alert/alert';
import { BadgeComponent } from '../../atoms/badge/badge';
import { ButtonComponent } from '../../atoms/button/button';
import { SpinnerComponent } from '../../atoms/spinner/spinner';
import { AdminUserDTO } from '../../services/admin-user';

@Component({
  selector: 'app-admin-user-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AlertComponent, BadgeComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './admin-user-table.html',
  styleUrl: './admin-user-table.css'
})
export class AdminUserTableComponent {
  readonly users = input.required<AdminUserDTO[]>();
  readonly currentUsername = input<string | null>(null);
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
  readonly busy = input(false, { transform: booleanAttribute });
  readonly statusToggleRequested = output<AdminUserDTO>();
  readonly roleChangeRequested = output<AdminUserDTO>();
  readonly retryRequested = output<void>();
}

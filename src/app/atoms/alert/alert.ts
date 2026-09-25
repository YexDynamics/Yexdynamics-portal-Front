import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';

export type AlertVariant = 'success' | 'error';

@Component({
  selector: 'app-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class AlertComponent {
  readonly variant = input<AlertVariant>('success');
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output<void>();

  protected readonly role = computed(() => (this.variant() === 'error' ? 'alert' : 'status'));
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeVariant = 'success' | 'danger' | 'neutral' | 'primary';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.html',
  styleUrl: './badge.css'
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');
}

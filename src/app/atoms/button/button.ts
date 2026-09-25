import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'md' | 'sm';

@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly accessibleLabel = input<string | null>(null);
  readonly clicked = output<void>();

  protected readonly classes = computed(
    () => `btn btn--${this.variant()} btn--${this.size()}${this.loading() ? ' btn--loading' : ''}`
  );
}

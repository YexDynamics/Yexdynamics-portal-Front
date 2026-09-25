import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button';
import { ModalComponent } from '../../molecules/modal/modal';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly confirming = input(false, { transform: booleanAttribute });
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}

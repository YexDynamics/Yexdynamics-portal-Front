import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  viewChild
} from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements AfterViewInit {
  readonly title = input.required<string>();
  readonly locked = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  protected requestClose(): void {
    if (!this.locked()) {
      this.dialog().nativeElement.close();
    }
  }

  protected onCancel(event: Event): void {
    if (this.locked()) {
      event.preventDefault();
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.requestClose();
    }
  }
}

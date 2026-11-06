import { ChangeDetectionStrategy, Component, OnDestroy, input, signal } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button';

const COPIED_FEEDBACK_MS = 2000;

@Component({
  selector: 'app-token-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  templateUrl: './token-field.html',
  styleUrl: './token-field.css'
})
export class TokenFieldComponent implements OnDestroy {
  readonly token = input.required<string>();
  readonly label = input('Token del juego');

  protected readonly copied = signal(false);
  protected readonly copyFailed = signal(false);

  private copiedTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    clearTimeout(this.copiedTimer);
  }

  protected async copy(): Promise<void> {
    const copied = await this.writeToClipboard(this.token());
    this.copied.set(copied);
    this.copyFailed.set(!copied);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => {
      this.copied.set(false);
      this.copyFailed.set(false);
    }, COPIED_FEEDBACK_MS);
  }

  protected selectAll(event: Event): void {
    (event.target as HTMLInputElement).select();
  }

  private async writeToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return this.legacyCopy(text);
    }
  }

  private legacyCopy(text: string): boolean {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(area);
    }
  }
}

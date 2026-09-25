import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-banner.html',
  styleUrl: './hero-banner.css'
})
export class HeroBannerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}

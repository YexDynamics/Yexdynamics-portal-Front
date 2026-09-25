import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-games-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './games-template.html',
  styleUrl: './games-template.css'
})
export class GamesTemplateComponent {
  readonly title = input.required<string>();
}

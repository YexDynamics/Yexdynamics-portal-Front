import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-external-game-detail-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './external-game-detail-template.html',
  styleUrl: './external-game-detail-template.css'
})
export class ExternalGameDetailTemplateComponent {}

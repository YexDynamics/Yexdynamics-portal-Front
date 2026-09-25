import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-game-detail-template',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './game-detail-template.html',
  styleUrl: './game-detail-template.css'
})
export class GameDetailTemplateComponent {}

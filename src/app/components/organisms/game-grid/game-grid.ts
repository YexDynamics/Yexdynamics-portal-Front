import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../../models/game';
import { GameCardComponent } from '../../molecules/game-card/game-card';

@Component({
  selector: 'app-game-grid',
  standalone: true,
  imports: [CommonModule, GameCardComponent],
  templateUrl: './game-grid.html',
  styleUrl: './game-grid.css'
})
export class GameGridComponent {
  @Input() games: Game[] = [];
}
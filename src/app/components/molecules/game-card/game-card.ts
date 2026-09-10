import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../../models/game';
import { BadgeComponent } from '../../atoms/badge/badge';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css'
})
export class GameCardComponent {
  @Input({ required: true }) game!: Game;
}
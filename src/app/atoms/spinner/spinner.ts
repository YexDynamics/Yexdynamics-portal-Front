import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class SpinnerComponent {
  readonly label = input('Cargando');
}

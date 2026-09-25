import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field.html',
  styleUrl: './form-field.css'
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly controlId = input.required<string>();
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);
}

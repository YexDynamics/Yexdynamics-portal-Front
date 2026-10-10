import { ChangeDetectionStrategy, Component, OnInit, booleanAttribute, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { TextInputComponent } from '../../atoms/text-input/text-input';
import { FormFieldComponent } from '../../molecules/form-field/form-field';

const notBlank: ValidatorFn = (control) => (String(control.value ?? '').trim() ? null : { required: true });

@Component({
  selector: 'app-nickname-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, TextInputComponent, FormFieldComponent],
  templateUrl: './nickname-form.html',
  styleUrl: './nickname-form.css'
})
export class NicknameFormComponent implements OnInit {
  readonly currentNickname = input<string | null>(null);
  readonly saving = input(false, { transform: booleanAttribute });
  readonly serverError = input<string | null>(null);
  readonly submitted = output<string>();

  protected readonly form = new FormGroup({
    nickname: new FormControl('', { nonNullable: true, validators: [notBlank, Validators.maxLength(50)] })
  });

  ngOnInit(): void {
    const current = this.currentNickname();
    if (current) {
      this.form.patchValue({ nickname: current });
    }
  }

  protected errorFor(): string | null {
    const control = this.form.controls.nickname;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue().nickname.trim());
  }
}

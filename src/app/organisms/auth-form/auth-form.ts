import { ChangeDetectionStrategy, Component, booleanAttribute, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { TextInputComponent } from '../../atoms/text-input/text-input';
import { FormFieldComponent } from '../../molecules/form-field/form-field';
import { LoginRequestDTO, RegisterRequestDTO } from '../../services/auth';

export type AuthMode = 'login' | 'register';

const notBlank: ValidatorFn = (control) => (String(control.value ?? '').trim() ? null : { required: true });

const textControl = (...validators: ValidatorFn[]): FormControl<string> =>
  new FormControl('', { nonNullable: true, validators });

@Component({
  selector: 'app-auth-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AlertComponent, ButtonComponent, TextInputComponent, FormFieldComponent],
  templateUrl: './auth-form.html',
  styleUrl: './auth-form.css'
})
export class AuthFormComponent {
  readonly mode = input<AuthMode>('login');
  readonly saving = input(false, { transform: booleanAttribute });
  readonly serverError = input<string | null>(null);
  readonly loginSubmitted = output<LoginRequestDTO>();
  readonly registerSubmitted = output<RegisterRequestDTO>();
  readonly modeChanged = output<AuthMode>();

  protected readonly loginForm = new FormGroup({
    username: textControl(notBlank),
    password: textControl(notBlank)
  });

  protected readonly registerForm = new FormGroup({
    username: textControl(notBlank, Validators.minLength(4), Validators.maxLength(50)),
    email: textControl(notBlank, Validators.email),
    password: textControl(notBlank, Validators.minLength(8)),
    nickname: textControl(Validators.maxLength(50))
  });

  protected switchMode(mode: AuthMode): void {
    this.modeChanged.emit(mode);
  }

  protected errorFor(control: FormControl<string>): string | null {
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['email']) {
      return 'Ingresa un correo válido.';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return null;
  }

  protected onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.getRawValue();
    this.loginSubmitted.emit({ username: value.username.trim(), password: value.password });
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.getRawValue();
    const nickname = value.nickname.trim();

    this.registerSubmitted.emit({
      username: value.username.trim(),
      email: value.email.trim(),
      password: value.password,
      nickname: nickname.length > 0 ? nickname : null
    });
  }
}

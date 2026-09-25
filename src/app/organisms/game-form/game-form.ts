import { ChangeDetectionStrategy, Component, OnInit, booleanAttribute, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AlertComponent } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { TextInputComponent } from '../../atoms/text-input/text-input';
import { TextareaComponent } from '../../atoms/textarea/textarea';
import { FormFieldComponent } from '../../molecules/form-field/form-field';
import { CreateGameDTO, GameDTO } from '../../services/game';

type GameFormField =
  | 'title'
  | 'description'
  | 'version'
  | 'genre'
  | 'developerName'
  | 'coverImageUrl'
  | 'downloadUrl';

const notBlank: ValidatorFn = (control) => (String(control.value ?? '').trim() ? null : { required: true });

const httpUrl = Validators.pattern(/^\s*https?:\/\/\S+\s*$/i);

const textControl = (...validators: ValidatorFn[]): FormControl<string> =>
  new FormControl('', { nonNullable: true, validators });

@Component({
  selector: 'app-game-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    TextInputComponent,
    TextareaComponent,
    FormFieldComponent
  ],
  templateUrl: './game-form.html',
  styleUrl: './game-form.css'
})
export class GameFormComponent implements OnInit {
  readonly game = input<GameDTO | null>(null);
  readonly saving = input(false, { transform: booleanAttribute });
  readonly serverError = input<string | null>(null);
  readonly submitted = output<CreateGameDTO>();
  readonly cancelled = output<void>();

  protected readonly form = new FormGroup<Record<GameFormField, FormControl<string>>>({
    title: textControl(notBlank, Validators.maxLength(100)),
    description: textControl(Validators.maxLength(500)),
    version: textControl(Validators.maxLength(20)),
    genre: textControl(Validators.maxLength(50)),
    developerName: textControl(Validators.maxLength(100)),
    coverImageUrl: textControl(Validators.maxLength(500), httpUrl),
    downloadUrl: textControl(Validators.maxLength(500), httpUrl)
  });

  protected readonly submitLabel = computed(() => (this.game() ? 'Guardar cambios' : 'Registrar juego'));

  ngOnInit(): void {
    const game = this.game();
    if (game) {
      this.form.patchValue({
        title: game.title,
        description: game.description ?? '',
        version: game.version ?? '',
        genre: game.genre ?? '',
        developerName: game.developerName ?? '',
        coverImageUrl: game.coverImageUrl ?? '',
        downloadUrl: game.downloadUrl ?? ''
      });
    }
  }

  protected errorFor(field: GameFormField): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['pattern']) {
      return 'Ingresa una URL válida que empiece por http:// o https://';
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

    const value = this.form.getRawValue();
    this.submitted.emit({
      title: value.title.trim(),
      description: this.toNullable(value.description),
      version: this.toNullable(value.version),
      genre: this.toNullable(value.genre),
      developerName: this.toNullable(value.developerName),
      coverImageUrl: this.toNullable(value.coverImageUrl),
      downloadUrl: this.toNullable(value.downloadUrl)
    });
  }

  private toNullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}

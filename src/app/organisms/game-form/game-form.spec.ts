import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CreateGameDTO, GameDTO } from '../../services/game';
import { GameFormComponent } from './game-form';

const game: GameDTO = {
  id: 3,
  title: 'PuntoBall',
  description: null,
  version: '1.2.0',
  genre: 'Arcade',
  developerName: null,
  coverImageUrl: null,
  downloadUrl: null,
  createdAt: '2026-09-10T15:30:00'
};

describe('GameFormComponent', () => {
  let fixture: ComponentFixture<GameFormComponent>;
  let emitted: CreateGameDTO[];

  const element = (): HTMLElement => fixture.nativeElement;

  const fill = (id: string, value: string): void => {
    const field = element().querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  const submit = (): void => {
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFormComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(GameFormComponent);
    emitted = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
  });

  it('should not submit and should show an error when the title is blank', () => {
    fixture.detectChanges();
    fill('game-title', '   ');
    submit();

    expect(emitted.length).toBe(0);
    expect(element().querySelector('.field__error')?.textContent).toContain('obligatorio');
  });

  it('should reject urls that are not http or https', () => {
    fixture.detectChanges();
    fill('game-title', 'PuntoBall');
    fill('game-cover', 'ftp://example.com/cover.png');
    submit();

    expect(emitted.length).toBe(0);
    expect(element().querySelector('.field__error')?.textContent).toContain('URL válida');
  });

  it('should emit a trimmed payload with null for empty optional fields', () => {
    fixture.detectChanges();
    fill('game-title', '  PuntoBall  ');
    fill('game-genre', 'Arcade');
    submit();

    expect(emitted).toEqual([
      {
        title: 'PuntoBall',
        description: null,
        version: null,
        genre: 'Arcade',
        developerName: null,
        coverImageUrl: null,
        downloadUrl: null
      }
    ]);
  });

  it('should prefill the form and change the submit label when editing', () => {
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();

    expect(element().querySelector<HTMLInputElement>('#game-title')!.value).toBe('PuntoBall');
    expect(element().querySelector<HTMLInputElement>('#game-version')!.value).toBe('1.2.0');
    expect(element().querySelector('button[type="submit"]')?.textContent).toContain('Guardar cambios');
  });

  it('should display the server error', () => {
    fixture.componentRef.setInput('serverError', 'Ya existe un juego registrado con el título: PuntoBall');
    fixture.detectChanges();

    expect(element().querySelector('app-alert')?.textContent).toContain('Ya existe un juego');
  });
});

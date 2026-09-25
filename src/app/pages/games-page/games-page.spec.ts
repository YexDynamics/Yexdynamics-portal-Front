import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { CreateGameDTO, GameDTO, GameService } from '../../services/game';
import { GamesPageComponent } from './games-page';

const buildGame = (id: number, title: string): GameDTO => ({
  id,
  title,
  description: null,
  version: '1.0.0',
  genre: null,
  developerName: null,
  coverImageUrl: null,
  downloadUrl: null,
  createdAt: '2026-09-10T15:30:00'
});

class GameServiceStub {
  games: GameDTO[] = [buildGame(1, 'PuntoBall'), buildGame(2, 'Astro Dash')];
  getGamesResult: Observable<GameDTO[]> | null = null;
  deleteResult: Observable<void> = of(undefined);
  deletedIds: number[] = [];
  created: CreateGameDTO[] = [];

  getGames(): Observable<GameDTO[]> {
    return this.getGamesResult ?? of([...this.games]);
  }

  createGame(dto: CreateGameDTO): Observable<GameDTO> {
    this.created.push(dto);
    return of({ ...buildGame(3, dto.title) });
  }

  updateGame(id: number, dto: CreateGameDTO): Observable<GameDTO> {
    return of({ ...buildGame(id, dto.title) });
  }

  deleteGame(id: number): Observable<void> {
    this.deletedIds.push(id);
    return this.deleteResult;
  }
}

describe('GamesPageComponent', () => {
  let fixture: ComponentFixture<GamesPageComponent>;
  let service: GameServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;
  const titles = (): string[] =>
    Array.from(element().querySelectorAll('.card__title')).map((node) => node.textContent?.trim() ?? '');

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(GamesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const click = (selector: string): void => {
    element().querySelector<HTMLElement>(selector)!.click();
    fixture.detectChanges();
  };

  beforeAll(() => {
    const proto = HTMLDialogElement.prototype as Partial<HTMLDialogElement>;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  beforeEach(async () => {
    service = new GameServiceStub();
    await TestBed.configureTestingModule({
      imports: [GamesPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: GameService, useValue: service }]
    }).compileComponents();
  });

  it('should list the games newest first', async () => {
    await create();

    expect(titles()).toEqual(['Astro Dash', 'PuntoBall']);
  });

  it('should show an empty state when there are no games', async () => {
    service.games = [];
    await create();

    expect(element().querySelector('.game-list__state')?.textContent).toContain('Aún no hay juegos');
  });

  it('should show an error with retry when the catalog fails to load', async () => {
    service.getGamesResult = throwError(() => new HttpErrorResponse({ status: 0 }));
    await create();

    expect(element().querySelector('app-alert')?.textContent).toContain('No se pudo conectar');

    service.getGamesResult = null;
    click('.game-list__state .btn--primary');

    expect(titles().length).toBe(2);
  });

  it('should register a new game from the form', async () => {
    await create();

    click('app-button[slot="actions"] button');
    const title = element().querySelector<HTMLInputElement>('#game-title')!;
    title.value = 'Nuevo Juego';
    title.dispatchEvent(new Event('input'));
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(service.created.length).toBe(1);
    expect(service.created[0].title).toBe('Nuevo Juego');
    expect(titles()).toContain('Nuevo Juego');
    expect(element().querySelector('app-modal')).toBeNull();
    expect(element().querySelector('[slot="feedback"]')?.textContent).toContain('registrado');
  });

  it('should prefill the form and update a game from the card edit action', async () => {
    await create();

    click('app-game-card .btn--secondary');
    const title = element().querySelector<HTMLInputElement>('#game-title')!;
    expect(title.value).toBe('Astro Dash');

    title.value = 'Astro Dash Remastered';
    title.dispatchEvent(new Event('input'));
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(titles()).toContain('Astro Dash Remastered');
    expect(element().querySelector('app-modal')).toBeNull();
    expect(element().querySelector('[slot="feedback"]')?.textContent).toContain('actualizado');
  });

  it('should soft delete a game after confirmation', async () => {
    await create();

    click('app-game-card .btn--danger');
    expect(element().querySelector('app-confirm-dialog')).toBeTruthy();

    click('app-confirm-dialog .btn--danger');

    expect(service.deletedIds).toEqual([2]);
    expect(titles()).toEqual(['PuntoBall']);
    expect(element().querySelector('app-confirm-dialog')).toBeNull();
    expect(element().querySelector('[slot="feedback"]')?.textContent).toContain('deshabilitado');
  });

  it('should keep the game when the confirmation is cancelled', async () => {
    await create();

    click('app-game-card .btn--danger');
    click('app-confirm-dialog .btn--secondary:not([aria-label])');

    expect(service.deletedIds.length).toBe(0);
    expect(titles().length).toBe(2);
  });
});

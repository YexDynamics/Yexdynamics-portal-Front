import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ExternalGameResponseDTO, ExternalGameService } from '../../services/external-game';
import { GameDTO, GameService } from '../../services/game';
import { LandingPageComponent } from './landing-page';

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

const buildExternalGame = (id: number, title: string): ExternalGameResponseDTO => ({
  id,
  title,
  releaseDate: '2017-02-24',
  coverImageUrl: null,
  rating: 4.4,
  genres: ['Action'],
  platforms: ['PC']
});

class GameServiceStub {
  getGamesResult: Observable<GameDTO[]> = of([buildGame(1, 'PuntoBall'), buildGame(2, 'Astro Dash')]);

  getGames(): Observable<GameDTO[]> {
    return this.getGamesResult;
  }
}

class ExternalGameServiceStub {
  getPopularIndieGamesResult: Observable<ExternalGameResponseDTO[]> = of([
    buildExternalGame(1, 'Hollow Knight'),
    buildExternalGame(2, 'Celeste')
  ]);
  requestedLimit: number | null = null;

  getPopularIndieGames(limit: number): Observable<ExternalGameResponseDTO[]> {
    this.requestedLimit = limit;
    return this.getPopularIndieGamesResult;
  }
}

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let gameService: GameServiceStub;
  let externalGameService: ExternalGameServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    gameService = new GameServiceStub();
    externalGameService = new ExternalGameServiceStub();
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: GameService, useValue: gameService },
        { provide: ExternalGameService, useValue: externalGameService }
      ]
    }).compileComponents();
  });

  it('should render the hero banner and the public catalog', async () => {
    await create();

    expect(element().querySelector('.hero__title')?.textContent).toContain('Portal Indie');
    expect(element().querySelectorAll('.card__title').length).toBe(2);
  });

  it('should not render edit or disable actions on public cards', async () => {
    await create();

    expect(element().querySelector('.card__actions')).toBeNull();
  });

  it('should show a connection error with retry', async () => {
    gameService.getGamesResult = throwError(() => new HttpErrorResponse({ status: 0 }));
    await create();

    expect(element().querySelector('app-alert')?.textContent).toContain('No se pudo conectar');
  });

  it('should request only 8 external games and render them compact', async () => {
    await create();

    expect(externalGameService.requestedLimit).toBe(8);
    expect(element().querySelectorAll('.ext-card__title').length).toBe(2);
    expect(element().querySelector('.external-game-list__grid--compact')).toBeTruthy();
  });

  it('should link to the extended external catalog', async () => {
    await create();

    const cta = element().querySelector('.landing-page__cta')!;
    expect(cta.getAttribute('href')).toBe('/external-games');
  });
});

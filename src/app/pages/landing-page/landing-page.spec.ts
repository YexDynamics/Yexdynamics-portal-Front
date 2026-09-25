import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
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

class GameServiceStub {
  getGamesResult: Observable<GameDTO[]> = of([buildGame(1, 'PuntoBall'), buildGame(2, 'Astro Dash')]);

  getGames(): Observable<GameDTO[]> {
    return this.getGamesResult;
  }
}

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let service: GameServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    service = new GameServiceStub();
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: GameService, useValue: service }]
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
    service.getGamesResult = throwError(() => new HttpErrorResponse({ status: 0 }));
    await create();

    expect(element().querySelector('app-alert')?.textContent).toContain('No se pudo conectar');
  });
});

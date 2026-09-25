import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ExternalGameResponseDTO, ExternalGameService } from '../../services/external-game';
import { ExternalGamesPageComponent } from './external-games-page';

const buildGame = (id: number, title: string): ExternalGameResponseDTO => ({
  id,
  title,
  releaseDate: '2017-02-24',
  coverImageUrl: null,
  rating: 4.4,
  genres: ['Action'],
  platforms: ['PC']
});

class ExternalGameServiceStub {
  getPopularIndieGamesResult: Observable<ExternalGameResponseDTO[]> = of([
    buildGame(1, 'Hollow Knight'),
    buildGame(2, 'Celeste')
  ]);
  requestedLimit: number | null = null;

  getPopularIndieGames(limit: number): Observable<ExternalGameResponseDTO[]> {
    this.requestedLimit = limit;
    return this.getPopularIndieGamesResult;
  }
}

describe('ExternalGamesPageComponent', () => {
  let fixture: ComponentFixture<ExternalGamesPageComponent>;
  let service: ExternalGameServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    service = new ExternalGameServiceStub();
    await TestBed.configureTestingModule({
      imports: [ExternalGamesPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ExternalGameService, useValue: service }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalGamesPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render the extended catalog with a larger limit', () => {
    expect(service.requestedLimit).toBe(40);
    expect(element().querySelectorAll('.ext-card__title').length).toBe(2);
  });
});

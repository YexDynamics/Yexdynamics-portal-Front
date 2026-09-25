import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ExternalGameDetailDTO, ExternalGameService } from '../../services/external-game';
import { ExternalGameDetailPageComponent } from './external-game-detail-page';

const game: ExternalGameDetailDTO = {
  id: 3498,
  title: 'Hollow Knight',
  releaseDate: '2017-02-24',
  coverImageUrl: null,
  rating: 4.4,
  genres: ['Action', 'Adventure'],
  platforms: ['PC'],
  description: 'Forge your own path.',
  website: 'https://www.hollowknight.com',
  esrbRating: 'Everyone 10+',
  storeUrls: ['https://store.steampowered.com/app/367520']
};

class ExternalGameServiceStub {
  getExternalGameByIdResult = of(game);

  getExternalGameById() {
    return this.getExternalGameByIdResult;
  }
}

describe('ExternalGameDetailPageComponent', () => {
  let fixture: ComponentFixture<ExternalGameDetailPageComponent>;
  let service: ExternalGameServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;

  const create = async (id = '3498'): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [ExternalGameDetailPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ExternalGameService, useValue: service },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id })),
            snapshot: { paramMap: convertToParamMap({ id }) }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalGameDetailPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    service = new ExternalGameServiceStub();
  });

  it('should render the game info and its store links', async () => {
    await create();

    expect(element().querySelector('.ext-detail__title')?.textContent).toContain('Hollow Knight');
    expect(element().querySelector('.ext-detail__store-link')?.getAttribute('href')).toBe(
      'https://store.steampowered.com/app/367520'
    );
  });

  it('should not render a leaderboard section', async () => {
    await create();

    expect(element().querySelector('app-leaderboard')).toBeNull();
  });

  it('should show a not found message on 404', async () => {
    service.getExternalGameByIdResult = throwError(() => new HttpErrorResponse({ status: 404 })) as any;
    await create();

    expect(element().querySelector('app-alert')?.textContent).toContain('no existe en RAWG');
  });
});

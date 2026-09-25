import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ExternalGameDetailDTO, ExternalGameResponseDTO, ExternalGameService } from './external-game';

const API_URL = 'http://localhost:8080/api/v1/external-games';

const summary: ExternalGameResponseDTO = {
  id: 3498,
  title: 'Hollow Knight',
  releaseDate: '2017-02-24',
  coverImageUrl: 'https://media.rawg.io/media/games/cover.jpg',
  rating: 4.4,
  genres: ['Action', 'Adventure'],
  platforms: ['PC', 'Nintendo Switch']
};

const detail: ExternalGameDetailDTO = {
  ...summary,
  description: 'Forge your own path.',
  website: 'https://www.hollowknight.com',
  esrbRating: 'Everyone 10+',
  storeUrls: ['https://store.steampowered.com/app/367520']
};

describe('ExternalGameService', () => {
  let service: ExternalGameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ExternalGameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the popular indie games with a limit', () => {
    let result: ExternalGameResponseDTO[] = [];
    service.getPopularIndieGames(8).subscribe((games) => (result = games));

    const req = http.expectOne(`${API_URL}?limit=8`);
    expect(req.request.method).toBe('GET');
    req.flush([summary]);

    expect(result).toEqual([summary]);
  });

  it('should get an external game by id', () => {
    let result: ExternalGameDetailDTO | undefined;
    service.getExternalGameById(3498).subscribe((value) => (result = value));

    const req = http.expectOne(`${API_URL}/3498`);
    expect(req.request.method).toBe('GET');
    req.flush(detail);

    expect(result).toEqual(detail);
  });
});

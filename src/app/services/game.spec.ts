import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateGameDTO, GameDTO, GameService } from './game';

const API_URL = 'http://localhost:8080/api/v1/games';

const game: GameDTO = {
  id: 1,
  title: 'PuntoBall',
  description: null,
  version: '1.0.0',
  genre: 'Arcade',
  developerName: null,
  coverImageUrl: null,
  downloadUrl: null,
  createdAt: '2026-09-10T15:30:00'
};

const payload: CreateGameDTO = { title: 'PuntoBall', genre: 'Arcade' };

describe('GameService', () => {
  let service: GameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the active games catalog', () => {
    let result: GameDTO[] = [];
    service.getGames().subscribe((games) => (result = games));

    const req = http.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush([game]);

    expect(result).toEqual([game]);
  });

  it('should get a game by id', () => {
    let result: GameDTO | undefined;
    service.getGameById(1).subscribe((value) => (result = value));

    const req = http.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(game);

    expect(result).toEqual(game);
  });

  it('should create a game', () => {
    service.createGame(payload).subscribe();

    const req = http.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(game);
  });

  it('should update a game', () => {
    service.updateGame(1, payload).subscribe();

    const req = http.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(game);
  });

  it('should soft delete a game', () => {
    let completed = false;
    service.deleteGame(1).subscribe({ complete: () => (completed = true) });

    const req = http.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});

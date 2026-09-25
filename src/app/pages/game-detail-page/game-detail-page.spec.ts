import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GameDTO, GameService } from '../../services/game';
import { GameDetailPageComponent } from './game-detail-page';

const game: GameDTO = {
  id: 5,
  title: 'PuntoBall',
  description: 'Arcade de físicas',
  version: '1.0.0',
  genre: 'Arcade',
  developerName: 'YexDynamics',
  coverImageUrl: null,
  downloadUrl: null,
  createdAt: '2026-09-10T15:30:00'
};

class GameServiceStub {
  getGameByIdResult = of(game);

  getGameById() {
    return this.getGameByIdResult;
  }
}

describe('GameDetailPageComponent', () => {
  let fixture: ComponentFixture<GameDetailPageComponent>;
  let service: GameServiceStub;
  let http: HttpTestingController;

  const element = (): HTMLElement => fixture.nativeElement;

  const create = async (id = '5'): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [GameDetailPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GameService, useValue: service },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id })), snapshot: { paramMap: convertToParamMap({ id }) } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameDetailPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    http = TestBed.inject(HttpTestingController);
  };

  beforeEach(() => {
    service = new GameServiceStub();
  });

  it('should render the game info and the leaderboard for that gameId', async () => {
    await create();

    expect(element().querySelector('.detail__title')?.textContent).toContain('PuntoBall');
    expect(element().querySelector('app-leaderboard')).toBeTruthy();

    http.expectOne('http://localhost:8080/api/v1/leaderboard/game/5').flush([]);
  });

  it('should show a not found message on 404', async () => {
    service.getGameByIdResult = throwError(() => new HttpErrorResponse({ status: 404 })) as any;
    await create();

    expect(element().querySelector('app-alert')?.textContent).toContain('no existe');
    expect(element().querySelector('app-leaderboard')).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LeaderboardComponent } from './leaderboard';

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('gameId', 1);
    await fixture.whenStable();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should create and load the scores for the given gameId', () => {
    expect(component).toBeTruthy();

    const req = http.expectOne('http://localhost:8080/api/v1/leaderboard/game/1');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nickname: 'Player1', gameTitle: 'PuntoBall', scoreValue: 1500, achievedAt: '2026-09-10T15:30:00' }]);

    expect(component.scores.length).toBe(1);
  });

  it('should reload the scores when gameId changes', () => {
    http.expectOne('http://localhost:8080/api/v1/leaderboard/game/1').flush([]);

    fixture.componentRef.setInput('gameId', 2);
    fixture.detectChanges();

    const req = http.expectOne('http://localhost:8080/api/v1/leaderboard/game/2');
    req.flush([]);
  });
});

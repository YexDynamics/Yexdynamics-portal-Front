import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LeaderboardService } from './leaderboard';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(LeaderboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

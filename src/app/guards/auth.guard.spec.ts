import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => localStorage.clear());

  it('should allow navigation when the user is authenticated', () => {
    const authService = TestBed.inject(AuthService);
    authService['persistUser']({ username: 'agente_isa', email: 'isa@example.com', nickname: null, role: 'ROLE_USER' });

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect to the home page when the user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
  });
});

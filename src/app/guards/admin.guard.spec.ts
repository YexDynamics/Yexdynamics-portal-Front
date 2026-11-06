import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });

  afterEach(() => localStorage.clear());

  it('should allow navigation for an admin user', () => {
    const authService = TestBed.inject(AuthService);
    authService['persistUser']({ username: 'admin', email: 'admin@example.com', nickname: null, role: 'ROLE_ADMIN' });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect a regular user away from admin routes', () => {
    const authService = TestBed.inject(AuthService);
    authService['persistUser']({ username: 'agente_isa', email: 'isa@example.com', nickname: null, role: 'ROLE_USER' });

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
  });

  it('should redirect anonymous visitors away from admin routes', () => {
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
  });
});

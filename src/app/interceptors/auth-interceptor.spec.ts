import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from '../services/auth';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpController: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpController.verify();
    localStorage.clear();
  });

  it('should attach the bearer token to API requests when authenticated', () => {
    authService.login({ username: 'agente_isa', password: 'secret123' }).subscribe();
    httpController
      .expectOne('http://localhost:8080/api/v1/auth/login')
      .flush({ token: 'jwt-token', username: 'agente_isa', email: 'isa@example.com', nickname: null, role: 'ROLE_USER' });

    http.get('http://localhost:8080/api/v1/games').subscribe();

    const req = httpController.expectOne('http://localhost:8080/api/v1/games');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush([]);
  });

  it('should not attach a token when there is no session', () => {
    http.get('http://localhost:8080/api/v1/games').subscribe();

    const req = httpController.expectOne('http://localhost:8080/api/v1/games');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should not attach the token to requests outside the API', () => {
    authService.login({ username: 'agente_isa', password: 'secret123' }).subscribe();
    httpController
      .expectOne('http://localhost:8080/api/v1/auth/login')
      .flush({ token: 'jwt-token', username: 'agente_isa', email: 'isa@example.com', nickname: null, role: 'ROLE_USER' });

    http.get('https://api.rawg.io/api/games').subscribe();

    const req = httpController.expectOne('https://api.rawg.io/api/games');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthResponseDTO, AuthService } from './auth';

const API_URL = 'http://localhost:8080/api/v1/auth';
const USERS_API_URL = 'http://localhost:8080/api/v1/users/me';

const response: AuthResponseDTO = {
  token: 'jwt-token',
  username: 'agente_isa',
  email: 'isa@example.com',
  nickname: null,
  role: 'ROLE_USER'
};

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should store the session and token after login', () => {
    service.login({ username: 'agente_isa', password: 'secret123' }).subscribe();

    const req = http.expectOne(`${API_URL}/login`);
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe('jwt-token');
    expect(service.user()).toEqual({
      username: 'agente_isa',
      email: 'isa@example.com',
      nickname: null,
      role: 'ROLE_USER'
    });
  });

  it('should store the session after register', () => {
    service.register({ username: 'agente_isa', email: 'isa@example.com', password: 'secret123' }).subscribe();

    const req = http.expectOne(`${API_URL}/register`);
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should identify admins from the role', () => {
    service.login({ username: 'admin', password: 'secret123' }).subscribe();
    http.expectOne(`${API_URL}/login`).flush({ ...response, role: 'ROLE_ADMIN' });

    expect(service.isAdmin()).toBe(true);
  });

  it('should clear the session on logout', () => {
    service.login({ username: 'agente_isa', password: 'secret123' }).subscribe();
    http.expectOne(`${API_URL}/login`).flush(response);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should update the nickname locally after a successful request', () => {
    service.login({ username: 'agente_isa', password: 'secret123' }).subscribe();
    http.expectOne(`${API_URL}/login`).flush(response);

    service.updateNickname('AgenteIsa').subscribe();

    const req = http.expectOne(`${USERS_API_URL}/nickname`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nickname: 'AgenteIsa' });
    req.flush('Nickname actualizado correctamente');

    expect(service.user()?.nickname).toBe('AgenteIsa');
  });
});

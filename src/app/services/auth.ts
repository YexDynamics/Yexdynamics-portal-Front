import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthResponseDTO {
  token: string;
  username: string;
  email: string;
  nickname: string | null;
  role: UserRole;
}

export interface LoginRequestDTO {
  username: string;
  password: string;
}

export interface RegisterRequestDTO {
  username: string;
  email: string;
  password: string;
  nickname?: string | null;
}

export interface AuthUser {
  username: string;
  email: string;
  nickname: string | null;
  role: UserRole;
}

const TOKEN_KEY = 'portal_indie_token';
const USER_KEY = 'portal_indie_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  private usersApiUrl = 'http://localhost:8080/api/v1/users/me';

  private readonly currentUser = signal<AuthUser | null>(this.readStoredUser());

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  constructor(private http: HttpClient) {}

  login(dto: LoginRequestDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<AuthResponseDTO>(`${this.apiUrl}/login`, dto)
      .pipe(tap((response) => this.storeSession(response)));
  }

  register(dto: RegisterRequestDTO): Observable<AuthResponseDTO> {
    return this.http
      .post<AuthResponseDTO>(`${this.apiUrl}/register`, dto)
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
  }

  updateNickname(nickname: string): Observable<string> {
    return this.http
      .put(`${this.usersApiUrl}/nickname`, { nickname }, { responseType: 'text' })
      .pipe(
        tap(() => {
          const user = this.currentUser();
          if (user) {
            this.persistUser({ ...user, nickname });
          }
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private storeSession(response: AuthResponseDTO): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    this.persistUser({
      username: response.username,
      email: response.email,
      nickname: response.nickname,
      role: response.role
    });
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}

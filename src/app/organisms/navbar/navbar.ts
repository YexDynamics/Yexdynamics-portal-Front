import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { ModalComponent } from '../../molecules/modal/modal';
import { AuthService, LoginRequestDTO, RegisterRequestDTO } from '../../services/auth';
import { AuthFormComponent, AuthMode } from '../auth-form/auth-form';
import { NicknameFormComponent } from '../nickname-form/nickname-form';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ModalComponent, AuthFormComponent, NicknameFormComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.authService.user;
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly isAdmin = this.authService.isAdmin;

  protected readonly authModalOpen = signal(false);
  protected readonly authMode = signal<AuthMode>('login');
  protected readonly authSaving = signal(false);
  protected readonly authError = signal<string | null>(null);

  protected readonly nicknameModalOpen = signal(false);
  protected readonly nicknameSaving = signal(false);
  protected readonly nicknameError = signal<string | null>(null);

  protected readonly authModalTitle = computed(() => (this.authMode() === 'login' ? 'Iniciar sesión' : 'Crear cuenta'));

  protected openLogin(): void {
    this.authMode.set('login');
    this.authError.set(null);
    this.authModalOpen.set(true);
  }

  protected openRegister(): void {
    this.authMode.set('register');
    this.authError.set(null);
    this.authModalOpen.set(true);
  }

  protected switchAuthMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.authError.set(null);
  }

  protected closeAuthModal(): void {
    this.authModalOpen.set(false);
    this.authError.set(null);
  }

  protected handleLogin(dto: LoginRequestDTO): void {
    this.authSaving.set(true);
    this.authError.set(null);

    this.authService
      .login(dto)
      .pipe(finalize(() => this.authSaving.set(false)))
      .subscribe({
        next: () => this.closeAuthModal(),
        error: (err: HttpErrorResponse) => this.authError.set(this.resolveAuthError(err, 'No se pudo iniciar sesión.'))
      });
  }

  protected handleRegister(dto: RegisterRequestDTO): void {
    this.authSaving.set(true);
    this.authError.set(null);

    this.authService
      .register(dto)
      .pipe(finalize(() => this.authSaving.set(false)))
      .subscribe({
        next: () => this.closeAuthModal(),
        error: (err: HttpErrorResponse) => this.authError.set(this.resolveAuthError(err, 'No se pudo crear la cuenta.'))
      });
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  protected openNicknameModal(): void {
    this.nicknameError.set(null);
    this.nicknameModalOpen.set(true);
  }

  protected closeNicknameModal(): void {
    this.nicknameModalOpen.set(false);
    this.nicknameError.set(null);
  }

  protected handleNicknameSubmit(nickname: string): void {
    this.nicknameSaving.set(true);
    this.nicknameError.set(null);

    this.authService
      .updateNickname(nickname)
      .pipe(finalize(() => this.nicknameSaving.set(false)))
      .subscribe({
        next: () => this.closeNicknameModal(),
        error: (err: HttpErrorResponse) =>
          this.nicknameError.set(this.resolveAuthError(err, 'No se pudo vincular el nickname.'))
      });
  }

  private resolveAuthError(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    }
    if (typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }
    return fallback;
  }
}

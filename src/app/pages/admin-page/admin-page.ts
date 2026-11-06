import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { AlertComponent, AlertVariant } from '../../atoms/alert/alert';
import { ButtonComponent } from '../../atoms/button/button';
import { AdminGameListComponent } from '../../organisms/admin-game-list/admin-game-list';
import { AdminUserTableComponent } from '../../organisms/admin-user-table/admin-user-table';
import { ConfirmDialogComponent } from '../../organisms/confirm-dialog/confirm-dialog';
import { AdminUserDTO, AdminUserService } from '../../services/admin-user';
import { AuthService, UserRole } from '../../services/auth';
import { AdminGameDTO, GameService } from '../../services/game';
import { GamesTemplateComponent } from '../../templates/games-template/games-template';

type AdminTab = 'games' | 'users';

type PendingAction =
  | { kind: 'delete-game'; game: AdminGameDTO }
  | { kind: 'ban-user'; user: AdminUserDTO }
  | { kind: 'change-role'; user: AdminUserDTO };

interface Feedback {
  type: AlertVariant;
  text: string;
}

const FEEDBACK_DURATION_MS = 5000;

const ROLE_LABELS: Record<UserRole, string> = {
  ROLE_ADMIN: 'Administrador',
  ROLE_USER: 'Usuario'
};

@Component({
  selector: 'app-admin-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GamesTemplateComponent,
    ButtonComponent,
    AlertComponent,
    AdminGameListComponent,
    AdminUserTableComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPageComponent implements OnInit, OnDestroy {
  private readonly gameService = inject(GameService);
  private readonly adminUserService = inject(AdminUserService);
  private readonly authService = inject(AuthService);

  protected readonly activeTab = signal<AdminTab>('games');

  protected readonly games = signal<AdminGameDTO[]>([]);
  protected readonly gamesLoading = signal(false);
  protected readonly gamesError = signal<string | null>(null);

  protected readonly users = signal<AdminUserDTO[]>([]);
  protected readonly usersLoading = signal(false);
  protected readonly usersError = signal<string | null>(null);

  protected readonly feedback = signal<Feedback | null>(null);
  protected readonly pendingAction = signal<PendingAction | null>(null);
  protected readonly processing = signal(false);

  protected readonly currentUsername = computed(() => this.authService.user()?.username ?? null);

  protected readonly confirmDialog = computed(() => {
    const action = this.pendingAction();
    if (!action) {
      return null;
    }

    switch (action.kind) {
      case 'delete-game':
        return {
          title: 'Eliminar juego',
          confirmLabel: 'Eliminar',
          message: `¿Eliminar permanentemente "${action.game.title}"? Esta acción no se puede deshacer.`
        };
      case 'ban-user':
        return {
          title: 'Banear usuario',
          confirmLabel: 'Banear',
          message: `¿Banear a "${action.user.username}"? No podrá iniciar sesión hasta que lo desbanees.`
        };
      case 'change-role':
        return {
          title: 'Cambiar rol',
          confirmLabel: 'Cambiar rol',
          message: `¿Cambiar el rol de "${action.user.username}" a ${ROLE_LABELS[this.nextRole(action.user)]}?`
        };
    }
  });

  private feedbackTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadGames();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    clearTimeout(this.feedbackTimer);
  }

  protected selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  protected loadGames(): void {
    this.gamesLoading.set(true);
    this.gamesError.set(null);

    this.gameService
      .getAllGamesForAdmin()
      .pipe(finalize(() => this.gamesLoading.set(false)))
      .subscribe({
        next: (games) => this.games.set(games),
        error: (err: HttpErrorResponse) =>
          this.gamesError.set(this.resolveErrorMessage(err, 'No se pudo cargar la lista de juegos.'))
      });
  }

  protected loadUsers(): void {
    this.usersLoading.set(true);
    this.usersError.set(null);

    this.adminUserService
      .getUsers()
      .pipe(finalize(() => this.usersLoading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: (err: HttpErrorResponse) =>
          this.usersError.set(this.resolveErrorMessage(err, 'No se pudo cargar la lista de usuarios.'))
      });
  }

  protected toggleGame(game: AdminGameDTO): void {
    const active = !game.active;

    this.execute(
      this.gameService.updateGameStatus(game.id, active),
      () => {
        this.games.update((games) => games.map((item) => (item.id === game.id ? { ...item, active } : item)));
        this.showFeedback('success', `Juego "${game.title}" ${active ? 'habilitado' : 'inhabilitado'} correctamente.`);
      },
      'No se pudo cambiar el estado del juego.',
      () => this.loadGames()
    );
  }

  protected requestGameDelete(game: AdminGameDTO): void {
    this.pendingAction.set({ kind: 'delete-game', game });
  }

  protected toggleUserStatus(user: AdminUserDTO): void {
    if (user.enabled) {
      this.pendingAction.set({ kind: 'ban-user', user });
      return;
    }

    this.changeUserStatus(user, true);
  }

  protected requestRoleChange(user: AdminUserDTO): void {
    this.pendingAction.set({ kind: 'change-role', user });
  }

  protected confirmAction(): void {
    const action = this.pendingAction();
    if (!action || this.processing()) {
      return;
    }

    switch (action.kind) {
      case 'delete-game':
        this.deleteGame(action.game);
        break;
      case 'ban-user':
        this.changeUserStatus(action.user, false);
        break;
      case 'change-role':
        this.changeUserRole(action.user);
        break;
    }
  }

  protected cancelAction(): void {
    if (!this.processing()) {
      this.pendingAction.set(null);
    }
  }

  protected dismissFeedback(): void {
    clearTimeout(this.feedbackTimer);
    this.feedback.set(null);
  }

  private deleteGame(game: AdminGameDTO): void {
    this.execute(
      this.gameService.hardDeleteGame(game.id),
      () => {
        this.games.update((games) => games.filter((item) => item.id !== game.id));
        this.showFeedback('success', `Juego "${game.title}" eliminado permanentemente.`);
      },
      'No se pudo eliminar el juego.',
      () => this.loadGames()
    );
  }

  private changeUserStatus(user: AdminUserDTO, enabled: boolean): void {
    this.execute(
      this.adminUserService.updateUserStatus(user.id, enabled),
      (updated) => {
        this.replaceUser(updated);
        this.showFeedback('success', `Usuario "${user.username}" ${enabled ? 'desbaneado' : 'baneado'} correctamente.`);
      },
      'No se pudo cambiar el estado del usuario.',
      () => this.loadUsers()
    );
  }

  private changeUserRole(user: AdminUserDTO): void {
    const role = this.nextRole(user);

    this.execute(
      this.adminUserService.updateUserRole(user.id, role),
      (updated) => {
        this.replaceUser(updated);
        this.showFeedback('success', `"${user.username}" ahora es ${ROLE_LABELS[role]}.`);
      },
      'No se pudo cambiar el rol del usuario.',
      () => this.loadUsers()
    );
  }

  private execute<T>(request$: Observable<T>, onSuccess: (result: T) => void, fallback: string, onNotFound: () => void): void {
    this.processing.set(true);

    request$
      .pipe(
        finalize(() => {
          this.processing.set(false);
          this.pendingAction.set(null);
        })
      )
      .subscribe({
        next: onSuccess,
        error: (err: HttpErrorResponse) => {
          this.showFeedback('error', this.resolveErrorMessage(err, fallback));
          if (err.status === 404) {
            onNotFound();
          }
        }
      });
  }

  private nextRole(user: AdminUserDTO): UserRole {
    return user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
  }

  private replaceUser(updated: AdminUserDTO): void {
    this.users.update((users) => users.map((user) => (user.id === updated.id ? updated : user)));
  }

  private showFeedback(type: AlertVariant, text: string): void {
    clearTimeout(this.feedbackTimer);
    this.feedback.set({ type, text });

    if (type === 'success') {
      this.feedbackTimer = setTimeout(() => this.feedback.set(null), FEEDBACK_DURATION_MS);
    }
  }

  private resolveErrorMessage(err: HttpErrorResponse, fallback: string): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    }
    if (err.status < 500 && typeof err.error === 'string' && err.error.trim()) {
      return err.error;
    }
    return fallback;
  }
}

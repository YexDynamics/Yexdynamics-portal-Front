import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AdminUserDTO, AdminUserService } from '../../services/admin-user';
import { AuthService, UserRole } from '../../services/auth';
import { AdminGameDTO, GameService } from '../../services/game';
import { AdminPageComponent } from './admin-page';

const buildGame = (id: number, title: string, active: boolean): AdminGameDTO => ({
  id,
  title,
  description: null,
  version: '1.0.0',
  genre: null,
  developerName: null,
  coverImageUrl: null,
  downloadUrl: null,
  active,
  ownerUsername: 'agente_isa',
  createdAt: '2026-09-10T15:30:00'
});

const buildUser = (id: number, username: string, role: UserRole, enabled: boolean): AdminUserDTO => ({
  id,
  username,
  nickname: null,
  email: `${username}@example.com`,
  role,
  enabled,
  createdAt: '2026-09-10T15:30:00'
});

class GameServiceStub {
  games: AdminGameDTO[] = [buildGame(1, 'PuntoBall', true), buildGame(2, 'Astro Dash', false)];
  statusCalls: Array<[number, boolean]> = [];
  deletedIds: number[] = [];
  deleteResult: Observable<void> = of(undefined);

  getAllGamesForAdmin(): Observable<AdminGameDTO[]> {
    return of([...this.games]);
  }

  updateGameStatus(id: number, active: boolean): Observable<string> {
    this.statusCalls.push([id, active]);
    return of('Estado del juego actualizado correctamente');
  }

  hardDeleteGame(id: number): Observable<void> {
    this.deletedIds.push(id);
    return this.deleteResult;
  }
}

class AdminUserServiceStub {
  users: AdminUserDTO[] = [buildUser(1, 'admin', 'ROLE_ADMIN', true), buildUser(2, 'agente_isa', 'ROLE_USER', true)];
  statusCalls: Array<[number, boolean]> = [];
  roleCalls: Array<[number, UserRole]> = [];

  getUsers(): Observable<AdminUserDTO[]> {
    return of([...this.users]);
  }

  updateUserStatus(id: number, enabled: boolean): Observable<AdminUserDTO> {
    this.statusCalls.push([id, enabled]);
    return of({ ...this.users.find((user) => user.id === id)!, enabled });
  }

  updateUserRole(id: number, role: UserRole): Observable<AdminUserDTO> {
    this.roleCalls.push([id, role]);
    return of({ ...this.users.find((user) => user.id === id)!, role });
  }
}

describe('AdminPageComponent', () => {
  let fixture: ComponentFixture<AdminPageComponent>;
  let gameService: GameServiceStub;
  let userService: AdminUserServiceStub;

  const element = (): HTMLElement => fixture.nativeElement;
  const feedbackText = (): string => element().querySelector('[slot="feedback"]')?.textContent ?? '';

  const create = async (): Promise<void> => {
    fixture = TestBed.createComponent(AdminPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const clickTab = (label: string): void => {
    const button = Array.from(element().querySelectorAll<HTMLButtonElement>('.admin-page__tabs button')).find((btn) =>
      btn.textContent?.includes(label)
    )!;
    button.click();
    fixture.detectChanges();
  };

  const click = (selector: string): void => {
    element().querySelector<HTMLElement>(selector)!.click();
    fixture.detectChanges();
  };

  beforeAll(() => {
    const proto = HTMLDialogElement.prototype as Partial<HTMLDialogElement>;
    proto.showModal ??= function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    proto.close ??= function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
  });

  beforeEach(async () => {
    localStorage.clear();
    gameService = new GameServiceStub();
    userService = new AdminUserServiceStub();

    await TestBed.configureTestingModule({
      imports: [AdminPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: GameService, useValue: gameService },
        { provide: AdminUserService, useValue: userService }
      ]
    }).compileComponents();

    TestBed.inject(AuthService)['persistUser']({
      username: 'admin',
      email: 'admin@example.com',
      nickname: null,
      role: 'ROLE_ADMIN'
    });
  });

  afterEach(() => localStorage.clear());

  it('should list every game, including disabled ones, with their owner', async () => {
    await create();

    const rows = element().querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('agente_isa');
    expect(rows[1].textContent).toContain('Inhabilitado');
  });

  it('should toggle a game status without asking for confirmation', async () => {
    await create();

    click('tbody tr:first-child .btn--secondary');

    expect(gameService.statusCalls).toEqual([[1, false]]);
    expect(element().querySelector('tbody tr:first-child')?.textContent).toContain('Inhabilitado');
    expect(feedbackText()).toContain('inhabilitado correctamente');
  });

  it('should hard delete a game only after confirmation', async () => {
    await create();

    click('tbody tr:first-child .btn--danger');
    expect(element().querySelector('app-confirm-dialog')).toBeTruthy();
    expect(gameService.deletedIds.length).toBe(0);

    click('app-confirm-dialog .btn--danger');

    expect(gameService.deletedIds).toEqual([1]);
    expect(element().querySelectorAll('tbody tr').length).toBe(1);
    expect(element().querySelector('app-confirm-dialog')).toBeNull();
  });

  it('should keep the game and show the backend message when the delete is rejected', async () => {
    gameService.deleteResult = throwError(
      () => new HttpErrorResponse({ status: 409, error: 'No se puede eliminar el juego porque tiene puntajes asociados' })
    );
    await create();

    click('tbody tr:first-child .btn--danger');
    click('app-confirm-dialog .btn--danger');

    expect(element().querySelectorAll('tbody tr').length).toBe(2);
    expect(feedbackText()).toContain('tiene puntajes asociados');
  });

  it('should show the users table with their data in the users tab', async () => {
    await create();
    clickTab('Usuarios');

    const rows = element().querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[1].textContent).toContain('agente_isa@example.com');
    expect(rows[1].textContent).toContain('Usuario');
  });

  it('should not offer actions on the logged admin account', async () => {
    await create();
    clickTab('Usuarios');

    const rows = element().querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Tu cuenta');
    expect(rows[0].querySelector('button')).toBeNull();
  });

  it('should ban a user only after confirmation', async () => {
    await create();
    clickTab('Usuarios');

    click('tbody tr:nth-child(2) .btn--danger');
    expect(userService.statusCalls.length).toBe(0);

    click('app-confirm-dialog .btn--danger');

    expect(userService.statusCalls).toEqual([[2, false]]);
    expect(element().querySelector('tbody tr:nth-child(2)')?.textContent).toContain('Baneado');
  });

  it('should unban a banned user directly', async () => {
    userService.users = [buildUser(1, 'admin', 'ROLE_ADMIN', true), buildUser(2, 'agente_isa', 'ROLE_USER', false)];
    await create();
    clickTab('Usuarios');

    click('tbody tr:nth-child(2) .btn--secondary');

    expect(userService.statusCalls).toEqual([[2, true]]);
    expect(element().querySelector('app-confirm-dialog')).toBeNull();
    expect(element().querySelector('tbody tr:nth-child(2)')?.textContent).toContain('Activo');
  });

  it('should swap the role of a user after confirmation', async () => {
    await create();
    clickTab('Usuarios');

    const buttons = element().querySelectorAll<HTMLButtonElement>('tbody tr:nth-child(2) button');
    buttons[1].click();
    fixture.detectChanges();
    expect(element().querySelector('app-confirm-dialog')?.textContent).toContain('Administrador');

    click('app-confirm-dialog .btn--danger');

    expect(userService.roleCalls).toEqual([[2, 'ROLE_ADMIN']]);
    expect(element().querySelector('tbody tr:nth-child(2)')?.textContent).toContain('Administrador');
  });
});

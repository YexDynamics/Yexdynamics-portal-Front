import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AdminUserDTO } from '../../services/admin-user';
import { AdminUserTableComponent } from './admin-user-table';

const buildUser = (id: number, username: string, role: AdminUserDTO['role'], enabled: boolean): AdminUserDTO => ({
  id,
  username,
  nickname: null,
  email: `${username}@example.com`,
  role,
  enabled,
  createdAt: '2026-09-10T15:30:00'
});

describe('AdminUserTableComponent', () => {
  let fixture: ComponentFixture<AdminUserTableComponent>;
  let statusRequests: AdminUserDTO[];
  let roleRequests: AdminUserDTO[];

  const element = (): HTMLElement => fixture.nativeElement;
  const rows = (): HTMLElement[] => Array.from(element().querySelectorAll('tbody tr'));

  const render = (users: AdminUserDTO[]): void => {
    fixture.componentRef.setInput('users', users);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserTableComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminUserTableComponent);
    statusRequests = [];
    roleRequests = [];
    fixture.componentInstance.statusToggleRequested.subscribe((user) => statusRequests.push(user));
    fixture.componentInstance.roleChangeRequested.subscribe((user) => roleRequests.push(user));
  });

  it('should show username, email, role and status', () => {
    render([buildUser(1, 'admin', 'ROLE_ADMIN', true), buildUser(2, 'agente_isa', 'ROLE_USER', false)]);

    expect(rows()[0].textContent).toContain('admin@example.com');
    expect(rows()[0].textContent).toContain('Administrador');
    expect(rows()[0].textContent).toContain('Activo');
    expect(rows()[1].textContent).toContain('Usuario');
    expect(rows()[1].textContent).toContain('Baneado');
  });

  it('should offer to ban an active user and to unban a banned one', () => {
    render([buildUser(2, 'agente_isa', 'ROLE_USER', true), buildUser(3, 'otro', 'ROLE_USER', false)]);

    expect(rows()[0].querySelector('.btn--danger')?.textContent).toContain('Banear');
    expect(rows()[1].textContent).toContain('Desbanear');
  });

  it('should emit the status and role requests with the user', () => {
    const user = buildUser(2, 'agente_isa', 'ROLE_USER', true);
    render([user]);

    const buttons = rows()[0].querySelectorAll<HTMLButtonElement>('button');
    buttons[0].click();
    buttons[1].click();

    expect(statusRequests).toEqual([user]);
    expect(roleRequests).toEqual([user]);
  });

  it('should not offer actions on the current admin account', () => {
    fixture.componentRef.setInput('currentUsername', 'admin');
    render([buildUser(1, 'admin', 'ROLE_ADMIN', true), buildUser(2, 'agente_isa', 'ROLE_USER', true)]);

    expect(rows()[0].querySelector('button')).toBeNull();
    expect(rows()[0].textContent).toContain('Tu cuenta');
    expect(rows()[1].querySelectorAll('button').length).toBe(2);
  });

  it('should disable the actions while busy', () => {
    fixture.componentRef.setInput('busy', true);
    render([buildUser(2, 'agente_isa', 'ROLE_USER', true)]);

    rows()[0].querySelectorAll<HTMLButtonElement>('button').forEach((button) => expect(button.disabled).toBe(true));
  });
});

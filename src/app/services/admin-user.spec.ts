import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminUserDTO, AdminUserService } from './admin-user';

const API_URL = 'http://localhost:8080/api/v1/admin/users';

const user: AdminUserDTO = {
  id: 2,
  username: 'agente_isa',
  nickname: null,
  email: 'isa@example.com',
  role: 'ROLE_USER',
  enabled: true,
  createdAt: '2026-09-10T15:30:00'
};

describe('AdminUserService', () => {
  let service: AdminUserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AdminUserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should get all users', () => {
    let result: AdminUserDTO[] = [];
    service.getUsers().subscribe((users) => (result = users));

    const req = http.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush([user]);

    expect(result).toEqual([user]);
  });

  it('should ban or unban a user', () => {
    let result: AdminUserDTO | undefined;
    service.updateUserStatus(2, false).subscribe((value) => (result = value));

    const req = http.expectOne(`${API_URL}/2/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ ...user, enabled: false });

    expect(result?.enabled).toBe(false);
  });

  it('should change the role of a user', () => {
    let result: AdminUserDTO | undefined;
    service.updateUserRole(2, 'ROLE_ADMIN').subscribe((value) => (result = value));

    const req = http.expectOne(`${API_URL}/2/role`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'ROLE_ADMIN' });
    req.flush({ ...user, role: 'ROLE_ADMIN' });

    expect(result?.role).toBe('ROLE_ADMIN');
  });
});

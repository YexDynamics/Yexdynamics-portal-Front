import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let http: HttpTestingController;

  const element = (): HTMLElement => fixture.nativeElement;

  const fill = (id: string, value: string): void => {
    const field = element().querySelector<HTMLInputElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
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
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should show login and register actions when logged out', () => {
    expect(element().textContent).toContain('Iniciar sesión');
    expect(element().textContent).toContain('Registrarse');
  });

  it('should log in and show the username', () => {
    element().querySelector<HTMLButtonElement>('.navbar__action')!.click();
    fixture.detectChanges();

    fill('login-username', 'agente_isa');
    fill('login-password', 'secret123');
    element().querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne('http://localhost:8080/api/v1/auth/login').flush({
      token: 'jwt-token',
      username: 'agente_isa',
      email: 'isa@example.com',
      nickname: null,
      role: 'ROLE_USER'
    });
    fixture.detectChanges();

    expect(element().querySelector('app-modal')).toBeNull();
    expect(element().textContent).toContain('agente_isa');
    expect(element().textContent).toContain('Vincular nickname');
  });

  it('should log out and show the login actions again', () => {
    element().querySelector<HTMLButtonElement>('.navbar__action')!.click();
    fixture.detectChanges();
    fill('login-username', 'agente_isa');
    fill('login-password', 'secret123');
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    http.expectOne('http://localhost:8080/api/v1/auth/login').flush({
      token: 'jwt-token',
      username: 'agente_isa',
      email: 'isa@example.com',
      nickname: null,
      role: 'ROLE_USER'
    });
    fixture.detectChanges();

    const buttons = Array.from(element().querySelectorAll('.navbar__action'));
    buttons.find((btn) => btn.textContent?.includes('Cerrar sesión'))!.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    expect(element().textContent).toContain('Iniciar sesión');
  });

  const loginAs = (role: 'ROLE_USER' | 'ROLE_ADMIN'): void => {
    element().querySelector<HTMLButtonElement>('.navbar__action')!.click();
    fixture.detectChanges();
    fill('login-username', 'agente_isa');
    fill('login-password', 'secret123');
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    http.expectOne('http://localhost:8080/api/v1/auth/login').flush({
      token: 'jwt-token',
      username: 'agente_isa',
      email: 'isa@example.com',
      nickname: null,
      role
    });
    fixture.detectChanges();
  };

  it('should hide the admin link for anonymous visitors and regular users', () => {
    expect(element().querySelector('a[href="/admin"]')).toBeNull();

    loginAs('ROLE_USER');

    expect(element().querySelector('a[href="/admin"]')).toBeNull();
  });

  it('should show the admin link only for admins', () => {
    loginAs('ROLE_ADMIN');

    expect(element().querySelector('a[href="/admin"]')).toBeTruthy();
  });

  it('should send the user back to the home page on logout', async () => {
    const router = TestBed.inject(Router);
    router.resetConfig([{ path: '', children: [] }, { path: 'games', children: [] }]);
    await router.navigateByUrl('/games');
    loginAs('ROLE_USER');

    const buttons = Array.from(element().querySelectorAll('.navbar__action'));
    buttons.find((btn) => btn.textContent?.includes('Cerrar sesión'))!.dispatchEvent(new Event('click'));
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });
});

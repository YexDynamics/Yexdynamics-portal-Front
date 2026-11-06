import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { LoginRequestDTO, RegisterRequestDTO } from '../../services/auth';
import { AuthFormComponent, AuthMode } from './auth-form';

describe('AuthFormComponent', () => {
  let fixture: ComponentFixture<AuthFormComponent>;
  let loginEmitted: LoginRequestDTO[];
  let registerEmitted: RegisterRequestDTO[];
  let modeChanges: AuthMode[];

  const element = (): HTMLElement => fixture.nativeElement;

  const fill = (id: string, value: string): void => {
    const field = element().querySelector<HTMLInputElement>(`#${id}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  };

  const submit = (): void => {
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFormComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthFormComponent);
    loginEmitted = [];
    registerEmitted = [];
    modeChanges = [];
    fixture.componentInstance.loginSubmitted.subscribe((value) => loginEmitted.push(value));
    fixture.componentInstance.registerSubmitted.subscribe((value) => registerEmitted.push(value));
    fixture.componentInstance.modeChanged.subscribe((value) => modeChanges.push(value));
  });

  it('should emit login credentials when the login form is valid', () => {
    fixture.detectChanges();
    fill('login-username', '  agente_isa  ');
    fill('login-password', 'secret123');
    submit();

    expect(loginEmitted).toEqual([{ username: 'agente_isa', password: 'secret123' }]);
  });

  it('should not submit the login form when a field is blank', () => {
    fixture.detectChanges();
    fill('login-username', '');
    submit();

    expect(loginEmitted.length).toBe(0);
    expect(element().querySelector('.field__error')?.textContent).toContain('obligatorio');
  });

  it('should switch to the register form and emit a trimmed payload with a null nickname', () => {
    fixture.componentRef.setInput('mode', 'register');
    fixture.detectChanges();

    fill('register-username', 'agente_isa');
    fill('register-email', 'isa@example.com');
    fill('register-password', 'superClaveSegura123');
    submit();

    expect(registerEmitted).toEqual([
      { username: 'agente_isa', email: 'isa@example.com', password: 'superClaveSegura123', nickname: null }
    ]);
  });

  it('should reject an invalid email on the register form', () => {
    fixture.componentRef.setInput('mode', 'register');
    fixture.detectChanges();

    fill('register-username', 'agente_isa');
    fill('register-email', 'no-es-un-correo');
    fill('register-password', 'superClaveSegura123');
    submit();

    expect(registerEmitted.length).toBe(0);
    expect(element().querySelector('.field__error')?.textContent).toContain('correo válido');
  });

  it('should request a mode switch', () => {
    fixture.detectChanges();
    element().querySelector<HTMLButtonElement>('.auth-form__link')!.click();

    expect(modeChanges).toEqual(['register']);
  });

  it('should display the server error', () => {
    fixture.componentRef.setInput('serverError', 'Usuario o contraseña incorrectos');
    fixture.detectChanges();

    expect(element().querySelector('app-alert')?.textContent).toContain('incorrectos');
  });
});

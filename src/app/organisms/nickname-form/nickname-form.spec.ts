import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NicknameFormComponent } from './nickname-form';

describe('NicknameFormComponent', () => {
  let fixture: ComponentFixture<NicknameFormComponent>;
  let emitted: string[];

  const element = (): HTMLElement => fixture.nativeElement;

  const submit = (): void => {
    element().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NicknameFormComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(NicknameFormComponent);
    emitted = [];
    fixture.componentInstance.submitted.subscribe((value) => emitted.push(value));
  });

  it('should prefill the field with the current nickname', () => {
    fixture.componentRef.setInput('currentNickname', 'AgenteIsa');
    fixture.detectChanges();

    expect(element().querySelector<HTMLInputElement>('#nickname-field')!.value).toBe('AgenteIsa');
  });

  it('should not submit when the nickname is blank', () => {
    fixture.detectChanges();
    submit();

    expect(emitted.length).toBe(0);
    expect(element().querySelector('.field__error')?.textContent).toContain('obligatorio');
  });

  it('should emit the trimmed nickname', () => {
    fixture.detectChanges();
    const field = element().querySelector<HTMLInputElement>('#nickname-field')!;
    field.value = '  AgenteIsa  ';
    field.dispatchEvent(new Event('input'));
    submit();

    expect(emitted).toEqual(['AgenteIsa']);
  });

  it('should display the server error', () => {
    fixture.componentRef.setInput('serverError', 'El nickname ya está en uso: AgenteIsa');
    fixture.detectChanges();

    expect(element().querySelector('app-alert')?.textContent).toContain('ya está en uso');
  });
});

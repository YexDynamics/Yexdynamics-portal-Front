import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TokenFieldComponent } from './token-field';

describe('TokenFieldComponent', () => {
  let fixture: ComponentFixture<TokenFieldComponent>;
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenFieldComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TokenFieldComponent);
    fixture.componentRef.setInput('token', 'abc-123');
    fixture.detectChanges();
  });

  it('should show the token in a read-only input', () => {
    const input = element().querySelector<HTMLInputElement>('input')!;
    expect(input.value).toBe('abc-123');
    expect(input.readOnly).toBe(true);
  });

  it('should copy the token to the clipboard and confirm it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

    element().querySelector('button')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('abc-123');
    expect(element().querySelector('button')?.textContent).toContain('¡Copiado!');
  });
});

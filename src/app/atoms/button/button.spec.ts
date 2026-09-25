import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let clicks: number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => clicks++);
  });

  const nativeButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  it('should emit clicked when pressed', () => {
    fixture.detectChanges();
    nativeButton().click();
    expect(clicks).toBe(1);
  });

  it('should not emit clicked when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    nativeButton().click();
    expect(clicks).toBe(0);
  });

  it('should be disabled while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(nativeButton().disabled).toBe(true);
  });
});

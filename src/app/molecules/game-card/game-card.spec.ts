import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GameDTO } from '../../services/game';
import { GameCardComponent } from './game-card';

const game: GameDTO = {
  id: 7,
  title: 'PuntoBall',
  description: 'Arcade de físicas',
  version: '1.0.0',
  genre: 'Arcade',
  developerName: 'YexDynamics',
  coverImageUrl: 'https://example.com/cover.png',
  downloadUrl: 'https://example.com/play',
  createdAt: '2026-09-10T15:30:00'
};

describe('GameCardComponent', () => {
  let fixture: ComponentFixture<GameCardComponent>;
  let edited: GameDTO[];
  let disabled: GameDTO[];

  const element = (): HTMLElement => fixture.nativeElement;

  const render = (value: GameDTO = game): void => {
    fixture.componentRef.setInput('game', value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCardComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(GameCardComponent);
    edited = [];
    disabled = [];
    fixture.componentInstance.editRequested.subscribe((value) => edited.push(value));
    fixture.componentInstance.disableRequested.subscribe((value) => disabled.push(value));
  });

  it('should render the game information', () => {
    render();

    expect(element().querySelector('.card__title')?.textContent).toContain('PuntoBall');
    expect(element().querySelector('.card__developer')?.textContent).toContain('YexDynamics');
    expect(element().querySelector('img')).toBeTruthy();
    expect(element().querySelector('.card__link')).toBeTruthy();
  });

  it('should link the preview to the game detail route', () => {
    render();

    const preview = element().querySelector('a.card__preview')!;
    expect(preview.getAttribute('href')).toBe('/games/7');
  });

  it('should show a placeholder when the game has no cover', () => {
    render({ ...game, coverImageUrl: null });

    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('.card__cover--placeholder')).toBeTruthy();
  });

  it('should fall back to the placeholder when the cover fails to load', () => {
    render();

    element().querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('.card__cover--placeholder')).toBeTruthy();
  });

  it('should request edit and disable with the game', () => {
    render();

    element().querySelector<HTMLButtonElement>('.btn--secondary')!.click();
    element().querySelector<HTMLButtonElement>('.btn--danger')!.click();

    expect(edited).toEqual([game]);
    expect(disabled).toEqual([game]);
  });

  it('should hide the actions footer in public mode', () => {
    fixture.componentRef.setInput('showActions', false);
    render();

    expect(element().querySelector('.card__actions')).toBeNull();
  });
});

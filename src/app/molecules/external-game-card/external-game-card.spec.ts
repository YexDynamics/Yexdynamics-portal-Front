import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ExternalGameResponseDTO } from '../../services/external-game';
import { ExternalGameCardComponent } from './external-game-card';

const game: ExternalGameResponseDTO = {
  id: 3498,
  title: 'Hollow Knight',
  releaseDate: '2017-02-24',
  coverImageUrl: 'https://media.rawg.io/media/games/cover.jpg',
  rating: 4.4,
  genres: ['Action', 'Adventure'],
  platforms: ['PC']
};

describe('ExternalGameCardComponent', () => {
  let fixture: ComponentFixture<ExternalGameCardComponent>;

  const element = (): HTMLElement => fixture.nativeElement;

  const render = (value: ExternalGameResponseDTO = game): void => {
    fixture.componentRef.setInput('game', value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalGameCardComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalGameCardComponent);
  });

  it('should render the game title, rating and genres', () => {
    render();

    expect(element().querySelector('.ext-card__title')?.textContent).toContain('Hollow Knight');
    expect(element().querySelector('.ext-card__rating')?.textContent).toContain('4.4');
    expect(element().querySelector('.ext-card__genres')?.textContent).toContain('Action, Adventure');
  });

  it('should link to the external game detail route', () => {
    render();

    const link = element().querySelector('a.ext-card')!;
    expect(link.getAttribute('href')).toBe('/external-games/3498');
  });

  it('should show a placeholder when there is no cover', () => {
    render({ ...game, coverImageUrl: null });

    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('.ext-card__cover--placeholder')).toBeTruthy();
  });

  it('should fall back to the placeholder when the cover fails to load', () => {
    render();

    element().querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(element().querySelector('img')).toBeNull();
    expect(element().querySelector('.ext-card__cover--placeholder')).toBeTruthy();
  });
});

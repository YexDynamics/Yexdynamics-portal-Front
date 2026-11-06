import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AdminGameDTO } from '../../services/game';
import { AdminGameListComponent } from './admin-game-list';

const buildGame = (id: number, title: string, active: boolean, ownerUsername: string | null): AdminGameDTO => ({
  id,
  title,
  description: null,
  version: '1.0.0',
  genre: 'Arcade',
  developerName: null,
  coverImageUrl: null,
  downloadUrl: null,
  active,
  ownerUsername,
  createdAt: '2026-09-10T15:30:00'
});

describe('AdminGameListComponent', () => {
  let fixture: ComponentFixture<AdminGameListComponent>;
  let toggled: AdminGameDTO[];
  let deleted: AdminGameDTO[];

  const element = (): HTMLElement => fixture.nativeElement;
  const rows = (): HTMLElement[] => Array.from(element().querySelectorAll('tbody tr'));

  const render = (games: AdminGameDTO[]): void => {
    fixture.componentRef.setInput('games', games);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGameListComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGameListComponent);
    toggled = [];
    deleted = [];
    fixture.componentInstance.toggleRequested.subscribe((game) => toggled.push(game));
    fixture.componentInstance.deleteRequested.subscribe((game) => deleted.push(game));
  });

  it('should show every game with its owner and status', () => {
    render([buildGame(1, 'PuntoBall', true, 'agente_isa'), buildGame(2, 'Astro Dash', false, null)]);

    expect(rows().length).toBe(2);
    expect(rows()[0].textContent).toContain('agente_isa');
    expect(rows()[0].textContent).toContain('Habilitado');
    expect(rows()[1].textContent).toContain('Sin propietario');
    expect(rows()[1].textContent).toContain('Inhabilitado');
  });

  it('should offer to enable a disabled game and to disable an enabled one', () => {
    render([buildGame(1, 'PuntoBall', true, 'agente_isa'), buildGame(2, 'Astro Dash', false, null)]);

    expect(rows()[0].querySelector('.btn--secondary')?.textContent).toContain('Deshabilitar');
    expect(rows()[1].querySelector('.btn--secondary')?.textContent).toContain('Habilitar');
  });

  it('should emit the toggle and delete requests with the game', () => {
    const game = buildGame(1, 'PuntoBall', true, 'agente_isa');
    render([game]);

    rows()[0].querySelector<HTMLButtonElement>('.btn--secondary')!.click();
    rows()[0].querySelector<HTMLButtonElement>('.btn--danger')!.click();

    expect(toggled).toEqual([game]);
    expect(deleted).toEqual([game]);
  });

  it('should disable the actions while busy', () => {
    fixture.componentRef.setInput('busy', true);
    render([buildGame(1, 'PuntoBall', true, 'agente_isa')]);

    expect(rows()[0].querySelector<HTMLButtonElement>('.btn--secondary')!.disabled).toBe(true);
    expect(rows()[0].querySelector<HTMLButtonElement>('.btn--danger')!.disabled).toBe(true);
  });

  it('should show an empty state', () => {
    render([]);

    expect(element().querySelector('.admin-list__state')?.textContent).toContain('No hay juegos');
  });
});

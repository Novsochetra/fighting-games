import { describe, expect, it } from 'vitest';
import { menuBackdrop } from '../../../src/ui/menus/menu-backdrop.js';

describe('what lies behind the open menu', () => {
  it('shows the painting undimmed behind the title and the hero select', () => {
    expect(menuBackdrop(['title'])).toEqual({ scene: 'on', dim: 'none' });
    expect(menuBackdrop(['title', 'heroes'])).toEqual({ scene: 'on', dim: 'none' });
  });

  it('keeps the painting behind a panel opened from the title, dimmed under it', () => {
    expect(menuBackdrop(['title', 'settings'])).toEqual({ scene: 'on', dim: 'panel' });
    expect(menuBackdrop(['title', 'help'])).toEqual({ scene: 'on', dim: 'panel' });
  });

  it('dims the game itself behind the pause, defeat and clear menus', () => {
    expect(menuBackdrop(['pause'])).toEqual({ scene: 'off', dim: 'menu' });
    expect(menuBackdrop(['over'])).toEqual({ scene: 'off', dim: 'menu' });
    expect(menuBackdrop(['clear'])).toEqual({ scene: 'off', dim: 'menu' });
    expect(menuBackdrop(['pause', 'settings'])).toEqual({ scene: 'off', dim: 'panel' });
  });

  it('keeps the last road in sight behind the credits, dimmed like the clear menu', () => {
    expect(menuBackdrop(['clear', 'credits'])).toEqual({ scene: 'off', dim: 'menu' });
  });

  it('keeps only a light dim over the screen while the skins are looked at and laid out', () => {
    const fromTitle = ['title', 'settings', 'section', 'skins'];
    const fromPause = ['pause', 'settings', 'section', 'skins'];

    expect(menuBackdrop(fromTitle)).toEqual({ scene: 'on', dim: 'light' });
    expect(menuBackdrop(fromPause)).toEqual({ scene: 'off', dim: 'light' });
  });

  it('brings the painting up for the hero list after a fall', () => {
    expect(menuBackdrop(['over', 'heroes'])).toEqual({ scene: 'on', dim: 'none' });
  });

  it('clears everything while the game is played', () => {
    expect(menuBackdrop([])).toEqual({ scene: 'off', dim: 'none' });
  });
});

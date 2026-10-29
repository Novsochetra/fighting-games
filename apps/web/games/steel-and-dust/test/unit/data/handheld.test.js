import { describe, expect, it } from 'vitest';
import { CLEAR_SKINS } from '../../../src/data/skins/clear.js';
import { PIXEL_SKINS } from '../../../src/data/skins/pixel.js';

const placesOf = (items) => items.map(({ id, at, size }) => ({ id, at, size }));
const classesOf = (items) => Object.fromEntries(items.map((item) => [item.id, item.class]));

describe('the handheld skins', () => {
  // every shell frames the game between panels of one width, which its controls are placed to fit
  it('stand every control where the Clear handheld stands it, held either way', () => {
    const clear = CLEAR_SKINS['clear-lotus'];

    for (const skin of Object.values(PIXEL_SKINS)) {
      for (const orientation of ['landscape', 'portrait']) {
        const layout = skin.layouts[orientation];

        expect(layout.screen, skin.id).toEqual(clear.layouts[orientation].screen);
        expect(placesOf(layout.items), skin.id).toEqual(placesOf(clear.layouts[orientation].items));
        expect(placesOf(skin.pills[orientation]), skin.id).toEqual(
          placesOf(clear.pills[orientation]),
        );
      }
    }
  });

  // a key reaching past its panel stands on the bezel round the game, or on the game itself; a
  // pill may be turned to a slant, so it is measured at its widest, corner to corner
  it('keep every control held sideways on its panel, clear of the game’s screen', () => {
    for (const skin of [CLEAR_SKINS['clear-lotus'], ...Object.values(PIXEL_SKINS)]) {
      const { screen, items } = skin.layouts.landscape;
      const widest = (item) => (item.aspect ? Math.hypot(1, item.aspect) : 1) * item.size;
      const reach = (item) => Math.abs(item.at.dx) + widest(item) / 2;

      for (const item of [...items, ...skin.pills.landscape]) {
        const panel = item.at.x === 0 ? screen.left : screen.right;

        expect(reach(item), `${skin.id} ${item.id}`).toBeLessThanOrEqual(panel);
      }
    }
  });

  it('dress the shell and each control in the skin’s own classes, its pills shaped as its art', () => {
    const { layouts, pills } = PIXEL_SKINS.sandstone;

    expect(layouts.portrait.shell.class).toBe('pixel sandstone');
    expect(classesOf(layouts.landscape.items)).toMatchObject({
      dpad: 'pixel-dpad sandstone',
      light: 'pixel-button pixel-light sandstone',
      ult: 'pixel-button pixel-ult sandstone',
    });
    expect(pills.landscape.map((item) => [item.class, item.aspect])).toEqual([
      ['pixel-button pixel-pill pixel-dash sandstone', 0.45],
      ['pixel-button pixel-pill pixel-ult sandstone', 0.45],
    ]);
    expect(CLEAR_SKINS['clear-jade'].layouts.landscape.shell.class).toBe('clear clear-jade');
    expect(classesOf(CLEAR_SKINS['clear-jade'].pills.portrait).dash).toBe(
      'clear-button clear-pill clear-dash clear-jade',
    );
  });
});

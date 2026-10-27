import { describe, expect, it } from 'vitest';
import { fitMenus, menuBox } from '../../../src/ui/screen/menu-area.js';

const rect = (x, y, width, height) => ({ x, y, width, height });

function fakeMenus() {
  const properties = new Map();
  const style = {
    setProperty: (name, value) => properties.set(name, value),
    removeProperty: (name) => properties.delete(name),
  };

  return { style, properties };
}

describe('the menus on a folded phone', () => {
  it('fill the screen without a hinge', () => {
    expect(menuBox({ hinge: null, width: 844, height: 390 })).toBeNull();
  });

  it('stand on the left screen of a Surface Duo held like a book', () => {
    const left = rect(0, 0, 540, 720);

    expect(menuBox({ hinge: { stacked: false, game: left }, width: 1114, height: 720 })).toBe(left);
  });

  it('stand on the top half of a Flip on a table', () => {
    const top = rect(0, 0, 412, 502);

    expect(menuBox({ hinge: { stacked: true, game: top }, width: 412, height: 1004 })).toBe(top);
  });

  it('keep the whole screen of a Fold, whose halves are too small for words sized on all of it', () => {
    const top = rect(0, 0, 1104, 442);
    const left = rect(0, 0, 442, 1104);

    expect(menuBox({ hinge: { stacked: true, game: top }, width: 1104, height: 884 })).toBeNull();
    expect(menuBox({ hinge: { stacked: false, game: left }, width: 884, height: 1104 })).toBeNull();
  });

  it('are placed by the box and let go of it once the phone lies flat', () => {
    const menus = fakeMenus();

    fitMenus(menus, rect(0, 574, 720, 540));
    expect(Object.fromEntries(menus.properties)).toEqual({
      '--menu-x': '0px',
      '--menu-y': '574px',
      '--menu-width': '720px',
      '--menu-height': '540px',
    });

    fitMenus(menus, null);
    expect(menus.properties.size).toBe(0);
  });
});

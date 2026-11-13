import { paintHalo } from './halo.js';
import { LAMP_BY_DUSK, ROOF } from './palette.js';
import { LAMP_EVERY, STAND } from './stand-plan.js';

const BANK = { width: 13, height: 4, lamps: 4 };

function paintBank(pen, { x, dusk }) {
  const y = STAND.under - 2;
  const [core, rim] = LAMP_BY_DUSK[dusk];

  paintHalo(pen, {
    box: { left: x, top: y, width: BANK.width, height: BANK.height },
    dusk,
    size: 0.5,
  });
  pen.rect([x, y, BANK.width, BANK.height], ROOF[0]);

  for (let lamp = 0; lamp < BANK.lamps; lamp += 1) {
    pen.rect([x + 1 + lamp * 3, y + 1, 2, 2], rim);
    pen.dot(x + 1 + lamp * 3, y + 1, core);
  }
}

export function paintRoofLamps(pen, dusk) {
  for (let x = STAND.left + 20; x < STAND.right - BANK.width; x += LAMP_EVERY) {
    paintBank(pen, { x, dusk });
  }
}

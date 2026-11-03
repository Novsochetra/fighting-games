import { HUD } from '../../art/hud.js';

const FLAME = ['..L..', '.LM..', '.MMM.', 'MDDM.', 'MDDDM', '.MMM.'];
const FLAME_TWO = ['...L.', '..LM.', '.MMM.', '.MDDM', 'MDDDM', '.MMM.'];

// x5: flame pixels flicker along the top of the digits
export function drawComboFlames(context, { x, top, width, tick }) {
  const colours = { L: HUD.flame[3], M: HUD.flame[2], D: HUD.flame[1] };

  for (let left = x; left < x + width - 4; left += 6) {
    const rows = (Math.floor(tick / 5) + left) % 2 ? FLAME : FLAME_TWO;
    const lift = (Math.floor(tick / 3) + left) % 3 === 0 ? 1 : 0;

    rows.forEach((row, dy) => {
      [...row].forEach((code, dx) => {
        if (colours[code]) {
          context.fillStyle = colours[code];
          context.fillRect(left + dx, top - rows.length + dy - lift + 2, 1, 1);
        }
      });
    });
  }
}

// a finisher bursts the number into gold sparks flying out of it
export function drawComboBurst(context, { x, y, age }) {
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const reach = 4 + age * (1.2 + (i % 3) * 0.4);
    const sparkX = Math.round(x + Math.cos(angle) * reach);
    const sparkY = Math.round(y + Math.sin(angle) * reach * 0.8 + age * age * 0.03);

    context.fillStyle = i % 2 ? HUD.gold[3] : HUD.gold[2];
    context.fillRect(sparkX, sparkY, i % 3 === 0 ? 2 : 1, 1);
  }
}

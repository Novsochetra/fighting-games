import { BOOTS as BOOT_RAMP, HAIRS, SKINS } from '../art/actors.js';
import { PLAIN_KITS } from '../art/kits.js';

// A footballer drawn from blocks, in px at the near touchline, feet at 0. The match draws its
// players from src/render/actors/; the training screens dress this one with a face of their own
const BOOTS = BOOT_RAMP[1];
const SKIN_TONES = Object.values(SKINS).map((ramp) => ramp[2]);
const HAIR = Object.values(HAIRS).map((ramp) => ramp[1]);

const flatKit = (kit) => ({
  shirt: kit.shirt[2],
  shorts: kit.shorts[2],
  socks: kit.socks[2],
  trim: kit.trim[2],
});

const BODY = {
  legs: 12,
  shorts: 6,
  shirt: 14,
  head: 8,
  width: 14,
};

export const FIGURE_HEIGHT = BODY.legs + BODY.shorts + BODY.shirt + BODY.head;

export function lookOf(player) {
  const kits = PLAIN_KITS[player.team] ?? PLAIN_KITS[0];

  return {
    kit: flatKit(player.role === 'keeper' ? kits.keeper : kits.home),
    skin: SKIN_TONES[player.index % SKIN_TONES.length],
    hair: HAIR[player.index % HAIR.length],
  };
}

function block(context, color, [left, top, width, height]) {
  context.fillStyle = color;
  context.fillRect(Math.round(left), Math.round(top), Math.ceil(width), Math.ceil(height));
}

// the legs swap every few px of running, one lifted, one planted
function drawLegs(context, { x, y, size }, { kit, stepping }) {
  const lifted = stepping ? 2 * size : 0;
  const leg = 4 * size;

  block(context, kit.socks, [x - 5 * size, y - BODY.legs * size, leg, BODY.legs * size - lifted]);
  block(context, kit.socks, [
    x + 1 * size,
    y - BODY.legs * size,
    leg,
    BODY.legs * size - 2 * size + lifted,
  ]);
  block(context, BOOTS, [x - 6 * size, y - 2 * size - lifted, 5 * size, 2 * size]);
  block(context, BOOTS, [x + 1 * size, y - 4 * size + lifted, 5 * size, 2 * size]);
}

function drawTorso(context, { x, y, size }, { kit, skin, hair }) {
  const half = (BODY.width / 2) * size;
  const shortsTop = y - (BODY.legs + BODY.shorts) * size;
  const shirtTop = shortsTop - BODY.shirt * size;
  const headTop = shirtTop - BODY.head * size;

  block(context, kit.shorts, [
    x - half + size,
    shortsTop,
    BODY.width * size - 2 * size,
    BODY.shorts * size,
  ]);
  block(context, kit.shirt, [x - half, shirtTop, BODY.width * size, BODY.shirt * size]);
  block(context, kit.trim, [x - half, shirtTop, BODY.width * size, 2 * size]);
  block(context, skin, [x - 4 * size, headTop, 8 * size, BODY.head * size]);
  block(context, hair, [x - 4 * size, headTop, 8 * size, 3 * size]);
}

export function drawStanding(context, place, look) {
  drawLegs(context, place, look);
  drawTorso(context, place, look);
}

// sliding in, or floored: the figure lies along the grass
export function drawLying(context, { x, y, size, facing }, { kit, skin }) {
  const length = (BODY.legs + BODY.shirt + BODY.head) * size;
  const left = facing < 0 ? x - length * 0.3 : x - length * 0.7;

  block(context, kit.socks, [left, y - 6 * size, length * 0.45, 4 * size]);
  block(context, kit.shirt, [left + length * 0.4, y - 9 * size, length * 0.4, 7 * size]);
  block(context, skin, [
    facing < 0 ? left - 4 * size : left + length * 0.8,
    y - 9 * size,
    6 * size,
    6 * size,
  ]);
}

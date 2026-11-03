import { HUD } from '../../art/hud.js';
import { moveOf } from '../../data/moves.js';
import { drawText, measureText } from '../text.js';
import { drawKeyCap, keyCapWidth } from './key-cap.js';

export const GAUGE = { width: 62, height: 5, segments: 8 };

// what the player can spend spirit on: his moves and his own skill
const movesOf = (player) =>
  [...(player.moves ?? []), player.skill]
    .map(moveOf)
    .filter((move) => move && Number.isFinite(move.cost) && move.cost > 0);

const canPay = (player, move) => (player.cooldown ?? 0) <= 0 && player.spirit >= move.cost;

// a special or a skill is ready when the gauge holds what the cheapest of them costs and he is
// not waiting out his last one
export function isSpecialReady(player) {
  return movesOf(player).some((move) => canPay(player, move));
}

// the key that fires what is ready, the strongest first: SHOOT, PASS, or RUN twice; a block or a
// save fires by itself
const KEYS = { shot: 'SHOOT', pass: 'PASS', cross: 'PASS', dribble: 'RUN' };
const KEY_ORDER = ['SHOOT', 'PASS', 'RUN'];

export function readyKeyOf(player) {
  const keys = new Set(
    movesOf(player)
      .filter((move) => canPay(player, move))
      .map((move) => KEYS[move.play]),
  );

  return KEY_ORDER.find((key) => keys.has(key)) ?? null;
}

const TWICE = 'x2';
const KEY_GAP = 4;

// the room the gauge keeps at its end for the widest key it may show
export const keyRoomOf = (context) =>
  KEY_GAP +
  Math.max(
    ...KEY_ORDER.map(
      (key) => keyCapWidth(context, key) + (key === 'RUN' ? 2 + measureText(context, TWICE) : 0),
    ),
  );

export const spiritShare = (player) =>
  player.spiritMax > 0 ? Math.min(1, Math.max(0, player.spirit / player.spiritMax)) : 0;

function drawGlow(context, { x, y }, tick) {
  const pulse = Math.floor(tick / 8) % 2;
  const shine = Math.floor(tick / 2) % (GAUGE.width + 12);

  context.fillStyle = pulse ? HUD.ready[3] : HUD.ready[2];
  context.fillRect(x - 2, y - 2, GAUGE.width + 4, 1);
  context.fillRect(x - 2, y + GAUGE.height + 1, GAUGE.width + 4, 1);
  context.fillRect(x - 2, y - 1, 1, GAUGE.height + 2);
  context.fillRect(x + GAUGE.width + 1, y - 1, 1, GAUGE.height + 2);

  if (shine < GAUGE.width) {
    context.fillStyle = HUD.ready[3];
    context.fillRect(x + shine, y, 2, GAUGE.height);
  }
}

function drawFill(context, { x, y }, { share, ramp }) {
  const filled = Math.round(GAUGE.width * share);

  context.fillStyle = ramp[2];
  context.fillRect(x, y, filled, GAUGE.height);
  context.fillStyle = ramp[3];
  context.fillRect(x, y, filled, 1);
  context.fillStyle = ramp[1];
  context.fillRect(x, y + GAUGE.height - 1, filled, 1);
}

// a notch over and under the gauge at what each move costs, gold once the gauge holds it
function drawNotches(context, player, { x, y }) {
  const costs = new Set(movesOf(player).map((move) => move.cost));

  for (const cost of costs) {
    if (cost < player.spiritMax) {
      const at = Math.round(x + (GAUGE.width * cost) / player.spiritMax);

      context.fillStyle = player.spirit >= cost ? HUD.gold[3] : HUD.muted;
      context.fillRect(at, y - 3, 1, 2);
      context.fillRect(at, y + GAUGE.height + 1, 1, 2);
    }
  }
}

function drawReadyKey(context, player, { x, y }) {
  const key = readyKeyOf(player);

  if (!key) {
    return;
  }

  const left = x + GAUGE.width + KEY_GAP;
  const width = drawKeyCap(context, { label: key, x: left, y: y - 3, ramp: HUD.ready });

  if (key === 'RUN') {
    drawText(context, TWICE, { x: left + width + 2, y: y - 2, color: HUD.ready[3], size: 8 });
  }
}

export function drawSpiritGauge(context, player, { x, y, tick }) {
  const ready = isSpecialReady(player);
  const step = GAUGE.width / GAUGE.segments;

  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, GAUGE.width + 2, GAUGE.height + 2);
  context.fillStyle = HUD.inset;
  context.fillRect(x, y, GAUGE.width, GAUGE.height);
  drawFill(context, { x, y }, { share: spiritShare(player), ramp: ready ? HUD.ready : HUD.spirit });
  context.fillStyle = HUD.ink;

  for (let i = 1; i < GAUGE.segments; i += 1) {
    context.fillRect(Math.round(x + i * step), y, 1, GAUGE.height);
  }

  if (ready) {
    drawGlow(context, { x, y }, tick);
  }

  drawNotches(context, player, { x, y });

  if (ready) {
    drawReadyKey(context, player, { x, y });
  }
}

const FLAME = ['..L..', '.LM..', '.MMM.', 'MDDM.', 'MDDDM', '.MMM.'];

export function drawSpiritFlame(context, player, { x, y, tick }) {
  const ramp = isSpecialReady(player) ? HUD.ready : HUD.spirit;
  const flicker = isSpecialReady(player) && Math.floor(tick / 6) % 2 === 1 ? 1 : 0;
  const colours = { L: ramp[3], M: ramp[2], D: ramp[1 + flicker] };

  FLAME.forEach((row, dy) => {
    [...row].forEach((code, dx) => {
      if (colours[code]) {
        context.fillStyle = colours[code];
        context.fillRect(x + dx, y + dy, 1, 1);
      }
    });
  });
}

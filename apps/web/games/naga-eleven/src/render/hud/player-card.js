import { HUD } from '../../art/hud.js';
import { drawText, isKhmer, khmerRoom, measureText, textOf } from '../text.js';
import { BAR_HEIGHT, PLAYER_CARD } from './layout.js';
import { drawPanel } from './panel.js';
import { drawSpiritFlame, drawSpiritGauge, GAUGE, keyRoomOf } from './spirit-gauge.js';

const BADGE = 16;

// Khmer's marks over a letter rise above the line it is set on, up to 5 art pixels in the Khmer
// face a Mac has, where a pixel-face letter starts under it: a Khmer name stands this much lower,
// in a card as much taller, so a row of the card shows between its marks and the card's top edge
const KHMER_RISE = 4;

const riseOf = (name) => (isKhmer(name) ? KHMER_RISE : 0);

function drawBadge(context, { player, kit, x, y }) {
  const shirt = kit.shirt;

  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, BADGE + 2, BADGE + 2);
  context.fillStyle = shirt[2];
  context.fillRect(x, y, BADGE, BADGE);
  context.fillStyle = shirt[3];
  context.fillRect(x, y, BADGE, 2);
  context.fillStyle = shirt[1];
  context.fillRect(x, y + BADGE - 2, BADGE, 2);
  context.fillStyle = kit.trim[2];
  context.fillRect(x + 5, y, 6, 1);
  drawText(context, String(player.number ?? ''), {
    x: x + BADGE / 2,
    y: y + BADGE / 2 + 1,
    color: kit.trim[3],
    shadow: HUD.ink,
    align: 'center',
    baseline: 'middle',
    size: 8,
  });
}

const nameOf = (player, lang) =>
  textOf(player.name, lang).toUpperCase() || `#${player.number ?? player.index + 1}`;

export function drawPlayerCard(context, match, { kits, lang, tick }) {
  const player = match.players[match.controlled ?? -1];

  if (!player) {
    return;
  }

  const kit = player.role === 'keeper' ? kits[player.team].keeper : kits[player.team].outfield;
  const name = nameOf(player, lang);
  const rise = riseOf(name);
  const room = khmerRoom(name) + rise;
  const height = BAR_HEIGHT + 4 + room;
  const nameWidth = Math.ceil(measureText(context, name, { size: 8 }));
  const width = Math.max(GAUGE.width + 10 + keyRoomOf(context), nameWidth) + BADGE + 14;
  const { x, y } = PLAYER_CARD;

  drawPanel(context, { x, y, width, height });
  drawBadge(context, { player, kit, x: x + 3, y: y + 3 + room / 2 });
  drawText(context, name, { x: x + BADGE + 8, y: y + 4 + rise, color: HUD.text, size: 8 });
  drawSpiritFlame(context, player, { x: x + BADGE + 8, y: y + 12 + room, tick });
  drawSpiritGauge(context, player, { x: x + BADGE + 16, y: y + 14 + room, tick });
}

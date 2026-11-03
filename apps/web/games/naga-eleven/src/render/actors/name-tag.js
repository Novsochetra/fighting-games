import { NAME_TAG } from '../../art/actors.js';
import { project } from '../camera.js';
import { toUiPoint } from '../spaces.js';
import { drawText, khmerRoom, measureText, textOf } from '../text.js';
import { drawnHeightOf } from './players.js';

const NEAR_BALL = 120;
const MOST_TAGS = 3;
const OVER_HEAD = 14;

const gapToBall = (player, ball) => Math.hypot(player.x - ball.x, player.y - ball.y);

export function taggedPlayers(match) {
  return match.players
    .filter((player) => player.star && player.index !== match.controlled)
    .filter((player) => gapToBall(player, match.ball) < NEAR_BALL)
    .sort((first, second) => gapToBall(first, match.ball) - gapToBall(second, match.ball))
    .slice(0, MOST_TAGS);
}

// the tag grows upwards for a Khmer name, so its point stays just over the head
function drawTag(context, { x, y, words, colour }) {
  const room = khmerRoom(words);
  const width = Math.ceil(measureText(context, words, { size: 8 })) + 7;
  const left = Math.round(x - width / 2);
  const top = Math.round(y) - room;
  const bottom = top + 11 + room;

  context.fillStyle = NAME_TAG.edge;
  context.fillRect(left, top, width, 11 + room);
  context.fillStyle = NAME_TAG.panel;
  context.fillRect(left + 1, top + 1, width - 2, 9 + room);
  context.fillStyle = colour;
  context.fillRect(left + 1, bottom - 2, width - 2, 1);
  context.fillRect(Math.round(x) - 1, bottom, 3, 1);
  context.fillRect(Math.round(x), bottom + 1, 1, 1);
  drawText(context, words, { x: left + 4, y: top + 2, color: NAME_TAG.text, size: 8 });
}

// drawn in the UI's space, over the world, so a name reads as the HUD does
export function drawNameTags(context, camera, match, { lang, looks, standHeight }) {
  for (const player of taggedPlayers(match)) {
    const height = drawnHeightOf(player, match, standHeight);
    const foot = project(camera, player.x, player.y);
    const head = toUiPoint({ x: foot.x, y: foot.y - height });
    const words = textOf(player.name, lang).toUpperCase();
    const colour = looks.players[player.index]?.shirt?.[2] ?? NAME_TAG.star;

    drawTag(context, { x: head.x, y: head.y - OVER_HEAD, words, colour });
  }
}

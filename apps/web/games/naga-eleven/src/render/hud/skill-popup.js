import { HUD } from '../../art/hud.js';
import { drawnHeightOf } from '../actors/players.js';
import { project } from '../camera.js';
import { planOf } from '../effects/move-plan.js';
import { toUiPoint } from '../spaces.js';
import { drawText, measureText } from '../text.js';
import { placeClear } from './clear-place.js';

// a skill's name rises 8 px over the player and fades over 60 ticks, over his name tag
export const POPUP = { life: 60, rise: 8, fadeFrom: 40, overHead: 21, flash: 3 };
const KHMER_LINE = 15;
const PAD = 6;

export function headOf(camera, { match, player, standHeight }) {
  const foot = project(camera, player.x, player.y);

  return toUiPoint({ x: foot.x, y: foot.y - drawnHeightOf(player, match, standHeight) });
}

function plateOf(context, { plan, lang, head, age }) {
  const words = plan.move.name.en.toUpperCase();
  const khmer = lang === 'km' ? plan.move.name.km : null;
  const width =
    Math.ceil(Math.max(measureText(context, words), khmer ? measureText(context, khmer) : 0)) +
    PAD * 2;
  const height = 11 + (khmer ? KHMER_LINE : 0);
  const bottom = head.y - POPUP.overHead - (age / POPUP.life) * POPUP.rise;

  return { x: head.x - width / 2, y: bottom - height, width, height, words, khmer };
}

function drawPlate(context, plate, { art, age }) {
  const { x, y, width, height } = plate;

  context.fillStyle = HUD.ink;
  context.fillRect(x - 1, y - 1, width + 2, height + 2);
  context.fillStyle = age < POPUP.flash ? art.body[4] : art.body[1];
  context.fillRect(x, y, width, height);
  context.fillStyle = art.body[3];
  context.fillRect(x, y, width, 1);
  context.fillStyle = art.body[0];
  context.fillRect(x, y + height - 1, width, 1);
  context.fillStyle = art.accent[2];
  context.fillRect(x + 1, y + 2, 2, height - 4);
  drawText(context, plate.words, { x: x + PAD, y: y + 2, color: HUD.text, shadow: HUD.ink });

  if (plate.khmer) {
    drawText(context, plate.khmer, { x: x + PAD, y: y + 11, color: art.body[4], shadow: HUD.ink });
  }
}

// each skill's name over the player who plays it, both sides (README "HUD"), in the UI's space
export function drawSkillPopups(context, effects, { match, camera, lang, standHeight }) {
  for (const popup of effects?.popups ?? []) {
    const age = match.tick - popup.born;
    const player = match.players[popup.player];
    const plan = planOf(popup.move);

    if (age >= 0 && age < POPUP.life && player && plan) {
      const head = headOf(camera, { match, player, standHeight });
      const plate = placeClear(match, plateOf(context, { plan, lang, head, age }));

      context.globalAlpha =
        age < POPUP.fadeFrom ? 1 : 1 - (age - POPUP.fadeFrom) / (POPUP.life - POPUP.fadeFrom);
      drawPlate(context, plate, { art: plan.art, age });
      context.globalAlpha = 1;
    }
  }
}

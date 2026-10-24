import { HINTS } from '../data/hints.js';
import { ultReady } from './combat/ult-bar.js';
import { holdsOwnWeapon } from './fighters/loadout.js';
import { isFightOver } from './stage/loot-time.js';

const MIN_SHOWN = 150;
const SHOWN_FOR = 240;

export function showHint(game, id) {
  const current = game.hint;
  if (game.hintsSeen[id] || (current && current.id === id)) {
    return;
  }
  if (current && current.time < MIN_SHOWN) {
    return;
  }
  game.hintsSeen[id] = 1;
  game.io.saveHints(game.hintsSeen);
  game.hint = { id, keys: HINTS[id].keys, touch: HINTS[id].touch, time: 0 };
}

function dueHints(game) {
  const { stage, arena, playTime } = game;
  const zone = game.missionIndex === 0 ? stage.zoneIndex : -1;
  return [
    ['move', playTime > 30],
    ['crate', playTime > 300 && !arena && zone === 0],
    ['weapon', !holdsOwnWeapon(game.player)],
    ['ult', ultReady(game)],
    ['launch', arena && stage.waveIndex >= 1 && zone === 0],
    ['dash', arena && zone === 1],
  ];
}

export function updateHints(game) {
  if (game.mode !== 'play') {
    return;
  }
  if (game.hint && ++game.hint.time > SHOWN_FOR) {
    game.hint = null;
  }
  if (isFightOver(game)) {
    return;
  }
  for (const [id, due] of dueHints(game)) {
    if (due) {
      showHint(game, id);
    }
  }
}

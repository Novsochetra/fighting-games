import { HINTS } from '../data/hints.js';

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
  return [
    ['move', playTime > 30],
    ['crate', playTime > 300 && !arena && stage.zoneIndex === 0],
    ['weapon', game.player.weapon.id !== 'fists'],
    ['ult', game.ultMeter >= 100],
    ['launch', arena && stage.waveIndex >= 1 && stage.zoneIndex === 0],
    ['dash', arena && stage.zoneIndex === 1],
  ];
}

export function updateHints(game) {
  if (game.mode !== 'play') {
    return;
  }
  if (game.hint && ++game.hint.time > SHOWN_FOR) {
    game.hint = null;
  }
  for (const [id, due] of dueHints(game)) {
    if (due) {
      showHint(game, id);
    }
  }
}

import { COLORS } from '../../art/colors.js';
import { addFloatText, showBanner } from '../fx/effects.js';
import { equipWeapon, pause } from '../stage/flow.js';

const WEAPON_KEYS = [
  ['weapon1', 'fists'],
  ['weapon2', 'sword'],
  ['weapon3', 'spear'],
  ['weapon4', 'axe'],
];

function toggleMute(game) {
  game.muted = !game.muted;
  game.io.setMuted(game.muted);
  showBanner(game, { text: game.muted ? 'Sound off' : 'Sound on', color: COLORS.lilac, time: 40 });
}

function fillUlt(game) {
  const player = game.player;
  game.ultMeter = 100;
  addFloatText(game, { x: player.x, y: player.y - 48, text: 'ULT ready', color: COLORS.gold });
  game.io.sfx('chargeMax');
}

// practice shortcuts work only with Training tools switched on in Settings
function trainingKeys(game, pressed) {
  if (pressed.debug) {
    game.settings.hitboxes = !game.settings.hitboxes;
    game.io.saveSettings(game.settings);
  }
  if (pressed.fillUlt && game.mode === 'play') {
    fillUlt(game);
  }
  if (game.mode !== 'play' || game.player.state === 'ko') {
    return;
  }
  for (const [key, id] of WEAPON_KEYS) {
    if (pressed[key]) {
      equipWeapon(game, id);
    }
  }
}

export function handleGlobalKeys(game) {
  const pressed = game.input.pressed;
  if (pressed.pause) {
    pause(game);
  }
  if (pressed.mute) {
    toggleMute(game);
  }
  if (game.settings.training) {
    trainingKeys(game, pressed);
  }
}

import { installTouchPad } from '../../../../packages/touch-pad/src/install-touch-pad.js';
import { buttonScale } from '../data/settings.js';
import { buzz } from '../sim/fx/haptics.js';
import { pause } from '../sim/stage/flow.js';

// what the touch pad's controls do in the game: a button presses its action as a key does, and
// the stick holds a direction, as it only steers (JUMP and DASH have buttons). Each press and each
// new direction ticks under the thumb (Settings, Vibration)
export function createTouchActions({ game, audio }) {
  return {
    press(action) {
      audio.unlock();
      buzz(game, 'tap');
      game.input.pressed[action] = true;
      game.input.held[action] = true;

      if (action === 'light') {
        game.input.autoAttack.on = true;
        game.input.autoAttack.since = game.tickCount;
      }
    },

    release(action) {
      game.input.held[action] = false;

      if (action === 'light') {
        game.input.autoAttack.on = false;
      }
    },

    steer(direction, on) {
      game.input.held[direction] = on;

      if (on) {
        buzz(game, 'tap');
      }
    },
  };
}

// the pad answers on the touch layer, whatever skin the screen fit draws on it
export function installGameTouchPad({ elements, game, audio, layout }) {
  return installTouchPad(elements.touch, {
    handler: createTouchActions({ game, audio }),
    stickMode: () => game.settings.stick,
    stickRest: () => layout.stickRest(buttonScale(game.settings)),
  });
}

export function installPauseButton(button, { game, audio }) {
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    audio.unlock();
    pause(game);
  });
}

import { pressAction, releaseAction } from '../../../../packages/input/src/actions.js';
import { releaseAll } from '../sim/input-state.js';
import { installTouchPad } from '../../../../packages/touch-pad/src/install-touch-pad.js';
import { renderPad } from '../../../../packages/touch-pad/src/pad-markup.js';
import { placePad, placesOf } from '../../../../packages/touch-pad/src/pad-place.js';
import {
  customStickPlace,
  placeStickZone,
} from '../../../../packages/touch-pad/src/stick-place.js';
import { PITCH_SIDE } from '../data/skins/pitch-side.js';
import { pauseUnderCard } from '../ui/turn-card.js';

// the stick's base at the pad's scale 1 where the skin gives it no size (pad-styles.js)
const STICK_BASE = 128;

function placeStick(layer, layout) {
  const { at, size: base = STICK_BASE } = layout.items.find((item) => item.kind === 'stick');
  const size = { width: layer.clientWidth, height: layer.clientHeight };
  const { zone, rest } = customStickPlace({ stick: at, layer: size, radius: base / 2 });

  placeStickZone(layer.querySelector('.pad-zone'), zone);

  return rest;
}

const inputsOf = (item) => (Array.isArray(item.inputs) ? item.inputs : Object.values(item.inputs));

// a key the screen reads none of stands aside, hidden and letting a touch through, so it covers
// nothing on the stage; the stick stands aside with its zone, and pause always stays
function showKeys(pad, layout, inputs) {
  for (const item of layout.items) {
    const control = pad.control(item.id);
    const used =
      !inputs || inputsOf(item).some((input) => input === 'pause' || inputs.includes(input));
    const stand = item.kind === 'stick' ? control?.parentElement : control;

    if (stand) {
      stand.style.visibility = used ? '' : 'hidden';
    }
  }
}

export function installTouch(layer, { source, onPause }) {
  const handler = {
    press: (input) => (input === 'pause' ? onPause() : pressAction(source, input)),
    release: (input) => releaseAction(source, input),
    steer: (input, on) => (on ? pressAction(source, input, true) : releaseAction(source, input)),
  };
  let rest = { x: 0, y: 0 };
  let layout = null;
  let shown = null;
  const pad = installTouchPad(layer, {
    handler,
    stickMode: () => 'float',
    stickRest: () => rest,
  });

  return {
    // the pad hides under a finger still on it, which never lifts off it: what it held is let go
    release() {
      releaseAll(source);
      pad.restStick();
    },
    fit(portrait) {
      layout = PITCH_SIDE.layouts[portrait ? 'portrait' : 'landscape'];

      renderPad(layer, layout);
      placePad(layer, placesOf(layout), { fromSkin: true });
      rest = placeStick(layer, layout);
      pad.restStick();
      showKeys(pad, layout, shown);
    },
    // the inputs the screen reads (a drill's, src/render/training/touch-keys.js), or null for all;
    // asked on every frame with the same list while they stay the same, it changes the pad only
    // when the list does, and holds play still under the turn card
    show(inputs) {
      pauseUnderCard(layer.ownerDocument.documentElement, onPause);

      if (inputs === shown) {
        return;
      }

      shown = inputs;

      if (layout) {
        showKeys(pad, layout, inputs);
      }
    },
  };
}

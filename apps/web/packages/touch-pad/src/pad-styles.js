// What every skin needs to stand and answer a thumb: where a control is and how big, never how it
// looks, which is the game's (its tokens and its skin's classes). A skin's own places are measured
// inside the safe area (.pad-safe), clear of a notch or a home bar, from --pad-safe-* where the
// game sets them (a folded phone's half has no status bar), else the browser's own insets; a
// player's places are where they put them on the screen. A shell is cut open where the game's
// screen stands, so what is under it shows there even when a copy of it lies over everything. A
// button starts bare of the browser's own border, padding and margin, so a skin that draws no
// border of its own gets none, rather than the browser's white outset rim. A game's stylesheets come as
// files the build does not bundle, so the pad brings its own rules in its module, first in the
// head, where a game's rules of the same weight come after them and win.
export const PAD_STYLES = `
.pad { position: absolute; inset: 0; pointer-events: none; opacity: var(--pad-opacity, 1); }
.pad-zone { position: absolute; pointer-events: auto; touch-action: none; }
.pad-controls { position: absolute; pointer-events: none; }
.pad-controls.pad-placed { inset: 0; width: auto; height: auto; }
.pad-stick, .pad-button, .pad-dpad {
  position: absolute;
  box-sizing: border-box;
  width: var(--pad-diameter);
  height: calc(var(--pad-diameter) * var(--pad-aspect, 1));
}
.pad-stick {
  --pad-diameter: calc(var(--pad-base, 128px) * var(--pad-scale, 1) * var(--pad-size, 1));
  translate: -50% -50%;
  pointer-events: none;
}
.pad-knob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(var(--pad-diameter) * 0.4375);
  height: calc(var(--pad-diameter) * 0.4375);
  translate: -50% -50%;
}
.pad-button, .pad-dpad {
  --pad-diameter: calc(var(--pad-base, 64px) * var(--pad-scale, 1) * var(--pad-size, 1));
  pointer-events: auto;
  touch-action: none;
}
.pad-button {
  margin: 0;
  padding: 0;
  border: 0;
}
.pad-placed > .pad-button, .pad-placed > .pad-dpad {
  --pad-half: calc(var(--pad-diameter) / 2);
  --pad-half-down: calc(var(--pad-half) * var(--pad-aspect, 1));
  --pad-left: calc(var(--pad-x) * 100% + var(--pad-dx, 0px) * var(--pad-scale, 1));
  --pad-top: calc(var(--pad-y) * 100% + var(--pad-dy, 0px) * var(--pad-scale, 1));
  left: clamp(var(--pad-half), var(--pad-left), calc(100% - var(--pad-half)));
  top: clamp(var(--pad-half-down), var(--pad-top), calc(100% - var(--pad-half-down)));
  right: auto;
  bottom: auto;
  translate: -50% -50%;
}
.pad-safe > .pad-button, .pad-safe > .pad-dpad {
  --pad-safe-box-top: var(--pad-safe-top, env(safe-area-inset-top, 0px));
  --pad-safe-box-right: var(--pad-safe-right, env(safe-area-inset-right, 0px));
  --pad-safe-box-bottom: var(--pad-safe-bottom, env(safe-area-inset-bottom, 0px));
  --pad-safe-box-left: var(--pad-safe-left, env(safe-area-inset-left, 0px));
  --pad-left: calc(
    var(--pad-safe-box-left) + var(--pad-x) * (100% - var(--pad-safe-box-left) - var(--pad-safe-box-right)) +
      var(--pad-dx, 0px) * var(--pad-scale, 1)
  );
  --pad-top: calc(
    var(--pad-safe-box-top) + var(--pad-y) * (100% - var(--pad-safe-box-top) - var(--pad-safe-box-bottom)) +
      var(--pad-dy, 0px) * var(--pad-scale, 1)
  );
}
.pad-arm { position: absolute; width: 33.34%; height: 33.34%; pointer-events: none; }
.pad-arm[data-direction='up'] { left: 33.33%; top: 0; }
.pad-arm[data-direction='right'] { right: 0; top: 33.33%; }
.pad-arm[data-direction='down'] { left: 33.33%; bottom: 0; }
.pad-arm[data-direction='left'] { left: 0; top: 33.33%; }
.pad-debug [data-control], .pad-debug .pad-zone { outline: 2px dashed currentColor; outline-offset: -1px; }
.pad-shell {
  position: absolute;
  inset: 0;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(black, black), linear-gradient(black, black);
  -webkit-mask-size: 100% 100%, var(--pad-screen-width) var(--pad-screen-height);
  -webkit-mask-position: 0 0, var(--pad-screen-x) var(--pad-screen-y);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-composite: xor;
  mask-image: linear-gradient(black, black), linear-gradient(black, black);
  mask-size: 100% 100%, var(--pad-screen-width) var(--pad-screen-height);
  mask-position: 0 0, var(--pad-screen-x) var(--pad-screen-y);
  mask-repeat: no-repeat;
  mask-composite: exclude;
}
.pad-bezel {
  position: absolute;
  left: var(--pad-screen-x);
  top: var(--pad-screen-y);
  width: var(--pad-screen-width);
  height: var(--pad-screen-height);
}
`;

const STYLE_ID = 'touch-pad-styles';

export function installPadStyles(document) {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');

  style.id = STYLE_ID;
  style.textContent = PAD_STYLES;
  document.head.prepend(style);
}

// What every skin needs to stand and answer a thumb: where a control is and how big, never how it
// looks, which is the game's (its tokens and its skin's classes). A game's stylesheets come as
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
  height: var(--pad-diameter);
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
.pad-placed > .pad-button, .pad-placed > .pad-dpad {
  --pad-half: calc(var(--pad-diameter) / 2);
  left: clamp(var(--pad-half), calc(var(--pad-x) * 100%), calc(100% - var(--pad-half)));
  top: clamp(var(--pad-half), calc(var(--pad-y) * 100%), calc(100% - var(--pad-half)));
  right: auto;
  bottom: auto;
  translate: -50% -50%;
}
.pad-arm { position: absolute; width: 33.34%; height: 33.34%; pointer-events: none; }
.pad-arm[data-direction='up'] { left: 33.33%; top: 0; }
.pad-arm[data-direction='right'] { right: 0; top: 33.33%; }
.pad-arm[data-direction='down'] { left: 33.33%; bottom: 0; }
.pad-arm[data-direction='left'] { left: 0; top: 33.33%; }
.pad-debug [data-control], .pad-debug .pad-zone { outline: 2px dashed currentColor; outline-offset: -1px; }
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

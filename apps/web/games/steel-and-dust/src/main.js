import { bootLoading } from './boot/boot-loading.js';
import { createClock, ticksDue } from './boot/fixed-step.js';
import { createSession } from './boot/create-session.js';
import { findElements } from './boot/dom-elements.js';
import { installInput } from './boot/install-input.js';
import { installUi } from './boot/install-ui.js';
import { TICK_MS } from './config.js';
import { createView } from './render/create-view.js';
import { renderFrame } from './render/render-frame.js';
import { missionWait, sceneLoaded } from './render/scene-loaded.js';
import { beginTick, runTick } from './sim/tick.js';
import { installTitleScene } from './ui/screen/title-scene.js';
import { createUiState } from './ui/ui-state.js';

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

const elements = findElements(document);
const { game, audio } = createSession({ window });
const ui = createUiState(game);
const pad = { connected: false };
const { layout, fullscreen, menus, act } = installUi({ window, elements, game, audio, ui, pad });
const { touchStick, gamepad } = installInput({ window, elements, game, audio, ui, layout, menus });
layout.onFit = () => touchStick.rest();
const titleScene = installTitleScene(window);
let view = null;
let clock = null;

function syncDom() {
  if (menus.sync()) {
    elements.touch.classList.toggle('live', game.mode === 'play');
    if (game.mode === 'play') {
      touchStick.rest();
    }
  }
  elements.ultButton.classList.toggle('ready', game.ultMeter >= 100 && game.mode === 'play');
}

// a frame that runs several ticks offsets each tick's sounds, so they keep their spacing
function runTicks(count) {
  for (let i = 0; i < count; i++) {
    audio.setTickOffset((i * TICK_MS) / 1000);
    beginTick(game);
    gamepad.poll();
    pad.connected = gamepad.state.connected;
    runTick(game);
    audio.update();
  }
  audio.setTickOffset(0);
}

// nothing moves behind the loading screen; the clock still keeps time there, so play does not
// rush to catch up once the road and the Shade are in
function frame(now) {
  const due = ticksDue(clock, now, TICK_MS);
  if (sceneLoaded(view, game)) {
    runTicks(due);
  }
  renderFrame(game, view);
  syncDom();
  bootLoading.loader.update(now, missionWait(view, game));
  titleScene.frame(now);
  requestAnimationFrame(frame);
}

layout.applyTouchSettings();
fullscreen.refreshLabels();
syncDom();
// the fighters, raiders and effects (about 8 MB) wait for the menu art, so the title comes up first
bootLoading.spritesMayStart.then(() => {
  view = createView({
    context: elements.canvas.getContext('2d'),
    createCanvas,
    createImage: () => new Image(),
    baseUrl: '',
  });
  clock = createClock(performance.now());
  bootLoading.appReady();
  requestAnimationFrame(frame);
});

// browser checks and automated tests drive the game through this handle
window.__steelAndDust = {
  game,
  act,
  audio: audio.debugState,
  menus: () => menus.state.stack.slice(),
};

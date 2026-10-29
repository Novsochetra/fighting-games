import { bootLoading } from './boot/boot-loading.js';
import { createClock, ticksDue } from './boot/fixed-step.js';
import { createSession } from './boot/create-session.js';
import { findElements } from './boot/dom-elements.js';
import { installInput } from './boot/install-input.js';
import { installUi } from './boot/install-ui.js';
import { TICK_MS } from './config.js';
import { createView } from './render/create-view.js';
import { drawChangedFrame } from './render/draw-changed-frame.js';
import { missionWait, sceneLoaded } from './render/scene-loaded.js';
import { canAffordHeavy, ultReady } from './sim/combat/ult-bar.js';
import { isFightOver } from './sim/stage/loot-time.js';
import { beginTick, runTick } from './sim/tick.js';
import { installTitleScene } from './ui/screen/title-scene.js';

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

const elements = findElements(document);
const { game, audio, ui, online } = createSession({ window });
const pad = { connected: false };
const { layout, fullscreen, menus, act, supporters } = installUi({
  window,
  elements,
  game,
  audio,
  ui,
  pad,
  online,
});
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
  supporters.followRun(game);
  const playing = game.mode === 'play';
  elements.ultButton.classList.toggle('ready', ultReady(game) && playing && !isFightOver(game));
  elements.heavyButton.classList.toggle('empty', !canAffordHeavy(game) && playing);
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

// the menus' painting is opaque, so the game screen under it is not drawn at all; drawing it there
// kept the phone's GPU busy for nothing on the title and the hero select
function screenCovered() {
  return elements.menus.dataset.scene === 'on';
}

// nothing moves behind the loading screen; the clock still keeps time there, so play does not
// rush to catch up once the road and the Shade are in
function frame(now) {
  const due = ticksDue(clock, now, TICK_MS);
  if (sceneLoaded(view, game)) {
    runTicks(due);
  }
  // the menus follow this frame's ticks first, so the frame play starts on is drawn
  syncDom();
  if (!screenCovered()) {
    drawChangedFrame(game, view);
  }
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
  // the supporters the credits name wait until the game is up, so they never hold its loading
  supporters.load();
  requestAnimationFrame(frame);
});

// browser checks and automated tests drive the game through this handle
window.__steelAndDust = {
  game,
  act,
  audio: audio.debugState,
  menus: () => menus.state.stack.slice(),
};

import { createPadState } from '../../../packages/input/src/gamepad.js';
import { createSafeArea } from '../../../packages/screen/src/safe-area.js';
import { createAudio, installAudioUnlock } from './audio/index.js';
import { WORLD_VIEW } from './config.js';
import { installCanvasTaps } from './input/canvas-taps.js';
import { installKeyboard } from './input/keyboard.js';
import { installTouch } from './input/touch.js';
import { setDialogueCanvasFactory } from './render/dialogue/index.js';
import { setPortraitCanvasFactory } from './render/portraits/index.js';
import { clearPresses, createInput } from './sim/input-state.js';
import { wireAudio } from './ui/app/app-audio.js';
import { installScreenKeys, onPauseKey, stepPad, togglePause } from './ui/app/controls.js';
import {
  createGameApp,
  drawApp,
  isPlaying,
  loadActorArt,
  pauseApp,
  stepApp,
} from './ui/app/game-app.js';
import { startLoop } from './ui/loop.js';
import { fitStage } from './ui/stage.js';

const root = document.documentElement;
const canvas = Object.assign(document.getElementById('pitch'), WORLD_VIEW);
const context = canvas.getContext('2d');
const input = createInput();
const padState = createPadState();
const safeArea = createSafeArea(document, window);

function createCanvas(width, height) {
  if (typeof OffscreenCanvas === 'function') {
    return new OffscreenCanvas(width, height);
  }

  return Object.assign(document.createElement('canvas'), { width, height });
}

// some browsers refuse storage outright (a private window, blocked site data)
function storageOf(window) {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

setDialogueCanvasFactory(createCanvas);
setPortraitCanvasFactory(createCanvas);
context.imageSmoothingEnabled = false;

const app = createGameApp({ document, window, storage: storageOf(window), input, createCanvas });
const audio = createAudio({
  AudioContext: window.AudioContext ?? window.webkitAudioContext,
  navigator,
});

wireAudio(app, audio);
installAudioUnlock(window, audio);
app.onPlay(app.canvas);

let coarse = window.matchMedia('(any-pointer: coarse)').matches;

const touch = installTouch(document.getElementById('touch'), {
  source: input.sources.touch,
  onPause: () => togglePause(app),
});

const touchOn = () => ({ on: true, off: false })[app.settings.touch] ?? coarse;

function refit() {
  root.classList.toggle('touch-on', touchOn());

  const { portrait } = fitStage(window, { canvas, safe: safeArea(), touchOn: touchOn() });

  touch.fit(portrait);
}

app.onSettings = refit;

installKeyboard(window, {
  source: input.sources.keys,
  onPause: () => onPauseKey(app),
  isCapturing: () => !app.screens.current(),
});
installScreenKeys(window, app);
installCanvasTaps(canvas, (point) => app.canvas?.tap(point));

window.addEventListener('resize', refit);
window.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch' && !coarse) {
    coarse = true;
    app.device = 'touch';
    refit();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseApp(app);
    audio.pause();
  } else {
    audio.resume();
  }
});

function showPad() {
  const playing = isPlaying(app);

  if (root.classList.contains('is-playing') && !playing) {
    touch.release();
  }

  root.classList.toggle('is-playing', playing);
  touch.show(app.canvas?.keys ?? null);
}

refit();
loadActorArt(app);
startLoop(window, {
  step() {
    stepPad(app, { navigator, padState });
    stepApp(app, input);
    clearPresses(input);
    showPad();
  },
  draw: () => drawApp(app, context),
});

window.__nagaEleven = app;

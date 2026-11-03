import { SPRITES } from '../../data/sprites.js';
import { createActorArt, loadSprites, prepareMatchArt } from '../../render/actors/index.js';
import { useUiSpace } from '../../render/spaces.js';
import { drawTitleArt } from '../../render/title/index.js';
import { createScreens } from '../screens/index.js';
import { act, quickMatchDone, showMenu } from './app-actions.js';
import { applyVolumes } from './app-audio.js';
import { paintedScreen } from './canvas-screens.js';
import { showClosing, storyCanvasDone } from './story-flow.js';

// the canvas screens that play out over time; one of them stands still while a DOM screen is up
const LIVE = new Set(['scene', 'training', 'match', 'card']);

function wire(app) {
  app.play = (screen) => {
    app.canvas = screen;
    app.onPlay?.(screen);
  };
  app.showTitleArt = () => app.play(paintedScreen(app.titleArt));
  app.finishStory = () => showClosing(app, () => showMenu(app));
  app.resume = () => app.screens.hide();
  app.applySettings = () => {
    app.settings = app.screens.settings();
    applyVolumes(app);
    app.onSettings?.(app.settings);
  };
}

export function createGameApp({ document, window, storage, input, createCanvas, titleArt }) {
  const app = {
    document,
    window,
    storage,
    input,
    createCanvas,
    titleArt: titleArt ?? drawTitleArt,
    device: 'keys',
    mode: 'title',
    canvas: null,
    run: null,
    match: null,
    frames: 0,
    hear: null,
    actors: createActorArt({ createCanvas }),
  };

  app.screens = createScreens(document, {
    storage,
    onAction: (name, data) => act(app, name, data),
  });
  app.settings = app.screens.settings();
  wire(app);
  app.showTitleArt();
  app.screens.show('title');

  return app;
}

// the footballer's sheets come in after the first frames; until then the block figure plays
export async function loadActorArt(app) {
  const sprites = await loadSprites(SPRITES);

  if (sprites) {
    app.actors = createActorArt({ sprites, createCanvas: app.createCanvas });

    if (app.match) {
      prepareMatchArt(app.actors, app.match.match);
    }
  }
}

function finishCanvas(app, screen) {
  const result = screen.result();

  if (screen.kind === 'card') {
    app.cardDone();
  } else if (app.mode === 'story') {
    storyCanvasDone(app, result);
  } else if (app.mode === 'quick') {
    quickMatchDone(app, result);
  }
}

export function stepApp(app, input) {
  const screen = app.canvas;

  app.frames += 1;

  if (!screen || (app.screens.current() && LIVE.has(screen.kind))) {
    return;
  }

  screen.step(input, app);

  if (screen.isDone()) {
    finishCanvas(app, screen);
  }
}

export const isPlaying = (app) => Boolean(app.canvas?.playing && !app.screens.current());

export function pauseApp(app) {
  if (app.canvas && LIVE.has(app.canvas.kind) && !app.screens.current()) {
    app.screens.show('pause');
  }
}

export function drawApp(app, context) {
  useUiSpace(context);
  app.canvas?.draw(context, app.frames, app);
}

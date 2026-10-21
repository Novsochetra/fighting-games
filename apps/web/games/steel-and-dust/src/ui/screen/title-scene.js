import { TITLE_SCENE_COLORS } from '../../art/title-scene.js';
import { createClock, ticksDue } from '../../boot/fixed-step.js';
import { TICK_MS } from '../../config.js';
import { TITLE_SCENES } from '../../data/title-scene.js';
import { createPainter } from '../../render/painter.js';
import { drawTitleScene } from '../../render/title/draw-title-scene.js';

const PORTRAIT = '(orientation: portrait)';
const STILL = '(prefers-reduced-motion: reduce)';

function loadPaintings(createImage, baseUrl) {
  const paintings = {};
  for (const [orientation, scene] of Object.entries(TITLE_SCENES)) {
    const painting = { image: createImage(), loaded: false };
    painting.image.onload = () => {
      painting.loaded = true;
    };
    painting.image.src = `${baseUrl}${scene.painting}`;
    paintings[orientation] = painting;
  }
  return paintings;
}

// the painting the page's CSS shows and whether anything may move, kept current as the screen turns
function watchScreen(matchMedia) {
  const portrait = matchMedia(PORTRAIT);
  const still = matchMedia(STILL);
  const screen = {};
  const read = () => {
    screen.orientation = portrait.matches ? 'portrait' : 'landscape';
    screen.still = still.matches;
  };
  read();
  portrait.addEventListener?.('change', read);
  still.addEventListener?.('change', read);
  return screen;
}

// a canvas is cleared when it is sized, so it is only sized in the frame it is drawn
function drawScene(view, { orientation, still }, tick) {
  const { canvas, drawn } = view;
  const scene = TITLE_SCENES[orientation];
  if (canvas.width !== scene.width || canvas.height !== scene.height) {
    canvas.width = scene.width;
    canvas.height = scene.height;
  }
  const painting = view.paintings[orientation].image;
  drawTitleScene(view.painter, { scene, painting, tick, colors: TITLE_SCENE_COLORS, still });
  drawn.orientation = orientation;
  drawn.still = still;
  drawn.tick = tick;
}

function isDrawn({ drawn }, { orientation, still }, tick) {
  return drawn.orientation === orientation && drawn.still === still && drawn.tick === tick;
}

// the title's living painting: its clock runs only while the painting is up and it draws only
// when the painting or its tick has changed, so play costs it nothing; until a frame is drawn the
// canvas stays blank and the painting under it shows
export function createTitleScene({ canvas, menus, matchMedia, createImage, baseUrl = '' }) {
  const context = canvas.getContext('2d');
  const view = {
    canvas,
    painter: context && createPainter(context),
    paintings: loadPaintings(createImage, baseUrl),
    drawn: {},
  };
  const screen = watchScreen(matchMedia);
  const clock = { steps: null, tick: 0 };
  return {
    frame(now) {
      if (!view.painter || menus.dataset.scene !== 'on') {
        clock.steps = null;
        return;
      }
      clock.steps ??= createClock(now);
      clock.tick += ticksDue(clock.steps, now, TICK_MS);
      const tick = screen.still ? 0 : clock.tick;
      if (view.paintings[screen.orientation].loaded && !isDrawn(view, screen, tick)) {
        drawScene(view, screen, tick);
      }
    },
  };
}

export function installTitleScene(window) {
  const { document } = window;
  return createTitleScene({
    canvas: document.getElementById('titleScene'),
    menus: document.getElementById('menus'),
    matchMedia: (query) => window.matchMedia(query),
    createImage: () => new window.Image(),
  });
}

import { DUEL_INK } from '../../../src/art/duel/palette.js';
import { SPRITES } from '../../../src/data/sprites.js';
import { createActorArt, loadSprites } from '../../../src/render/actors/index.js';
import { setPortraitCanvasFactory } from '../../../src/render/portraits/index.js';
import { prepareSaveCam } from '../../../src/render/save-cam/index.js';
import { useUiSpace } from '../../../src/render/spaces.js';
import { installEditor } from './editor.js';
import { loadLab, saveLab } from './lab-store.js';
import { DEFAULT_SETTINGS } from './options.js';
import { fillChoices, onSettings, showFor, writeSettings } from './panel.js';
import { advance, createPlayer, seek } from './player.js';
import { createScene } from './scenes.js';
import { installTransport, renderTimeline, showPlace } from './transport.js';

const canvas = document.getElementById('view');
const context = canvas.getContext('2d');

const createCanvas = (width, height) =>
  Object.assign(document.createElement('canvas'), { width, height });

// the game's sprite sheets are named from its own page, two folders up from this one
function imageAt(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`no sprite sheet at ${source}`));
    image.src = `../../${source}`;
  });
}

function storageOf() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const storage = storageOf();
const lab = { settings: { ...DEFAULT_SETTINGS, ...loadLab(storage) }, actors: null, player: null };

// a new show for the settings, kept at the frame it was on, so a change is seen where it was made
function rebuild() {
  const frame = lab.player?.frame ?? 0;
  const playing = lab.player?.playing ?? true;
  const speed = lab.player?.speed ?? 1;

  prepareSaveCam(lab.settings.venue);
  lab.player = Object.assign(
    createPlayer(() => createScene(lab.settings)),
    { playing, speed },
  );
  seek(lab.player, Math.min(frame, lab.player.total));
  renderTimeline(document, lab.player, (frameAt) => seek(lab.player, frameAt));
  showFor(document, lab.settings.scene);
  saveLab(storage, lab.settings);
}

function draw() {
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = DUEL_INK;
  context.fillRect(0, 0, canvas.width, canvas.height);
  useUiSpace(context);
  lab.player.scene.draw(context, {
    lang: lab.settings.lang,
    tick: lab.player.frame,
    actors: lab.actors,
  });
}

function onDisplayFrame() {
  advance(lab.player);
  draw();
  showPlace(document, lab.player);
  window.requestAnimationFrame(onDisplayFrame);
}

setPortraitCanvasFactory(createCanvas);
fillChoices(document);
writeSettings(document, lab.settings);
onSettings(document, (settings) => {
  lab.settings = settings;
  rebuild();
});
installTransport(document, () => lab.player);

const editor = installEditor(document, { onChange: rebuild });
const editorButton = (name, act) =>
  document.querySelector(`[data-do="${name}"]`).addEventListener('click', () => {
    act();
    editor.show();
    rebuild();
  });

editorButton('reset-list', editor.resetList);
editorButton('reset-all', editor.resetAll);
document.querySelector('[data-do="copy"]').addEventListener('click', editor.copy);
rebuild();
window.requestAnimationFrame(onDisplayFrame);

loadSprites(SPRITES, { loadImage: imageAt }).then((sprites) => {
  lab.actors = sprites ? createActorArt({ sprites, createCanvas }) : null;
});

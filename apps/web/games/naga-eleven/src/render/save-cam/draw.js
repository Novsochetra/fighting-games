import { createPen, shiftedPen } from '../duel/pen.js';
import { drawBars } from '../duel/bars.js';
import { UNIT } from '../duel/layout.js';
import { drawBackdrop, goalStyleOf } from './backdrop.js';
import { drawCamBall } from './ball.js';
import { drawContact, drawContactBurst, drawFlash, shakeOf } from './effects.js';
import { drawFrame, drawNet } from './goal.js';
import { drawCamFocus } from './focus.js';
import { guardOf } from './guards/index.js';
import { drawHeldGloves, drawKeeper, drawKeeperShadow } from './keeper.js';
import { clutched, drawLayer, layersOf } from './layers.js';
import { camScene } from './scene.js';
import { drawCamWord } from './word.js';

// the back of the net gives where the ball struck it, as long as the ball sits in it
function bulgeOf(scene) {
  if (scene.moment.outcome !== 'goal' || scene.since < 8 || !scene.ball) {
    return null;
  }

  return {
    x: scene.ball.x,
    y: scene.ball.y,
    depth: 0.4 * Math.max(0.3, 1 - (scene.since - 8) / 30),
  };
}

function keeper(pen, scene, { cam, actors }) {
  const guard = guardOf(scene.moment.guardLook);
  const layer = { ...scene, art: scene.guardArt };

  drawKeeperShadow(pen, scene.pose);
  drawKeeper(pen, { pose: scene.pose, match: cam.match, keeper: cam.moment.keeper, actors });
  guard.front?.(pen, layer);

  if (clutched(scene)) {
    drawCamBall(pen, { ...scene.ball, radius: 4.5, tick: 0 });
    drawHeldGloves(pen, { ...scene.ball, radius: 5 });
  }
}

// lines rush in on where the shot is aimed while it flies
function focus(pen, scene) {
  if (scene.flight > 0 && scene.since < 12) {
    drawCamFocus(pen, {
      centre: scene.aim,
      color: scene.art.body[4],
      tick: scene.tick,
      strength: scene.flight * 0.7,
    });
  }
}

// back to front: the venue behind the goal, the lines rushing in on the aim, the venue's net, what
// rises behind the keeper, its frame, the shot's burst, then what goes behind him, him, what goes
// before him, and what lands in front of him at the contact
export function drawCamScene(pen, cam, { actors, tick }) {
  const scene = camScene(cam, tick);
  const layers = layersOf(scene);
  const guard = guardOf(scene.moment.guardLook);
  const goal = goalStyleOf(cam.venue);

  drawBackdrop(pen, { tick, ticks: cam.ticks, venue: cam.venue });
  focus(pen, scene);
  drawNet(pen, { bulge: bulgeOf(scene), style: goal });
  guard.back?.(pen, { ...scene, art: scene.guardArt });
  drawFrame(pen, goal);
  drawContactBurst(pen, { moment: scene.moment, ticks: scene.ticks, art: scene.art });
  drawLayer(pen, scene, { layers, layer: 'behind' });
  keeper(pen, scene, { cam, actors });
  drawLayer(pen, scene, { layers, layer: 'front' });
  drawContact(pen, { moment: scene.moment, ticks: scene.ticks, pose: scene.pose });
}

// the save cam on a pen of the cut-ins' art grid, shaking at the contact and flashing white
export function drawSaveCamOn(pen, cam, { actors = null, tick = cam.ticks } = {}) {
  const shake = shakeOf(cam.ticks);

  // the shaken scene leaves a strip at the view's edge uncovered, where the match under the cam
  // would show; the venue laid down unshaken first fills it
  if (shake.x !== 0 || shake.y !== 0) {
    drawBackdrop(pen, { tick, ticks: cam.ticks, venue: cam.venue });
  }

  drawCamScene(shiftedPen(pen, shake.x, shake.y), cam, { actors, tick });
  drawFlash(pen, cam.ticks);
}

// the save cam fills the view; in open play it has the film's bars and calls out the save itself
export function drawSaveCam(
  context,
  cam,
  { lang = 'en', actors = null, tick = cam.ticks, bars = true } = {},
) {
  const pen = createPen(context, { unit: UNIT });

  context.imageSmoothingEnabled = false;
  drawSaveCamOn(pen, cam, { actors, tick });

  if (bars) {
    drawCamWord(pen, cam, { lang });
    drawBars(pen, 1);
  }
}

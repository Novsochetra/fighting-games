import { drawCamBall, drawNetBall } from './ball.js';
import { DIVE_BEATS } from './dive-frames.js';
import { drawCamTrail } from './trails/index.js';
import { DEPTH } from './view.js';

// a ball he has clutched to his chest is drawn with his gloves, not on its own
export const clutched = (scene) => Boolean(scene.ball?.held) && scene.pose.animation === 'idle';

// what goes behind the keeper and what before him: the ball once it is past him or in the dive's
// arms; the move's beast from his push-off on, so his head and gloves read through the stretch and
// the contact with the ball in front of them
export function layersOf(scene) {
  const passed = Boolean(scene.ball && !scene.ball.held && scene.ball.z > DEPTH.keeper);
  const behind = passed || scene.pose.holdsBall;
  const ballLayer = clutched(scene) ? 'none' : 'front';

  return {
    trail: behind || scene.since >= DIVE_BEATS.push ? 'behind' : 'front',
    ball: behind ? 'behind' : ballLayer,
  };
}

function trail(pen, scene) {
  drawCamTrail(pen, {
    points: scene.trail,
    look: scene.moment.look,
    art: scene.art,
    tick: scene.tick,
  });
}

function ball(pen, scene) {
  if (!scene.ball) {
    return;
  }

  if (scene.moment.outcome === 'goal' && scene.ball.z > DEPTH.line) {
    drawNetBall(pen, scene.ball);
  } else {
    drawCamBall(pen, { ...scene.ball, tick: scene.tick });
  }
}

// the trail and the ball that go `layer` of him ('behind' or 'front'), as layersOf says
export function drawLayer(pen, scene, { layers, layer }) {
  if (layers.trail === layer) {
    trail(pen, scene);
  }

  if (layers.ball === layer) {
    ball(pen, scene);
  }
}

import { CHASE_SHOTS } from '../../../data/shots.js';
import { drawBall } from '../ball.js';
import { drawFocusLines } from '../focus-lines.js';
import { lensPen } from '../lens/lens-pen.js';
import { shotView } from '../lens/shot-view.js';
import { fullTicks } from '../lens/track.js';
import { lookOf } from '../looks/index.js';
import { chaseScene } from './chase-scene.js';
import { drawChaseWorld } from './chase-world.js';
import { chaseFull } from './chase-length.js';

export function drawChase(base, show, { tick }) {
  const scene = chaseScene(show, tick);
  const look = lookOf(scene.look);
  const ticks = fullTicks(show.stageTicks, { length: show.chaseLength, full: chaseFull() });
  const pen = lensPen(base, shotView(show.cinema, CHASE_SHOTS, ticks, { ball: scene.ball }));

  drawChaseWorld(pen, { art: scene.art, ticks: show.stageTicks });
  drawFocusLines(pen, {
    centre: scene.ball,
    inner: 26,
    color: scene.art.body[3],
    tick,
    strength: 0.5,
  });
  look.back?.(pen, scene);
  scene.ball = look.ball?.(scene) ?? scene.ball;
  look.front?.(pen, scene);
  drawBall(pen, { ...scene.ball, tick });
}

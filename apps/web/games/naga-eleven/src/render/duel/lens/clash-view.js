import { CLASH_SHOTS } from '../../../data/shots.js';
import { MIDDLE } from './lens-pen.js';
import { shotView } from './shot-view.js';

export function clashView(show, scene) {
  const meeting = { x: (MIDDLE.x + scene.impact.x) / 2, y: (MIDDLE.y + scene.impact.y) / 2 };

  return shotView(show.cinema, CLASH_SHOTS, scene.t, {
    impact: scene.impact,
    meeting,
    ball: scene.ball,
  });
}

import { saveCamShots } from '../../data/shots.js';
import { movesCamera } from '../cinema/mode.js';
import { shotView } from '../duel/lens/shot-view.js';
import { camScene } from './scene.js';
import { FRAME } from './view.js';

const GOAL = { x: (FRAME.left + FRAME.right) / 2, y: (FRAME.bar + FRAME.line) / 2 };

const CHEST_RISE = 30;

// once the ball is out of the view, or held, the camera keeps to where it was last seen
function ballOf(scene) {
  return scene.ball ?? scene.trail[scene.trail.length - 1] ?? scene.aim;
}

function targetsOf(scene) {
  const { pose } = scene;

  return {
    goal: GOAL,
    aim: scene.aim,
    ball: ballOf(scene),
    gloves: pose.gloves,
    keeper: { x: pose.x, y: pose.y - CHEST_RISE },
  };
}

// the camera's view of the save cam `cam.ticks` in, by its shots for what came of the shot
export function saveCamView(cam, tick) {
  if (!movesCamera(cam.cinema)) {
    return null;
  }

  const scene = camScene(cam, tick);

  return shotView(cam.cinema, saveCamShots(scene.moment.outcome), cam.ticks, targetsOf(scene));
}

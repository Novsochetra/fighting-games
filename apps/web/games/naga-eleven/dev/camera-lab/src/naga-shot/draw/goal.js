import { SHOT_ART } from '../colors.js';
import { afterTicks } from '../tracks/after.js';
import { drawBackBar, drawCrossbar, drawSideFrame, frameColours } from './goal/frame.js';
import { drawBulge, drawShudderLines, swayOf } from './goal/hit.js';
import { drawDepthNets, drawSideNet } from './goal/net.js';
import { goalView } from './goal/shape.js';

// the far side's net lies right behind the near one, so only the near one is knotted
const MESH = { near: SHOT_ART.mesh, depth: SHOT_ART.stadium.post[1] };

const hitOf = (moment) => ({ ending: moment.ending, ticks: afterTicks(moment.clock) });

export function drawGoalBack(pen, moment) {
  const view = goalView(moment.camera);
  const hit = hitOf(moment);
  const sway = swayOf(hit);

  drawDepthNets(pen, { view, colour: MESH.depth });
  drawBulge(pen, { view, hit, ball: moment.ball });
  drawBackBar(pen, { view });
  drawSideFrame(pen, { view, side: 'far', colours: frameColours('far', 0), sway });
}

// in front of the ball, so a ball in the net is seen in it
export function drawGoalFront(pen, moment) {
  const view = goalView(moment.camera);
  const hit = hitOf(moment);
  const sway = swayOf(hit);
  const colours = frameColours('near', moment.keeper.lit);

  drawSideNet(pen, { view, side: 'near', colour: MESH.near });
  drawSideFrame(pen, { view, side: 'near', colours, sway });
  drawCrossbar(pen, { view, colours, sway });
  drawShudderLines(pen, { view, hit, sway });
}

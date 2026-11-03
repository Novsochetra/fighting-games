import { PITCHSIDE } from '../../../art/venues/pitchside.js';
import { packedAlpha } from '../kit/colour.js';
import { hash2 } from '../kit/hash.js';

// a net's strings run about this many world units apart
const MESH = 9;
const SHADOW = packedAlpha(PITCHSIDE.goalShadow, 0.22);

// a proper goal: a white frame and a tight net, the back stay along the grass
export function frameGoal({ goal }, { post, net, netNear, stay, veil }) {
  return {
    post,
    net,
    netNear,
    stay,
    veil,
    shadow: SHADOW,
    nodes: false,
    columns: Math.round(goal.width / MESH),
    rows: Math.round(goal.height / MESH),
    shape: { sag: 0, backDrop: 0.12 },
    skip: () => false,
  };
}

// the village's goal: bamboo poles, a bar that sags in the middle, and an old net hung slack, a few
// of its strings gone
export function bambooGoal({ goal }, { post, net, netNear, stay, veil }) {
  return {
    post,
    net,
    netNear,
    stay,
    veil,
    shadow: SHADOW,
    nodes: true,
    columns: Math.round(goal.width / (MESH * 1.4)),
    rows: Math.round(goal.height / (MESH * 1.4)),
    shape: { sag: 3, backDrop: 0.3 },
    skip: (i, j) => hash2(i, Math.round(j * 2), 77) < 0.07,
  };
}

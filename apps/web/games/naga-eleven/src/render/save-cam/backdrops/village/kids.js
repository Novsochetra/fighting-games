import { paintKid } from '../../../venues/scenery/kid.js';

// the village kids who watch from the dike behind the goal, off to either side of the posts, in
// the venue's own kids (scenery/kid.js) and their shirts; one jumps and one cheers in frame 1
const DIKE_ROW = 99;

const KIDS = [
  { x: 3, shirt: 1, skin: 0, poses: ['stand', 'cheer'] },
  { x: 233, shirt: 2, skin: 1, poses: ['cheer', 'stand'] },
  { x: 245, shirt: 0, skin: 2, poses: ['stand', 'jump'] },
];

const lookOf = (kids, { shirt, skin }) => ({
  shirt: kids.shirts[shirt],
  shorts: kids.shorts[(shirt + skin) % kids.shorts.length],
  skin: kids.skins[skin],
  skinLight: kids.skinLight[skin],
  hair: kids.hair,
  hairLight: kids.hairLight,
});

export function paintKids(raster, { art, frame }) {
  for (const kid of KIDS) {
    paintKid(raster, { x: kid.x, y: DIKE_ROW, pose: kid.poses[frame] }, lookOf(art.kids, kid));
  }
}

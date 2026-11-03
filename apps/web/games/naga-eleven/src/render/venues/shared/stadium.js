import { NEAR_RUN } from '../../camera/bounds.js';
import { chalk, mownGrass } from '../ground/grass.js';
import { markingsOf } from '../ground/markings.js';
import { packedAlpha } from '../kit/colour.js';
import { paintBoards } from './ad-boards.js';
import { frameGoal } from './goal-style.js';

const LINES = { along: 2.3, across: 1.8, spot: 5 };

// the boards round a stadium's pitch; their LED panels all shout GOAL! while the crowd cheers
export function ledBoards(art, { depth = -40, height = 26, panel = 150 } = {}) {
  const shout = (frame) => ({
    back: art.led.back,
    ink: art.ads[frame % art.ads.length].back,
    text: 'GOAL!',
  });

  return {
    depth,
    height,
    frames: 4,
    paint: (raster, _, frame) =>
      paintBoards(raster, {
        ads: art.ads,
        frame: art.led.frame,
        panel,
        shout: frame >= 2 ? shout(frame) : null,
      }),
  };
}

export const nearBoards = (layout, art) => ({
  depth: layout.pitch.width + 48,
  height: 30,
  paint: (raster) =>
    paintBoards(raster, { ads: art.ads, frame: art.led.frame, panel: 190, height: 24 }),
});

// what every stadium's pitch shares: mown grass and white lines, a framed goal with a white net
export function stadiumGround(layout, { art, stripes, light, surface, surround }) {
  const { pitch } = layout;

  return {
    far: -66,
    near: pitch.width + NEAR_RUN + 10,
    surface: surface ?? mownGrass({ ramp: art.grass, pitch, stripes, light, surround }),
    lines: { markings: markingsOf(layout), thick: LINES, colour: chalk(art.line) },
  };
}

export function stadiumGoal(layout, art, net) {
  return frameGoal(layout, {
    post: art.post,
    net: packedAlpha(net, 0.6),
    netNear: packedAlpha(net, 0.42),
    veil: packedAlpha(net, 0.1),
    stay: art.concrete[3],
  });
}

import { describe, expect, it } from 'vitest';
import { portableCos, portableSin } from '../../support/portable-trig.js';
import { seededRandom } from '../../support/seeded-random.js';

// Bug: the campaign, boss, bazaar, hills and Bayon runs failed on an Apple Silicon Mac with no change
// to the game. There Math.sin rounds about one result in 200 to the other side of its last bit from
// x64, where the fixtures were recorded and CI runs, and the mist, motes, smoke, bats and hit effects
// draw that value straight into globalAlpha. These are the calls that came out different on arm64,
// with the bits x64 gives them.
const X64_SINES = [
  [56.1, -0.43376554097568404],
  [22.68, -0.6356509285581351],
  [131.45555555555555, -0.47180417212191156],
  [36.926839568579744, -0.6977647301769205],
  [135.72914819494508, -0.5977279738770376],
  [35.1, -0.516262220079927],
  [43.35, -0.5909993624801761],
  [107.3, 0.46695996829045655],
  [216.04284298500104, 0.6646685561893115],
  [217.36157043394158, -0.5577540065297456],
  [135.8507307901699, -0.6905481838213824],
  [9.9, -0.4575358937753214],
  [15.899999999999999, -0.19085858137418765],
  [0.4928571428571429, 0.4731449148452087],
  [0.43823949329109047, 0.424345984441014],
];

function sampleAngles() {
  const random = seededRandom(7);
  const angles = [];
  for (let i = 0; i < 50000; i++) {
    angles.push((random() - 0.5) * 2 * 10 ** (random() * 7 - 2));
  }
  // near whole turns the reduction takes its second and third steps
  for (let i = 1; i < 4000; i++) {
    angles.push((i * Math.PI) / 2, (-i * Math.PI) / 2);
  }
  return angles;
}

describe('the sine and cosine the recorded runs use', () => {
  it('give the x64 bits for the calls that came out different on Apple Silicon', () => {
    const sines = X64_SINES.map(([angle]) => [angle, portableSin(angle)]);
    expect(sines).toEqual(X64_SINES);
  });

  it('agree with each other a quarter turn apart', () => {
    for (const [angle, sine] of X64_SINES) {
      expect(portableCos(angle - Math.PI / 2)).toBeCloseTo(sine, 12);
    }
  });

  it.runIf(process.arch === 'x64')('match the native sine and cosine bit for bit on x64', () => {
    const mismatches = sampleAngles().filter(
      (angle) => portableSin(angle) !== Math.sin(angle) || portableCos(angle) !== Math.cos(angle),
    );
    expect(mismatches).toEqual([]);
  });
});

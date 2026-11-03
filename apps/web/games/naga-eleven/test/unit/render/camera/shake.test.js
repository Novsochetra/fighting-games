import { describe, expect, it } from 'vitest';
import { addShake, createShake, stepShake } from '../../../../src/render/camera/shake.js';

function biggestJolt(shake, ticks) {
  let biggest = 0;

  for (let i = 0; i < ticks; i += 1) {
    stepShake(shake, i);
    biggest = Math.max(biggest, Math.abs(shake.x), Math.abs(shake.y));
  }

  return biggest;
}

describe('the shake', () => {
  it('leaves the view still for a hard shot or a save', () => {
    const shake = createShake();

    addShake(shake, 2.5);
    addShake(shake, 3);

    expect(biggestJolt(shake, 10)).toBe(0);
  });

  it('kicks a goal by a few whole pixels and dies away within a fifth of a second', () => {
    const shake = createShake();

    addShake(shake, 6);

    const biggest = biggestJolt(shake, 12);

    expect(biggest).toBeLessThanOrEqual(3);
    expect(shake).toMatchObject({ power: 0, x: 0, y: 0 });
  });
});

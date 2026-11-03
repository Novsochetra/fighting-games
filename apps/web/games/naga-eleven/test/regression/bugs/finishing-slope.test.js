import { describe, expect, it } from 'vitest';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { holdBallAt, matchInPlay, only } from '../../support/match-driver.js';

// a plain shot past a set keeper went in from the penalty spot nearly every time and from a step
// further out almost never: the keeper either never moved or always got there, so goals came
// only from specials. Now the chance falls away with the distance, a snap shot below a hit one
const SEEDS = Array.from({ length: 40 }, (_, i) => i + 1);

// a good shooter alone with a very good keeper, from `back` units out in front of the goal,
// holds shoot for `charge` ticks and lets go with the stick on the corner away from the keeper
function shoot(seed, { back, charge }) {
  const match = matchInPlay(seed, { format: '11' });
  const shooter = holdBallAt(match, { x: match.pitch.length - back, y: match.pitch.width / 2 });
  const keeper = Object.assign(match.players[11], { stats: { ...match.players[11].stats } });

  keeper.stats.keeping = 95;
  shooter.stats = { ...shooter.stats, shot: 85 };
  shooter.spirit = 0;
  only(match, [shooter.index, keeper.index]);

  const keys = match.input.sources.keys.held;
  const away = keeper.y > match.pitch.width / 2 ? 'up' : 'down';

  for (let i = 0; i <= charge; i += 1) {
    Object.assign(keys, { shoot: i < charge, [away]: i === charge });
    match.input.pressed.shoot = i === 0;
    tick(match);
  }

  Object.assign(keys, { shoot: false, up: false, down: false });
  drainEvents(match);

  for (let i = 0; i < 120 && match.phase === 'play'; i += 1) {
    tick(match);

    if (drainEvents(match).some((event) => event.type === 'goal')) {
      return true;
    }
  }

  return false;
}

// forty shots a spot take a few seconds on a busy machine
const SLOW = { timeout: 60000 };

const scoredShare = (shot) => SEEDS.filter((seed) => shoot(seed, shot)).length / SEEDS.length;

describe('a plain shot past a very good keeper', () => {
  it('goes in less the further out it is struck, never all or nothing', SLOW, () => {
    const spot = scoredShare({ back: 180, charge: 28 });
    const edge = scoredShare({ back: 270, charge: 28 });
    const far = scoredShare({ back: 330, charge: 28 });

    expect(spot).toBeGreaterThan(0.3);
    expect(spot).toBeLessThan(0.75);
    expect(edge).toBeGreaterThan(0.1);
    expect(edge).toBeLessThan(spot);
    expect(far).toBeGreaterThan(0.02);
    expect(far).toBeLessThan(edge);
  });

  it('struck on a quick tap still goes in now and then, less than one hit hard', SLOW, () => {
    const snap = scoredShare({ back: 180, charge: 14 });

    expect(snap).toBeGreaterThan(0.15);
    expect(snap).toBeLessThan(scoredShare({ back: 180, charge: 28 }));
  });
});

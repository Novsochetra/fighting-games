import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

// the player pressed ULT as Bokator with no raider on screen: the slam, the rush and the pounce
// all went off, but only blows that landed burst, so the ultimate sounded exactly as before
const originalRandom = Math.random;

function ultimateAlone(hero) {
  const played = [];
  const game = createPlayingGame({ settings: { hero }, io: { sfx: (key) => played.push(key) } });
  runTicks(game, 30);
  game.fighters = game.fighters.filter((fighter) => fighter.side !== 'enemy');
  game.ultMeter = 100;
  played.length = 0;
  tap(game, 'ult');
  for (let tick = 0; game.player.state === 'ult' && tick < 600; tick++) {
    runTicks(game, 1);
  }
  return played;
}

describe('an ultimate thrown at nobody', () => {
  beforeEach(() => {
    Math.random = seededRandom(23);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it("still bursts on every one of Bokator's blows: the slam, eight rush blows, the pounce", () => {
    const played = ultimateAlone('bokator');
    expect(played.filter((key) => key === 'ultHit').length).toBeGreaterThanOrEqual(10);
    expect(played).not.toContain('heavy');
  });

  it.each([
    ['blue', 8],
    ['angkor', 8],
    ['ember', 1],
    ['firefly', 1],
  ])('%s: the hero’s own blows burst too (at least %i)', (hero, blows) => {
    const played = ultimateAlone(hero);
    expect(played.filter((key) => key === 'ultHit').length).toBeGreaterThanOrEqual(blows);
  });
});

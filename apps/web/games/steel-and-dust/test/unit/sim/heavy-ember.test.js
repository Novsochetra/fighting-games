import { writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ULT_MAX } from '../../../src/config.js';
import { spawnEnemy } from '../../../src/sim/stage/spawn-enemy.js';
import { seededRandom } from '../../support/seeded-random.js';
import { createPlayingGame, runTicks, tap } from '../../support/test-game.js';

const originalRandom = Math.random;

describe('probe', () => {
  beforeEach(() => {
    Math.random = seededRandom(6);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });

  it('counts', () => {
    const game = createPlayingGame({ settings: { hero: 'ember' }, io: { sfx: () => {} } });
    runTicks(game, 30);
    spawnEnemy(game, 'grunt', 1);
    const raider = game.fighters.find((fighter) => fighter.side === 'enemy');
    Object.assign(raider, { entering: false, x: game.player.x + 24, hp: 500 });
    raider.ai.cooldown = 9999;
    game.player.facing = 1;
    game.ultMeter = ULT_MAX;
    const rows = [];
    for (let i = 0; i < 90; i++) {
      if (i === 0 || i === 22 || i === 44) {
        tap(game, 'heavy');
      } else {
        runTicks(game, 1);
      }
      const mine = game.particles.filter((particle) => particle.kind.startsWith('ember'));
      const counts = {};
      mine.forEach((particle) => (counts[particle.kind] = (counts[particle.kind] || 0) + 1));
      const { player } = game;
      rows.push(
        `${i} ${player.move?.id ?? '-'}@${player.moveTime} ${mine.length} ${JSON.stringify(counts)}`,
      );
    }
    writeFileSync(
      '/tmp/claude-0/-home-user-fighting-games/8f3a873c-7cce-5970-8102-d27dd0d80ea8/scratchpad/shades/ember/probe.txt',
      rows.join('\n'),
    );
    expect(rows.length).toBe(90);
  });
});

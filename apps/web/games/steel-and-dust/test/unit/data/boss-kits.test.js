import { describe, expect, it } from 'vitest';
import { BOSS_ULT_COLORS } from '../../../src/art/boss-colors.js';
import { BOSS_KITS } from '../../../src/data/enemies/boss-kits/index.js';
import { ENEMY_MOVES } from '../../../src/data/enemies/enemy-moves.js';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { ENEMY_TYPES } from '../../../src/data/enemies/enemy-types.js';
import { moveLength } from '../../../src/data/moves/define-move.js';
import { BOSS_MOVEMENT } from '../../../src/sim/brains/enemy/boss-movement.js';

const kitMoves = (kit) => [
  ...kit.close.moves,
  ...kit.skills.map((skill) => skill.move),
  ...Object.values(kit.phaseTwo?.swaps ?? {}),
  ...(kit.ultimate ? [kit.ultimate.move] : []),
];

describe('the boss kits', () => {
  it('belong to bosses, and name a way of moving the brain knows', () => {
    for (const [kind, kit] of Object.entries(BOSS_KITS)) {
      expect(ENEMY_TYPES[kind].boss, kind).toBe(true);
      expect(BOSS_MOVEMENT[kit.movement], kind).toBeTypeOf('function');
    }
  });

  it('use only moves that exist, and every timed move has a strip of its own frame for frame', () => {
    for (const [kind, kit] of Object.entries(BOSS_KITS)) {
      const sprite = ENEMY_SPRITES[ENEMY_TYPES[kind].sprite];
      for (const id of kitMoves(kit)) {
        const move = ENEMY_MOVES[id];
        expect(move, `${kind} ${id}`).toBeDefined();
        if (move.frameAt) {
          expect(sprite.strips[move.strip ?? id].frames, `${kind} ${id}`).toBe(move.frameAt.length);
          expect(move.frameAt[0], `${kind} ${id}`).toBe(0);
          expect(
            [...move.frameAt].sort((first, second) => first - second),
            `${kind} ${id}`,
          ).toEqual(move.frameAt);
          expect(move.frameAt.at(-1), `${kind} ${id}`).toBeLessThan(moveLength(move));
        }
      }
    }
  });

  it('let every boulder of a rockfall drop while the move still plays', () => {
    for (const id of Object.values(BOSS_KITS).flatMap(kitMoves)) {
      const { rockfall, startup, active } = ENEMY_MOVES[id];
      if (rockfall) {
        expect((rockfall.count - 1) * rockfall.every, id).toBeLessThan(active);
        expect(startup, id).toBeGreaterThan(0);
      }
    }
  });

  it('time every cue of a move inside the move', () => {
    for (const id of Object.values(BOSS_KITS).flatMap(kitMoves)) {
      const move = ENEMY_MOVES[id];
      const cues = [move.glint, ...(move.crescents ?? []), ...(move.quakes ?? [])].filter(
        (cue) => cue !== undefined,
      );
      for (const cue of cues) {
        expect(cue, id).toBeLessThan(moveLength(move));
      }
    }
  });

  it('give each ultimate its colors, its armor and a wind-up long enough to read', () => {
    for (const [kind, kit] of Object.entries(BOSS_KITS).filter(([, bossKit]) => bossKit.ultimate)) {
      const move = ENEMY_MOVES[kit.ultimate.move];
      expect(move.bossUltimate, kind).toBe(true);
      expect(move.armor, kind).toBe(true);
      expect(move.startup, kind).toBeGreaterThanOrEqual(60);
      expect(BOSS_ULT_COLORS[kind], kind).toMatchObject({ dim: expect.any(String) });
      expect(kit.ultimate.below, kind).toBeLessThan(kit.phaseTwo.below);
    }
  });
});

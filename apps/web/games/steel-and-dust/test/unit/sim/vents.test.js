import { describe, expect, it } from 'vitest';
import { VENT } from '../../../src/data/vents.js';
import { VENT_BEAT, ventFrame, ventPhase } from '../../../src/sim/hazards/vent-beat.js';
import { createVents, updateVents } from '../../../src/sim/hazards/vents.js';
import { createLootGame, soundKeys, spawnEnemy } from '../../support/loot-game.js';

const SPOT = 300;
const GLOW_AT = VENT.rest;
const ERUPT_AT = VENT.rest + VENT.glow;
const COOL_AT = ERUPT_AT + VENT.erupt;

// the vent just before the start of its beat, so the first update starts it
function foundryGame() {
  const { game, sounds } = createLootGame();
  game.player.x = SPOT - 120;
  game.vents = createVents([{ x: SPOT, y: game.player.y }]);
  game.vents[0].time = VENT_BEAT - 1;

  return { game, sounds, vent: game.vents[0] };
}

function runBeat(game, ticks) {
  for (let i = 0; i < ticks; i++) {
    updateVents(game);
  }
}

const framesOver = (from, to) =>
  new Set(Array.from({ length: to - from }, (_, i) => ventFrame(from + i)));

const burnOn = (game, fighter) =>
  game.summons.find((summon) => summon.kind === 'burn' && summon.target === fighter);

describe("a slag vent's beat", () => {
  it('lies cold, glows, erupts and dies down, then starts again', () => {
    expect(ventPhase(0)).toEqual({ phase: 'rest', at: 0 });
    expect(ventPhase(GLOW_AT).phase).toBe('glow');
    expect(ventPhase(ERUPT_AT)).toEqual({ phase: 'erupt', at: 0 });
    expect(ventPhase(COOL_AT).phase).toBe('cool');
    expect(ventPhase(VENT_BEAT)).toEqual({ phase: 'rest', at: 0 });
  });

  it('shows the cold grate, the glow, the column and the slag dying down in turn', () => {
    expect(framesOver(0, GLOW_AT)).toEqual(new Set([0]));
    expect(framesOver(GLOW_AT, ERUPT_AT)).toEqual(new Set([1, 2]));
    expect(framesOver(ERUPT_AT, COOL_AT)).toEqual(new Set([3, 4, 5, 6, 7]));
    expect(ventFrame(ERUPT_AT)).toBe(3);
    expect(ventFrame(COOL_AT - 1)).toBe(7);
    expect(framesOver(COOL_AT, VENT_BEAT)).toEqual(new Set([8, 9]));
  });

  it('lets two vents keep their own beats', () => {
    const [first, second] = createVents([
      { x: 300, y: 184 },
      { x: 620, y: 184 },
    ]);

    expect(first.time).not.toBe(second.time);
  });
});

describe('a slag vent', () => {
  it('sizzles as it starts to glow, and roars as it erupts, once a beat', () => {
    const { game, sounds } = foundryGame();

    runBeat(game, VENT_BEAT);

    expect(soundKeys(sounds)).toEqual(['sizzle', 'flame']);
  });

  it('glows and erupts without a sound far off the screen, and still throws what is over it', () => {
    const { game, sounds } = foundryGame();
    const over = spawnEnemy(game, 'grunt', SPOT);
    game.camera.x = SPOT + 1000;

    runBeat(game, ERUPT_AT + 1);

    expect(soundKeys(sounds)).not.toContain('sizzle');
    expect(soundKeys(sounds)).not.toContain('flame');
    expect(over.state).toBe('juggle');
  });

  it('throws the raider over it high and leaves it burning, and not the one beside it', () => {
    const { game } = foundryGame();
    const over = spawnEnemy(game, 'grunt', SPOT + 4);
    const beside = spawnEnemy(game, 'grunt', SPOT + VENT.halfWidth + 24);

    runBeat(game, ERUPT_AT);
    expect(over.hp).toBe(over.def.hp);
    runBeat(game, 1);

    expect(over).toMatchObject({ state: 'juggle', airborne: true });
    expect(over.vy).toBeLessThan(-6);
    expect(burnOn(game, over)).toBeDefined();
    expect(beside.hp).toBe(beside.def.hp);
    expect(burnOn(game, beside)).toBeUndefined();
  });

  it('throws up a raider lying on the grate, though a blow could not touch it there', () => {
    const { game } = foundryGame();
    const lying = Object.assign(spawnEnemy(game, 'grunt', SPOT), { state: 'down', stateTime: 30 });

    runBeat(game, ERUPT_AT + 1);

    expect(lying.state).toBe('juggle');
    expect(lying.hp).toBeLessThan(lying.def.hp);
    expect(burnOn(game, lying)).toBeDefined();
  });

  it('hurts the hero over it once an eruption, without setting him alight', () => {
    const { game } = foundryGame();
    game.player.x = SPOT;
    const before = game.player.hp;

    runBeat(game, ERUPT_AT + 1);
    const after = game.player.hp;
    runBeat(game, VENT.erupt - 1);

    expect(after).toBeLessThan(before);
    expect(after).toBeGreaterThan(0);
    expect(game.player.hp).toBe(after);
    expect(burnOn(game, game.player)).toBeUndefined();
  });

  it('leaves alone a raider still walking in from off screen', () => {
    const { game } = foundryGame();
    const walker = Object.assign(spawnEnemy(game, 'grunt', SPOT), { entering: true });

    runBeat(game, COOL_AT);

    expect(walker.hp).toBe(walker.def.hp);
  });
});

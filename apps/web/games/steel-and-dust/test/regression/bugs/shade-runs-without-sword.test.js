import { describe, expect, it } from 'vitest';
import { HERO_ATLAS } from '../../../src/data/hero-atlas/index.js';
import { WEAPONS } from '../../../src/data/weapons/index.js';
import { renderFrame } from '../../../src/render/render-frame.js';
import { createLateView } from '../../support/late-images.js';
import { createPlayingGame, press, release, runTicks, tap } from '../../support/test-game.js';

// Bug: a Shade ran and dashed bare-handed, drawn from the fists row of its run and dash strips,
// though the sword row of both holds the sword in every frame. Every frame a Shade runs, dashes,
// skids and turns in is drawn from its sword row now
const SHADES = ['moss', 'firefly', 'antler', 'blue', 'ember'];
const RUN_DRAWN = /^drawImage\(img\(hero_(run|dash)\.png\),(\d+),(\d+),/;

// every piece of a packed strip has a corner of its own, so the corner names the row it was cut from
function rowOf(pieces, strip, sx, sy) {
  const [, ...rows] = pieces[strip];
  return rows.findIndex((frames) => frames.some(([x, y]) => x === sx && y === sy));
}

function drawnRows(game, late) {
  late.log.length = 0;
  renderFrame(game, late.view);
  return late.log.flatMap((call) => {
    const drawn = RUN_DRAWN.exec(call);
    const pieces = HERO_ATLAS[game.settings.hero];
    return drawn ? [rowOf(pieces, drawn[1], Number(drawn[2]), Number(drawn[3]))] : [];
  });
}

function playing(heroId) {
  const late = createLateView();
  const game = createPlayingGame({ settings: { hero: heroId } });
  renderFrame(game, late.view);
  late.images.loadAll();
  return { game, late };
}

// runs right, dashes, turns and runs back, then skids to a stop, drawing every tick
function runAround({ game, late }) {
  const seen = { rows: [], states: new Set() };
  const step = (ticks) => {
    for (let i = 0; i < ticks; i++) {
      runTicks(game, 1);
      // the hero blinks while invincible; it is held solid so every frame has to show it
      game.player.invincible = 0;
      seen.states.add(game.player.state);
      seen.rows.push(...drawnRows(game, late));
    }
  };
  press(game, 'right');
  step(60);
  tap(game, 'dash');
  step(24);
  release(game, 'right');
  press(game, 'left');
  step(40);
  release(game, 'left');
  step(12);
  return seen;
}

describe('a running Shade', () => {
  it.each(SHADES)('%s holds its sword in every frame it runs and dashes', (heroId) => {
    const { rows, states } = runAround(playing(heroId));
    expect([...states]).toEqual(expect.arrayContaining(['run', 'dash']));
    expect(rows.length).toBeGreaterThan(100);
    expect(new Set(rows)).toEqual(new Set([WEAPONS.sword.spriteRow]));
  });
});

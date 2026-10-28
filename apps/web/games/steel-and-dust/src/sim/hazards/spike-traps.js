import { VIEW_WIDTH } from '../../config.js';
import { SPIKE_STAB, SPIKE_TRAP } from '../../data/spike-traps.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { addDust } from '../fx/particles.js';
import { hazardAttacker } from './hazard-attacker.js';
import { SPIKE_BEAT, spikePhase, spikesUp } from './spike-beat.js';

// a tile off screen keeps its beat but makes no sound, or every trap on the road would be heard
const HEARD_FROM = 32;

// a row's tiles lie edge to edge around its spot, each one a stagger behind the one before it,
// so the spikes ripple along the row
export function createSpikeTraps(rows) {
  const { tiles, pitch, stagger } = SPIKE_TRAP;

  return rows.flatMap(({ x, y }) =>
    Array.from({ length: tiles }, (_, i) => ({
      x: x + (i - (tiles - 1) / 2) * pitch,
      y,
      time: (SPIKE_BEAT - i * stagger) % SPIKE_BEAT,
      struck: [],
    })),
  );
}

export function spikeArea(tile) {
  return {
    x: tile.x - SPIKE_TRAP.halfWidth,
    y: tile.y - SPIKE_TRAP.height,
    width: SPIKE_TRAP.halfWidth * 2,
    height: SPIKE_TRAP.height,
  };
}

// on its feet or lying on the tile; one in the air over it, or still walking in, is clear
function onTheTile(tile, fighter) {
  const body = hurtBox(fighter);

  return Boolean(body) && !fighter.airborne && !fighter.entering && overlaps(spikeArea(tile), body);
}

// a raider caught is the hero's hit, so it scores and builds the combo; the hero caught is hurt
// as by a raider's. The spikes strike from underfoot, so no shield faces them, and throw off the
// tile the way it was nearer its edge
function stab(game, tile, target) {
  const hero = target.side === 'player';
  const attacker = hazardAttacker(
    { x: target.x, direction: target.x < tile.x ? -1 : 1, side: hero ? 'enemy' : 'player' },
    hero ? 'knife' : 'spear',
  );
  const move = hero ? SPIKE_STAB.hero : SPIKE_STAB.raider;

  return applyHit(game, { attacker, target, move, x: target.x, y: target.y - 8 });
}

// the spikes catch whoever stands on the tile as they come up, and whoever steps onto them while
// they stand, once a beat each
function impale(game, tile) {
  for (const fighter of game.fighters.slice()) {
    if (!tile.struck.includes(fighter) && onTheTile(tile, fighter) && stab(game, tile, fighter)) {
      tile.struck.push(fighter);
    }
  }
}

function heard(game, tile) {
  const { x } = game.camera;

  return tile.x > x - HEARD_FROM && tile.x < x + VIEW_WIDTH + HEARD_FROM;
}

// the slots grind and puff dust, then the spikes shoot up with a ring of metal
function cue(game, tile, { phase, at }) {
  if (at !== 0 || !heard(game, tile)) {
    return;
  }

  if (phase === 'warn') {
    game.io.sfx('dig', false, { x: tile.x });
  } else if (phase === 'rise') {
    addDust(game, { x: tile.x, y: tile.y, count: 4 });
    game.io.sfx('spikeTrap', false, { x: tile.x });
  }
}

export function updateSpikeTraps(game) {
  for (const tile of game.spikeTraps) {
    tile.time = (tile.time + 1) % SPIKE_BEAT;
    const beat = spikePhase(tile.time);

    cue(game, tile, beat);
    if (beat.phase === 'rest') {
      tile.struck.length = 0;
    } else if (spikesUp(tile.time)) {
      impale(game, tile);
    }
  }
}

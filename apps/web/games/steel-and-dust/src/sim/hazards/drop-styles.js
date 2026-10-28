import { PAINTED_THEMES } from '../../art/painted-themes/index.js';
import { DROP } from '../../data/ambush.js';
import { burstLeaves, shedLeaf, startleFireflies } from '../fx/canopy-fx.js';
import { burstGrit, trickleGrit } from '../fx/grit-fx.js';
import { missionOf } from '../stage/mission.js';

// the leaves rustle as the raider settles on the branch, and again as it gets ready to jump; grit
// rattles off a ledge as it climbs on and as it shifts its feet to leap
const STIRS = [1, DROP.warn - 26];
// while it climbs onto a ledge it knocks a grain loose every few ticks, then now and again
const CLIMBING_EVERY = 3;
const WAITING_EVERY = 11;

const roadOf = (game) => PAINTED_THEMES[missionOf(game).theme];

// the band of a crown its leaves are shaken from, round where the raider hides in it
function crownBand(perch) {
  return { top: perch.top + 6, bottom: perch.y, spread: (perch.to - perch.from) * 0.3 };
}

function startle(game, mark) {
  const { fireflies } = roadOf(game).ambient;

  if (fireflies) {
    startleFireflies(game, { x: mark.x, colors: fireflies });
  }
}

function stir(game, mark, sound) {
  if (STIRS.includes(mark.time)) {
    game.io.sfx(sound, false, { x: mark.x });
  }
}

// out of the road's own canopy overhead, or out of a crown: leaves shaken down, fireflies
// startled, and a branch that snaps
function leafy(band) {
  return {
    wait(game, mark) {
      const { ambient } = roadOf(game);
      const colors = mark.perch ? roadOf(game).debris : ambient.leaves;

      if (colors && mark.time % DROP.leafEvery === 0) {
        shedLeaf(game, { x: mark.x, colors, band: band(mark.perch) });
      }

      if (mark.time === 1) {
        startle(game, mark);
      }

      stir(game, mark, 'rustle');
    },

    leave(game, mark) {
      const colors = mark.perch ? roadOf(game).debris : roadOf(game).ambient.leaves;

      if (colors) {
        burstLeaves(game, { x: mark.x, colors, band: band(mark.perch) });
      }

      startle(game, mark);
      game.io.sfx('branchSnap', false, { x: mark.x });
    },
  };
}

// the top of what a raider on a ledge stands on or behind, where grit comes off it
const edgeOf = (perch) => perch.wall ?? perch.y;

// off a ledge in sight: grit knocked loose as it climbs on and waits, and a leap off in its dust
const LEDGE = {
  wait(game, mark) {
    const every = mark.time < DROP.climb ? CLIMBING_EVERY : WAITING_EVERY;

    if (mark.time % every === 0) {
      trickleGrit(game, { x: mark.x, y: edgeOf(mark.perch), colors: roadOf(game).debris });
    }

    stir(game, mark, 'gritTrickle');
  },

  leave(game, mark) {
    const { debris, ground } = roadOf(game);
    const y = edgeOf(mark.perch);

    burstGrit(game, { x: mark.x, y, colors: debris, dust: ground.sand });
    game.io.sfx(mark.perch.leap ?? 'perchLeap', false, { x: mark.x });
  },
};

const CANOPY = leafy(() => undefined);
const STYLES = { crown: leafy(crownBand), ledge: LEDGE };

// how a raider waits overhead and how it lets go, by what it waits on
export function dropStyle(mark) {
  return mark.perch ? STYLES[mark.perch.kind] : CANOPY;
}

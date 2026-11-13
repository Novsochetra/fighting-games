import { LOOK_ART } from '../../art/duel/looks.js';
import { clashClock } from './clash-clock.js';
import { easeIn, easeOut, phaseOf } from './hash.js';
import { afterPath, approachPath, bezier } from './paths.js';
import { shownRound } from './show.js';
import { IMPACT_TICK, STAGE_TICKS } from './stages.js';

const START = 8;

function ballOf(scene) {
  if (!scene.hit) {
    return bezier(scene.from, scene.control, scene.impact, scene.approach);
  }

  const path = scene.afterPath;

  return bezier(path.from, path.control, path.to, easeOut(scene.after));
}

// everything a clash frame needs, worked out from the round and how far into the clash it is
export function clashScene(show, tick) {
  const round = shownRound(show);
  const ticks = clashClock(show);
  const attack = round.picked.attack;
  const defend = round.picked.defend;
  const keeper = round.kind === 'keeper';
  const look = attack.look ?? 'plain';
  const path = approachPath({ attackKind: attack.kind, look, keeper });
  const scene = {
    tick,
    t: ticks,
    keeper,
    attack,
    defend,
    word: round.result.word,
    attackWins: round.result.side === 'attack',
    look,
    art: LOOK_ART[look] ?? LOOK_ART.plain,
    guardArt: defend.move ? LOOK_ART[defend.look] : null,
    approach: easeIn(phaseOf(ticks, START, IMPACT_TICK - START)),
    after: phaseOf(ticks, IMPACT_TICK, STAGE_TICKS.clash - IMPACT_TICK - 16),
    hit: ticks >= IMPACT_TICK,
    sinceHit: ticks - IMPACT_TICK,
    ...path,
  };

  scene.afterPath = afterPath(scene.word, scene.impact, scene.impact);
  scene.ball = ballOf(scene);
  scene.trailPoint = (back) => trailPoint(scene, back);

  return scene;
}

// a point the ball passed through `back` of the way behind where it is now, for trails
export function trailPoint(scene, back) {
  const share = Math.max(0, (scene.hit ? 1 : scene.approach) - back);

  return bezier(scene.from, scene.control, scene.impact, share);
}

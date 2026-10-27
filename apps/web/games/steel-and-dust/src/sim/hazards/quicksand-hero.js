import { QUICKSAND, QUICKSAND_HEAVE } from '../../data/quicksand.js';
import { endCombo } from '../combat/combo.js';
import { reactToHit } from '../combat/hit-reaction.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { letGo, patchAt, shelf, standsIn, wade } from './quicksand-patch.js';

// a dash tears him out of the sand, and down on it or in the ultimate he is not standing in it
const FREE = new Set(['dash', 'down', 'getup', 'ult', 'ko']);

// the sand heaves him up and out, away from its middle: it hurts, but never knocks him out
function heave(game, patch, hero) {
  const direction = hero.x >= patch.x ? 1 : -1;
  const { knockback, hitstop } = QUICKSAND_HEAVE;

  Object.assign(hero, { hp: Math.max(1, hero.hp - QUICKSAND.heroDamage), sunk: 0, flashTime: 4 });
  reactToHit(game, hero, { move: QUICKSAND_HEAVE, direction, knockback, knockdown: true });
  hero.hitstop = hitstop;
  endCombo(game);
  addBurst(game, { sprite: 'eruption', x: hero.x, y: patch.y, scale: 0.5, behind: true });
  addDust(game, { x: hero.x, y: patch.y, count: 10 });
  shake(game, 2, 10);
  game.io.sfx('eruption', false, { x: hero.x });
  game.io.sfx('voiceHero', false, { x: hero.x });
}

// the hero wades through the sand slowly and it pulls him down while he stays; a jump or a dash
// gets him out
export function pullHero(game, hero) {
  const patch = patchAt(game.quicksand, hero.x);

  if (!patch || !standsIn(patch, hero) || FREE.has(hero.state)) {
    letGo(hero);
    return;
  }

  if (hero.hitstop > 0) {
    return;
  }

  wade(hero);
  hero.sunk = Math.min((hero.sunk ?? 0) + QUICKSAND.heroSink, shelf(patch, hero.x));
  if (hero.sunk >= QUICKSAND.heroDepth) {
    heave(game, patch, hero);
  }
}

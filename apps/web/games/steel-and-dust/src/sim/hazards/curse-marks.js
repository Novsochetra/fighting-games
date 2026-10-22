import { isCursing } from './canopic-jars.js';

// the eye hangs this high over the hero's feet
export const CURSE_OVER_HEAD = 46;

// the sun's eye hangs over the cursed hero's head, counting down till the curse burns
export function markCurse(game, boss) {
  game.projectiles.push({
    kind: 'curseMark',
    x: game.player.x,
    y: game.player.y,
    direction: 1,
    speed: 0,
    side: boss.side,
    time: 0,
    damage: 0,
    left: 0,
    owner: boss,
    hitTargets: new Set(),
  });
}

export function followHero(game, mark) {
  const { player } = game;
  const { owner } = mark;
  Object.assign(mark, { x: player.x, y: player.y });
  mark.dead = !isCursing(owner);
  mark.left = mark.dead ? 0 : owner.move.curse.releaseAt - owner.moveTime;
}

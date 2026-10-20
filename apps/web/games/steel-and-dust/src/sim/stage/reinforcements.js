import { missionOf } from './mission.js';

const REINFORCEMENT_EVERY = 420;

// the boss calls one of the mission's raiders every few seconds while fewer than two are left
export function callReinforcements(game) {
  const boss = game.boss;
  if (!boss || boss.state === 'ko' || boss.entering) {
    return;
  }
  if (++game.stage.reinforcementTimer <= REINFORCEMENT_EVERY) {
    return;
  }
  game.stage.reinforcementTimer = 0;
  const helpers = game.fighters.filter(
    (fighter) => fighter.side === 'enemy' && !fighter.def.boss && fighter.state !== 'ko',
  );
  if (helpers.length < 2) {
    const kinds = missionOf(game).reinforcements;
    const kind = kinds[(Math.random() * kinds.length) | 0];
    game.stage.spawnQueue.push({ kind, side: Math.random() < 0.5 ? -1 : 1, delay: 1 });
  }
}

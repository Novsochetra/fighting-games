import { COLORS } from '../../art/colors.js';
import { punch } from '../fx/camera-fx.js';
import { addFloatText, addRing } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';
import { addSparks } from '../fx/particles.js';
import { releaseToken } from '../fighters/tokens.js';
import { stageClear } from '../stage/stage-clear.js';
import { endCombo } from './combo.js';
import { shout } from './sounds.js';

function knockOutEnemy(game, enemy, direction) {
  const boss = enemy.def.boss;
  const points = boss ? 5000 : 300;
  const y = enemy.y - 16 * enemy.scale;
  game.score += points;
  game.io.sfx('ko', false, { x: enemy.x });
  shout(game, enemy, 'die');
  addRing(game, { x: enemy.x, y, color: COLORS.gold, big: true });
  addSparks(game, { x: enemy.x, y, count: boss ? 24 : 12, color: COLORS.gold, speed: 3.6 });
  addFloatText(game, {
    x: enemy.x,
    y: enemy.y - 40 * enemy.scale,
    text: `+${points}`,
    color: COLORS.gold,
  });
  punch(game, {
    x: enemy.x - game.camera.x,
    y: enemy.y - 16,
    time: boss ? 16 : 9,
    kickX: direction * 2,
    kickY: 0,
  });
  buzz(game, boss ? [60, 40, 90] : 22);
  const standing = game.fighters.filter(
    (fighter) => fighter.side === 'enemy' && fighter.state !== 'ko',
  );
  if (standing.length === 0 && !game.stage.spawnQueue.length) {
    game.slowMotion = Math.max(game.slowMotion, 42);
  }
  if (enemy === game.boss && !game.clearTime) {
    stageClear(game);
  }
}

function knockOutPlayer(game, player) {
  game.io.sfx('ko');
  game.io.sfx('voiceHero', false, { vol: 1.1, rate: 0.85, x: player.x });
  game.slowMotion = 40;
  endCombo(game);
}

export function knockOut(game, fighter, direction) {
  fighter.state = 'ko';
  fighter.airborne = true;
  fighter.vy = -3.6;
  fighter.vx = direction * 2.4;
  fighter.stateTime = 0;
  fighter.koBounced = false;
  fighter.move = null;
  fighter.hitboxActive = false;
  releaseToken(game, fighter);
  if (fighter.side === 'enemy') {
    knockOutEnemy(game, fighter, direction);
  } else {
    knockOutPlayer(game, fighter);
  }
}

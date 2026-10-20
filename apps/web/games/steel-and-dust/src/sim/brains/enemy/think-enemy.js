import { VIEW_WIDTH } from '../../../config.js';
import { takeToken } from '../../fighters/tokens.js';
import { tryBlink } from './blink.js';
import { thinkBoss } from './boss.js';
import { thinkMelee } from './melee.js';
import { standStill, walk } from './movement.js';
import { thinkSlinger } from './slinger.js';

function arenaMiddle(game) {
  if (game.arena) {
    return (game.arena.left + game.arena.right) / 2;
  }
  return game.camera.x + VIEW_WIDTH / 2;
}

function walkIntoArena(game, fighter) {
  fighter.facing = arenaMiddle(game) >= fighter.x ? 1 : -1;
  walk(fighter, 1, 1);
}

function fightIsOff(game) {
  return game.player.state === 'ko' || game.mode !== 'play' || game.clearTime > 0;
}

function isPlayerDown(player) {
  return player.state === 'down' || player.state === 'getup';
}

function faceThePlayer(game, fighter) {
  const dx = game.player.x - fighter.x;
  fighter.facing = dx >= 0 ? 1 : -1;
  if (fighter.ai.cooldown > 0) {
    fighter.ai.cooldown--;
  }
  return Math.abs(dx);
}

function maybeTakeToken(game, fighter, playerDown) {
  if (!fighter.hasToken && fighter.ai.cooldown <= 0 && !playerDown && Math.random() < 0.03) {
    takeToken(game, fighter);
  }
}

export function thinkEnemy(game, fighter) {
  if (fighter.state !== 'idle' && fighter.state !== 'walk') {
    return;
  }
  if (fighter.entering) {
    walkIntoArena(game, fighter);
    return;
  }
  const distance = faceThePlayer(game, fighter);
  if (fightIsOff(game)) {
    standStill(fighter);
    return;
  }
  if (fighter.def.boss) {
    thinkBoss(game, fighter, distance);
    return;
  }
  const playerDown = isPlayerDown(game.player);
  maybeTakeToken(game, fighter, playerDown);
  if (fighter.def.blink && tryBlink(game, fighter, distance)) {
    return;
  }
  const think = fighter.def.ranged ? thinkSlinger : thinkMelee;
  think(game, fighter, { distance, playerDown });
}

import { CHARACTER_PALETTES } from '../../art/character-palettes.js';
import { GROUND_Y } from '../../config.js';
import { ENEMY_TYPES } from '../../data/enemies/enemy-types.js';
import { PLAYER_TYPE } from '../../data/player.js';

function startingWeapon(side, def) {
  return side === 'player' ? { id: 'fists', durability: Infinity } : { id: def.weapon };
}

function combatFlags() {
  return {
    hitboxActive: false,
    hitTargets: new Set(),
    hitConfirmed: false,
    durabilityUsed: false,
    hitstop: 0,
    hitShake: 0,
    flashTime: 0,
    armorFlash: 0,
    blockFlash: 0,
    invincible: 0,
    airborne: false,
    juggleCount: 0,
    groundBounce: false,
    groundBounceUsed: false,
    wallBounced: false,
    koBounced: false,
    hasToken: false,
    airHits: 0,
    airDashUsed: false,
    dashChain: 0,
    pogoCount: 0,
  };
}

function animationFields(animTime) {
  return {
    animTime,
    pose: null,
    poseAtMoveStart: null,
    joints: null,
    trail: [],
    scarf: null,
    afterimages: [],
    spriteName: null,
    spriteStart: 0,
    landedAt: -99,
    lastShoutAt: -999,
    ultFrame: null,
  };
}

export function createFighter(side, kind, x) {
  const def = side === 'player' ? PLAYER_TYPE : ENEMY_TYPES[kind];
  const animTime = (Math.random() * 60) | 0;
  const cooldown = 30 + ((Math.random() * 40) | 0);
  const spacing = 46 + Math.random() * 34;
  return {
    side,
    kind,
    def,
    x,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    facing: 1,
    hp: def.hp,
    maxHp: def.hp,
    hpLag: def.hp,
    scale: def.scale || 1,
    palette: CHARACTER_PALETTES[def.palette],
    state: 'idle',
    stateTime: 0,
    move: null,
    moveTime: 0,
    ai: { cooldown, spacing },
    walkDirection: 1,
    jumpDirection: 0,
    weapon: startingWeapon(side, def),
    removed: false,
    hpBarTime: 0,
    entering: false,
    ...combatFlags(),
    ...animationFields(animTime),
  };
}

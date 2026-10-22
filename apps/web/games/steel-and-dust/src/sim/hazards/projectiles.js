import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { trailColorOf } from '../fighters/hero-colors.js';
import { showHint } from '../hints.js';
import { breakCratesIn } from '../items/crates.js';
import { groundAt } from '../stage/terrain.js';
import { burnBlaze } from './blazes.js';
import { flyBoulder } from './boulders.js';
import { skimGround } from './crescents.js';
import { spinDustDevil } from './dust-devils.js';
import { flyBomb } from './enemy-shots.js';
import { runLance } from './flame-lances.js';
import { diveToward } from './shot-aim.js';
import { hitArea } from './shot-hits.js';
import { leaveTrail } from './shot-trails.js';
import { coolLava, flySlagPot } from './slag-pots.js';
import { SHOT_RULES } from './shot-rules.js';
import { riseSpike } from './spikes.js';
import { crackStrike } from './storm-strikes.js';
import { runThunderBolt } from './thunder-bolts.js';
import { flyGlob, soakPuddle } from './venom-globs.js';
import { fadeMark } from './pounce-mark.js';
import { flyWasp } from './wasps.js';

const DEFAULT_SPEED = 4.6;
const KNIFE_SPEED = 3.1;

export function spawnSlashWave(game, fighter, move) {
  game.projectiles.push({
    kind: 'wave',
    x: fighter.x + fighter.facing * 18,
    y: fighter.y - 22,
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: move.waveDamage,
    speed: move.waveSpeed,
    hitTargets: new Set(),
    color: trailColorOf(game, fighter.weapon.id),
  });
}

export function tossKnife(game, fighter) {
  const x = fighter.x + fighter.facing * 10;
  game.projectiles.push({
    kind: 'knife',
    x,
    y: fighter.y - 24 * fighter.scale,
    vy: diveToward(fighter, game.player, { x, speed: KNIFE_SPEED }),
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: 6,
    speed: KNIFE_SPEED,
    hitTargets: new Set(),
    color: COLORS.steel,
  });
  game.io.sfx('swingSpear', false, { vol: 0.6, x: fighter.x, dir: fighter.facing });
}

// shots that fly their own way, and find their own floor, instead of running straight
const FLIGHT = {
  bomb: flyBomb,
  crescent: skimGround,
  shard: skimGround,
  boulder: flyBoulder,
  spike: riseSpike,
  glob: flyGlob,
  puddle: soakPuddle,
  wasp: flyWasp,
  pounceMark: fadeMark,
  thunderBolt: runThunderBolt,
  dustDevil: spinDustDevil,
  stormStrike: crackStrike,
  blaze: burnBlaze,
  slagPot: flySlagPot,
  lavaPool: coolLava,
  flameLance: runLance,
};
const OWN_FLOOR = new Set(['fire', 'bamboo', ...Object.keys(FLIGHT)]);

// a thrown or fired shot breaks on a rise in the road
export function hitsGround(terrain, shot) {
  return !OWN_FLOOR.has(shot.kind) && shot.y >= groundAt(terrain, shot.x);
}

function moveShot(game, shot) {
  shot.x += shot.direction * (shot.speed ?? DEFAULT_SPEED);
  shot.time++;
  if (FLIGHT[shot.kind]) {
    FLIGHT[shot.kind](game, shot);
  } else if (shot.vy) {
    shot.y += shot.vy;
  }
  if (hitsGround(game.terrain, shot)) {
    shot.dead = true;
  }
  const rules = SHOT_RULES[shot.kind];
  if (rules.rehitEvery && shot.time % rules.rehitEvery === 0) {
    shot.hitTargets.clear();
  }
}

function stillFlying(game, shot) {
  const cameraX = game.camera.x;
  return (
    !shot.dead &&
    shot.time < SHOT_RULES[shot.kind].range &&
    shot.x > cameraX - 40 &&
    shot.x < cameraX + VIEW_WIDTH + 40
  );
}

export function updateProjectiles(game) {
  for (const shot of game.projectiles.slice()) {
    moveShot(game, shot);
    leaveTrail(game, shot);
    const rules = SHOT_RULES[shot.kind];
    const area = rules.area(shot);
    if ((shot.kind === 'knife' || shot.kind === 'bolt') && shot.side === 'enemy') {
      showHint(game, 'sling');
    }
    if (rules.hit && (!rules.armed || rules.armed(shot))) {
      hitArea(game, { shot, area, hit: rules.hit });
    }
    if (shot.side === 'player') {
      breakCratesIn(game, area);
    }
  }
  game.projectiles = game.projectiles.filter((shot) => stillFlying(game, shot));
}

import { digest } from './digest.js';

// the fixture format comes from the original single-file game, which used 'p' / 'e' for sides
// and had no kind for impacts and slash waves
const LEGACY_SIDE = { player: 'p', enemy: 'e' };
const legacyKind = (kind) => (kind === 'impact' || kind === 'wave' ? undefined : kind);

function fighterSnapshot(fighter) {
  return {
    kind: fighter.side === 'player' ? 'player' : fighter.kind,
    x: fighter.x,
    y: fighter.y,
    vx: fighter.vx,
    vy: fighter.vy,
    state: fighter.state,
    stateTime: fighter.stateTime,
    hp: fighter.hp,
    facing: fighter.facing,
    weapon: fighter.weapon.id,
    durability: fighter.weapon.durability,
    airborne: fighter.airborne,
    move: fighter.move ? fighter.move.name : null,
    moveTime: fighter.moveTime,
    juggle: fighter.juggleCount,
    invincible: fighter.invincible,
    hitstop: fighter.hitstop,
    token: fighter.hasToken,
    entering: fighter.entering,
    cooldown: fighter.ai.cooldown,
    spacing: fighter.ai.spacing,
  };
}

function worldSnapshot(game) {
  return {
    particles: digest(
      game.particles.flatMap((part) => [part.kind, part.x, part.y, part.life, part.color]),
    ),
    effects: digest(
      game.effects.flatMap((fx) => [legacyKind(fx.kind), fx.x, fx.y, fx.time, fx.color]),
    ),
    floaters: digest(
      game.floaters.flatMap((text) => [text.text, text.x, text.y, text.time, text.color]),
    ),
    shockwaves: digest(
      game.shockwaves.flatMap((wave) => [wave.x, wave.time, LEGACY_SIDE[wave.side]]),
    ),
    projectiles: digest(
      game.projectiles.flatMap((shot) => [
        legacyKind(shot.kind),
        shot.x,
        shot.y,
        shot.time,
        LEGACY_SIDE[shot.side],
      ]),
    ),
    summons: digest(
      game.summons.flatMap((summon) => [summon.kind, summon.x, summon.y, summon.time]),
    ),
    pickups: digest(
      game.pickups.flatMap((pickup) => [pickup.item, pickup.x, pickup.y, pickup.time]),
    ),
    crates: digest(game.crates.map((crate) => crate.broken)),
  };
}

function timers(game) {
  const { camera } = game;
  return [
    game.ultFreeze,
    game.flashTime,
    game.slashBandTime,
    game.slowMotion,
    game.goArrowTime,
    game.clearTime,
    game.playTime,
    camera.zoom.time,
    camera.shakeTime,
    game.hurtFlash,
    game.weaponPopup,
    game.fadeIn,
  ];
}

export function snapshotGame(game) {
  const { stage, camera, combo } = game;
  return {
    mode: game.mode,
    zone: stage.zoneIndex,
    wave: stage.waveIndex,
    arena: game.arena ? [game.arena.left, game.arena.right] : null,
    score: game.score,
    combo: [combo.count, combo.damage, combo.timer],
    camX: camera.x,
    meter: game.ultMeter,
    tokens: game.attackTokens,
    timers: timers(game),
    camera: [camera.kickX, camera.kickY, camera.shakeAmount],
    continues: game.continues,
    banner: game.banner ? game.banner.text : null,
    hint: game.hint ? game.hint.id : null,
    boss: game.boss ? game.boss.hp : null,
    player: fighterSnapshot(game.player),
    enemies: game.fighters.filter((fighter) => fighter.side === 'enemy').map(fighterSnapshot),
    world: worldSnapshot(game),
  };
}

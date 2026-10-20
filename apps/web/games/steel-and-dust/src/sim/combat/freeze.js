const SHATTER_HIT = { damage: 8, knockback: [1.6, -4.8], launch: true, hitstop: 8, hitstun: 24 };

// the raider is held in ice (see summons/ice.js) until it shatters; freezing again only adds time
export function freezeTarget(game, target, { duration, shatter = SHATTER_HIT }) {
  if (target.state === 'ko' || target.removed) {
    return;
  }
  const ticks = target.def.boss ? Math.round(duration / 2) : duration;
  const held = game.summons.find((summon) => summon.kind === 'ice' && summon.target === target);
  if (held) {
    held.duration = Math.max(held.duration, held.time + ticks);
    return;
  }
  target.frozen = true;
  target.hitShake = 0;
  target.hitstop = Math.max(target.hitstop, 2);
  game.summons.push({
    kind: 'ice',
    target,
    x: target.x,
    y: target.y,
    direction: 1,
    side: 'player',
    time: 0,
    duration: ticks,
    shatter,
    scale: target.scale,
    hitTargets: new Set(),
  });
  game.io.sfx('freeze', false, { x: target.x });
}

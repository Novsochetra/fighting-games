// how long each kind of effect lasts, in ticks
export const LIFETIMES = { dust: 20, grass: 26, flash: 16 };

// a goal and a scramble can make many at once; past this the oldest go first
const MOST = 48;

export function addEffect(effects, effect) {
  if (effects.list.length >= MOST) {
    effects.list.shift();
  }

  effects.list.push({ ...effect, life: effect.life ?? LIFETIMES[effect.kind] });
}

export function expireEffects(effects, tick) {
  let kept = 0;

  for (const effect of effects.list) {
    if (tick - effect.born < effect.life) {
      effects.list[kept] = effect;
      kept += 1;
    }
  }

  effects.list.length = kept;
}

export const ageOf = (effect, tick) => tick - effect.born;

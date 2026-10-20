import { themeOf } from '../fighters/hero-colors.js';
import { addFloatText, addRing } from './effects.js';
import { addSparks } from './particles.js';

// a technique calls out its name in the Shade's colors, so a player learns what they just pulled off
export function announceTechnique(game, fighter, move) {
  const theme = themeOf(game);
  const chest = { x: fighter.x + fighter.facing * 8, y: fighter.y - 26 };
  addRing(game, { ...chest, color: theme.blade, big: true });
  addSparks(game, { ...chest, count: 8, color: theme.spark, speed: 2.6 });
  addFloatText(game, { x: fighter.x, y: fighter.y - 50, text: move.name, color: theme.ult.title });
  game.io.sfx('technique', false, { x: fighter.x });
}

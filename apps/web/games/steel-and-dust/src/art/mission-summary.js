import { COLORS } from './colors.js';
import { LOOT_COLORS } from './loot-colors.js';

// the loot summary at a clear: a pane of dark glass the cleared road shows through, a thin gold rim
// and a faint sheen along its top, each kind's count in the color of its pickup text
export const SUMMARY_COLORS = {
  glass: COLORS.night,
  glassAlpha: 0.62,
  rim: COLORS.gold,
  rimAlpha: 0.85,
  sheen: COLORS.white,
  sheenAlpha: 0.14,
  shadow: COLORS.night,
  shadowAlpha: 0.35,
  rule: COLORS.gold,
  ruleAlpha: 0.35,
  label: COLORS.sand,
  count: { coin: LOOT_COLORS.coinText, gem: LOOT_COLORS.gemText, apple: LOOT_COLORS.appleText },
  take: COLORS.gold,
  none: COLORS.lilac,
  flash: COLORS.white,
};

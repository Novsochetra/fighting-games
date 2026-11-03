import { looksOf } from '../actors/looks.js';
import { bannerOf } from './banners.js';
import { drawComboCounters } from './combo-counter.js';
import { drawComboPops } from './combo-pop.js';
import { minimapRect } from './layout.js';
import { drawBigBanner, drawRestartTag } from './draw-banner.js';
import { drawPlayerCard } from './player-card.js';
import { drawScoreBug } from './score-bug.js';
import { drawSkillPopups } from './skill-popup.js';

export { bannerOf } from './banners.js';
export { minimapRect } from './layout.js';

// television's boards cover the frame at half and full time, and its opening card lands a KICK
// OFF of its own: under them the HUD would only say the same thing twice
const BOARD_PHASES = new Set(['halfTime', 'over']);

const isOpeningKickoff = (match) =>
  match.phase === 'kickoff' && match.half === 1 && match.tick === match.phaseTicks;

// the opening card plays before the match's first tick, its cup band where the score stands, and
// the HUD has nothing to say before kick off
const isUnderTvCard = (match) => BOARD_PHASES.has(match.phase) || match.tick === 0;

function drawBars(context, match, { kits, lang, tick, minimap, minimapAlpha }) {
  drawScoreBug(context, match, kits);
  minimap?.(context, match, minimapRect(match), { alpha: minimapAlpha });

  if (match.humanTeam !== null && match.humanTeam !== undefined) {
    drawPlayerCard(context, match, { kits, lang, tick });
  }
}

// what floats over the players' heads, in the UI's space, under the HUD: a skill's name and a
// combo's level; `standHeight` is the actors' (src/render/actors/sheets.js)
export function drawOverHeads(context, effects, { match, camera, lang, standHeight }) {
  if (!effects || !camera) {
    return;
  }

  drawComboPops(context, effects, { match, camera, standHeight });
  drawSkillPopups(context, effects, { match, camera, lang, standHeight });
}

// a banner is timed by the match's ticks, which a story scene (effects `held`) holds where it
// opened: it waits under the scene rather than stand half open, and plays once the match goes on
function bannerFor(match, { tv = false, kits, effects = null, lang }) {
  if (effects?.held || (tv && isOpeningKickoff(match))) {
    return null;
  }

  return bannerOf(match, { kits, effects, lang });
}

// `minimap` is the venues' drawMinimap(context, match, rect, { alpha }), given its place here
// and how faint to be (minimap-fade.js), and `comboAlpha` each side's combo counter's
// (combo-fade.js); `bannerTop` is where a big banner crosses
// (banner-slot.js); `tv` says television's cards (src/render/cinematics/) are laid over this frame
export function drawHud(context, match, options = {}) {
  if (options.tv && isUnderTvCard(match)) {
    return;
  }

  const { lang = 'en', tick = match.tick, minimap = null, minimapAlpha = 1 } = options;
  const { kits } = looksOf(match);
  const banner = bannerFor(match, { ...options, kits, lang });

  drawBars(context, match, { kits, lang, tick, minimap, minimapAlpha });
  drawComboCounters(context, match, {
    effects: options.effects,
    kits,
    lang,
    tick,
    alphas: options.comboAlpha,
  });

  if (banner) {
    drawBanner(context, banner, { lang, slot: options.bannerTop });
  }
}

function drawBanner(context, banner, { lang, slot }) {
  if (banner.size === 'big') {
    drawBigBanner(context, banner, { lang, slot });
  } else {
    drawRestartTag(context, banner, { lang });
  }
}

import { COLORS } from '../../art/colors.js';
import { WIPE_TICKS } from '../../data/mission-handoff.js';
import { SUMMARY_TICKS } from '../../data/mission-summary.js';
import { isLastMission } from '../../data/missions/index.js';
import { showBanner } from '../fx/effects.js';
import { buzz } from '../fx/haptics.js';

export const BANNER_FOREVER = 9999;
// the card, the summary of the road's loot, then the wipe closing over the road
export const CLEAR_TICKS = SUMMARY_TICKS + WIPE_TICKS;
// the drawn frames the next mission takes to open out of the cleared one's wipe
export const REVEAL_FRAMES = 36;

// the loot time is over (loot-time.js): the hero stands in triumph while the road is summed up
export function stageClear(game) {
  game.clearTime = 1;
  const text = isLastMission(game.missionIndex) ? 'All clear' : 'Mission complete';
  showBanner(game, { text, color: COLORS.amber, time: BANNER_FOREVER, stamp: true });
  game.io.sfx('clear');
  buzz(game, [40, 60, 40, 60, 120]);
}

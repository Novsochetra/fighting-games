import { isLastMission } from '../../data/missions/index.js';
import { clamp } from '../../lib/math.js';
import { CLEAR_TICKS } from '../../sim/stage/stage-clear.js';

const FADE_OUT_TICKS = 40;

// the cleared road fades to night just as the next mission starts, and that one fades in from
// night, so the change of road is never seen; the last mission stays lit behind the All clear
export function clearFadeOpacity({ clearTime, missionIndex }) {
  if (!clearTime || isLastMission(missionIndex)) {
    return 0;
  }
  return clamp((clearTime - (CLEAR_TICKS - FADE_OUT_TICKS)) / FADE_OUT_TICKS, 0, 1);
}

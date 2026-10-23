import {
  CARD_STAGGER,
  cardAge,
  cardLetterCount,
  CLEAR_CALL_TICK,
  clearCall,
  letterHitsAt,
  startCall,
  WIPE_TICKS,
} from '../../data/mission-handoff.js';
import { isLastMission } from '../../data/missions/index.js';
import { missionOf } from './mission.js';
import { CLEAR_TICKS } from './stage-clear.js';

function letterHitsNow(age, letterCount) {
  const sinceFirst = age - letterHitsAt(0);
  return (
    sinceFirst >= 0 && sinceFirst % CARD_STAGGER === 0 && sinceFirst < letterCount * CARD_STAGGER
  );
}

function callOut(game, clearing) {
  const { number } = missionOf(game);
  return clearing ? clearCall(number) : startCall(number);
}

function callsNow(game, age, clearing) {
  return clearing ? game.clearTime === CLEAR_CALL_TICK : age === 0;
}

// the announcer calls the mission, and each letter of its card stamps as it strikes
function cueTitleCard(game, banner) {
  const clearing = game.clearTime > 0;
  const age = cardAge(banner, clearing);
  if (callsNow(game, age, clearing)) {
    game.io.announce(callOut(game, clearing));
  }
  if (letterHitsNow(age, cardLetterCount(banner.text))) {
    game.io.sfx('stamp');
  }
}

// the sounds keep time with what the hand-off between two missions draws, tick for tick; the
// next mission's road opens to its own rush (`reveal`, from announceMission)
export function cueHandoff(game) {
  if (game.banner?.stamp) {
    cueTitleCard(game, game.banner);
  }
  const wipeStarts = game.clearTime === CLEAR_TICKS - WIPE_TICKS + 1;
  if (wipeStarts && !isLastMission(game.missionIndex)) {
    game.io.sfx('wipe');
  }
}

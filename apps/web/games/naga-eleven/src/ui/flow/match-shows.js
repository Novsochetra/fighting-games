import {
  createDuelShow,
  createPenaltyShow,
  isPenaltyShowDone,
  isShowDone,
  updateDuelShow,
  updatePenaltyShow,
} from '../../render/duel/index.js';
import {
  createSaveCam,
  isSaveCamDone,
  SAVE_CAM_TICKS,
  updateSaveCam,
} from '../../render/save-cam/index.js';
import { createShootout, finishDuel, shootoutResult } from '../../sim/duel/index.js';
import { endSaveCam } from '../../sim/save-cam.js';

// the cut-in of a duel comes up as the match stops for it, and the duel is settled as it ends
export function stepDuelShow(session, menuInput) {
  const { match } = session;

  if (match.phase === 'duel' && !session.duelShow) {
    session.duelShow = createDuelShow(match, { heroAge: session.heroAge, venue: session.venue });
  }

  if (!session.duelShow) {
    return;
  }

  updateDuelShow(session.duelShow, menuInput);

  if (isShowDone(session.duelShow)) {
    finishDuel(match);
    session.duelShow = null;
  }
}

// the save cam of open play comes up as the sim pauses for one, and play goes on as it ends or a
// press skips it; should the sim move on first, the show goes with it
export function stepSaveCamShow(session, input) {
  const { match } = session;

  if (match.phase === 'saveCam' && match.saveCam && !session.saveCamShow) {
    session.saveCamShow = createSaveCam(match, match.saveCam, {
      length: SAVE_CAM_TICKS.open,
      venue: session.venue,
    });
  }

  if (!session.saveCamShow || match.phase !== 'saveCam') {
    session.saveCamShow = null;

    return;
  }

  updateSaveCam(session.saveCamShow, input);

  if (isSaveCamDone(session.saveCamShow)) {
    endSaveCam(match);
    session.saveCamShow = null;
  }
}

// the shows that stop open play: a duel's cut-in and the save cam
export function stepMatchShows(session, input) {
  stepDuelShow(session, input);
  stepSaveCamShow(session, input);
}

export function startPenalties(session) {
  session.shootout = createShootout(session.match, { first: 0, watched: true });
  session.penaltyShow = createPenaltyShow(session.shootout, {
    match: session.match,
    heroAge: session.heroAge,
  });
}

export function stepPenaltyShow(session, menuInput) {
  updatePenaltyShow(session.penaltyShow, menuInput);

  if (isPenaltyShowDone(session.penaltyShow)) {
    session.penaltyShow = null;
    session.done = true;
  }
}

export const penaltiesWon = (session) =>
  session.shootout ? shootoutResult(session.shootout).winner === session.match.humanTeam : null;

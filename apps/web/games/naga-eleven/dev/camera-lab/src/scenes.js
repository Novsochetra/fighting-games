import { MOVES } from '../../../src/data/moves.js';
import { drawDuelShow } from '../../../src/render/duel/draw-show.js';
import { seenOf } from '../../../src/render/duel/seen.js';
import { createDuelShow, isShowDone } from '../../../src/render/duel/show.js';
import { updateDuelShow } from '../../../src/render/duel/timeline.js';
import {
  createSaveCam,
  drawSaveCam,
  isSaveCamDone,
  SAVE_CAM_TICKS,
  updateSaveCam,
} from '../../../src/render/save-cam/index.js';
import { forceFieldRound, forceKeeperRound, saveCamMoment } from './forced.js';
import { forwardOf, giveBall, keeperOf, labMatch } from './lab-match.js';

// a move seen before in the match plays short, as it does the second time in a game
function markSeen(match, settings) {
  const seen = seenOf(match);

  seen.duels = 1;

  for (const move of [settings.shot, settings.guard, settings.attack, settings.defend]) {
    seen.moves.add(move);
    seen.moves.add(`chase:${move}`);
  }
}

function sides(match, settings) {
  const shooter = Object.assign(forwardOf(match, 0), { star: 'sochetra', x: 850 });
  const keeper = Object.assign(keeperOf(match, 1), {
    star: settings.guard ? (MOVES[settings.guard].owner ?? null) : null,
    moves: settings.guard ? [settings.guard] : [],
  });

  return { shooter, keeper };
}

function newMatch(settings) {
  const match = labMatch();

  if (settings.repeat) {
    markSeen(match, settings);
  }

  return match;
}

// a show of the match's duel, stepped as the game steps it; a duel decided by hand (`decided`)
// is never ticked, as the sim would finish it then and there
function showScene(match, settings, { onStep = () => {}, decided = false } = {}) {
  const show = createDuelShow(match, {
    heroAge: 'young',
    venue: settings.venue,
    cinema: settings.camera,
  });

  return {
    step() {
      updateDuelShow(show, {});

      if (match.duel && !decided) {
        match.hooks.duelTick(match);
      }

      onStep(show);
    },

    draw: (context, options) => drawDuelShow(context, show, options),
    isDone: () => isShowDone(show),
    stage: () => show.stage,
    stageTicks: () => show.stageTicks,
  };
}

// Sochetra lets go of his shot at the keeper; once the duel is drawn it is made to come out as asked
function shotScene(settings) {
  const match = newMatch(settings);
  const { shooter } = sides(match, settings);
  let forced = false;

  Object.assign(match.players[3], { star: 'rithy', x: 820 });
  shooter.moves = ['naga-shot'];
  giveBall(match, shooter);
  match.hooks.special(match, shooter);

  const onStep = (show) => {
    const round = show.duel.rounds[0];

    if (round?.result && !forced) {
      forced = true;
      forceKeeperRound(round, settings);
    }
  };

  return showScene(match, settings, { onStep });
}

// Sochetra on the ball meets Rithy, the duel decided as asked
function clashScene(settings) {
  const match = newMatch(settings);
  const carrier = Object.assign(forwardOf(match, 0), { star: 'sochetra', x: 840 });

  Object.assign(forwardOf(match, 1), { star: 'rithy', x: 870 });
  giveBall(match, carrier);
  match.hooks.duel(match);
  forceFieldRound(match.duel.rounds[0], settings);
  match.duel.stage = 'done';

  return showScene(match, settings, { decided: true });
}

// open play's save cam for the same shot and keeper, with the film's bars and its word
function saveCamScene(settings) {
  const match = newMatch(settings);
  const cam = createSaveCam(match, saveCamMoment(sides(match, settings), settings), {
    length: SAVE_CAM_TICKS.open,
    venue: settings.venue,
    cinema: settings.camera,
  });

  return {
    step: () => updateSaveCam(cam, {}),
    draw: (context, options) => drawSaveCam(context, cam, options),
    isDone: () => isSaveCamDone(cam),
    stage: () => 'saveCam',
    stageTicks: () => cam.ticks,
  };
}

const SCENES = { shot: shotScene, clash: clashScene, saveCam: saveCamScene };

export const createScene = (settings) => SCENES[settings.scene](settings);

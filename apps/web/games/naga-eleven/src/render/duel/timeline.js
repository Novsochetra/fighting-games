import { CINEMA } from '../../data/cinema.js';
import { isSaveCamDone, updateSaveCam } from '../save-cam/index.js';
import {
  beginChase,
  beginCutin,
  beginMeeting,
  cutinLength,
  nextCutinOrMeeting,
  specialsIn,
  versusLength,
} from './beats.js';
import { clashLength } from './clash-clock.js';
import { hasFinale } from './finale.js';
import { openMenu, stepMenu } from './menu.js';
import { enter, pendingSide, shownRound } from './show.js';
import { IMPACT_TICK, MENU_AFTER, SHAKE, STAGE_TICKS } from './stages.js';

function versus(show, input) {
  if (show.stageTicks >= MENU_AFTER && pendingSide(show)) {
    openMenu(show);
    enter(show, 'menu');

    return;
  }

  const hurried = input.pressed?.pass && show.stageTicks > MENU_AFTER;

  if (show.stageTicks >= versusLength(show) || hurried) {
    enter(show, 'wait');
  }
}

function wait(show) {
  const round = shownRound(show);

  if (!round?.result) {
    return;
  }

  show.cutins = specialsIn(show, round);
  show.cutin = 0;

  if (show.cutins.length > 0) {
    beginCutin(show);
  } else {
    beginMeeting(show);
  }
}

function cutin(show) {
  if (show.stageTicks < cutinLength(show)) {
    return;
  }

  const shown = show.cutins[show.cutin];

  show.cutin += 1;

  if (shown !== 'attack' || !beginChase(show)) {
    nextCutinOrMeeting(show);
  }
}

function clash(show) {
  if (show.stageTicks === IMPACT_TICK) {
    show.shake = SHAKE.impact;
    show.flash = 8;
  }

  if (show.stageTicks >= clashLength(show)) {
    enter(show, hasFinale(show) ? 'finale' : 'result');
  }
}

// a flash cuts away from the chase as the ball arrives
function chase(show, input) {
  const hurried = input.pressed?.pass && show.stageTicks > CINEMA.chase.skipAfter;

  if (show.stageTicks >= show.chaseLength || hurried) {
    show.flash = 5;
    nextCutinOrMeeting(show);
  }
}

function saveCam(show, input) {
  updateSaveCam(show.saveCam, input);

  if (isSaveCamDone(show.saveCam)) {
    enter(show, hasFinale(show) ? 'finale' : 'result');
  }
}

function result(show, input) {
  const word = shownRound(show)?.result?.word;
  const length = word === 'through' ? STAGE_TICKS.through : STAGE_TICKS.result;
  const hurried = input.pressed?.pass && show.stageTicks > 30;

  if (show.stageTicks < length && !hurried) {
    return;
  }

  if (show.duel.rounds.length > show.round + 1) {
    show.round += 1;
    show.saveCam = null;
    enter(show, 'versus');
  } else if (show.duel.stage === 'done') {
    enter(show, 'outro');
  }
}

const after = (stage, next) => (show) => {
  if (show.stageTicks >= STAGE_TICKS[stage]) {
    enter(show, next);
  }
};

const STAGES = {
  intro: after('intro', 'versus'),
  versus,
  menu: (show, input) => stepMenu(show, input) && enter(show, 'wait'),
  wait,
  cutin,
  clash,
  chase,
  saveCam,
  finale: after('finale', 'result'),
  result,
  outro: after('outro', 'done'),
  done: () => {},
};

export function updateDuelShow(show, input = {}) {
  show.ticks += 1;
  show.stageTicks += 1;
  show.shake = Math.max(0, show.shake - 1);
  show.flash = Math.max(0, show.flash - 1);
  STAGES[show.stage](show, input);

  return show;
}

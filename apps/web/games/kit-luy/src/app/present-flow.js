import { dropNotes } from '../fx/particles.js';
import { cheer } from '../fx/piggy-mood.js';
import { RUN_HANDLERS } from './present-run.js';

const BEST_NOTES = 48;
const BEST_CHEER_SECONDS = 2.5;

function start(stage) {
  stage.audio.stopMusic();
  stage.fx.particles = [];
  stage.hud.reset();
  stage.question.blank();
}

function go(stage) {
  stage.announce(stage.text.t('banner.go'), 'go');
  stage.audio.play('go');
  stage.audio.startMusic();
}

function resumed(stage) {
  if (stage.game.screen === 'play') {
    stage.audio.startMusic();
  }
}

function finished(stage, { summary }) {
  const isBest = summary.isNewBest && summary.score > 0;

  stage.results.show(summary, stage.text);
  stage.save();
  stage.buzz('over');
  stage.audio.play(isBest ? 'best' : 'over');

  if (isBest) {
    cheer(stage.piggy, BEST_CHEER_SECONDS);
    dropNotes(stage.fx, Math.random, { width: stage.canvases.width, count: BEST_NOTES });
  }
}

const HANDLERS = {
  ...RUN_HANDLERS,
  start,
  go,
  resumed,
  finished,

  beat(stage, event) {
    stage.announce(stage.text.number(event.count), 'beat');
    stage.audio.play('beat');
  },

  paused: (stage) => stage.audio.stopMusic(),
  quit: (stage) => stage.audio.stopMusic(),
};

export function present(stage, events) {
  for (const event of events) {
    HANDLERS[event.type]?.(stage, event);
  }
}

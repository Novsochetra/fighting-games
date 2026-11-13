import { clothCount, clothTotal } from '../sim/pieces.js';
import { CLOSING_BEAT_MS } from './present.js';
import { bankLanded } from './present-speed.js';

const MENU_OF = { pause: 'pause', over: 'over' };

function showView(stage) {
  const { screen } = stage.game;
  const closing = screen === 'over' && stage.now < stage.closedAt + CLOSING_BEAT_MS;

  stage.at.counter.classList.toggle('is-closing', screen === 'over');

  if (screen !== stage.view && !closing) {
    stage.view = screen;
    stage.at.app.dataset.view = screen;
    stage.menus.showFor(MENU_OF[screen] ?? null);
  }
}

function showCount(stage) {
  const { run } = stage.game;

  if (run.mode === 'keypad') {
    stage.keypad.show(run.typed);
  } else {
    stage.slip.count(run.showTotal ? clothTotal(run.cloth) : null);
  }
}

function tearNextSlip(stage) {
  const next = stage.nextSlip;

  if (next && stage.now >= next.at) {
    stage.nextSlip = null;
    stage.slip.turnPage(next.customer, stage.game.run.served + 1);
    showCount(stage);
  }
}

function countTakings(stage) {
  const value = stage.results.count(stage.now);

  if (value !== null) {
    stage.audio.play('count', { value });
  }
}

function burnFuse(stage) {
  const { run, screen } = stage.game;
  const second = stage.fuse.show(run.patience);

  if (second !== null && screen === 'play') {
    stage.audio.play('hurry', { seconds: second });
  }

  stage.stools.restless(screen === 'play' && stage.fuse.isHurry());
}

const nothingToGive = (run) =>
  run.mode === 'money' ? clothCount(run.cloth) === 0 : run.typed === '';

export function drawFrame(stage, ms) {
  const { run, screen } = stage.game;

  stage.now += ms;
  showView(stage);
  tearNextSlip(stage);
  bankLanded(stage);
  stage.praise.fade(stage.now);
  stage.sign.roll(stage.banked);
  stage.stools.sync(run, stage.now);
  burnFuse(stage);
  stage.at.give.classList.toggle('is-empty', nothingToGive(run));

  if (screen === 'over') {
    countTakings(stage);
  }
}

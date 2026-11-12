import { clothCount, clothTotal } from '../sim/pieces.js';
import { CLOSING_BEAT_MS } from './present.js';

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

function tearNextSlip(stage) {
  const next = stage.nextSlip;

  if (next && stage.now >= next.at) {
    stage.nextSlip = null;
    stage.slip.turnPage(next.customer, stage.game.run.served + 1);
    stage.slip.count(stage.game.run.showTotal ? clothTotal(stage.game.run.cloth) : null);
  }
}

function countTakings(stage) {
  const value = stage.results.count(stage.now);

  if (value !== null) {
    stage.audio.play('count', { value });
  }
}

export function drawFrame(stage, ms) {
  const { run, screen } = stage.game;

  stage.now += ms;
  showView(stage);
  tearNextSlip(stage);
  stage.sign.roll(run.takings);
  stage.stools.sync(run, stage.now);
  stage.at.give.classList.toggle('is-empty', clothCount(run.cloth) === 0);

  if (screen === 'over') {
    countTakings(stage);
  }
}

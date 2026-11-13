import { clothTotal } from '../sim/pieces.js';
import { applyText } from '../ui/text.js';
import { openStall } from './flow.js';

// Every word and figure on the page is said again in the new language and numerals; the money
// and the bill are written again, as their figures are not the page's own text.
export function createSettingsChanged(stage) {
  const { game, document, text } = stage;

  return function settingsChanged(key) {
    // the running total and the way of answering are the run's from its first customer, so the
    // title opens afresh with them; in a day, they wait for the next
    if ((key === 'total' || key === 'input') && game.screen === 'title') {
      openStall(game, stage.window.Date.now() >>> 0);
    }

    const { run } = game;

    stage.save();
    document.documentElement.lang = game.settings.lang;
    applyText(document, text);
    stage.till.write();
    stage.till.show(run.pieces);
    stage.cloth.show(run.cloth);
    stage.keypad.write();
    stage.sign.showBest(game.records[run.mode].best);

    if (run.queue.length > 0 && run.phase !== 'closed' && !stage.nextSlip) {
      stage.slip.rewrite(run.queue[0], run.served + 1);
      stage.slip.count(run.showTotal && run.mode === 'money' ? clothTotal(run.cloth) : null);

      if (run.mode === 'keypad') {
        stage.keypad.show(run.typed);
      }
    }
  };
}

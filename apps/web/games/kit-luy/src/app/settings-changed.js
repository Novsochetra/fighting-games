import { applyText } from '../ui/text.js';
import { openStall } from './flow.js';

// Every word and figure on the page is said again in the new language and numerals; the money
// and the bill are written again, as their figures are not the page's own text.
export function createSettingsChanged(stage) {
  const { game, document, text } = stage;

  return function settingsChanged(key) {
    // the running total is the run's from its first customer, so the title opens afresh with it
    if (key === 'total' && game.screen === 'title') {
      openStall(game, stage.window.Date.now() >>> 0);
    }

    const { run } = game;

    stage.save();
    document.documentElement.lang = game.settings.lang;
    applyText(document, text);
    stage.till.write();
    stage.till.show(run.pieces);
    stage.cloth.show(run.cloth);
    stage.sign.showBest(game.records.best);

    if (run.queue.length > 0 && run.phase !== 'closed') {
      stage.slip.show(run.queue[0], run.served + 1);
    }
  };
}

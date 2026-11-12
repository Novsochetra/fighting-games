import { applyText } from '../ui/text.js';

export function createSettingsChanged(stage) {
  const { game, document, text } = stage;

  return function settingsChanged() {
    stage.save();
    document.documentElement.lang = game.settings.lang;
    applyText(document, text);
    stage.showTitle(game, text);

    // only a question that was showing: a countdown's is still hidden, and stays so
    if (game.screen === 'pause' && game.resumeTo === 'play') {
      stage.question.show(game.run.question, text);
    }
  };
}

import { RIEL } from '../data/currency.js';
import { TUNING } from '../data/tuning.js';
import { countUp } from '../lib/count-up.js';
import { comboOf } from '../sim/scoring.js';
import { replay, setText } from './dom.js';
import { createPips } from './pips.js';

function showCombo(combo, run, text) {
  const multiplier = comboOf(run.streak);

  combo.hidden = multiplier < 2;
  setText(combo, `×${text.number(multiplier)}`);
}

function streakLit(streak) {
  const atTop = comboOf(streak) === TUNING.maxCombo;

  return atTop ? TUNING.streakPerCombo : streak % TUNING.streakPerCombo;
}

export function createHud(elements) {
  const { score, level, clock, clockFill, clockSeconds, combo } = elements;
  const lightLevel = createPips(elements.levelPips, TUNING.answersPerLevel);
  const lightStreak = createPips(elements.streakPips, TUNING.streakPerCombo);
  let shown = 0;

  return {
    reset() {
      shown = 0;
    },

    update(run, text) {
      shown = countUp(shown, run.score, RIEL.step);
      setText(score, text.money(shown));
      setText(level, text.t('hud.level', { level: text.number(run.level) }));
      setText(clockSeconds, text.number(Math.ceil(run.timeLeft / 1000)));
      clockFill.style.transform = `scaleX(${run.timeLeft / TUNING.maxTimeMs})`;
      clock.classList.toggle('is-low', run.timeLeft <= TUNING.lowTimeMs);
      lightLevel(run.correct % TUNING.answersPerLevel);
      lightStreak(streakLit(run.streak));
      showCombo(combo, run, text);
    },

    stampCombo: () => replay(combo, 'is-stamped'),
    flinch: () => replay(clock, 'is-hit'),
    raiseLevel: () => replay(level, 'is-raised'),
  };
}

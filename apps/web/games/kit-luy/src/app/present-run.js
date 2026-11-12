import { streakTranspose } from '../audio/notes.js';
import { STREAK_SCALE } from '../data/sounds.js';
import { TUNING } from '../data/tuning.js';
import { burstSparks, scatterShards, throwCoins } from '../fx/particles.js';
import { cheer, upset } from '../fx/piggy-mood.js';
import { comboOf } from '../sim/scoring.js';
import { centerOf, replay } from '../ui/dom.js';

const LEVEL_SPARKS = 16;
const COMBO_SPARKS = 14;

function ask(stage) {
  stage.question.show(stage.game.run.question, stage.text);
  stage.question.deal();
}

function comboRose(stage) {
  const at = centerOf(stage.at.combo);

  stage.audio.play('combo');
  stage.hud.stampCombo();
  burstSparks(stage.fx, Math.random, { at: stage.canvases.toArt(at), count: COMBO_SPARKS });
}

function payOut(stage, event, key) {
  const { text } = stage;
  const box = key.getBoundingClientRect();
  const above = { x: box.left + box.width / 2, y: box.top };

  // off the key's top edge, clear of the next answer already written on it
  stage.pop({ text: `+${text.money(event.gain)}`, kind: 'gain', at: above });

  if (event.fast) {
    stage.audio.play('fast');
    stage.pop({ text: text.t('pop.fast'), kind: 'fast', at: { x: above.x, y: above.y - 30 } });
  }
}

function correct(stage, event) {
  const { canvases } = stage;
  const key = stage.question.keys[event.index];

  stage.question.markRight(event.index);
  stage.audio.play('right', streakTranspose(event.streak, STREAK_SCALE));
  stage.buzz('right');
  cheer(stage.piggy);
  throwCoins(stage.fx, Math.random, {
    from: canvases.toArt(centerOf(key)),
    to: canvases.toArt(centerOf(stage.at.hudPiggy)),
    count: 2 + event.combo * 2,
  });
  payOut(stage, event, key);

  if (event.combo > comboOf(event.streak - 1)) {
    comboRose(stage);
  }
}

function wrong(stage, event) {
  const at = centerOf(stage.question.keys[event.index]);
  const seconds = stage.text.number(TUNING.wrongPenaltyMs / 1000);

  stage.question.markWrong(event);
  stage.audio.play('wrong');
  stage.buzz('wrong');
  upset(stage.piggy);
  replay(stage.at.stage, 'is-shaken');
  stage.hud.flinch();
  scatterShards(stage.fx, Math.random, stage.canvases.toArt(at));
  stage.pop({
    text: stage.text.t('pop.penalty', { seconds }),
    kind: 'penalty',
    at: centerOf(stage.at.clock),
  });
}

// A new level shows where the level is written, off the board: nothing may cover a question.
function levelUp(stage) {
  stage.hud.raiseLevel();
  stage.audio.play('levelUp');
  stage.buzz('levelUp');
  burstSparks(stage.fx, Math.random, {
    at: stage.canvases.toArt(centerOf(stage.at.level)),
    count: LEVEL_SPARKS,
  });
}

export const RUN_HANDLERS = {
  ask,
  correct,
  wrong,
  levelUp,
  tick: (stage) => stage.audio.play('tick'),
  over: (stage) => stage.audio.stopMusic(),
};

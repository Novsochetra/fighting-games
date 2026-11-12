import { STAGES } from '../data/stages.js';
import { TUNING } from '../data/tuning.js';
import { replay } from '../ui/dom.js';
import { chipsOf } from '../ui/praise-view.js';

const PRAISED = { perfect: 'perfect', great: 'great' };

// the takings on the sign grow as each chip lands on it
export function bankLanded(stage) {
  for (const chip of stage.praise.land(stage.now)) {
    stage.banked += chip.amount;
    replay(stage.at.takings, 'is-bumped');
    stage.audio.play('chip');
  }
}

export function praisePayment(stage, paid) {
  const pay = STAGES[stage.game.run.stage - 1].pay;
  const sound = PRAISED[paid.speed];

  stage.praise.praise(paid);
  stage.praise.fly(chipsOf(paid, stage.text, pay), stage.now);
  stage.sign.showStreak(paid.streak);

  if (sound) {
    stage.audio.play(sound);
  }
}

export const SPEED_HANDLERS = {
  stormed(stage, { customer, strikes }) {
    stage.stools.storming(customer, stage.text.t('play.stormed'));
    stage.sign.showTrust(strikes, TUNING.trust);
    stage.sign.showStreak(0);
    stage.cloth.show({});
    stage.keypad.show('');
    stage.audio.play('stormed');
    stage.buzz('wrong');
    replay(stage.at.counter, 'is-knocked');
  },

  type(stage, { typed }) {
    stage.keypad.show(typed);
  },
};

import { describe, expect, it } from 'vitest';
import { HUD } from '../../../../src/art/hud.js';
import { drawRestartTag } from '../../../../src/render/hud/draw-banner.js';
import { drawPlayerCard } from '../../../../src/render/hud/player-card.js';
import { GAUGE } from '../../../../src/render/hud/spirit-gauge.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../actors/match-fixture.js';

const RAMP = ['#202020', '#404040', '#808080', '#c0c0c0'];
const KIT = { shirt: RAMP, trim: RAMP };
const KITS = [
  { outfield: KIT, keeper: KIT },
  { outfield: KIT, keeper: KIT },
];

function recorded(draw) {
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 8 });
  draw(context);

  return calls;
}

const textsOf = (calls) => calls.filter((call) => call.name === 'fillText');

const rectsOf = (calls, matches) =>
  calls.filter((call) => call.name === 'fillRect' && matches(call.args));

function cardIn(lang) {
  const match = fixtureMatch({ format: '11' });
  const hero = match.players.find((player) => player.star === 'sochetra');

  Object.assign(hero, { name: { en: 'Sochetra', km: 'សុចិត្រា' } });
  match.controlled = hero.index;

  const calls = recorded((context) =>
    drawPlayerCard(context, match, { kits: KITS, lang, tick: 0 }),
  );
  const [name] = textsOf(calls).filter((call) => call.args[0].length > 2);
  const [gauge] = rectsOf(calls, (args) => args[2] === GAUGE.width + 2);

  return { nameTop: name.args[2], gaugeTop: gauge.args[1] };
}

describe('Khmer words on the match screen', () => {
  it('stand the spirit gauge clear below a Khmer name, as below an English one', () => {
    const english = cardIn('en');
    const khmer = cardIn('km');

    expect(khmer.gaugeTop - khmer.nameTop).toBeGreaterThanOrEqual(15);
    expect(english.gaugeTop - english.nameTop).toBe(9);
  });

  it('make a restart tag tall enough for its Khmer word', () => {
    const tagHeight = (lang) => {
      const banner = { label: { en: 'CORNER', km: 'បាល់ជ្រុង' }, age: 20, ramp: HUD.gold };
      const calls = recorded((context) => drawRestartTag(context, banner, { lang }));

      return Math.max(...rectsOf(calls, () => true).map((call) => call.args[3]));
    };

    expect(tagHeight('km')).toBeGreaterThan(tagHeight('en'));
  });
});

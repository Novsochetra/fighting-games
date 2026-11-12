// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { TUNING } from '../../../src/data/tuning.js';
import { openPage } from '../../support/open-page.js';

// The fine for a wrong answer pops up over the clock, and the page looked the clock up among
// elements that did not hold it: the first wrong answer threw before the game was told to go on,
// and the run stood still on the wrong answer.
describe('the first wrong answer of a run', () => {
  it('pops the fine over the clock and the run goes on to the next question', () => {
    const page = openPage();

    page.play();

    const first = page.text('sum');

    page.pressWrong();
    page.step();
    expect(document.querySelector('.pop-penalty')).not.toBeNull();
    expect(page.stage.at.clock).toBe(document.getElementById('clock'));

    page.wait(TUNING.wrongRevealMs + 50);
    expect(page.game.run.phase).toBe('asking');
    expect(page.text('sum')).not.toBe(first);
    expect(document.querySelectorAll('.answer.is-wrong, .answer.is-answer')).toHaveLength(0);
  });

  it('plays a whole run of wrong answers through to the results', () => {
    const page = openPage();

    page.play();

    for (let i = 0; i < 12 && page.screen() === 'play'; i++) {
      page.pressWrong();
      page.wait(TUNING.wrongRevealMs + 50);
    }

    expect(page.screen()).toBe('over');
    expect(page.text('overAccuracy')).toBe('0%');
    expect(document.getElementById('overStamp').hidden).toBe(true);
  });
});

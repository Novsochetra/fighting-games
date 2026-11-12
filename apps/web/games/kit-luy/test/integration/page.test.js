// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { TUNING } from '../../src/data/tuning.js';
import { openPage } from '../support/open-page.js';

describe('the game on its page', () => {
  it('opens on the title with what the player has saved up', () => {
    const page = openPage({ records: { best: 4200, bestStreak: 9, savings: 30000, plays: 5 } });

    expect(page.screen()).toBe('title');
    expect(page.openMenu()).toBe('m-title');
    expect(page.text('titleBest')).toBe('4,200៛');
    expect(page.text('titleSavings')).toBe('30,000៛');
    expect(page.text('titleRank')).toBe('Snack seller');
    expect(page.text('titleNext')).toBe('20,000៛ to Market vendor');
    expect(document.getElementById('titleRankFill').style.transform).toBe('scaleX(0.5)');
  });

  it('opens in Khmer, in Khmer numerals, for a player who chose them', () => {
    const page = openPage({ settings: { lang: 'km', numerals: 'khmer' } });

    expect(document.documentElement.lang).toBe('km');
    expect(document.querySelector('#m-title [data-act="play"]').textContent).toBe('លេង');
    expect(page.text('titleBest')).toBe('០៛');
  });

  it('counts down over a covered question, then asks the first one', () => {
    const page = openPage();

    page.click('#m-title [data-act="play"]');
    page.step();
    expect(page.screen()).toBe('countdown');
    expect(page.openMenu()).toBeNull();
    expect(page.text('banner')).toBe('3');
    expect(page.text('sum')).toBe('?');
    expect(page.keys().map((key) => key.lastElementChild.textContent)).toEqual(['', '', '', '']);

    page.wait(2400);
    expect(page.screen()).toBe('play');
    expect(page.text('banner')).toBe('Go!');
    expect(page.text('sum')).toMatch(/^[\d,]+៛ [+−×÷] [\d,]+៛?$/);
    expect(page.keys().every((key) => /^[\d,]+៛$/.test(key.lastElementChild.textContent))).toBe(
      true,
    );
  });

  it('pays a right answer: the key lights, coins fly and the score rolls up', () => {
    const page = openPage();

    page.play();

    const index = page.game.run.question.correctIndex;

    page.pressRight();
    page.step();
    expect(page.keys()[index].classList.contains('is-right')).toBe(true);
    expect(page.stage.fx.particles.some((particle) => particle.kind === 'coin')).toBe(true);
    expect(document.querySelector('.pop-gain').textContent).toBe('+200៛');

    page.wait(400);
    expect(page.text('score')).toBe('200៛');
    expect(document.querySelectorAll('#streakPips .on')).toHaveLength(1);
    expect(page.keys().some((key) => key.classList.contains('is-right'))).toBe(false);
  });

  it('shows a wrong answer for what it is, and which key was right', () => {
    const page = openPage();

    page.play();

    const { correctIndex } = page.game.run.question;
    const pressed = (correctIndex + 1) % 4;

    page.pressWrong();
    page.step();

    expect(page.keys()[pressed].classList.contains('is-wrong')).toBe(true);
    expect(page.keys()[correctIndex].classList.contains('is-answer')).toBe(true);
    expect(document.querySelectorAll('.answer.is-dim')).toHaveLength(2);
    expect(document.getElementById('stage').classList.contains('is-shaken')).toBe(true);
    expect(document.querySelector('.pop-penalty').textContent).toBe('−4s');
    expect(page.text('clockSeconds')).toBe(String(TUNING.startTimeMs / 1000 - 4));
  });

  it('stamps the multiplier on the note at five in a row', () => {
    const page = openPage();

    page.play();

    for (let i = 0; i < TUNING.streakPerCombo; i++) {
      page.pressRight();
      page.wait(200);
    }

    expect(document.getElementById('combo').hidden).toBe(false);
    expect(page.text('combo')).toBe('×2');
  });

  it('raises the level where it is written, with sparks and nothing over the board', () => {
    const page = openPage();

    page.play();

    for (let i = 0; i < TUNING.answersPerLevel - 1; i++) {
      page.pressRight();
      page.wait(200);
    }

    page.pressRight();
    page.step();

    expect(document.getElementById('level').classList.contains('is-raised')).toBe(true);
    expect(page.stage.fx.particles.some((particle) => particle.kind === 'spark')).toBe(true);
    expect(page.stage.fx.particles.some((particle) => particle.kind === 'note')).toBe(false);
    expect(page.text('banner')).toBe('Go!');

    page.wait(200);
    expect(page.text('level')).toBe('Level 2');
  });

  it('answers from the keyboard, keys 1 to 4', () => {
    const page = openPage();

    page.play();
    page.typeKey(`Digit${page.game.run.question.correctIndex + 1}`);

    expect(page.game.run.correct).toBe(1);
  });

  it('answers when a focused key is pressed with Enter, which comes as a click', () => {
    const page = openPage();

    page.play();
    page.keys()[page.game.run.question.correctIndex].click();

    expect(page.game.run.correct).toBe(1);
  });

  it('ends on the results, and keeps the run', () => {
    const page = openPage();

    page.play();
    page.pressRight();
    page.wait(TUNING.maxTimeMs + 1000);

    expect(page.screen()).toBe('over');
    expect(page.openMenu()).toBe('m-over');
    expect(page.text('overScore')).toBe('200៛');
    expect(page.text('overCorrect')).toBe('1');
    expect(page.text('overAccuracy')).toBe('100%');
    expect(page.text('overStamp')).toBe('New best!');
    expect(page.saved().records).toEqual({ best: 200, bestStreak: 1, savings: 200, plays: 1 });
  });

  it('plays again from the results, from nothing', () => {
    const page = openPage();

    page.play();
    page.pressRight();
    page.wait(TUNING.maxTimeMs + 1000);
    page.click('#m-over [data-act="play"]');
    page.wait(2400);

    expect(page.screen()).toBe('play');
    expect(page.text('score')).toBe('0៛');
    expect(page.game.records.plays).toBe(1);
  });
});

describe('a new best', () => {
  it('showers notes over the results, where nothing is left to read against the clock', () => {
    const page = openPage();

    page.play();
    page.pressRight();
    page.wait(TUNING.maxTimeMs + 500);

    expect(page.stage.fx.particles.some((particle) => particle.kind === 'note')).toBe(true);
  });

  it('showers nothing for a run that beat no record', () => {
    const page = openPage({ records: { best: 9000, bestStreak: 5, savings: 9000, plays: 2 } });

    page.play();
    page.pressRight();
    page.wait(TUNING.maxTimeMs + 500);

    expect(page.text('overStamp')).toBe('');
    expect(page.stage.fx.particles.some((particle) => particle.kind === 'note')).toBe(false);
  });
});

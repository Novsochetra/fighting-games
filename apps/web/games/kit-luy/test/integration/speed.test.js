// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { STAGES } from '../../src/data/stages.js';
import { openPage } from '../support/open-page.js';

const PATIENCE = STAGES[0].patience;

function listen(page) {
  const played = [];

  page.stage.audio.play = (name, detail) => played.push({ name, ...detail });

  return played;
}

describe('the fuse on every bill', () => {
  it('burns down with the customer’s patience', () => {
    const page = openPage();

    page.serve();
    page.wait(PATIENCE / 2);

    const burnt = Number(
      /scaleX\(([\d.]+)\)/.exec(document.getElementById('fuseLeft').style.transform)[1],
    );

    expect(burnt).toBeGreaterThan(0.4);
    expect(burnt).toBeLessThan(0.6);
    expect(document.getElementById('fuse').classList.contains('is-hurry')).toBe(false);
  });

  it('turns red, ticks each of the last three seconds higher, and the customer fidgets', () => {
    const page = openPage();
    const played = listen(page);

    page.serve();
    page.wait(PATIENCE - 3500);
    expect(document.getElementById('fuse').classList.contains('is-hurry')).toBe(true);
    expect(document.querySelector('.guest.is-front').classList.contains('is-restless')).toBe(true);

    page.wait(3200);
    expect(played.filter((sound) => sound.name === 'hurry').map((sound) => sound.seconds)).toEqual([
      3, 2, 1,
    ]);
  });

  it('sends the customer off unpaid when it burns out, a trust stamp lost', () => {
    const page = openPage();
    const played = listen(page);

    page.serve();
    page.wait(PATIENCE + 100);

    expect(played.map((sound) => sound.name)).toContain('stormed');
    expect(document.querySelectorAll('.trust i.is-lost')).toHaveLength(1);
    expect(document.querySelector('.guest-bubble').textContent).toBe("I'm off!");
  });
});

describe('a quick payment', () => {
  it('is praised over the customers, with how long it took', () => {
    const page = openPage();

    page.serve();
    page.wait(1200);
    page.count();
    page.give();
    page.step();

    expect(document.getElementById('praise').classList.contains('is-shown')).toBe(true);
    expect(document.getElementById('praise').dataset.speed).toBe('perfect');
    expect(page.text('praiseWord')).toBe('Lightning!');
    expect(page.text('praiseTime')).toMatch(/^1\.\ds$/);
  });

  it('sends its earnings up to the sign a chip at a time, the takings growing as each lands', () => {
    const page = openPage();
    const played = listen(page);

    page.deal(1000);
    page.give();
    page.step();

    const chips = [...document.querySelectorAll('.score-chip')].map((chip) => chip.dataset.kind);

    expect(chips).toEqual(['pay', 'speed', 'clean']);
    expect(page.text('takings')).toBe('0៛');

    page.wait(1500);
    expect(document.querySelectorAll('.score-chip')).toHaveLength(0);
    expect(page.text('takings')).toBe('2,000៛');
    expect(played.filter((sound) => sound.name === 'chip')).toHaveLength(3);
  });

  it('praises a slow one less, and says only that it is paid', () => {
    const page = openPage();

    page.serve();
    page.wait(PATIENCE * 0.8);
    page.count();
    page.give();
    page.step();

    expect(document.getElementById('praise').dataset.speed).toBe('good');
    expect(page.text('praiseWord')).toBe('Paid');
    expect(
      [...document.querySelectorAll('.score-chip')].map((chip) => chip.dataset.kind),
    ).not.toContain('speed');
  });

  it('stamps the run of right answers on the sign, and a wrong one wipes it', () => {
    const page = openPage();

    page.serve();
    page.serve();
    page.serve();
    expect(document.getElementById('streak').hidden).toBe(false);
    expect(page.text('streak')).toBe('×3');

    page.deal(page.front().answer === 500 ? 1000 : 500);
    page.give();
    page.step();
    expect(document.getElementById('streak').hidden).toBe(true);
  });
});

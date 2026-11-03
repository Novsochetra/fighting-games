// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { fakeStorage, savedAt } from '../../support/screen-fixtures.js';
import { clashesOf, stageFor } from '../../support/title-stage.js';

const section = (name) => document.getElementById(`screen-${name}`);

// the page lays nothing out here, so a screen is given the heights a phone would give it
function giveHeights(node, { content, view }) {
  Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => content });
  Object.defineProperty(node, 'clientHeight', { configurable: true, get: () => view });
}

// the canvas stands where the game's stage fit puts it on a screen of this size
function fitCanvas({ width, height, touch = false }) {
  const stage = stageFor({ width, height, touch });
  const canvas = document.getElementById('pitch');

  window.happyDOM.setViewport({ width, height });
  canvas.getBoundingClientRect = () => ({ ...stage });
  canvas.style.left = `${stage.x}px`;
  canvas.style.top = `${stage.y}px`;
  canvas.style.width = `${stage.width}px`;

  return stage;
}

const pxOf = (name) => parseFloat(section('title').style.getPropertyValue(name));

function titleBoxes() {
  const boxOf = (name) => ({
    place: section('title').dataset[name],
    x: pxOf(`--${name}-x`),
    y: pxOf(`--${name}-y`),
    width: pxOf(`--${name}-width`),
    height: pxOf(`--${name}-height`),
  });

  return { head: boxOf('head'), prompt: boxOf('prompt') };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('the screens on a phone', () => {
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    screens = createScreens(document, { storage: fakeStorage() });
  });

  it('open How to play at its top each time, wherever it was left', () => {
    screens.show('menu', { hasSave: false });
    screens.show('howto', { device: 'keys' });
    section('howto').scrollTop = 300;
    screens.back();
    screens.show('howto', { device: 'keys' });

    expect(screens.current()).toBe('howto');
    expect(section('howto').scrollTop).toBe(0);
  });

  it('return to a screen where it was left', () => {
    screens.show('pause');
    section('pause').scrollTop = 40;
    screens.show('hero', { hero: savedAt().hero, age: 'child' });
    screens.back();

    expect(screens.current()).toBe('pause');
    expect(section('pause').scrollTop).toBe(40);
  });

  it('dock the buttons of a screen taller than the phone, and point down until its end', () => {
    const hero = section('hero');

    giveHeights(hero, { content: 711, view: 390 });
    screens.show('hero', { hero: savedAt().hero, age: 'child' });

    expect(hero.classList.contains('is-scrollable')).toBe(true);
    expect(hero.classList.contains('has-more')).toBe(true);

    hero.scrollTop = 321;
    hero.dispatchEvent(new Event('scroll'));

    expect(hero.classList.contains('has-more')).toBe(false);
    expect(hero.classList.contains('is-scrollable')).toBe(true);
  });

  it('dock nothing on a screen that fits', () => {
    giveHeights(section('settings'), { content: 390, view: 390 });
    screens.show('settings');

    expect(section('settings').classList.contains('is-scrollable')).toBe(false);
  });
});

describe('the title’s words', () => {
  beforeEach(async () => {
    await loadPageBody(document);
  });

  it.each([
    [844, 390, false],
    [390, 844, false],
    [390, 844, true],
    [1280, 800, false],
  ])('stand clear of the Naga and the boy at %i x %i (touch %s)', (width, height, touch) => {
    const stage = fitCanvas({ width, height, touch });

    createScreens(document, { storage: fakeStorage() });

    expect(clashesOf(titleBoxes(), stage)).toEqual({ logoOnNaga: false, promptOnBoy: false });
  });

  it('follow the stage when it is fitted again', async () => {
    fitCanvas({ width: 768, height: 432 });
    createScreens(document, { storage: fakeStorage() });

    const upright = fitCanvas({ width: 390, height: 844 });

    await settle();

    expect(titleBoxes().head.place).toBe('above');
    expect(titleBoxes().head.y + titleBoxes().head.height).toBeLessThan(upright.y);
  });
});

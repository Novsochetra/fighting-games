// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { rulesOf, styleOf, valueOf } from '../../support/page-styles.js';
import { clashesOf, stageFor } from '../../support/title-stage.js';

// on an upright phone (390 x 844) NAGA ELEVEN ran from x -140 to 530 at a fixed 64 px; held
// sideways (844 x 390) THE SOCHETRA STORY ran over the Naga's heads and the Khmer prompt sat on
// the boy's head, as the words stood at fixed places on the screen, not on the art
const TOKENS = styleOf('tokens.css');
const TITLE = styleOf('title.css');

// NAGA ELEVEN in Silkscreen bold with the title's tracking, measured in a browser: on one line it
// is 10.47 times its size wide, stacked (ELEVEN the wider line) 5.84 times
const WIDTH_PER_SIZE = { line: 10.47, stacked: 5.84 };

const pxOfToken = (value) =>
  Number(TOKENS.match(new RegExp(`${value.match(/--[\w-]+/)[0]}: (\\d+)px`))[1]);

const STACKED = ".screen-title:is([data-head='above'], [data-head='below']) .logo";

function logoSteps(selector) {
  return rulesOf(TITLE)
    .filter((rule) => rule.selector === selector && valueOf(rule.body, 'font-size'))
    .map((rule) => ({
      size: pxOfToken(valueOf(rule.body, 'font-size')),
      roomWidth: Number(rule.at.match(/min-width: (\d+)px/)?.[1] ?? 0),
    }));
}

function fitTitle(width, height) {
  const stage = stageFor({ width, height });
  const canvas = document.getElementById('pitch');

  window.happyDOM.setViewport({ width, height });
  canvas.getBoundingClientRect = () => ({ ...stage });
  createScreens(document, {});

  return stage;
}

function titleBoxes() {
  const title = document.getElementById('screen-title');
  const px = (name) => parseFloat(title.style.getPropertyValue(name));
  const boxOf = (name) => ({
    place: title.dataset[name],
    x: px(`--${name}-x`),
    y: px(`--${name}-y`),
    width: px(`--${name}-width`),
    height: px(`--${name}-height`),
  });

  return { head: boxOf('head'), prompt: boxOf('prompt') };
}

describe('the title', () => {
  beforeEach(async () => {
    await loadPageBody(document);
  });

  it('takes a logo size only where the room is wide enough for it', () => {
    const lines = logoSteps('.screen-title .logo');
    const plain = lines.find((step) => !step.roomWidth) ?? logoSteps('.logo')[0];
    const steps = [
      ...[plain, ...lines.filter((step) => step.roomWidth)].map((step) => ({
        ...step,
        per: WIDTH_PER_SIZE.line,
      })),
      ...logoSteps(STACKED).map((step) => ({ ...step, per: WIDTH_PER_SIZE.stacked })),
    ];

    for (const step of steps) {
      expect(step.size * step.per).toBeLessThanOrEqual(step.roomWidth || 358);
    }
  });

  it('stacks the logo over the stage on an upright phone, inside the screen', () => {
    fitTitle(390, 844);

    const { head } = titleBoxes();

    expect(head.place).toBe('above');
    expect(head.x).toBeGreaterThanOrEqual(0);
    expect(head.x + head.width).toBeLessThanOrEqual(390);
  });

  it('keeps its words off the Naga and the boy on a phone held sideways', () => {
    const stage = fitTitle(844, 390);
    const boxes = titleBoxes();

    expect(boxes.head.place).toBe('sky');
    expect(Number.isFinite(boxes.prompt.y)).toBe(true);
    expect(clashesOf(boxes, stage)).toEqual({ logoOnNaga: false, promptOnBoy: false });
  });
});

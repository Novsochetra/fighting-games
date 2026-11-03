import { describe, expect, it } from 'vitest';
import {
  actorDrawables,
  createActorArt,
  loadSprites,
  looksOf,
  prepareMatchArt,
} from '../../../../src/render/actors/index.js';
import { sheetCount } from '../../../../src/render/actors/sheets.js';
import { WORLD_VIEW } from '../../../../src/config.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { FAKE_KIT, FAKE_SPRITES, fakeImageLoader, MARK } from '../../../support/fake-sprites.js';
import { fixtureMatch } from './match-fixture.js';

async function spriteArt() {
  const sprites = await loadSprites(FAKE_SPRITES, { loadImage: fakeImageLoader().loadImage });

  return createActorArt({ sprites, sourceKit: FAKE_KIT, createCanvas: createPixelCanvas });
}

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;
};

// one player alone on an empty canvas, drawn as the match draws them
function drawAlone(art, match, index) {
  const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
  const camera = createCamera(match);
  const player = match.players[index];
  const drawable = actorDrawables(match, camera, { art, scoringTeam: null })[index];

  drawable.draw(canvas.getContext('2d'));

  return { canvas, foot: project(camera, player.x, player.y) };
}

function markColumns(canvas) {
  const columns = [];

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (hexAt(canvas, x, y) === MARK) {
        columns.push(x);
      }
    }
  }

  return columns;
}

describe('the players drawn from sprites', () => {
  it('stand each frame with its anchor on the player ground point', async () => {
    const match = fixtureMatch();
    const { canvas, foot } = drawAlone(await spriteArt(), match, 5);
    const lowest = Math.round(foot.y) - FAKE_SPRITES.anchor.y + 13;

    expect(hexAt(canvas, Math.round(foot.x), lowest)).toBe(looksOf(match).players[5].socks[3]);
  });

  it('wear their side kit in place of the sheet own shirt', async () => {
    const match = fixtureMatch();
    const { canvas, foot } = drawAlone(await spriteArt(), match, 5);
    const shirtRows = [5, 6, 7, 8].map((row) => Math.round(foot.y) - FAKE_SPRITES.anchor.y + row);
    const shirt = shirtRows.map((y) => hexAt(canvas, Math.round(foot.x), y));

    expect(shirt).toEqual(looksOf(match).players[5].shirt);
  });

  it('mirror a way drawn for the other side', async () => {
    const art = await spriteArt();
    const match = fixtureMatch();
    const facingEast = markColumns(drawAlone(art, match, 5).canvas);

    match.players[5].facing = { x: -1, y: 0 };

    const { canvas, foot } = drawAlone(art, match, 5);
    const facingWest = markColumns(canvas);

    expect(facingEast[0]).toBeLessThan(Math.round(foot.x));
    expect(facingWest[0]).toBeGreaterThan(Math.round(foot.x));
  });

  it('paint every sheet a match needs before it starts, once a look', async () => {
    const art = await spriteArt();
    const match = fixtureMatch({ format: '7' });
    const keys = new Set(looksOf(match).players.map((look) => look.key));

    prepareMatchArt(art, match);

    expect(sheetCount(art)).toBe(keys.size * Object.keys(FAKE_SPRITES.animations).length);
  });
});

describe('the players drawn from the block figure', () => {
  it('bake the figure for a look once, and draw it at its anchor', () => {
    const art = createActorArt({ createCanvas: createPixelCanvas });
    const match = fixtureMatch();
    const { canvas, foot } = drawAlone(art, match, 5);
    const column = [...Array(60).keys()].map((dy) =>
      hexAt(canvas, Math.round(foot.x) + 1, Math.round(foot.y) - dy),
    );

    expect(sheetCount(art)).toBe(1);
    expect(column.some((colour) => looksOf(match).players[5].shirt.includes(colour))).toBe(true);
  });
});

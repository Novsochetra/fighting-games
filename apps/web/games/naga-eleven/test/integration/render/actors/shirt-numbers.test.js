import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../../src/config.js';
import { SPRITES } from '../../../../src/data/sprites.js';
import {
  actorDrawables,
  createActorArt,
  loadSprites,
  looksOf,
  prepareMatchArt,
} from '../../../../src/render/actors/index.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { decodePng } from '../../../support/png.js';
import { fixtureMatch } from './match-fixture.js';

const GAME = fileURLToPath(new URL('../../../../', import.meta.url));
const loadImage = async (source) => decodePng(readFileSync(`${GAME}${source}`));
const sprites = await loadSprites(SPRITES, { loadImage });
const { width, height } = SPRITES.frame;

const hexAt = (canvas, at) =>
  `#${[0, 1, 2].map((i) => canvas.data[at + i].toString(16).padStart(2, '0')).join('')}`;

// the 11 a side fixture standing still, every player turned the one way
function standingMatch(facing) {
  const match = fixtureMatch({ format: '11' });

  for (const player of match.players) {
    player.facing = facing;
  }

  return match;
}

function drawPlayers(match, art) {
  const canvas = createPixelCanvas(WORLD_VIEW.width, WORLD_VIEW.height);
  const camera = createCamera(match);
  const scene = actorDrawables(match, camera, { art, scoringTeam: null });

  scene
    .sort((first, second) => first.depth - second.depth)
    .forEach(({ draw }) => draw(canvas.getContext('2d')));

  return { canvas, camera };
}

// each player's frame on the canvas, kept only where no other player's frame overlaps it
function lonePlayers(match, camera) {
  const boxes = match.players.map((player) => {
    const foot = project(camera, player.x, player.y);
    const left = Math.round(foot.x) - SPRITES.anchor.x;
    const top = Math.round(foot.y) - SPRITES.anchor.y;

    return { player, left, top, right: left + width, bottom: top + height };
  });
  const meets = (first, second) =>
    first.left < second.right &&
    second.left < first.right &&
    first.top < second.bottom &&
    second.top < first.bottom;
  const inView = (box) =>
    box.left >= 0 &&
    box.top >= 0 &&
    box.right <= WORLD_VIEW.width &&
    box.bottom <= WORLD_VIEW.height;

  return boxes.filter(
    (box) => inView(box) && boxes.every((other) => other === box || !meets(box, other)),
  );
}

// what the numbers changed, by comparing the frame with one drawn with no numbers worn
function numberPixels(match, art) {
  const worn = drawPlayers(match, art);
  const numbers = match.players.map((player) => player.number);

  match.players.forEach((player) => {
    player.number = undefined;
  });

  const bare = drawPlayers(match, art);

  match.players.forEach((player, i) => {
    player.number = numbers[i];
  });

  const changed = [];

  for (let at = 0; at < worn.canvas.data.length; at += 4) {
    if (hexAt(worn.canvas, at) !== hexAt(bare.canvas, at)) {
      changed.push({
        at,
        x: (at / 4) % WORLD_VIEW.width,
        y: Math.floor(at / 4 / WORLD_VIEW.width),
      });
    }
  }

  return { changed, bare: bare.canvas, worn: worn.canvas, camera: worn.camera };
}

const art = () => createActorArt({ sprites, createCanvas: createPixelCanvas });

describe('a match frame with the shirts numbered', () => {
  it("prints each back-facing player's number on his back, inside his shirt", () => {
    const match = standingMatch({ x: 0, y: -1 });
    const { players: looks } = looksOf(match);
    const { changed, bare, worn, camera } = numberPixels(match, art());
    const lone = lonePlayers(match, camera);

    expect(lone.length).toBeGreaterThan(5);

    for (const { player, left, top, right, bottom } of lone) {
      const look = looks[player.index];
      const his = changed.filter(({ x, y }) => x >= left && x < right && y >= top && y < bottom);

      expect(his.length, `#${player.number}`).toBeGreaterThan(8);
      expect(his.every(({ at }) => look.shirt.includes(hexAt(bare, at)))).toBe(true);
      expect(his.some(({ at }) => hexAt(worn, at) === look.numberColours.fill)).toBe(true);
    }
  });

  it('prints a plain chest number on those facing the camera, and none side on', () => {
    const facingUs = standingMatch({ x: 0, y: 1 });
    const front = numberPixels(facingUs, art());
    const { players: looks } = looksOf(facingUs);

    expect(front.changed.length).toBeGreaterThan(0);
    expect(
      front.changed.every(({ at }) =>
        looks.some((look) => look.numberColours.fill === hexAt(front.worn, at)),
      ),
    ).toBe(true);
    expect(numberPixels(standingMatch({ x: 1, y: 0 }), art()).changed).toEqual([]);
  });

  it('paints the numbers before kick off, and draws each with one image a frame', () => {
    const match = standingMatch({ x: 0, y: -1 });
    const made = [];
    const actors = createActorArt({
      sprites,
      createCanvas: (canvasWidth, canvasHeight) => {
        made.push(`${canvasWidth}x${canvasHeight}`);

        return createPixelCanvas(canvasWidth, canvasHeight);
      },
    });

    prepareMatchArt(actors, match);
    made.length = 0;

    const { context, calls } = createRecordingContext();
    const camera = createCamera(match);

    actorDrawables(match, camera, { art: actors, scoringTeam: null }).forEach(({ draw }) =>
      draw(context),
    );

    const atlases = new Set(actors.numbers.values());
    const numberDraws = calls.filter(
      (call) => call.name === 'drawImage' && atlases.has(call.args[0]),
    );

    expect(made).toEqual([]);
    expect(numberDraws).toHaveLength(match.players.length);
    expect(new Set(numberDraws.map((call) => call.args[0])).size).toBe(match.players.length);
  });
});

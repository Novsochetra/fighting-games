import { HERO_THEMES } from '../../art/hero-themes.js';
import { SHARE_COLORS } from '../../art/share-colors.js';
import { cardWords } from './share-text.js';

export const CARD_SIZE = { width: 1200, height: 630 };
const FONT = "'Silkscreen', 'Courier New', monospace";
const LEFT = 64;
const TEXT_WIDTH = 600;
// a hero's card frame is 128 px wide, its height that of the art (80, or 112 for the Khmer fighters)
const HERO_FRAME_WIDTH = 128;
const HERO_SCALE = 5;

// the select screen's painting, as large as whole pixels let it cover the card, from its middle
function drawBackdrop(context, backdrop) {
  const scale = Math.ceil(
    Math.max(CARD_SIZE.width / backdrop.width, CARD_SIZE.height / backdrop.height),
  );
  const width = backdrop.width * scale;
  const height = backdrop.height * scale;

  context.drawImage(
    backdrop,
    (CARD_SIZE.width - width) / 2,
    (CARD_SIZE.height - height) / 2,
    width,
    height,
  );
}

function drawBand(context) {
  context.globalAlpha = 0.78;
  context.fillStyle = SHARE_COLORS.band;
  context.fillRect(0, 0, LEFT + TEXT_WIDTH + 40, CARD_SIZE.height);
  context.globalAlpha = 1;
  context.fillStyle = SHARE_COLORS.edge;
  context.fillRect(LEFT + TEXT_WIDTH + 40, 0, 6, CARD_SIZE.height);
}

// the hero's first frame of their win pose, standing on the card's floor in their own glow
function drawHero(context, { heroArt, glow }) {
  const height = heroArt.height * HERO_SCALE;
  const width = HERO_FRAME_WIDTH * HERO_SCALE;

  context.shadowColor = glow;
  context.shadowBlur = 36;
  context.drawImage(
    heroArt,
    0,
    0,
    HERO_FRAME_WIDTH,
    heroArt.height,
    CARD_SIZE.width - width + 20,
    CARD_SIZE.height - height - 20,
    width,
    height,
  );
  context.shadowBlur = 0;
}

// a word set in the pixel font, shrunk to fit the band if it would run past it
function drawWord(context, { text, y, size, color, weight = 700 }) {
  context.font = `${weight} ${size}px ${FONT}`;
  const shrink = Math.min(1, TEXT_WIDTH / Math.max(1, context.measureText(text).width));

  context.font = `${weight} ${Math.floor(size * shrink)}px ${FONT}`;
  context.fillStyle = SHARE_COLORS.shadow;
  context.fillText(text, LEFT + 4, y + 4);
  context.fillStyle = color;
  context.fillText(text, LEFT, y);
}

function drawWords(context, { words, glow, site }) {
  context.textBaseline = 'top';
  drawWord(context, { text: 'Steel & Dust', y: 56, size: 58, color: SHARE_COLORS.title });
  drawWord(context, { text: words.hero, y: 140, size: 40, color: glow });
  drawWord(context, { text: 'Score', y: 214, size: 28, color: SHARE_COLORS.label, weight: 400 });
  drawWord(context, { text: words.score, y: 250, size: 110, color: SHARE_COLORS.score });
  drawWord(context, { text: words.reached, y: 390, size: 34, color: SHARE_COLORS.text });
  drawWord(context, {
    text: words.rank || words.player,
    y: 446,
    size: 34,
    color: SHARE_COLORS.rank,
  });
  drawWord(context, {
    text: `Play free at ${site}`,
    y: 552,
    size: 26,
    color: SHARE_COLORS.text,
    weight: 400,
  });
}

export function drawShareCard(context, { run, rank, name, backdrop, heroArt, site }) {
  const glow = HERO_THEMES[run.hero]?.spark ?? SHARE_COLORS.text;

  context.imageSmoothingEnabled = false;
  drawBackdrop(context, backdrop);
  drawBand(context);
  drawHero(context, { heroArt, glow });
  drawWords(context, { words: cardWords(run, rank, name), glow, site });
}

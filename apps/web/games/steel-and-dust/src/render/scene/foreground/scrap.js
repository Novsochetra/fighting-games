import { VIEW_HEIGHT } from '../../../config.js';

const LINK = 3;

// a lump of slag with a crack that still glows, breathing like the furnaces
function drawSlag(painter, x, { hash, colors, tick }) {
  const width = 18 + (hash % 12);
  const height = 5 + ((hash >>> 3) % 4);
  const top = VIEW_HEIGHT - height;
  painter.use(colors.slag).rect(x, top, width, height);
  painter.rect(x + 3, top - 3, width - 7, 3);
  painter.rect(x + 7, top - 5, width - 15, 2);
  painter.use(colors.slagTop).rect(x + 3, top - 3, width - 9, 1);
  painter.rect(x + 7, top - 5, width - 17, 1);
  painter.rect(x, top, 3, 1);
  const glow = 0.45 + 0.35 * Math.sin(tick * 0.05 + hash);
  painter
    .use(colors.molten)
    .alpha(glow)
    .rect(x + 5 + (hash % 6), top + 1, 4, 1);
  painter.rect(x + 9 + (hash % 6), top + 2, 2, 1);
  painter.alpha(1);
}

// a length of rusty pipe dropped by the road, flanged at both ends
function drawPipe(painter, x, { hash, colors }) {
  const length = 30 + (hash % 24);
  const top = VIEW_HEIGHT - 7;
  painter.use(colors.pipe).rect(x, top, length, 5);
  painter.use(colors.pipeLight).rect(x, top + 1, length, 1);
  painter.use(colors.pipeDark).rect(x, top + 4, length, 1);
  for (const flangeX of [x - 1, x + length - 2]) {
    painter.use(colors.pipeDark).rect(flangeX, top - 1, 3, 7);
    painter.use(colors.pipeLight).rect(flangeX + 1, top, 1, 5);
  }
}

// a crane chain hanging into view from above, swinging a little, with its hook
function drawChain(painter, x, { hash, colors, tick }) {
  const links = 6 + (hash % 6);
  const swing = Math.sin(tick / 70 + hash) * 2;
  for (let link = 0; link < links; link++) {
    const linkX = Math.round(x + (swing * link) / links);
    const wide = link % 2 === 0;
    painter.use(colors.chain).rect(linkX - (wide ? 1 : 0), link * LINK, wide ? 3 : 1, LINK + 1);
    painter.use(colors.chainLight).rect(linkX - (wide ? 1 : 0), link * LINK + 1, 1, 1);
  }
  const hookX = Math.round(x + swing);
  const hookY = links * LINK;
  painter.use(colors.chain).rect(hookX - 1, hookY, 3, 2);
  painter.rect(hookX, hookY + 2, 2, 4);
  painter.rect(hookX - 3, hookY + 5, 4, 2);
  painter.rect(hookX - 3, hookY + 3, 1, 2);
  painter.use(colors.chainLight).rect(hookX + 1, hookY + 2, 1, 3);
}

const PIECES = [drawPipe, drawSlag, drawChain, drawSlag, drawPipe];

// what lies in front of the fighters in the iron works: slag, dropped pipe and hanging chain
export function drawScrap(painter, x, options) {
  PIECES[(options.hash >>> 13) % PIECES.length](painter, x, options);
}

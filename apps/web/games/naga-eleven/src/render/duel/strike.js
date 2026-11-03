import { drawCutinFigure } from './cutin-figure.js';

export const STRIKE_FRAMES = 5;

// a frame of the strike plays this many ticks, so the kick lands before a repeated cut-in ends
const FRAME_TICKS = 6;

// the strike was drawn for Sochetra, his hair and his build; any other striker keeps his portrait
const STRIKERS = new Set(['sochetra']);

export const strikesIn = ({ striker, partner }, option) =>
  STRIKERS.has(striker?.star) && !partner && option?.kind === 'shot';

export const strikeFrameAt = (ticks) =>
  Math.min(STRIKE_FRAMES - 1, Math.floor(ticks / FRAME_TICKS));

export const drawStrike = (pen, { feet, look, index }) =>
  drawCutinFigure(pen, { name: 'strike', index, feet, look });

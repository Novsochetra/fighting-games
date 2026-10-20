import { GROUND_Y } from '../../../config.js';
import { paintCity } from './city.js';
import { paintDuneland } from './dunes.js';
import { paintFactory } from './factory.js';
import { paintRuins } from './ruins.js';
import { SKYLINE_WIDTH } from './width.js';

const PAINT_SKYLINE = {
  city: paintCity,
  dunes: paintDuneland,
  factory: paintFactory,
  ruins: paintRuins,
};

export function buildSkyline(createCanvas, { skylineKind, skyline }) {
  const canvas = createCanvas(SKYLINE_WIDTH, GROUND_Y);
  PAINT_SKYLINE[skylineKind](canvas.getContext('2d'), skyline);
  return canvas;
}

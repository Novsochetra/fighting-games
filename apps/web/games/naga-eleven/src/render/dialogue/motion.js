import { ART } from './pixel-map.js';

export const clamp01 = (value) => Math.min(1, Math.max(0, value));

export const easeOut = (progress) => 1 - (1 - clamp01(progress)) ** 3;

// what moves stays on the art's own pixel grid, so a portrait never smears across half a pixel
export const onGrid = (value) => Math.round(value / ART) * ART;

// how far from 1 to 0 a move `ticks` long is, `since` ticks after it began
export const remaining = (since, ticks) => 1 - easeOut(since / ticks);

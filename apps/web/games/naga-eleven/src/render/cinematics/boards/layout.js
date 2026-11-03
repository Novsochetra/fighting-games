import { VIEW } from '../../../config.js';

export const BOARD = { x: 124, y: 60, width: 520, height: 318 };

export const MIDDLE = VIEW.width / 2;

export const HEADER = { width: 200, height: 24, y: BOARD.y - 12 };

export const SCORE_ROW = { y: BOARD.y + 26, height: 56 };

export const SCORERS = { y: BOARD.y + 96, line: 12, most: 4 };

export const STATS = { y: BOARD.y + 160, row: 25, reach: 136 };

export const BOARD_MOTION = { drop: 14, score: 8, scorer: 14, scorerStep: 4, bars: 22, barStep: 5 };

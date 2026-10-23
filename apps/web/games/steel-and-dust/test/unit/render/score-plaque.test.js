import { describe, expect, it } from 'vitest';
import { SCORE_BOX, scoreRows } from '../../../src/render/hud/score.js';
import { textWidth } from '../../../src/render/text/draw-text.js';
import { createPlayingGame } from '../../support/test-game.js';

const pairs = (rows) => rows.map(({ label, value }) => [label, value]);

describe('the rows in the score box', () => {
  it('shows the score alone until there is a best combo', () => {
    expect(pairs(scoreRows(createPlayingGame(), 4671))).toEqual([['SCORE', '0004671']]);
  });

  it('puts the best combo under the score', () => {
    const game = createPlayingGame({ records: { bestCombo: 46 } });
    expect(pairs(scoreRows(game, 0))).toEqual([
      ['SCORE', '0000000'],
      ['BEST', '46 HITS'],
    ]);
  });

  it('leaves a gap between each label and its value, even for a best of 999 hits', () => {
    const game = createPlayingGame({ records: { bestCombo: 999 } });
    for (const { label, value } of scoreRows(game, 9999999)) {
      const room = SCORE_BOX.width - 16 - textWidth(label, 1) - textWidth(value, 1);
      expect(room).toBeGreaterThanOrEqual(8);
    }
  });
});

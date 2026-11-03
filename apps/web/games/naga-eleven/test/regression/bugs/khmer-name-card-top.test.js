import { describe, expect, it } from 'vitest';
import { TEAMS } from '../../../src/data/teams/index.js';
import { PLAYER_CARD } from '../../../src/render/hud/layout.js';
import { drawPlayerCard } from '../../../src/render/hud/player-card.js';
import { GAUGE } from '../../../src/render/hud/spirit-gauge.js';
import { isKhmer, textOf } from '../../../src/render/text.js';
import { createRecordingContext } from '../../support/recording-context.js';

// A tall Khmer name on the player card, such as "វុទ្ធី", had its top vowel on the card's top
// border: it was set where an English name is, and Khmer's marks over a letter rise above the line
// it is set on. Every Khmer name now stands clear of the border, as the English ones do.

// measured in Chrome on a Mac, at the HUD's scale in the Khmer face the game names first: the
// highest Khmer mark of any squad's name stands this many art pixels over where the name is set
const KHMER_RISE = 5;
// the card's border: the ink line over it and the two lit rows along its top (panel.js)
const BORDER_ROWS = 2;
const RAMP = ['#202020', '#404040', '#808080', '#c0c0c0'];
const KIT = { shirt: RAMP, trim: RAMP };
const KITS = [
  { outfield: KIT, keeper: KIT },
  { outfield: KIT, keeper: KIT },
];

const khmerNames = () => [
  ...new Set(
    Object.values(TEAMS)
      .flatMap((team) => team.players.map((player) => textOf(player.name, 'km')))
      .filter(isKhmer),
  ),
];

function cardOf(name) {
  const { context, calls } = createRecordingContext();
  const match = {
    players: [{ index: 0, team: 0, number: 8, role: 'midfielder', name, spirit: 10, moves: [] }],
    controlled: 0,
  };

  context.measureText = (text) => ({ width: [...text].length * 8 });
  drawPlayerCard(context, match, { kits: KITS, lang: 'km', tick: 0 });

  const words = calls.find((call) => call.name === 'fillText' && isKhmer(call.args[0]));
  const rects = calls.filter((call) => call.name === 'fillRect').map((call) => call.args);
  const gauge = rects.find(([, , width]) => width === GAUGE.width + 2);
  const body = rects.filter(([x, y]) => x === PLAYER_CARD.x && y === PLAYER_CARD.y);
  const bottom = PLAYER_CARD.y + Math.max(...body.map(([, , , height]) => height));

  return { nameTop: words.args[2], gauge, bottom };
}

describe('a Khmer name on the player card', () => {
  it('stands every squad’s Khmer name clear of the card’s top border', () => {
    const names = khmerNames();

    expect(names.length).toBeGreaterThan(50);

    for (const name of names) {
      const { nameTop } = cardOf({ en: 'Name', km: name });

      expect(nameTop - KHMER_RISE, name).toBeGreaterThanOrEqual(PLAYER_CARD.y + BORDER_ROWS + 1);
    }
  });

  it('keeps the spirit gauge inside the card under it', () => {
    const { gauge, bottom } = cardOf({ en: 'Vuthy', km: 'វុទ្ធី' });
    const [, gaugeTop, , gaugeHeight] = gauge;

    expect(gaugeTop + gaugeHeight).toBeLessThan(bottom);
  });
});

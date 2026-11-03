import { SAVE_STYLES } from '../../data/skills.js';
import { nextRandom } from '../random.js';

// a shot at the keeper this near the middle is one he stands for
const AT_HIM = 0.22;
// beaten, he went the wrong way this often
const WRONG_WAY = 0.35;

// a keeper's skill keeps the ball out its own way; with none, a punch punches and the rest catch
export const styleOf = (defend) =>
  SAVE_STYLES[defend?.move] ?? (defend?.kind === 'punch' ? 'punch' : 'catch');

const signOf = (value) => (value < 0 ? -1 : 1);

// where the shot goes, across the goal from the shooter's right as he faces it (-1 to 1 post to
// post, past them for a miss) and up it (0 to 1 under the bar)
function aimFor(match, word) {
  const across = nextRandom(match.random) * 2 - 1;
  const height = 0.1 + nextRandom(match.random) * 0.75;

  if (word === 'wide') {
    return { side: signOf(across) * (1.12 + Math.abs(across) * 0.2), height };
  }

  if (word === 'goal') {
    return { side: signOf(across) * (0.45 + Math.abs(across) * 0.45), height };
  }

  return { side: across * 0.85, height };
}

// he dives the way it goes, or stands for one at him; a wall stands big and never dives
function diveFor(match, { word, aim, style }) {
  const toward = style === 'wall' || Math.abs(aim.side) < AT_HIM ? 0 : signOf(aim.side);
  const fooled = toward !== 0 && word === 'goal' && nextRandom(match.random) < WRONG_WAY;

  return fooled ? -toward : toward;
}

// what the save cam shows and the finish plays, drawn once as the round is settled so they agree
export function keeperResult(match, { word, defend }) {
  const style = styleOf(defend);
  const aim = aimFor(match, word);

  return { aim, dive: diveFor(match, { word, aim, style }), style };
}

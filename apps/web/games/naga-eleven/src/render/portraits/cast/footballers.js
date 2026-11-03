import { beard } from '../props/beard.js';
import { moustache } from '../props/moustache.js';
import { stubble } from '../props/stubble.js';
import { AGE_FACES, MOUTH_MOODS } from './footballer-ages.js';
import { colouringOf } from './footballer-colouring.js';
import { isKeeperWear, kitLook } from './footballer-kits.js';
import { stylesFor } from './footballer-styles.js';
import { BROWS, person } from './person.js';
import { mixOf, pickerOf } from './seeded.js';

export const footballerKey = ({ team, kit, wear, place }) => `${team}:${kit}:${wear}:${place}`;

// boys and lads are clean-shaven; at nineteen a beard comes out as a day's growth, and a keeper
// with a beard and gloves would be Farhad's double
function whiskersOf({ age, whisker, head, mouthY, keeper }) {
  if (age !== 'young' && age !== 'adult') {
    return {};
  }

  if (whisker === 'beard' && age === 'adult' && !keeper) {
    return { skinDetails: [beard({ shape: head, fromY: mouthY - 5, mouthY })] };
  }

  if (whisker === 'moustache') {
    return { faceProps: [moustache({ y: mouthY - 2 })] };
  }

  return whisker === 'none' ? {} : { skinDetails: [stubble({ shape: head, mouthY })] };
}

// a player with no face of his own: his side's colouring and kit, the hero's age, and features
// seeded by his side and his place in it, so he is the same man in every duel and no mate's twin
export function footballer({ age, team = 'side-0', kit = 'plain-0', wear = 'home', place = 0 }) {
  const grownAs = AGE_FACES[age] ? age : 'young';
  const faces = AGE_FACES[grownAs];
  const styles = stylesFor(kit, grownAs);
  const pick = pickerOf(`${team}:${place}`);
  const { hair, eyes, nose, head, brows } = mixOf(
    {
      hair: styles.hairs,
      eyes: faces.eyes,
      nose: faces.noses,
      head: faces.heads,
      brows: faces.browLooks,
    },
    { seed: team, place },
  );
  const mouthY = faces.mouthY + (head === 'long' ? 1 : 0);
  const whisker = pick(styles.whiskers, 'whiskers');
  const { clothes, colours, ...dress } = kitLook({ kit, wear, neck: faces.neck });

  const face = person({
    iris: pick(styles.irises, 'iris'),
    clothes,
    colours: { ...colouringOf(kit, place).palette, ...colours },
    ...faces.base,
    head,
    eyes: { set: eyes, y: faces.eyeY, gap: 3 },
    brows: { ...faces.brows, look: BROWS[brows] },
    nose,
    mouth: { y: mouthY, moods: pick(MOUTH_MOODS, 'mouth') },
    hair,
    ...whiskersOf({ age: grownAs, whisker, head, mouthY, keeper: isKeeperWear(wear) }),
    ...dress,
  });

  return { ...face, age: grownAs, sex: 'male' };
}

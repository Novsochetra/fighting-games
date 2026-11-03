import { KEEPER_SPARES, KITS, PLAIN_KITS } from '../../../art/kits.js';
import { GLOVES, SHIRTS } from '../../../art/portraits/clothes.js';
import { gloves } from '../props/gloves.js';
import { nationalKit } from './national-kit.js';

// a side's home shirt as its named players already wear it, so a mate beside them in a cut-in is
// in the same cloth
const NAMED_SHIRTS = {
  'chrey-school': SHIRTS.chreySchool,
  'royal-kids': SHIRTS.royalKids,
  'kampong-cham-high': SHIRTS.kampongCham,
  'phnom-penh-elite': SHIRTS.phnomPenhElite,
  cambodia: SHIRTS.cambodia,
  japan: SHIRTS.japan,
  korea: SHIRTS.korea,
  brazil: SHIRTS.brazil,
  germany: SHIRTS.germany,
};

const VEE_NECKS = new Set(['japan', 'brazil', 'phnom-penh-elite']);

const clothesOf = ({ shirt, trim }) => ({
  clothLight: shirt[3],
  cloth: shirt[2],
  clothShade: shirt[1],
  clothDeep: shirt[0],
  trim: trim[2],
  trimShade: trim[1],
});

const setOf = (kit) => KITS[kit] ?? PLAIN_KITS[kit === 'plain-1' ? 1 : 0];

// `wear` is what the side has on in the match: `home`, `away`, `keeper`, or `keeper-<n>` for the
// spare a keeper changes into when his own shirt clashes (src/render/actors/kit-clash.js)
function rampsOf(kit, wear) {
  const spare = /^keeper-(\d+)$/.exec(wear);

  if (spare) {
    return KEEPER_SPARES[Number(spare[1])] ?? setOf(kit).keeper;
  }

  return setOf(kit)[wear] ?? setOf(kit).home;
}

export const isKeeperWear = (wear) => wear === 'keeper' || wear.startsWith('keeper-');

export function kitLook({ kit, wear, neck }) {
  if (isKeeperWear(wear)) {
    return {
      clothes: clothesOf(rampsOf(kit, wear)),
      colours: GLOVES,
      neck,
      frontProps: [gloves()],
    };
  }

  const clothes = (wear === 'home' && NAMED_SHIRTS[kit]) || clothesOf(rampsOf(kit, wear));

  if (kit === 'cambodia' && wear === 'home') {
    return { clothes, ...nationalKit(neck) };
  }

  return { clothes, colours: {}, neck, collar: VEE_NECKS.has(kit) ? 'vee' : 'crew' };
}

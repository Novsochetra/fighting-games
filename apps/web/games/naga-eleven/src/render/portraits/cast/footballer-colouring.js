import { HAIRS as PITCH_HAIRS, SKINS as PITCH_SKINS, TEAM_LOOKS } from '../../../art/actors.js';
import { HAIRS } from '../../../art/portraits/hair.js';
import { SKINS } from '../../../art/portraits/skin.js';
import { rampOf } from '../../../art/ramp.js';

const skinRamp = ([skinDeep, skinShade, skin, skinLight]) => ({
  skinLight,
  skin,
  skinShade,
  skinDeep,
});

const hairRamp = ([hairDark, hairShade, hair, hairLight]) => ({
  hairLight,
  hair,
  hairShade,
  hairDark,
});

// the pitch's darkest skins are darker than any portrait ramp; built on their lit shades, a
// portrait's deepest shade still stands apart from the outline
const DARK = skinRamp(rampOf(PITCH_SKINS.dark[3]));
const DEEP_BROWN = skinRamp(rampOf(PITCH_SKINS.deep[2]));

const FACE_SKINS = {
  khmer: SKINS.khmer,
  warm: SKINS.khmerLight,
  deep: SKINS.khmerDeep,
  fair: SKINS.eastAsian,
  tan: SKINS.persian,
  dark: DARK,
};

// one name on the pitch covers more than one people: Germany's fair skin is pinker than Japan's,
// and Brazil's and Mexico's brown is not Cambodia's
const LOCAL_SKINS = {
  germany: { fair: SKINS.german },
  brazil: { khmer: SKINS.brazilian },
  mexico: { khmer: SKINS.brazilian },
  nigeria: { deep: DEEP_BROWN },
};

const FACE_HAIRS = {
  black: HAIRS.black,
  brown: HAIRS.brown,
  blond: HAIRS.blond,
  chestnut: hairRamp(PITCH_HAIRS.chestnut),
};

// the skin and hair the player has on the pitch, picked by his place as src/render/actors/looks.js
// picks them, so his portrait is the man the player has been steering
export function colouringOf(kit, place) {
  const pool = TEAM_LOOKS[kit] ?? TEAM_LOOKS.default;
  const skin = pool.skins[place % pool.skins.length];
  const hair = pool.hairs[(place * 2 + 1) % pool.hairs.length];

  return {
    skin,
    hair,
    palette: { ...(LOCAL_SKINS[kit]?.[skin] ?? FACE_SKINS[skin]), ...FACE_HAIRS[hair] },
  };
}

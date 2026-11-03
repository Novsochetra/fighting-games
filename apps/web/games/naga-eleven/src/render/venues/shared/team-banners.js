import { KITS } from '../../../art/kits.js';
import { colourGap } from '../../actors/kit-clash.js';
import { packAll } from '../kit/colour.js';

// The fans' banners follow the match: each side's name in its own kit's colours, among the
// venue's own words (its town, a cheer), so no banner names a team or a cup that is not there.
// The letters take whichever of the kit's light colours stands out most on the shirt.
function bannerOf(side) {
  const kit = KITS[side.kit]?.home;

  if (!kit || !side.name) {
    return null;
  }

  const back = kit.shirt[2];
  const inks = [kit.trim[3], kit.shorts[3], kit.trim[0], kit.shorts[0]];
  const ink = inks.reduce((best, each) =>
    colourGap(each, back) > colourGap(best, back) ? each : best,
  );

  return { back: packAll(back), ink: packAll(ink), text: side.name };
}

export const bannersOf = (layout, art) => [
  ...(layout.sides ?? []).map(bannerOf).filter(Boolean),
  ...art.banners,
];

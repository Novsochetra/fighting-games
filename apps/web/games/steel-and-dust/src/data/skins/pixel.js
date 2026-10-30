import { handheldSkin } from './handheld.js';

// handhelds painted by ChatGPT as pixel art and read back at the size they were drawn
// (assets/skins/<skin>/, tools/pixel_skin/bake.py), each painted by styles/skin-pixel.css from the
// art its own class names. `about` is one line on a phone held sideways, so the bar clears the keys
// under it, and the pills are shaped as each skin's pill art is
// the window round the screen is the painting's, so the grips start at its edge, and upright the
// body starts its chin under it (each skin's --pixel-chin)
const pixelSkin = (id, name, about, { pillAspect, chin }) =>
  handheldSkin({
    id,
    name,
    about,
    prefix: 'pixel',
    tint: id,
    pillAspect,
    bezel: { side: 0, chin },
  });

export const PIXEL_SKINS = {
  // assets/skins/sandstone/key-pill.png is 53 by 24
  sandstone: pixelSkin('sandstone', 'Sandstone', 'Carved Angkor sandstone, moss in its corners', {
    pillAspect: 0.45,
    chin: 6,
  }),
  // its pills slant, each 34 by 14 along itself (styles/skin-retro.css)
  retro: pixelSkin('retro', 'Retro Grey', 'Grey plastic, a purple bezel and red keys', {
    pillAspect: 0.42,
    chin: 30,
  }),
};

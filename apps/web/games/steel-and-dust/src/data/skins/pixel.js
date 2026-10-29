import { handheldSkin } from './handheld.js';

// handhelds painted by ChatGPT as pixel art and read back at the size they were drawn
// (assets/skins/<skin>/, tools/pixel_skin/bake.py), each painted by styles/skin-pixel.css from the
// art its own class names. `about` is one line on a phone held sideways, so the bar clears the keys
// under it, and the pills are shaped as each skin's pill art is
const pixelSkin = (id, name, about, pillAspect) =>
  handheldSkin({ id, name, about, prefix: 'pixel', tint: id, pillAspect });

export const PIXEL_SKINS = {
  // assets/skins/sandstone/key-pill.png is 53 by 24
  sandstone: pixelSkin(
    'sandstone',
    'Sandstone',
    'Carved Angkor sandstone, moss in its corners',
    0.45,
  ),
  // its pills slant, each 34 by 14 along itself (styles/skin-retro.css)
  retro: pixelSkin('retro', 'Retro Grey', 'Grey plastic, a purple bezel and red keys', 0.42),
};

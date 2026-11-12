# Icons

Every icon is the game's own money: a wad of three pieces (1,000, 2,000 and 5,000៛) under a red
rubber band, below the stall's striped awning, on the counter's blue. It was drawn in a browser
from the game's own stylesheets (`styles/tokens.css`, `styles/pieces.css`, `styles/fonts.css`),
a 512×512 page screenshotted at 1×, and scaled down for the smaller sizes:

| File                    | Size    | What it is                                         | Used by                               |
| ----------------------- | ------- | -------------------------------------------------- | ------------------------------------- |
| `icon-32.png`           | 32×32   | the 512 scaled down                                | the browser tab (`index.html`)        |
| `icon-192.png`          | 192×192 | the same                                           | `index.html`, the manifest            |
| `icon-512.png`          | 512×512 | the wad, full bleed                                | the manifest, `game.json`'s `cover`   |
| `icon-maskable-512.png` | 512×512 | the wad at three quarters, inside Android's circle | the manifest                          |
| `apple-touch-icon.png`  | 180×180 | the 512 scaled down; iOS rounds the corners        | `index.html`, an iPhone's home screen |

Draw them again after the pieces' colours or figures change.

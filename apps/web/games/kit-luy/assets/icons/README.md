# Icons

Every icon is the game's own pixel art: the piggy bank, a riel coin over its slot, before the
market's dusk sky. `tools/kit_luy_icons.js` draws them from `src/art/` on a grid of 32 art pixels:

| File                    | Size    | What it is                                              | Used by                               |
| ----------------------- | ------- | ------------------------------------------------------- | ------------------------------------- |
| `icon-32.png`           | 32×32   | the grid, a pixel an art pixel                          | the browser tab (`index.html`)        |
| `icon-192.png`          | 192×192 | the grid at 6 pixels an art pixel                       | `index.html`, the manifest            |
| `icon-512.png`          | 512×512 | the grid at 16                                          | the manifest, `game.json`'s `cover`   |
| `icon-maskable-512.png` | 512×512 | the grid at 10 in the middle, inside Android's circle   | the manifest                          |
| `apple-touch-icon.png`  | 180×180 | the grid at 5 in the middle; iOS rounds the corners     | `index.html`, an iPhone's home screen |

Run `node tools/kit_luy_icons.js` again after the pig, the coin or the palette changes.

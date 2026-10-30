# Icons

Every icon is the Steel & Dust logo: a fighter before the face towers of a temple, between two
nagas, over the title. The logo is drawn on magenta (`concepts/logo/steel-and-dust.webp`), and
`tools/steel_and_dust_icons.py` keys the magenta out and draws every size here:

| File                    | Size    | What it is                                               | Used by                               |
| ----------------------- | ------- | -------------------------------------------------------- | ------------------------------------- |
| `icon-32.png`           | 32×32   | the logo alone, see-through                              | the browser tab (`index.html`)        |
| `icon-192.png`          | 192×192 | the logo before Angkor Wat at dusk, full bleed           | `index.html`, the manifest            |
| `icon-512.png`          | 512×512 | the same                                                 | the manifest, `game.json`'s `cover`   |
| `icon-maskable-512.png` | 512×512 | the same, the logo inside the circle Android may crop to | the manifest                          |
| `apple-touch-icon.png`  | 180×180 | the same; iOS rounds the corners itself                  | `index.html`, an iPhone's home screen |

The dusk behind the logo is the loading screen's painting (`ui/loading/bg.png`), with a sun going
down behind the logo's towers, drawn in blocks of 4 pixels like the game's own art. The arcade's
leaderboard shows the `cover` beside the game's name. Run
`python3 tools/steel_and_dust_icons.py` again after the logo changes.

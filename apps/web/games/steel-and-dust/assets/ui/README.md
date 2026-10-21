# UI art: the Khmer stone kit

Carved, mossy Angkor sandstone for the hero select, the settings panel and the HUD frames. The art was
drawn with Codex (ChatGPT image generation) as large sheets on magenta, then cut out, shrunk to these
sizes by keeping the most common color in each block, snapped to one palette and given a dark outline.

| Folder      | Files                                                                | Used by                     |
| ----------- | -------------------------------------------------------------------- | --------------------------- |
| `select/`   | `bg-landscape.png` (384×216), `bg-portrait.png` (216×468): Angkor Wat at dusk | `styles/hero-scene.css`     |
| `select/`   | `card.png`, `card-selected.png`, `card-crest*.png`, `card-foot*.png` | `styles/heroes.css`         |
| `kit/`      | `panel.png`, `panel-crest.png`, `panel-foot.png`, `stone-button.png` | `styles/stone.css`          |
| `kit/`      | `title-crest.png`, `title-rule.png`                                  | `styles/hero-scene.css`     |
| `settings/` | `lotus-band.png`: the frieze after a settings group's name           | `styles/stone.css`          |
| `hud/`      | `panel-frame.png`, `score-frame.png`                                 | `src/data/hud-frames.js`    |

Frames are nine-slice images: corners stay whole and the middle of every edge repeats. Their borders, in
image pixels (top, right, bottom, left):

| Image                       | Borders        |
| --------------------------- | -------------- |
| `select/card*.png`          | 44, 26, 30, 26 |
| `kit/panel.png`             | 46, 40, 50, 40 |
| `kit/stone-button.png`      | 8, 8, 8, 8     |
| `settings/lotus-band.png`   | 0, 10, 0, 14   |
| `hud/panel-frame.png`       | 12, 14, 12, 14 |
| `hud/score-frame.png`       | 11, 12, 11, 12 |

The crest and foot of a card or panel would repeat along the edge, so they are cut out of the frame and
laid on top of its middle. The menus draw this art at 2× (1× on short screens), the hero sprites' own
size, and the HUD draws it at the sprites' 2× on the canvas.

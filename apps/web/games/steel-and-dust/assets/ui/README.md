# UI art: the Khmer stone kit

Carved, mossy Angkor sandstone for the menus, the hero select and the HUD frames. The art was
drawn with Codex (ChatGPT image generation) as large sheets on magenta, then cut out, shrunk to these
sizes by keeping the most common color in each block, snapped to one palette and given a dark outline.

| Folder      | Files                                                                | Used by                     |
| ----------- | -------------------------------------------------------------------- | --------------------------- |
| `select/`   | `bg-landscape.png` (384×216), `bg-portrait.png` (216×468): Angkor Wat at dusk | `styles/hero-scene.css`     |
| `select/`   | `card.png`, `card-selected.png`, `card-crest*.png`, `arrow.png`      | `styles/hero-frames.css`    |
| `kit/`      | `panel.png`, `panel-crest.png`, `panel-foot.png`, `stone-button.png` | `styles/stone.css`          |
| `kit/`      | `title-crest.png`, `title-rule.png`                                  | `styles/stone-menus.css`    |
| `kit/`      | `button.png`, `button-primary.png`: the menu buttons                 | `styles/stone-menus.css`    |
| `loading/`  | `bg.png` (384×216, Angkor Wat at dusk from the causeway), `naga-*.png` (each piece's stone look over its gold one), `bokator-run.png` (8 frames of 76×59), `dust.png` (5 frames of 32×18) | `styles/loading*.css` |
| `hud/`      | `panel-frame.png`, `score-frame.png`                                 | `src/data/hud-frames.js`    |
| `hud/`      | `panel-frame.png`: the Skins screen's bar                            | `styles/layout-editor.css`  |

The loading screen's art was drawn with Codex the same way and baked to these sizes; the naga's gold
look is its stone look recoloured, each pixel taking the gold of the same rank of brightness, so the
two line up exactly where the gold ends.

Frames are nine-slice images: corners stay whole and the middle of every edge repeats. Their borders, in
image pixels (top, right, bottom, left):

| Image                       | Borders        |
| --------------------------- | -------------- |
| `select/card*.png`          | 44, 26, 30, 26 |
| `kit/panel.png`             | 46, 40, 50, 40 |
| `kit/stone-button.png`      | 8, 8, 8, 8     |
| `kit/button*.png`           | 0, 24, 0, 22   |
| `hud/panel-frame.png`       | 12, 14, 12, 14 |
| `hud/score-frame.png`       | 11, 12, 11, 12 |

A card's crest and the panel's crest and foot would repeat along the edge, so they are cut out of the
frame and laid on top of its middle. The menus draw this art at 2× (1× on short screens), the hero sprites' own
size, and the HUD draws it at the sprites' 2× on the canvas.

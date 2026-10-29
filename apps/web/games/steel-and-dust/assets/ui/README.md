# UI art: the Khmer stone kit

Carved, mossy Angkor sandstone for the menus, the hero select and the HUD frames. The art was
drawn with Codex (ChatGPT image generation) as large sheets on magenta, then cut out, shrunk to these
sizes by keeping the most common color in each block, snapped to one palette and given a dark outline.

| Folder      | Files                                                                | Used by                     |
| ----------- | -------------------------------------------------------------------- | --------------------------- |
| `select/`   | `bg-landscape.png` (384×216), `bg-portrait.png` (216×468): Angkor Wat at dusk | `styles/hero-scene.css`     |
| `select/`   | `card.png`, `card-selected.png`, `card-crest*.png`, `arrow.png`      | `styles/hero-frames.css`    |
| `kit/`      | `panel.png`, `panel-crest.png`, `panel-foot.png`, `stone-button.png` | `styles/stone.css`          |
| `kit/`      | `title-crest.png`, `title-rule.png`: over and under a menu's title   | `styles/stone-menus.css`    |
| `kit/`      | `button.png`, `button-primary.png`: the menu buttons                 | `styles/stone-menus.css`    |
| `logo/`     | `logo.png` (160×79): the title's logo, STEEL & DUST                  | `styles/stone-menus.css`    |
| `settings/` | `lotus-band.png`: the frieze after a settings group's name           | `styles/stone.css`          |
| `loading/`  | `bg.png` (384×216, Angkor Wat at dusk from the causeway), `naga-*.png` (each piece's stone look over its gold one), `bokator-run.png` (8 frames of 76×59), `dust.png` (5 frames of 32×18) | `styles/loading*.css` |
| `hud/`      | `panel-frame.png`, `score-frame.png`                                 | `src/data/hud-frames.js`    |
| `hud/`      | `panel-frame.png`: the button layout editor's toolbar                | `styles/layout-editor.css`  |

The logo is not Codex's: `tools/steel_dust_logo.py` draws it pixel by pixel, run it again after
changing the design. STEEL is chrome, its horizon dark across the middle; a sword with a jade-set
gold guard lies under it; & DUST is sandstone, dithered from cream to rust and pitted with grit,
kicking up a trail of dust as it dashes. Each letter is a polygon of 45 degree cuts, slanted one
pixel in five, set in a dark outline over a three-pixel depth. The menus draw it at 2× (1× on short
screens, 3× on big ones), with its name kept in the heading for screen readers.

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
| `settings/lotus-band.png`   | 0, 10, 0, 14   |
| `hud/panel-frame.png`       | 12, 14, 12, 14 |
| `hud/score-frame.png`       | 11, 12, 11, 12 |

A card's crest and the panel's crest and foot would repeat along the edge, so they are cut out of the
frame and laid on top of its middle. The menus draw this art at 2× (1× on short screens), the hero sprites' own
size, and the HUD draws it at the sprites' 2× on the canvas.

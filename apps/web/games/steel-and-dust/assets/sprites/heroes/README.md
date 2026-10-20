# Hero sprites: the other Shades

The Firefly, Antler Spirit and Blue Shades, generated with PixelLab, east-facing only, in the same
format as the Moss Shade in `../hero/`: one row of 128×80 frames per animation, feet at x=64, y=76,
with the same animation names and frame counts as `../hero/hero.json`.

| Folder     | PixelLab character                                                  |
| ---------- | ------------------------------------------------------------------- |
| `firefly/` | `66973473-5c28-497d-8573-5538341e28d3`, "Variant 3 - Firefly Shade" |
| `antler/`  | `1e5ffed4-12a9-4ae4-a131-5949e2472e56`, "Variant 2 - Antler Spirit Shade" |
| `blue/`    | `d61d0535-aa48-4f28-b1a5-594f297b6032`, "Hero - Blue Shade (from reference)" |

- Most strips are PixelLab v3 animations from the character's east view. Hurt, juggle and get-up start
  from the Shade's own knock-out and lying frames, and dash and jump use the PixMiniMax model, because
  the first takes of those moves did not read well.
- Attack strips are ordered so the frame with the biggest slash sits at the strike frame the game
  holds while the hitbox is out (`src/data/hero-sprites.js`).
- `<shade>/arsenal/` is built from these sword strips by `tools/bake_hero_weapons.py <shade>`, with
  rows for the sword, fists, spear and axe, exactly like `../hero/arsenal/`.

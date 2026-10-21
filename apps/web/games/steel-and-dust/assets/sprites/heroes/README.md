# Hero sprites: the other Shades

The Firefly, Antler Spirit, Blue and Ember Shades, generated with PixelLab, east-facing only, in the same
format as the Moss Shade in `../hero/`: one row of 128×80 frames per animation, feet at x=64, y=76,
with the same animation names and frame counts as `../hero/hero.json`.

| Folder     | PixelLab character                                                  |
| ---------- | ------------------------------------------------------------------- |
| `firefly/` | `66973473-5c28-497d-8573-5538341e28d3`, "Variant 3 - Firefly Shade" |
| `antler/`  | `1e5ffed4-12a9-4ae4-a131-5949e2472e56`, "Variant 2 - Antler Spirit Shade" |
| `blue/`    | `d61d0535-aa48-4f28-b1a5-594f297b6032`, "Hero - Blue Shade (from reference)" |
| `ember/`   | gallery image `2631dd62-ccc8-5289-9c2c-775d5c445bad`, "Ember Shade" (Create Image Pro Flash) |

- Most strips are PixelLab v3 animations from the character's east view. Hurt, juggle and get-up start
  from the Shade's own knock-out and lying frames, and dash and jump use the PixMiniMax model, because
  the first takes of those moves did not read well.
- Attack strips are ordered so the frame with the biggest slash sits at the strike frame the game
  holds while the hitbox is out (`src/data/hero-sprites.js`).
- `<shade>/hero_ult.png` is the Shade's ultimate, nine frames on one row with no `arsenal/` copy (the
  Shade always draws its own blade for it): PixelLab v3 animations "ult_swarm_nova" (Firefly),
  "ult_spirit_stampede" (Antler Spirit) and "ult_absolute_zero_v2" (Blue), east view, placed in the
  128×80 frames the same way as the other strips.
- The Ember Shade is not a PixelLab character: its concept is a 64×64 Create Image (Pro Flash) sprite,
  set into a 128×80 frame on the feet line, and every strip is a PixMiniMax animation of that frame
  (getting up and the juggle start from its own knock-out lying frame). The frames were picked and
  placed with the feet on x=64, the air poses lowered to the other Shades' height and the juggle
  re-centred; frames where the model painted a hit flash were left out. Its ultimate is a 12-frame
  PixMiniMax take ("raises the sword into a column of fire"), nine frames of it kept.
- `<shade>/arsenal/` is built from these sword strips by `tools/bake_hero_weapons.py <shade>`, with
  rows for the sword, fists, spear and axe, exactly like `../hero/arsenal/`. The Ember Shade's spear
  keeps the sword's fire smear, and a few of its frames with no smear take their grip from detection
  (or `EMBER_OVERRIDES`) instead of the Moss Shade's "hide" overrides.
- `ember/spear/` holds the Ember Shade's own spear moves, one row per attack strip with the sword
  strip's frame count; the bake puts them in the spear row of `ember/arsenal/` in place of the sword
  swings. Each is a PixMiniMax animation (8 frames) of the arsenal's spear idle frame: a jab, a low
  stab, a twirl with a ring of fire, a thrust, a rising stab, an overhead slam, an air jab, a rising
  air stab, a diving stab and a plunge, all with phoenix-fire trails. The frames were picked so the
  strike lands on the strip's strike frame; air frames are lowered or raised so the hood sits where
  it does in the sword strip, without running off the bottom edge.

# Painted forests

The six forests of missions 1 to 6, two layers each, made with PixelLab Create Image (Pro) from the
concept paintings in `concepts/stages/mission-01/` at the repo root (each used as the reference).
Every layer is 216 rows tall, the height of the view, and tiles sideways.

| Folder            | Mission          | Concept             | `back.png` | `near.png` |
| ----------------- | ---------------- | ------------------- | ---------- | ---------- |
| `pine-ridge/`     | 1 Pine Ridge     | `b_pine_dawn`       | 310 wide   | 768 wide   |
| `old-grove/`      | 2 Old Grove      | `a_old_grove`       | 320 wide   | 384 wide   |
| `bamboo-pass/`    | 3 Bamboo Pass    | `f_bamboo_grove`    | 320 wide   | 384 wide   |
| `raider-camp/`    | 4 Raider Camp    | `e_raider_camp`     | 320 wide   | 384 wide   |
| `ember-woods/`    | 5 Ember Woods    | `c_autumn_dusk`     | 320 wide   | 384 wide   |
| `firefly-hollow/` | 6 Firefly Hollow | `d_firefly_night`   | 320 wide   | 384 wide   |

- `back.png` is the far plate: the sky, the sun or moon and the distant forest, with no trunks or
  road. Made with `tools/backdrop_layers.py`: `unframe` (Pro sometimes paints a white frame), `shift`
  where the sun or moon sat near an edge, then `overlap` to dither the two ends into each other.
  Pine Ridge also had a painted step in its mist inpainted away and its lowest rows flattened with
  `fogfloor`.
- `near.png` is the strip of trunks, bamboo or camp pieces just behind the road, on transparency.
  Made with `near`, which rolls each painting so a see-through gap sits on its edges, sets its base
  just under the road's edge and hazes it a little toward the forest's mist. Pine Ridge joins two
  paintings; the Old Grove's canopy ran over its edges, so that seam was inpainted first.
- The campfire's embers and smoke are drawn in code at the fire in `raider-camp/near.png`
  (`src/data/backdrops.js`).

The props in `../sprites/props/` (stump, logs, boulder, signpost) are one Pro batch at 128×128,
trimmed to their content and drawn at half scale like the fighters.

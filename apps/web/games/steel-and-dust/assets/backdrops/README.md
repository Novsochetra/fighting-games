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
  (`src/data/backdrops/`).

The forests keep their road clear of loose props: the near strips already dress it, and props drawn
on their own never sat in the painted light. The palisade that closes each forest road
(`../sprites/props/palisade.png`) and the plank deck of the platforms (`../sprites/platforms/`) are
Pro sprites drawn at half scale like the fighters. `ground.png` in each folder is the road's
cross-section (turf, earth, roots), keyed and tiled with `ground` and laid along the hills.

# Mirage Temple

Mission 9's road (`mirage-temple/`): the deep desert past the iron works at dusk turning to
twilight, a sun temple half-buried in rose-gold dunes. A concept was painted first with PixelLab
Create Image (Pro), `c_autumn_dusk` as its style reference; the concept then served as the style
image of every layer and sprite, so they share one palette.

- `back.png` (320 wide): Pro, sky and horizon only. The moon and the stepped temple were lifted
  off it (the sky behind them filled from the same rows a little to the side, an even step keeping
  the dither in phase), and its two ends were joined along a minimum-error seam instead of a dither
  crossfade; the one cloud the seam cut was given rounded lobes by hand.
- `horizon.png` (384 wide): the moon and the temple lifted off `back.png`, a `once` layer at
  parallax 0.01. They barely move, so they never show twice across the screen the way anything on
  a 320 wide plate in a 384 wide view does.
- `near.png` (1152 wide): two Pro paintings on transparency (a column, a cobra statue, braziers, a
  carved block; palms round an oasis, a broken obelisk, a wall with a doorway, a colossus hand), cut
  into pieces, each dropped so it stands on the road, laid out by hand so the cobra stands in the
  Serpent Shrine's screen and a column and a brazier in the Sun Throne's, hazed 0.22 toward the
  horizon.
- `works.png` (340 wide): Pro, the last scaffold, smokestack, rails and ore cart of the iron works,
  a `once` layer for the way in from mission 8. The drift and scrap on its right were cut away so
  they never hide the first brazier as the two layers slide past each other; hazed 0.22.
- `ground.png` (123 wide, 96 tall): a Pro cross-section (drifted sand over flagstones and buried
  masonry), cut where its two ends already match instead of dithered. Its near-black deep rows,
  which only show under a hill and made every hill look like a bridge over a cave, were rebuilt as
  courses of its own masonry that darken with depth; graded 0.22 toward rose.
- `cliff.png` (12 wide): drawn from `ground.png`'s colours, a facing of sandstone blocks for the
  sheer faces of steps.

The flames, sparks and sand trickles are drawn in code at the braziers and ledges of `near.png`
(`src/data/backdrops/mirage-temple.js`). The sealed door that closes the road and its broken-open
twin (`../sprites/props/temple-door*.png`, the twin a Pro edit of the door) and the slab on a fluted
column (`../sprites/platforms/slab.png`, its shaft the last row) are Pro sprites.

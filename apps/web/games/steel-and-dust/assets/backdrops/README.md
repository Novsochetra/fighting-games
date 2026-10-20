# Painted roads

The six forests of missions 1 to 6 and the two temples of missions 11 and 12, two layers each (the
Bayon also has a canopy drawn over the fight), made with PixelLab Create Image (Pro) from the
concept paintings in `concepts/stages/` at the repo root (each used as the reference). Every layer
is 216 rows tall, the height of the view, and tiles sideways.

| Folder            | Mission          | Concept             | `back.png` | `near.png` |
| ----------------- | ---------------- | ------------------- | ---------- | ---------- |
| `pine-ridge/`     | 1 Pine Ridge     | `b_pine_dawn`       | 310 wide   | 768 wide   |
| `old-grove/`      | 2 Old Grove      | `a_old_grove`       | 320 wide   | 384 wide   |
| `bamboo-pass/`    | 3 Bamboo Pass    | `f_bamboo_grove`    | 320 wide   | 384 wide   |
| `raider-camp/`    | 4 Raider Camp    | `e_raider_camp`     | 320 wide   | 384 wide   |
| `ember-woods/`    | 5 Ember Woods    | `c_autumn_dusk`     | 320 wide   | 384 wide   |
| `firefly-hollow/` | 6 Firefly Hollow | `d_firefly_night`   | 320 wide   | 384 wide   |
| `angkor-wat/`     | 11 Angkor Wat    | `angkor-wat/concept` | 640 wide  | 768 wide   |
| `bayon/`          | 12 Bayon         | `bayon/concept`     | 384 wide   | 384 wide   |

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

The forests keep their road clear of loose props: the near strips already dress it, and props drawn
on their own never sat in the painted light. The palisade that closes each forest road
(`../sprites/props/palisade.png`) and the plank deck of the platforms (`../sprites/platforms/`) are
Pro sprites drawn at half scale like the fighters. `ground.png` in each folder is the road's
cross-section (turf, earth, roots), keyed and tiled with `ground` and laid along the hills.

## Angkor Wat at dawn

Mission 11's layers come from `concepts/stages/angkor-wat/concept.png` (Pro, laid out from the
pixflux sketch `sketch-composition.png` beside it, Ember Woods' concept as a reference and Pine
Ridge's as the style); each layer used the concept as its reference and style, and the raw Pro
paintings are kept beside it (`back-painting.png`, `near-painting.png`, `ground-painting.png`). The
fixes below are small scripts, not `backdrop_layers.py` commands, because the tool has no step for
them.

- `back.png` was painted 640 wide so a tile holds one temple and two never show at once. It needed
  no `overlap`: both ends are jungle and already met; only a palm crown the left edge cut through
  was covered with sky from the other end. The painted moon sat cut off at the top edge, so the
  concept's rose moon was set lower, below the HUD panel and behind a cloud streak. Pro painted the
  moat as a pool with angled side banks, so the water only ran the full width under the road: the
  far bank was redrawn as one straight stone edge (rows 146-152) and the water below it (row 153
  down) rebuilt from the scene above, mirrored and squashed 2.5 times, in Pro's own water colours,
  with ripple lines and Pro's lotus pads set back on it. Rows 146 and below were then hazed 0.28
  toward `#d9a99e`, the dawn mist on the water, so dark fighters stand out against the reflection.
- `near.png` joins two paintings: `near <out> 187 '#d9a99e' 0.25 <a> <b>`. Painting a is Pro's,
  with its paved floor cut off below row 183 and the banana plant that ran off its right edge
  trimmed back to its stem. Painting b is built from a's own pieces: the singha and the railing's
  end post mirrored, seven post-to-post railing modules, and the naga mirrored to close the run
  facing outward, so half the strip is low balustrade that leaves the temple in view.
- `ground.png` came out of Pro seamless at 128 wide, so `ground` ran on a copy wrapped by 32 columns
  (its crossfade then leaves every column as painted); surface row 19.
- The incense smoke rises from the sticks at x 321, y 170 of `near.png`, drawn in code like the
  campfire's. There is no `mid` or `canopy` layer: the open dawn sky, the moon and the towers are
  the picture, and an overhang hid them.

## Bayon at dusk

Mission 12's layers come from `concepts/stages/bayon/concept.png` (Pro, laid out from the pixflux
sketch `sketch_composition.png` beside it, Ember Woods' concept as the style); each layer used the
concept as its reference and style. The fixes below are small scripts, not `backdrop_layers.py`
commands, because the tool has no step for them.

- `back.png` needed no `overlap`: the painting's two ends already met. Its near-black zenith was
  recoloured teal, its lone stars brightened, the moon moved in from the right edge (the concept's
  cratered moon, set behind the clouds) and the cloud and tree crown the edge cut through were
  rounded off and run on across the join.
- `near.png`: the model lit the ruins from the right and the face from the left, where the sun is,
  so the painting was mirrored with its face tower mirrored back. Then `near <out> 215 '#6a5288'
  0.35` (215 keeps the painted terrace under the ruins hidden under the road) and `shift 115`, so
  the first screen opens on the face tower at the right. The second fire bowl was given the first
  one's coals; the fire itself is drawn in code (`flames`, `embers`, `smoke`).
- `ground.png` was painted 160 wide. `ground` gives its surface row, 19, but its 32-column dither
  crossfade speckled the stones, so the ends were joined along the path where they match best.
- `canopy.png` (352 wide) is the optional front layer: a pixflux sketch on a flat ground, keyed,
  its orange tendrils dimmed to violet, lifted 6 rows, cut off below row 40 and joined like the
  ground.

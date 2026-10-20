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

# Warden's Fortress

Mission 10, the last road: night under a blood-red moon, from the last ruins of the sun temple up
the cliff road to the Warden Hall. Every layer is 216 rows tall like the forests'.

| File                         | Size      | How it was made                                                                                                                                                                                                                                  |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `warden-fortress/back.png`   | 585 wide  | Create Image (Pro) 640x216, `firefly-hollow/back.png` as the style image (outline, detail, shading; not its palette), from a Pixen concept. Cut before a second mesa, `overlap` 16, then the cliff face dithered toward the mist (`#7c203a`). |
| `warden-fortress/near.png`   | 1280 wide | Two Pro paintings of fortress pieces on transparency (the second used the first as its style image). Their painted ground band and weeds removed, the twelve pieces laid out by hand with gaps, sunk 3px and hazed toward `#80223a`, more at the base. |
| `warden-fortress/ruins.png`  | 384 wide  | Pro Flash 192x216 (a crop of the gatehouse as the style image): the broken sun-disc obelisk, a `once` layer at the start of the road where mission 9's temple is left behind. Hazed like the near strip.                                      |
| `warden-fortress/ground.png` | 96 wide   | Pro Flash 128x64 (`firefly-hollow/ground.png` as the layout and density reference): flagstones over basalt, keyed with `ground`. Surface row 14.                                                                                            |
| `warden-fortress/cliff.png`  | 12x64     | Cut from `ground.png` by hand, with a dark outer edge and a moonlit rim, for sheer step faces.                                                                                                                                                 |

- The near strip keeps a 212px gap at its start: on the first screen the temple ruins stand there,
  and on every later pass the far fortress shows whole through it. Its fires (the brazier, the fire
  bowl and the torch) have flames, glow and sparks drawn in code at their painted spots, and the
  pennant on the tall pole is drawn in code so it ripples (`src/data/backdrops/warden-fortress.js`).
- The road's rampart decks (`../sprites/platforms/rampart.png`) and the Warden Hall's gate
  (`../sprites/props/warden-gate.png`, the end wall) are Pro Flash sprites at the fighters' density,
  with the plank deck and the palisade as their style images.

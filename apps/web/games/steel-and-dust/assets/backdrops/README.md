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

# Sandstorm Pass

Mission 7 leaves the forests: the morning after Firefly Hollow, a red-rock canyon pass at dawn
with a sandstorm blowing against the hero. `sandstorm-pass/` holds a far plate, a near strip, a
one-off strip of forest edge, the road's cross-section and a cliff face, made with PixelLab Create
Image (Pro), Edit and Inpaint (the originals are kept with the job's scratch files, not in the
repo).

| File       | Size     | How it was made                                                                                                                                                                                                                                          |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `back.png` | 768 wide | Two Pro paintings side by side, the first styled on `ember-woods/back.png` (sun, mesas, a dust wall), the second on the first (no sun, the storm wall swallowing the mesas). Both joins were inpainted on 256-wide crops across them, so the plate tiles with no dither and one sun. |
| `near.png` | 1152 wide | Two Pro paintings of set pieces (dead tree, beast skeleton, wagon, banners, hoodoo; arch, lookout, crates, cairn, thorn bush). The first painted its own ground band, which was cut away; each piece was stood on row 186 and laid along the strip with uneven gaps, then hazed toward the dust, the darks more than the lights. |
| `edge.png` | 384 wide | `once`: Firefly Hollow's own left trunk (`firefly-hollow/near.png`), barely hazed so it stays night-blue, with wind-blown sand drifts painted over its roots, where the road leaves the forest. |
| `ground.png` | 128x53 | A Pro cross-section (packed sand over red-rock strata) styled on `raider-camp/ground.png`; its ends already met, so it was only keyed and given a sprinkle of grit along the surface (`groundTop` 2). |
| `cliff.png` | 12x64 | Painted from the ground's strata in code: the rock face of a step, high ground on the left, for the sheer faces of the ledges. |

The canyon's air is drawn in code (`src/render/scene/ambient/`): one storm strength (`storm.js`)
that swells and dies on an irregular beat drives a dust wash and a rolling dust bank (`veil`),
sand streaks on both planes (`gusts`), dust plumes rolling along the foot of the canyon
(`plumes`), a far dust devil (`devil`), vultures riding a thermal (`vultures`), straw tumbleweeds
(`tumbleweeds`) and scraps of banner cloth (`leaves`). Dry scrub and bleached bones lie in front
of the fighters (`foreground/scrub.js`).

The broken palisade that opens the road (`../sprites/props/palisadeBroken.png`) is `palisade.png`
smashed with Edit. The raider barricade that closes it (`canyonBarricade.png`) is a Pro sprite
styled on the palisade, and `canyonBarricadeBroken.png`, the way into mission 8, is that sprite
smashed with Edit and its middle stakes inpainted into a gap. The scaffold decks
(`../sprites/platforms/scaffold.png`) are a Pro sprite whose crossed braces were carried down into
the posts, so its last row is only the two posts.

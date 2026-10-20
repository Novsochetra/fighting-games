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

# Iron Works

Mission 8 leaves the canyon of Sandstorm Pass for the raiders' foundry at a smoggy midday, all
in `iron-works/`. Every layer was made with PixelLab Create Image (Pro) or its repair tools, a
forest or an earlier Iron Works layer passed as the style image so the pixel density, outlines and
dithering match.

| Layer             | Size    | How it was made                                                                                                                                                                                                                                                                                      |
| ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `back.png`        | 384×216 | Pro (style: `ember-woods/back.png`): foundries built into red-rock cliffs under a smog-dimmed sun. Rolled by half, so the seam and the dark foreground rocks at its corners sat together in the middle, then one Inpaint (256×216 crop) over both; the cloud seam rounded by hand, the floor flattened into a dithered haze band, and rolled back so the sun stands in the middle. Tiles without an overlap. |
| `mouth.png`       | 384×216 | Pro (style: `back.png`): the canyon's red sandstone wall stepping down into a soot-black spur with pipes and a ladder. Drawn once at the start of the road (`once: true`, parallax 0.3), behind the near strip; a stray band on its right erased, its base raised to the road and hazed 12% toward the floor haze.                                                                    |
| `near.png`        | 1872×216 | Two Pro paintings of separate yard pieces (688×216 each; the second used the first as its style image): furnace, crane, brass tank, pipes, slag heap and conveyor; blast furnace with its tap and ladle gantry, girders, flywheel, water tower and slag cart. Cut apart and laid out on one strip with gaps chosen so the first screen opens on the pipes, the blast furnace stands behind the Great Furnace and the slag heap behind the Slag Gate; bases on row 189, hazed 25% toward `#ce9c62`. |
| `ground.png`      | 124×64  | Pro (style: `raider-camp/ground.png`): cinder crust over rail ties and riveted plates, earth with chains below. Cut where a plate meets a tie so it tiles, its crust and earth rows dithered 4px across the join, the white above keyed out; surface row 14.                                                                                                                                 |
| `cliff.png`       | 12×64   | Drawn by hand from the ground's colours: a riveted iron plate with a cinder lip, the face of a sheer step whose high ground is on the left (`cliff: true`).                                                                                                                                                                                                                       |

The moving air is drawn in code at spots in `near.png` (`src/data/backdrops/iron-works.js`): the
furnace mouths glow and breathe (`glow`), sparks shower from the furnace, the tap and the conveyor
head (`sparks`), the brick furnace's chimney sends up a plume (`plume`), the pipes and the tank vent
steam in bursts (`steam`), heat ripples over the furnaces and the slag heap (`shimmer`), the slag
heap spits embers, and ash sifts down behind and in front of the fighters (`ash`). Slag, dropped
pipe and hanging chain lie in front of them (`src/render/scene/foreground/scrap.js`).

The iron catwalks (`../sprites/platforms/catwalk.png`, Pro with `planks.png` as the style image)
stand on two I-beam legs whose last row repeats down to the ground. The foundry gate that closes
the road (`../sprites/props/foundry-gate.png`, Pro with `palisade.png` as the style image) and its
blown-open twin (`foundry-gate-broken.png`, an Edit of the gate) are drawn at half scale like the
fighters; the broken one is for the next road's way in.

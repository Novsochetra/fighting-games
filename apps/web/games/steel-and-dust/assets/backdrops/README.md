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

# Warden's Fortress

Mission 10, the last road: night under a blood-red moon, from the last ruins of the sun temple up
the cliff road to the Warden Hall. Every layer is 216 rows tall like the forests'.

| File                         | Size      | How it was made                                                                                                                                                                                                                                  |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `warden-fortress/back.png`   | 585 wide  | Create Image (Pro) 640x216, `firefly-hollow/back.png` as the style image (outline, detail, shading; not its palette), from a Pixen concept. Cut before a second mesa, `overlap` 16, then the cliff face dithered toward the mist (`#7c203a`). |
| `warden-fortress/near.png`   | 2040 wide | Three Pro paintings of fortress pieces on transparency (each later one with the one before as its style image). Their painted ground band, weeds and stray specks removed, the sixteen pieces laid out by hand, sunk 3px and hazed toward `#80223a`, more at the base. |
| `warden-fortress/ruins.png`  | 384 wide  | Pro Flash 192x216 (a crop of the gatehouse as the style image): the broken sun-disc obelisk, a `once` layer at the start of the road where mission 9's temple is left behind. Hazed like the near strip.                                      |
| `warden-fortress/ground.png` | 96 wide   | Pro Flash 128x64 (`firefly-hollow/ground.png` as the layout and density reference): flagstones over basalt, keyed with `ground`. Surface row 14.                                                                                            |
| `warden-fortress/cliff.png`  | 12x64     | Cut from `ground.png` by hand, with a dark outer edge and a moonlit rim, for sheer step faces.                                                                                                                                                 |

- The near strip keeps a 212px gap at its start: on the first screen the temple ruins stand there,
  and on every later pass the far fortress shows whole through it. Its width (2040) and drift
  (0.455) are picked so each boss arena looks onto its own pieces: the tower and fire bowl at the
  Outer Gate, the gatehouse at the Inner Keep, and the Warden's statue beside his gate at the end. Its fires (the brazier, the fire
  bowl and the torch) have flames, glow and sparks drawn in code at their painted spots, and the
  pennant on the tall pole is drawn in code so it ripples (`src/data/backdrops/warden-fortress.js`).
- The road's rampart decks (`../sprites/platforms/rampart.png`) and the Warden Hall's gate
  (`../sprites/props/warden-gate.png`, the end wall) are Pro Flash sprites at the fighters' density,
  with the plank deck and the palisade as their style images.

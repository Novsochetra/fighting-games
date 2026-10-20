# Painted forests

The six forests of missions 1 to 6, two layers each, made with PixelLab Create Image (Pro) from the
concept paintings in `concepts/stages/mission-01/` at the repo root (each used as the reference).
Every layer is 216 rows tall, the height of the view, and tiles sideways.

| Folder            | Mission          | Concept           | `back.png` | `near.png` |
| ----------------- | ---------------- | ----------------- | ---------- | ---------- |
| `pine-ridge/`     | 1 Pine Ridge     | `b_pine_dawn`     | 620 wide   | 768 wide   |
| `old-grove/`      | 2 Old Grove      | `a_old_grove`     | 320 wide   | 384 wide   |
| `bamboo-pass/`    | 3 Bamboo Pass    | `f_bamboo_grove`  | 320 wide   | 768 wide   |
| `raider-camp/`    | 4 Raider Camp    | `e_raider_camp`   | 576 wide   | 384 wide   |
| `ember-woods/`    | 5 Ember Woods    | `c_autumn_dusk`   | 640 wide   | 768 wide   |
| `firefly-hollow/` | 6 Firefly Hollow | `d_firefly_night` | 576 wide   | 768 wide   |

- `back.png` is the far plate: the sky, the sun or moon and the distant forest, with no trunks or
  road. Made with `tools/backdrop_layers.py`: `unframe` (Pro sometimes paints a white frame), `shift`
  where the sun or moon sat near an edge, then `overlap` to dither the two ends into each other.
  Pine Ridge also had a painted step in its mist inpainted away and its lowest rows flattened with
  `fogfloor`.
- `near.png` is the strip of trunks, bamboo or camp pieces just behind the road, on transparency.
  (`way-in.png`, where there is one, and `cliff.png` are described in the second pass below.)
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

## Second pass: seams, one sun per screen, cliffs

The far plates and near strips were reworked after looking at every forest in the browser with two
tiles side by side, and every road got a cliff face. All of it is reproducible with
`tools/backdrop_layers.py`; the PixelLab originals were kept with the work notes.

- **Far plate seams.** `overlap` had left a 64-column ordered-dither crossfade at the start of every
  plate, which read as a ghosted, blocky patch (the Ember Woods sun halo was cut by it). `unblend`
  sorts each pixel of that band back to the end it came from (the Bayer pattern says which), fills
  the gaps from its neighbours and joins the two ends along the least visible seam: all six plates.
  Firefly Hollow (column 191) and Raider Camp (column 192, its camp floor) also had a hard cut where
  `shift` had joined the painting's own ends; `join` lays the two sides 32 columns over each other
  and switches along the least visible seam (both plates 288 wide). Inpainting the dither with
  PixelLab was tried first and only copied the dither, so it was not used.
- **One sun or moon per screen.** A plate narrower than the view showed its sun twice. Each plate
  with a sun or moon is now the plate followed by a copy without it (`back.png` twice as wide): Pine
  Ridge, Ember Woods and Firefly Hollow had the sun or moon and its rings inpainted away with
  PixelLab Inpaint on a 256-wide crop centred on it ("dawn sky in flat bands, no sun", "dusk sky,
  no sun", "night sky, no moon"); Raider Camp's flat disc was painted out with its own sky bands.
  Ember Woods is rolled by 112 so its halo sits inside its own half. The Pine Ridge halo stub at the
  top edge was rounded off.
- **Near strips.** Raider Camp's strip is `sink` 6 rows, so its tents and crates stand on the road's
  far edge instead of on the plate's yard (its fire emitters moved down with it); a warm dust `mist`
  now hangs over the yard. Old Grove (`#b8ccaa`, 0.38) and Firefly Hollow (`#6e6fa6`, 0.34) got
  `groundhaze` from row 70 to 176, and Pine Ridge (`#c9d5da`, 0.3) from row 90 to 178, a ground
  mist that keeps their dark trunks and lower boughs from swallowing the fighters. Bamboo Pass, Ember Woods and Firefly Hollow passed their trunks at one even rhythm;
  `vary` joins each strip with a copy that leaves one trunk or clump out (768 wide).
- **Cliffs.** `cliff.png` (12x64) in every folder is the face of a step whose high ground is on the
  left, drawn down each sheer step (`src/render/scene/cliff-faces.js`). One PixelLab Create Image
  (Pro) call at 16x64 with a crop of the Pine Ridge cross-section as the style image gave 16
  candidate faces (earth, stones, roots, strata, stacked stones); `cliff` picks one per forest,
  repaints it in that forest's earth by brightness rank, darkens it as a face turned from the light,
  crumbles its outer edge and leaves its top clear so the road's own turf rolls over it:

  | Folder            | Candidate         | Arguments after `<ground.png>` (left width skip depth turf lip shade) |
  | ----------------- | ----------------- | --------------------------------------------------------------------- |
  | `pine-ridge/`     | 0 stones, roots   | `2 12 14 64 11 4 0.8`                                                 |
  | `old-grove/`      | 4 dense roots     | `2 12 14 64 10 4 0.8`                                                 |
  | `bamboo-pass/`    | 5 layered strata  | `2 12 14 64 7 3 0.8`                                                  |
  | `raider-camp/`    | 6 pebble pack     | `2 12 14 64 5 3 0.8`                                                  |
  | `ember-woods/`    | 12 roots          | `2 12 16 64 12 5 0.8`                                                 |
  | `firefly-hollow/` | 13 stacked stones | `1 12 1 18 14 11 0.8` (the colours of its paving, a retaining wall)   |

- **Decks.** `../sprites/platforms/planks.png` is a PixelLab Create Image (Pro) trestle (160x48,
  the old deck as the style image): a thick plank walkway on two posts with a nailed cross brace,
  so it no longer reads as a little gate from a distance. Its brace was run 12 rows further down
  into the posts, so the last row, which the legs repeat down to the ground, is the two posts alone.
  `planks-night.png` is the same trestle pulled 42% toward indigo (`#3a3c6e`) and darkened to 88%,
  the deck of Firefly Hollow, where the warm wood stood out of the moonlight.
- **The way in.** Each road from the second on starts with a piece of the forest before it, a
  `way-in.png` layer drawn once from the start of the road (`once: true`, parallax 0.5), made with
  `wayin` from the last road's near strip as it was before this pass and hazed toward this forest's
  air: two pines from Pine Ridge in the Old Grove (`#b8ccaa`, 0.3), an Old Grove tree (its canopy
  trimmed to a ragged edge and its floor band left behind) in Bamboo Pass (`#e1f1df`, 0.35), a
  bamboo clump at the Raider Camp gate (`#d8ae84`, 0.3), the camp's crates and banner on the edge of
  Ember Woods (`#e7a35f`, 0.25) and the last autumn tree going dark in Firefly Hollow (`#3c3c74`,
  0.58).

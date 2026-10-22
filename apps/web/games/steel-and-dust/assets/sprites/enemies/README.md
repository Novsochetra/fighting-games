# Enemy sprites

Thirty-one enemies. Twenty-nine were designed and animated with PixelLab; the two temple bosses are
recolors of two of them (below). The first sixteen came from one batch of 64×64 side-view concepts
(`concepts/enemies/` at the repo root, `01` to `16`), and their three bosses were redrawn at 96×96
first. The thirteen added with the missions (`17` to `29`: seven bosses at 96×96, six raiders at
64×64) were drawn with Create Image (Pro), styled after the first batch.

Each strip is a PixMiniMax animation of the concept, facing right, generated on a frame the size of
the sheet's frame with the concept standing on the feet line, so the strips need no resizing. Every
strip but `ko` is pinned back to the concept's feet where the model drifted, and the sheets are
indexed PNGs.

Each PNG holds one enemy, one row per strip. `src/data/enemies/enemy-sprites.js` gives the frame size,
the feet position and each strip's row, frame count and strike frame:

| Strip    | Frames | What it shows                                                        |
| -------- | ------ | -------------------------------------------------------------------- |
| `idle`   | 4      | breathing loop                                                       |
| `walk`   | 8      | walk loop                                                            |
| `attack` | 9      | frame 0 is the stance, then the wind-up, the strike and the recovery |
| `hurt`   | 4      | recoil and recover                                                   |
| `ko`     | 9      | 0 stands, 1-4 fly backward, 5-8 land and lie still                   |
| `lunge`  | 9      | Red Cutter only: crouch, then a running lunge                        |
| `slam`   | 9      | bosses: wind-up and a strike into the ground                         |
| `charge` | 8      | bosses: a running loop                                               |

Regular enemies use 128×80 frames with the feet at x=64, y=76; bosses use 192×112 with the feet at
x=96, y=108. Hit splashes and flashes the model painted onto hurt and knock-out frames were removed.
Where a generated knock-out landed early or late, its frames were picked to fit the 1-4 / 5-8 split.

The two bosses of the temple roads are palette swaps of finished sheets, so they keep every frame,
the strips and the strike frames of their source. A short Python (PIL) script rewrote each indexed
sheet's palette, mapping every entry by hue band and lightness onto a new ramp, so the shading
ramps keep their order and the outlines, blades and transparency stay as they were:

| Sheet          | From           | Recolor                                                                                                                                                        |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naga.png`     | `cobra.png`    | Naga Raja: green scales to deep jade and emerald with turquoise highlights, the rust-red hood to gold over dark bronze, a richer gold belly, a turquoise slash |
| `guardian.png` | `colossus.png` | Bayon Guardian: rust to cool grey-green sandstone, a few speckled rust shades to moss, the bright rust highlights and the red eye to a warm gold glow          |

## Boss kits

A boss with a kit of its own (`docs/boss-kits.md`) has more rows under the seven above, one per move
of its own, named as the move is. Each plays on the move's own timeline (`frameAt`), so its strike
frame only has to lie inside the strip. A boulder or a mace held overhead does not fit a 192×112 frame, so `colossus.png` and `ironhorn.png`
have 192×160 frames with the feet at y = 156: their first seven rows are the old ones moved 48px down. The Cobra's tail laid
along the floor reaches past a 192px frame, so `cobra.png` has 256×112 frames with the feet at x = 128: its first seven rows
are the old ones moved 32px right. The Gnoll's club raised high in his leap does not fit either, so `gnoll.png` has 192×160 frames too, and so does `djinn.png`, for the storm over the Djinn's raised hands. The Queen's sting reaches far ahead and her tail stabs straight up as she
bursts out, so `queen.png` has 256×160 frames with the feet at x = 128, y = 156: its first seven rows are the old ones
moved 32px right and 48px down, and so does `furnace.png`, for the flail swung overhead and swept far along the floor, and `pharaoh.png`, for the sun over his staff and the staff thrust far ahead. Her old sheet was in full color, so once the rows were added the whole sheet was
folded into one 255-color palette (no color moved more than 9 levels). They are drawn by an image model, then lifted off their
background, cut into frames, shrunk to the boss's idle height, stood on the feet line and folded
into the sheet's own palette.

| Sheet      | Rows added                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `khan.png` | `warHorn` 8 (blows a ram's horn), `crescentDash` 10 (crouch, lunge, slash), `tempest` 12 (three low swings) |
| `colossus.png` | `boulderLob` 10 (tears up a boulder, hurls it), `spikeLine` 8 (a stomp), `landslide` 12 (pounds the ground twice, roars) |
| `ironhorn.png` | `hornRush` 10 (paws, runs, skids), `uppercut` 8, `dazed` 6 (a loop; the stars are `fx/stars.png`), `stampede` 12 (rears, stomps, runs, skids) |
| `cobra.png` | `venomSpit` 8 (rears back, spits), `coilLash` 10 (whips the tail round and along the floor), `hypnoticGaze` 12 (rises, hood flared, eyes glowing and flashing, lunges) |
| `gnoll.png` | `packCall` 8 (crouches, howls at the sky), `leapingMaul` 10 (crouches, leaps with the club overhead, smashes it down), `bloodFrenzy` 12 (hunches with red eyes, cackles, lunges; frame 8 is unused, see `docs/boss-kits.md`) |
| `djinn.png` | `thunderFist` 8 (fists crackling, a punch trailing lightning), `dustDevil` 8 (whips sand round himself, pushes it out), `eyeOfStorm` 12 (raises his arms into a storm, drives lightning down) |
| `furnace.png` | his `attack` (swipe), `ko` and `slam` rows redrawn too, his first sheet's being cut off at its edges (the `ko` row's last lying frame is used twice); `fireFlail` 10 (whirls the flail overhead, sweeps it along the floor), `slagPot` 8 (lifts a pot of slag over his head, hurls it; the flying pot was keyed out, it is `fx/slag.png`), `meltdown` 10 (opens the chest furnace, fires, blazes between lances, then red hot and cooling; the image's later beam frames were drawn over each other's bodies, so only the first firing frame is kept, its flame trimmed to a ragged tip, the blazing frame is used twice and the lances are `fx/beam.png`) |
| `pharaoh.png` | `mirage` 9 (raises the staff, dissolves into a spiral of gold sand, steps out of it crouched, stands; the copies pop on its frames 3-5), `scarabCarpet` 8 (raises the staff, thrusts it low, the orb pulsing; the scarabs are `fx/scarab.png`), `curseOfSun` 12 (raises the staff in gold ribbons, the sun over it pulsing, 4-7 a loop, then points the orb at the hero) |
| `queen.png` | `burrow` 12 (digs in until only the stinger shows, 0-7; then her mound tunnelling, a loop, 8-11), `emerge` 8 (bursts up, stinger stabbing straight up), `tailSting` 9 (stabs over her head), `hiveSwarm` 12 (rears, shrieks, tail glowing with embers, slams the pincers down) |

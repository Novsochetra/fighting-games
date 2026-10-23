# Enemy sprites

Thirty-one enemies. Twenty-nine were designed and animated with PixelLab; the two temple bosses
were drawn new by an image model (Boss kits, below), having first been recolors of two of them. The first sixteen came from one batch of 64×64 side-view concepts
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
| `khan.png` | his `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges; `warHorn` 8 (blows a ram's horn), `crescentDash` 10 (crouch, lunge, slash; redrawn, its blade was cut off at the right), `tempest` 12 (three low swings) |
| `colossus.png` | his `slam` row redrawn, his first sheet's having its raised fists cut off at the top; `boulderLob` 10 (tears up a boulder, hurls it), `spikeLine` 8 (a stomp), `landslide` 12 (pounds the ground twice, roars) |
| `ironhorn.png` | `hornRush` 10 (paws, runs, skids), `uppercut` 8, `dazed` 6 (a loop; the stars are `fx/stars.png`), `stampede` 12 (rears, stomps, runs, skids) |
| `cobra.png` | her `ko`, `slam` and `charge` rows redrawn, her first sheet's being cut off at its edges (her palette was full, so colors in her old rows less than 5 levels apart were merged to make room); `venomSpit` 8 (rears back, spits), `coilLash` 10 (whips the tail round and along the floor), `hypnoticGaze` 12 (rises, hood flared, eyes glowing and flashing, lunges) |
| `gnoll.png` | his `attack`, `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges; `packCall` 8 (crouches, howls at the sky), `leapingMaul` 10 (crouches, leaps with the club overhead, smashes it down), `bloodFrenzy` 12 (hunches with red eyes, cackles, lunges; frame 8 is unused and left empty, see `docs/boss-kits.md`) |
| `djinn.png` | his `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges (his palette was full, so colors in his old rows less than 5 levels apart were merged to make room); `thunderFist` 8 (fists crackling, a punch trailing lightning), `dustDevil` 8 (whips sand round himself, pushes it out), `eyeOfStorm` 12 (raises his arms into a storm, drives lightning down) |
| `furnace.png` | his `attack` (swipe), `ko` and `slam` rows redrawn too, his first sheet's being cut off at its edges (the `ko` row's last lying frame is used twice); `fireFlail` 10 (whirls the flail overhead, sweeps it along the floor), `slagPot` 8 (lifts a pot of slag over his head, hurls it; the flying pot was keyed out, it is `fx/slag.png`), `meltdown` 10 (opens the chest furnace, fires, blazes between lances, then red hot and cooling; the image's later beam frames were drawn over each other's bodies, so only the first firing frame is kept, its flame trimmed to a ragged tip, the blazing frame is used twice and the lances are `fx/beam.png`) |
| `pharaoh.png` | `mirage` 9 (raises the staff, dissolves into a spiral of gold sand, steps out of it crouched, stands; the copies pop on its frames 3-5), `scarabCarpet` 8 (raises the staff, thrusts it low, the orb pulsing; the scarabs are `fx/scarab.png`), `curseOfSun` 12 (raises the staff in gold ribbons, the sun over it pulsing, 4-7 a loop, then points the orb at the hero) |
| `guardian.png` | all ten rows his own, drawn new (a mossy four-faced temple golem with gold veins), in 256×160 frames: the seven shared rows (his `attack` a straight punch, his `slam` both fists into the road) and `stoneGaze` 8 (eyes kindling and flaring), `figRoots` 8 (fists into the ground, gold-veined roots bursting round him), `fourFaces` 12 (raises his arms as gold climbs him from the feet, 4-5 a glowing loop, lowers them into prayer as the gold drains, stands), `crumble` 8 (falls to rubble; played back to reform). The image model drew each strip at its own size, place and idea of his body, so he jumped and changed as his moves began; the sheet was then reworked pixel by pixel round one stance (the old `stoneGaze` frame 0, moved to where his idle stood): every strip scaled and shifted onto it, every move starting and ending on that very frame, `idle` rebuilt from it (a 2px breath and a pulse of his veins), the `walk` given its upper body over the old legs with a heavy bob and swinging fists, the other strips' heads, fists and planted feet replaced by its own where they had drifted, and `fourFaces` 1-10 animated from it with PixMiniMax (the first draw had turned him into a slim figure) and gilded in code. Straight cuts of other frames' bodies, specks and smears were removed, and every frame was finished the same way: a contrast curve, his veins kindled, the silhouette tidied and a 1px dark outline. Folded into one 255-color palette (no color moved more than 10 levels) |
| `naga.png` | drawn new, not recolored, and half as fine again as the other sheets (`density` 1.5, so she stays sharp drawn big): all ten rows are hers, in 384×240 frames with the feet at x = 192, y = 236, each strip shrunk from the source images so its stance stands as tall as her idle (129 px) and laid over the frame before by its coil. Her `attack` (slash; the arc is in frame 4) and `slam` rows were redrawn body-only; `tidalCoil` 9 (leans back, rears up, crashes her coil flat, rises), `sevenHeads` 8 (fans her hoods, strikes forward in frames 4 and 5, in turn; in those two frames her face turns left), `rainbowNaga` 12 (raises her empty hand, rises with both arms up, 4-7 a loop, points her dagger, sags); the water, the orb and the spirits are `fx/` strips |
| `queen.png` | `burrow` 12 (digs in until only the stinger shows, 0-7; then her mound tunnelling, a loop, 8-11), `emerge` 8 (bursts up, stinger stabbing straight up), `tailSting` 9 (stabs over her head), `hiveSwarm` 12 (rears, shrieks, tail glowing with embers, slams the pincers down) |

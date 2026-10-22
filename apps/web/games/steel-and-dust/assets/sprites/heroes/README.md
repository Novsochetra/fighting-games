# Hero sprites: the other heroes

The Firefly, Antler Spirit, Blue and Ember Shades, generated with PixelLab, and the Bokator fighter and
the Angkor Warrior, drawn with ChatGPT image generation, all east-facing only, in the same
format as the Moss Shade in `../hero/`: one row of 128×80 frames per animation, feet at x=64, y=76,
with the same animation names and frame counts as `../hero/hero.json`. The two Khmer fighters' frames
are 128×112, their feet on y=108, the same 4 px above the bottom edge (the game reads a strip's frame
height from its image).

| Folder     | PixelLab character                                                  |
| ---------- | ------------------------------------------------------------------- |
| `firefly/` | `66973473-5c28-497d-8573-5538341e28d3`, "Variant 3 - Firefly Shade" |
| `antler/`  | `1e5ffed4-12a9-4ae4-a131-5949e2472e56`, "Variant 2 - Antler Spirit Shade" |
| `blue/`    | `d61d0535-aa48-4f28-b1a5-594f297b6032`, "Hero - Blue Shade (from reference)" |
| `ember/`   | gallery image `2631dd62-ccc8-5289-9c2c-775d5c445bad`, "Ember Shade" (Create Image Pro Flash) |
| `bokator/` | ChatGPT image sheets on magenta, one sheet per animation (not PixelLab) |
| `angkor/`  | ChatGPT image sheets on magenta, a row of frames per animation (not PixelLab) |

- Most strips are PixelLab v3 animations from the character's east view. Hurt, juggle and get-up start
  from the Shade's own knock-out and lying frames, and dash and jump use the PixMiniMax model, because
  the first takes of those moves did not read well.
- Attack strips are ordered so the frame with the biggest slash sits at the strike frame the game
  holds while the hitbox is out (`src/data/hero-sprites.js`).
- `<shade>/hero_ult.png` is the Shade's ultimate, nine frames on one row with no weapon rows (the
  Shade always draws its own blade for it): PixelLab v3 animations "ult_swarm_nova" (Firefly),
  "ult_spirit_stampede" (Antler Spirit) and "ult_absolute_zero_v2" (Blue), east view, placed in the
  128×80 frames the same way as the other strips. The game draws `<shade>/arsenal/hero_ult.png`, the
  same strip dressed in the Shade's element (below).
- The Ember Shade is not a PixelLab character: its concept is a 64×64 Create Image (Pro Flash) sprite,
  set into a 128×80 frame on the feet line, and every strip is a PixMiniMax animation of that frame
  (getting up and the juggle start from its own knock-out lying frame). The frames were picked and
  placed with the feet on x=64, the air poses lowered to the other Shades' height and the juggle
  re-centred; frames where the model painted a hit flash were left out. Its ultimate is a 12-frame
  PixMiniMax take ("raises the sword into a column of fire"), nine frames of it kept.
- `<shade>/arsenal/` is built from these sword strips by `tools/bake_hero_weapons.py <shade>`, with
  rows for the sword, fists, spear and axe, exactly like `../hero/arsenal/`, and for the Firefly,
  Antler Spirit and Blue Shades then dressed in their element (below). The Firefly and Blue Shades' blades
  burn white at the core, so for them the bake counts white as the blade's glow: it finds the blade
  wherever it lies, across the body too, takes away its white core and its glowing edge to their full
  width, and where the blade crossed the body with body on both sides of it each pixel takes the one
  mirrored across the blade's edge, so the body runs on under it. Their lit armour and tunic, all
  colour and wrapped in the body, never count as a smear; out of a swing a flailing blade's white arcs
  take the weapon's smear colours, while a swing's smear, and a strike lost in it, is recoloured as it
  always was. A few frames have their blade line set by hand (`OWN_OVERRIDES`): the Firefly Shade's
  walk, where a ring of sparks or a glow at the tip was taken for the blade, and its hurt, where the
  blade is drawn twice; the Blue Shade's landing and flailing hurt frames, a getting-up frame found
  grip-for-tip, and the pommel hanging under his raised fist in his win pose. A frame's entry may also
  mark it `blaze` (a swing running through the glow round him, recoloured whole) and list `keep` boxes
  shown as drawn in every row (an eye a swing's glow runs into), `smear` boxes recoloured with it and
  `under` boxes where the weapon passes behind his body (a spear's butt behind his hood), and `burst`
  boxes that give back the glow the blade's erase took (a thrust's burst, a smear's end the blade runs
  into), recoloured with the smear. The Firefly and Blue Shades' entries also use the Moss Shade's
  `paint`, `clear` and `tint`, and `aim`, the point a drawn weapon points at from his grip. A few
  pixels of air shut in by a drawn weapon, against the body or by the effects drawn after it, take the
  weapon's outline (a frame's `pocket` allows a larger one), and a single pixel the effects shut in
  anywhere takes the colour round it. The Firefly Shade's small loose cyan
  sparks stay as drawn in every row. A pale blade's smear follows its stroke: a darker rim, the
  lightest colour only on its core line. The Ember Shade's spear keeps the sword's fire smear, and a
  few of its frames with no smear take their grip from detection (or `EMBER_OVERRIDES`) instead of
  the Moss Shade's "hide" overrides.
- The bake dresses the Firefly, Antler Spirit and Blue Shades (and the Moss Shade, `../hero/`) in
  their element with `tools/shade_fx/` (`<shade>.py` and its `<shade>_*.py` parts), the way the
  Ember Shade's frames burn, in every row of every `arsenal/` strip and in `arsenal/hero_ult.png`; the
  strips in this folder stay as PixelLab drew them, so a re-bake writes the same files. Every pixel
  it paints is one of the Shade's own dozen colours, never a blend (a few see-through glow colours
  only on empty pixels), its particles are seeded, wrap round the looping strips so the last frame
  runs into the first, keep off the frame's outer pixel and are the same in every weapon row.
  `python3 tools/shade_fx/preview.py <shade> OUT_DIR` draws every strip before and after.
  - Firefly: a swarm of nine fireflies circles him (a ring at the waist passing in front, one behind
    the shoulders, a few hovering behind and above), each pulsing white-hot to lime with a gold trail
    and lagging his body, so the swarm streams after him on lunges and jumps; on the looping strips
    each ring turns one spacing a loop. The swarm lights the cloak's back edge, which breaks into
    flickering motes, sixteen resting fireflies blink along its edge, hem and folds, sparks lift off the
    hem, fireflies gather a few pixels outside each swing, his eyes get a white core and the blade a
    soft cyan bloom (where a hilt's glint or the hood's edge passes for his eye, `firefly_eyes.py`
    names the eye by hand); in the ultimate a second ring closes in on the raised blade. The win strip is timed
as the game plays it, a loop over its last three frames with the first half a step between them, so
the swarm turns evenly both in a fight and on the select card that plays all four.
  - Antler Spirit: the cloak's back edge and hem burn in teal ghost fire, hottest low at his back,
    dark teal to pale mint over a scorch that keeps the cloth's fold shading, cooling within a few
    pixels of the blade and smear; wisps rise and curl off it, soul motes drift behind him, small
    flames lick up from each antler tip, the runes and eyes pulse a step brighter, and a see-through
    teal halo sits round the blade, smear and burning edge.
  - Blue: the black cape gets an icy rim along its back and top edges, two fold lines hung a set
    distance in from its back edge so they swing with the cloth, and frost spikes, needles and short
    icicles along its hem; ice motes drift back off it, spaced apart, a third of them twinkling once as
    a cross, mist curls at his feet, each armour seam away from his eye gets a glint, the blade core
    and smears turn cold white in a
    soft blue halo, and warm eyes turn to ice. His black trousers are told apart from the cape and left
    plain. His head is kept out of the frost (`blue_head.py`), so the hood's flat black frames his face
    as in his PixelLab design (gallery `1792398516784`): where a side view drew the face as a flat blue
    plate, or as a closed lit ring, it is drawn black in the hood, lit only along its front and chin,
    with its eye. The few motes, twinkles and flecks no rule can tell apart are set by hand in
    `blue_touchups.py`.
- `ember/spear/` holds the Ember Shade's own spear moves, one row per attack strip with the sword
  strip's frame count; the bake puts them in the spear row of `ember/arsenal/` in place of the sword
  swings. Each is a PixMiniMax animation (8 frames) of the arsenal's spear idle frame: a jab, a low
  stab, a twirl with a ring of fire, a thrust, a rising stab, an overhead slam, an air jab, a rising
  air stab, a diving stab and a plunge, all with phoenix-fire trails. The frames were picked so the
  strike lands on the strip's strike frame; air frames are lowered or raised so the hood sits where
  it does in the sword strip, without running off the bottom edge.
- `bokator/` was drawn with ChatGPT image generation, one sheet of frames per animation on a magenta
  background, from a prompt pack giving each animation's frame count and strike frame. Each sheet was
  cut frame by frame (each frame's body found first, the sword and arcs going with the body they are
  drawn on, pieces floating loose from it dropped), the first batch of sheets recoloured to the
  second's tan skin and slate trousers, every sheet scaled so his body is the same size, shrunk to the
  game's scale, cut to one 64-colour palette and given a 1-px dark outline, with the body on x=60 and
  his feet, not his sword's tip, on y=108; his raised sword and his leaps need the taller frame. His
  idle breathes on one frame of the idle sheet, and `hero_ult.png` is put together from the salute,
  the overhead chop and the first frame of his ultimate sheet (the only one the lion is not drawn
  over), the sword raised to the sky in a gold swirl. Standing up in his win pose he is a head taller
  than the crouch he fights in, so `card_win.png` is the same win sheet cut the same way at 80% of
  that size, the art his select cards were drawn from (see `card_pose.png` below).
- `bokator/fists/` holds his own bare-hand Bokator moves (elbows, knees, a push kick, a flying knee, a
  downward elbow), one row per attack strip; the bake puts them in his fists row, the same way as the
  Ember Shade's spear moves. His other rows are baked from the sword strips with the `bokator` setting:
  his blade is found as the longest thin straight run of gold in the frame, and the frames where it
  merges with his glowing fist or bends are given their blade line by hand (`OWN_OVERRIDES`).
- `angkor/` is the Angkor Warrior, a soldier of the battle reliefs on the Bayon and Angkor Wat: topknot,
  ring earrings, a round shield on his back, a dark sampot chang kben and a gold dav. He was drawn with
  ChatGPT image generation from one concept image, on six magenta sheets with a row per animation
  (the ultimate over two rows, more frames than asked for in most rows) and a seventh sheet for his
  meteor slash, the first take of which stood on the ground. Each sheet was cut the same way as the Bokator
  fighter's (each frame's body found first, the sword and arcs going with the body they are drawn on,
  where a slash arc reached the next frame's body it was given back by hand, loose specks dropped),
  every sheet scaled so his stance is 61 px tall, shrunk with the colours averaged, cut to one 64-colour
  palette and given a 1-px dark outline round his body only, so the glow of his blade and arcs keeps a
  soft edge. Ground frames stand with his legs on x=63 and his feet on y=108, air frames have their
  lowest point on y=105, the idle loop's frames are nudged so his feet stay still, and the frames of each
  attack were picked so the strike lands on the strip's strike frame. Scaled to that height, the lean of
  his dash and the crouch of his landing came out a fifth bigger than his stance, and some attack and
  ultimate frames were drawn bigger still, so these were shrunk about his feet afterwards, in the sword
  strips and in every row of `arsenal/`: the dash's first three frames and the landing's first two (to
  82-88%), the cleave's first six (80-93%), the rising dragon's last five (86-93%), the thrust's lunge
  (frames 3-4) and the spin slash's frame 3 (94%), and `hero_ult.png` (88%, the leap 95%). Each pixel
  takes the colour most of it covered, an edge on his body keeps its dark outline, and the glow of his
  arcs keeps its soft edge. Three effects ran off their frames and were cut straight across: the
  thrust's blade now narrows to a point inside the frame and its loose glint is gone, the meteor
  slash's arc thins out over its last rows instead of stopping at the bottom edge, and the rising
  dragon's arc tip, shrunk, now ends inside the frame. His win pose is one frame of the
  win sheet, its blade glowing brighter and dimmer, since the sheet's other win frames wrap the blade in
  flames the weapon bake cannot lift off; `card_win.png` is that pose at 80% of the size, the art his
  select cards were drawn and sized from, as for the Bokator fighter. `hero_ult.png` is two frames raising the dav, three of its blade
  blazing, the leap, the chop and the kneel over the split ground, from his ultimate sheet. His other
  rows are baked with the `angkor` setting, his gold blade found and taken away like the Bokator
  fighter's, with the frames where a gold arm band was taken for it given their blade line by hand.
- `bokator/card_pose.png` and `card_idle.png`, and the same two in `angkor/`, are the Khmer fighters'
  select cards: the middle card and the side cards, six 128×112 frames on one row each. They were
  drawn with ChatGPT image generation (Codex) from their own art: a sheet of six frames on magenta for
  each, the middle card a flourish (Bokator flicks his sword up, spins it in a gold arc and salutes;
  the Angkor Warrior's raised dav gathers light, blazes up in flame under a star and settles) and the
  side cards a bouncing guard. `python3 tools/hero_cards/cut.py <hero> <pose|idle> SHEET` cut each
  sheet into `<hero>/card/pose.png` and `card/idle.png`: every frame lifted off the magenta, shrunk by
  the one scale that makes its body (a raised blade does not count) as tall as the art it replaces,
  each pixel taking the colour of one shared palette that covers most of it, lone grain pixels taking
  their neighbours' colour, the drawing's own dark line closed where a lit pixel met the background,
  and the feet set where that art's are, each frame moved sideways so its feet cover the first's.
  `python3 tools/hero_cards/bake.py` then draws gold sparks rising off the blade, now and then a
  twinkle, and for the Angkor Warrior lotus petals tumbling past his shoulders, and writes the cards;
  `python3 tools/hero_cards/preview.py <hero> OUT_DIR` draws them on a pixel grid.

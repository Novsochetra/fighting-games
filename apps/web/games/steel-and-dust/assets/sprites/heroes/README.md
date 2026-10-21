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
- `<shade>/hero_ult.png` is the Shade's ultimate, nine frames on one row with no `arsenal/` copy (the
  Shade always draws its own blade for it): PixelLab v3 animations "ult_swarm_nova" (Firefly),
  "ult_spirit_stampede" (Antler Spirit) and "ult_absolute_zero_v2" (Blue), east view, placed in the
  128×80 frames the same way as the other strips.
- The Ember Shade is not a PixelLab character: its concept is a 64×64 Create Image (Pro Flash) sprite,
  set into a 128×80 frame on the feet line, and every strip is a PixMiniMax animation of that frame
  (getting up and the juggle start from its own knock-out lying frame). The frames were picked and
  placed with the feet on x=64, the air poses lowered to the other Shades' height and the juggle
  re-centred; frames where the model painted a hit flash were left out. Its ultimate is a 12-frame
  PixMiniMax take ("raises the sword into a column of fire"), nine frames of it kept.
- `<shade>/arsenal/` is built from these sword strips by `tools/bake_hero_weapons.py <shade>`, with
  rows for the sword, fists, spear and axe, exactly like `../hero/arsenal/`. The Ember Shade's spear
  keeps the sword's fire smear, and a few of its frames with no smear take their grip from detection
  (or `EMBER_OVERRIDES`) instead of the Moss Shade's "hide" overrides.
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
  that size, for his select card only, where he stands as tall as the Shades on theirs. In the
  middle of the hero carousel his card holds its first frame, where he faces the player; in the
  other three he turns his back.
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
  attack were picked so the strike lands on the strip's strike frame. His win pose is one frame of the
  win sheet, its blade glowing brighter and dimmer, since the sheet's other win frames wrap the blade in
  flames the weapon bake cannot lift off; `card_win.png` is that pose at 80% of the size for his select
  card, as for the Bokator fighter. `hero_ult.png` is two frames raising the dav, three of its blade
  blazing, the leap, the chop and the kneel over the split ground, from his ultimate sheet. His other
  rows are baked with the `angkor` setting, his gold blade found and taken away like the Bokator
  fighter's, with the frames where a gold arm band was taken for it given their blade line by hand.

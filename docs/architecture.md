# Architecture

A small retro arcade: a Node server, a home page that lists the games, and one folder per game.
There is no bundler. The browser loads native ES modules, and the same files run in Node for tests.

```
apps/
  server/                 Node HTTP server: the games API and the static files
    src/
    test/{unit,integration}
  web/                    everything the browser loads
    index.html            home page: pick a game
    src/
      design/tokens.css   every UI color, font, size, radius, shadow and motion value
      home/               home page modules
    games/
      <game-id>/
        game.json         catalog entry, read by the server
        index.html        the game page
        assets/           sprites, icons, manifest
        styles/           the game page CSS (tokens only)
        src/              game modules
        test/{unit,integration,regression,support}
    test/{unit,integration}  home page tests
scripts/                  thin CLIs (the static site build lives in apps/server/src/static-site/)
tools/eslint-rules/       the project's own lint rules
docs/                     this file
```

## Request flow

1. `GET /` serves `apps/web/index.html`. The home page fetches `api/games`.
2. `GET /api/games` reads every `apps/web/games/*/game.json` and returns `{ games: [...] }`.
3. A card links to `games/<id>/`, which serves that game's `index.html`.

Every URL in the pages is relative, so the same files work under the GitHub Pages sub path.
`npm run build` writes the static site to `dist/`, including `dist/api/games`, because Pages has no server.

## Game: Steel & Dust

The game keeps a strict split:

| Folder        | Job                                                                 | May touch the DOM, canvas or audio? |
| ------------- | ------------------------------------------------------------------- | ----------------------------------- |
| `src/data/`   | tuning tables: moves, weapons, enemies, missions                    | no                                  |
| `src/art/`    | sprite and scene colors (the only JS allowed to hold hex values)    | no                                  |
| `src/sim/`    | the 60 Hz simulation: one `game` object in, the same object changed | no                                  |
| `src/render/` | draws a `game` onto a 2D canvas context it is given                 | canvas only                         |
| `src/audio/`  | synthesized sound and music                                         | Web Audio only                      |
| `src/input/`  | keyboard, gamepad and touch write into `game.input`                 | yes                                 |
| `src/ui/`     | menus, the hero carousel, settings, help, screen fit, full screen   | yes                                 |
| `src/main.js` | wires the pieces together and runs the fixed-step loop              | yes                                 |

The menus stand on two layers shared by all of them, at the back of `#menus`: the Angkor painting
(`.menu-scene`) and one dim (`.menu-dim`). `menuBackdrop` (`src/ui/menus/menu-backdrop.js`) sets
both from the menu stack, so a change of menu fades the dim from one darkness to the next and keeps
the painting up from the title into Settings or the hero select; the menus themselves only cross-fade.
On that layer a canvas (`src/ui/screen/title-scene.js`, drawn by `src/render/title/`, effects in
`src/data/title-scene.js`, colors in `src/art/title-scene.js`) redraws the painting at its own pixel
size and brings the dusk to life: the moat's reflection ripples, the sun glows and throws rays, and
the roads' ambient effects drift through. It draws only while the painting is shown.

A loading screen (`#loader` in `index.html`, `src/ui/loading/`, styles in `styles/loading*.css`) is
up from the first paint: Bokator runs along a naga balustrade before Angkor Wat at dusk, the stone
turning to gold behind him as files settle (its own art, in `assets/ui/loading/`, is preloaded first). The boot
(`src/boot/start-loading.js`) loads every image the menus draw (`src/data/ui-art.js` and each hero's
card strips) and the pixel font before the fighters' sprites, so no menu or popup shows art still on
its way; a file that fails counts as settled and a stalled boot gives up after a time limit. In play
the same screen covers a mission's road and the picked Shade while they load (`missionWait` in
`src/render/scene-loaded.js`), after a short grace so a cached road never flashes it.

The menus and the HUD share one carved-sandstone kit in `assets/ui/` (see its README): nine-slice
frames for the hero cards, the settings panel and the HUD panels, which the HUD draws with
`src/render/nine-slice.js`.

The touch buttons and the stick can be moved and resized (Settings, Button layout). The editor is its
own menu, `layout`, in `src/ui/layout/` with `styles/layout-editor.css`: it drags a copy of the touch
layer's controls and works on a draft (`layout-draft.js`), so only Done saves. The setting
`buttonLayout` holds one layout per orientation, or `null` for the original one in
`styles/touch-buttons.css` and `styles/touch.css`: each control's centre (the five buttons and the
stick) as fractions of the touch layer and a size on top of Button size, checked on load by
`sanitizeButtonLayout` (`src/data/button-layout.js`). `screen-fit.js` applies the layout for the way
the phone is held on every fit: the `custom` class and `--tb-x`, `--tb-y`, `--tb-size` on each button,
`--stick-size` on the stick, and the stick's zone, which becomes the half of the screen the stick
stands on, widened to reach past its rim (`stick-place.js`); `layout.stickRest` gives `TouchStick`
the custom centre to rest on. The buttons come after the zone in the page, so they stay on top of it.

`sim/` reaches the outside world only through `game.io` ports
(`sfx`, `vibrate`, `saveRecords`, `saveHints`, `saveSettings`, `setMuted`), so it runs in Node tests unchanged.

### Missions

The game is twelve missions (`src/data/missions/specs/`), each a road of its own with a painted theme,
a boss, the raiders that boss calls in, crate contents, its way in and its closing wall. A spec only lists its zones
and the raider kinds in each wave; `layoutMission` (`src/data/missions/layout.js`) turns that into
places on the road: zone walls, where each wave starts, crates, its way in and wall, and the mission's
length.

- A zone is one screen or several. On a single screen every wave comes as soon as the field is
  clear. In a wide zone the camera keeps scrolling with the hero, and each wave waits until the
  hero walks up to it with at most one raider left; the last wave of every zone is a lock wave that
  pins the camera to the screen it starts on (`src/sim/stage/zones.js`).
- `screenEdges` (`src/sim/fighters/arena-bounds.js`) is the part of the road a fight happens in: the
  locked screen, or what the camera shows of a wide zone. Raiders walk in from just past it.
- A mission ends when its own boss falls (`isMissionBoss` in `src/sim/stage/mission.js`); a boss met
  earlier on its road is a mid-boss and only opens the road. The score, clock, continues, lives and
  ULT bar carry into the next mission (`enterNextMission`); the hero starts it fresh. Every run
  starts at mission 1; there is no mission select.
- A run has five lives (`START_LIVES` in `src/data/player.js`), shown as hearts under the hero's
  panel (`src/render/hud/lives.js`). Every fall costs one (`loseLife` in `src/sim/stage/lives.js`)
  and nothing gives one back: not a continue, a restart of the mission or a new mission. While lives
  are left, a fallen hero continues where they fell, as any Shade: Continue opens the Shade list,
  and `continueAs` (`src/sim/stage/flow.js`) brings the hero back as the one picked, keeping the
  run. The last fall is Game over: the defeat menu offers only Start from mission 1, a new run with
  five lives, and Quit.
- The walk on to the next mission is never seen: over the end of the clear screen the cleared road
  fades to night (`src/render/overlays/clear-fade.js`), and the next mission fades in from it. A
  mission is drawn and its clock runs only once its painted road has loaded (`missionRoadLoaded`
  in `src/render/scene/backdrop.js`) and so have the picked Shade's strips (`sceneLoaded` in
  `src/render/scene-loaded.js`), so the hero is never drawn as the bare body; until then `main.js` holds the ticks and the screen shows
  `src/render/overlays/loading-screen.js`. Once a road is in, the next mission's road loads behind
  it, so the wait is usually over before the mission is. A file that fails to load still settles,
  and the plain road is drawn in its place.
- The twelve missions are one road, painted end to end with PixelLab (Angkor Wat repainted with
  ChatGPT and turned into pixel art by `tools/painting_layers.py`): six forests from sunrise to
  night (Pine Ridge, Old Grove, Bamboo Pass, Raider Camp, Ember Woods, Firefly Hollow), then out of
  the woods into the desert from dawn to night: Sandstorm Pass (a red-rock canyon in a dawn
  sandstorm), Iron Works (the raiders' foundry at a smoggy midday), Mirage Temple (a half-buried sun
  temple at dusk) and Warden's Fortress (a blood-moon fortress), then out of that night into two
  temples: Angkor Wat at dawn and the Bayon at dusk, the finale, where the Bayon Guardian ends the
  game. A road
  (`src/data/backdrops/<folder>.js`) is layers in `assets/backdrops/<folder>/`: a far plate (wider
  than the view where it holds a sun or moon, so that shows once per screen) and a near strip that
  each tile sideways and scroll at their own share of the camera, and a layer drawn `once` at the
  start of the road, a piece of the road before it (the last trunk of the forest, the canyon mouth,
  the foundry's scaffold, the temple's broken obelisk), so each road walks on from the last
  (`src/render/scene/painted-backdrop.js`; a `once` layer stops drawing when it has scrolled away,
  and a layer that drifts no faster than the far plate keeps still in a screen shake). A road may
  also list `fronts`, layers that scroll faster than the camera and are drawn over the fight, after
  the world and its front air and before the foreground (the Bayon's canopy of fig roots); a road
  without them draws exactly as before. Each road's
  colors for its soil, grass (if any), the clumps in front of the fighters and its air are in
  `src/art/painted-themes/<folder>.js`; `scenePalette` works out the shades.
- A road's air moves on its own (`src/render/scene/ambient/`): mist, birds, leaves, motes, light
  shafts, fireflies, embers and smoke in the forests; a storm that swells and dies
  (`storm.js`) driving gusts, a dust veil, rolling plumes, a dust devil, vultures and tumbleweeds in
  the canyon; furnace glow, sparks, chimney plumes, steam, heat shimmer and ash at the iron works;
  mirage streaks, blue brazier fire, sand trickles, bats and drifting sand at the temple; torch
  flames, lightning and pennants at the fortress; light shafts from the rising sun, egrets, glints
  on the moat (`glints.js`), butterflies (`butterflies.js`), petals and incense smoke at Angkor Wat;
  bats, flames in the fire bowls, embers and fireflies at the Bayon. Each is worked out from the tick count and the
  camera alone, never `Math.random()`, so a replay draws the same frames. In front of the fighters
  lies the road's own foreground kind (`src/render/scene/foreground/`: ferns, scrub and bones, slag
  and chain, ruins, spikes).
- A road carries no loose props, since the painted strips dress it: the only pieces set on it
  (`src/data/missions/props-layout.js`, sprites in `assets/sprites/props/`) are its closing wall
  (`endWall`: the forests' palisade, the canyon barricade, the foundry gate, the temple door, the
  Warden's gate, the temples' naga gate) and, from mission 7 on, its `entry`: the last road's wall broken open, standing
  behind the hero's start. `test/unit/data/missions.test.js` keeps every entry the last road's
  wall plus `Broken`.
- The roads rise and fall: a zone's spec lists its `ground` as shapes from
  `src/data/missions/ground-shapes.js` (`mound`, `bank`, `ramp`, `terrace`, `ledge`, `stairs`,
  `dais` for temple steps walked up and down, and `contour` for any outline walked leg by leg) and
  its `platforms` (each road's own deck: plank trestles, scaffolds, iron catwalks, temple slabs,
  ramparts and the temples' sandstone lintels). Each zone's shape has a job: a high ground to fight from, a deck for the throwers, a
  hollow, gentle lock screens and level boss arenas. `layoutTerrain`
  (`src/data/missions/terrain.js`) turns them into a height for every pixel of the road and the
  platforms' tops, kept on `mission.terrain` and `game.terrain`; a road with no shapes has no
  height table at all and stays at `GROUND_Y`.
  `src/sim/stage/terrain.js` reads it (`groundAt`, `floorBelow`, `isWall`, `STEP_UP`): fighters walk
  slopes and steps up to 8px, taller rises are walls, platforms only catch what comes down onto them
  and down + jump drops through (`src/sim/fighters/terrain-motion.js`), and crates, pickups, bombs,
  fire, shockwaves and summons all use the floor where they are. Raiders use it too
  (`src/sim/brains/enemy/climb.js`, `hop.js`, `perch.js`): melee raiders hop up to the hero, drop
  off decks and hop walls in their way, and only swing at a hero on their own level; ranged raiders
  climb onto a nearby deck and throw down, their shots aimed by `src/sim/hazards/shot-aim.js`.
  `test/unit/data/terrain-rules.test.js`
  keeps every road fair: level starts, zone walls and boss arenas, gentle lock screens, no wall over
  24px, platforms within jumping reach and every crate on level ground. The road is drawn from the
  backdrop's painted cross-section (`ground.png`) laid along the surface
  (`src/render/scene/terrain-ground.js`), and the decks from `assets/sprites/platforms/` with legs
  grown to the ground. A backdrop with `cliff: true` also loads `cliff.png` (about 12x64, the face
  of a step whose high ground is on the left, mirrored once on load for the other way): every sheer
  step is drawn with that face hung from its lip and cut off at the low ground, the high side's turf
  rounded over the shoulder and hanging a pixel past it, and a soft contact shadow at its foot
  (`src/render/scene/cliff-faces.js`). Only the drawing rounds the shoulder; fighters still stand
  on the sheer step.

Fighters are drawn from PixelLab sprite sheets in `assets/sprites/`: one folder of strips per playable
Shade (`src/data/heroes.js`, all four loaded at the start) and one sheet per enemy
(`src/data/enemies/enemy-sprites.js`). `src/sim/hero-animation.js` and `src/sim/enemy-animation.js`
pick the frame for a fighter's state; colors that belong to a Shade live in `src/art/hero-themes.js`.
A boss is drawn at its `scale` (`spriteSize` in `src/render/fighters/enemy-sprites.js`), two to
three times the hero's height, and its hit and hurt boxes grow with it; raiders are drawn at the
size of their sheets. Where a boss's effects leave its body (a mouth, eyes, a fist, the furnace in a
chest) is a `bodyPoint` (`src/sim/fighters/body-point.js`) given at scale 1 and grown with the
boss, so an effect leaves the same spot on its art at any size; a boss keeps its whole body on
screen (`arenaBounds`). Its body as drawn (`src/data/enemies/boss-bodies.js`) sets the hurt box a
hero's blows land on, mirrored as it turns, how far its shared swings reach (`swingBox`), and how
much of it others are kept off (`src/sim/fighters/separate.js`).
A Shade's `arsenal/` strips are baked from its sword strips by `tools/bake_hero_weapons.py`, which
also dresses the Moss, Firefly, Antler Spirit and Blue Shades and their ultimate in their element
(`tools/shade_fx/`: grove moss and spores, a firefly swarm, teal ghost fire, frost), drawn into the
pixels of every frame the way the Ember Shade's frames burn. The two Khmer fighters' select cards
play loops drawn for them, `card_pose.png` and `card_idle.png`, cut from their sheets and lit by
`tools/hero_cards/`.

Each Shade fights in its own style and has its own ultimate:

- `src/data/styles/` turns every weapon's moves into a Shade's moves once, at load
  (`heroMoves(heroId, weaponId)`); `movesetOf(game, fighter)` hands the hero the chosen Shade's set.
  A Shade's own techniques (`src/data/styles/techniques/`) join every weapon's set unscaled, linked
  off the heavies' free light follow-ups (`technique-links.js`): `K J`, `K K J`, `K K K J`, `Air K J`.
- `src/sim/summons/` runs what a Shade calls up: thorns, fireflies, spirit stags, ice, flame
  pillars, the fire on a burning raider, the phoenix, the golden lion, the Angkor Warrior's carved
  soldiers and one-shot bursts, kept in `game.summons`; the phoenix and the lion fly a list of points
  (`flight.js`), and a point may carry a hop, so the lion bounds to it in an arc and lands there. A carved soldier is drawn from the strips of the hero who raised it, carved in
  sandstone (the frame's own light and shade under the stone's color, a `relief` copy in
  `src/render/fighters/tint.js`), rising out of the ground behind the fighters
  (`src/render/fx/soldiers.js`, the carving itself in `carved.js`); a finisher's soldier thrusts
  once. The Angkor Warrior's ultimate leaves `hangingCut`s of gold on the raiders he cuts through
  (`src/sim/summons/hanging-cuts.js`, drawn by `src/render/fx/hanging-cuts.js`), riding them until
  they all land at once, and a `carving` of him in sandstone where he stopped after each cut
  (`src/sim/summons/carvings.js`, `src/render/fx/carvings.js`), which swings with them and crumbles.
  What stands behind the fighters stands in the hero's light over the dimmed world in an ultimate.
  Bokator's ultimate leaves gold `echo`es of him where his rush lands each blow
  (`src/sim/summons/echoes.js`), drawn the same way from his strips in gold behind the fighters
  (`src/render/fx/echoes.js`); each strikes its raider again, holds the blow and, once woken, flares
  as a lion rises out of it. A burst may be marked `behind` to rise behind the fighters too. An
  ultimate frame may name its own weapon row (`[strip, frame, row]`), so he fights his whole ultimate
  bare-handed whatever he holds, and an ultimate marked `bareHanded` shows the hero bare-handed in
  its cut-in too. A move's signature
  (`thorns`, `fireflies`, `stags`, `pillars`, `lions`, `soldiers`, and the name call-out of a
  `technique`) fires on its first active frame; a style's `weapons` patch marks every move of one
  weapon (the Ember Shade's spear moves all carry `feathers`, a burst where each hit lands); what a landed move leaves on the raider is in
  `src/sim/combat/afflict.js`: `freeze` encases it (`src/sim/combat/freeze.js`), `shatters` breaks
  that ice at once, and `burn` sets it alight, losing a little health every so often without
  flinching (`src/sim/summons/burn.js`).
- `src/sim/ultimates/` holds one timeline per Shade, picked by `game.settings.hero`; the numbers are in
  `src/data/ultimates/`. The effect strips are in `assets/sprites/fx/` (`src/data/fx-sprites.js`).
  The Angkor Warrior's chop opens a `fissure` effect (`src/sim/fx/fissure.js`, drawn by
  `src/render/fx/fissure.js`): a crack fixed to the road that runs out to both screen edges with
  light rising out of it.

Bosses are moving from one shared brain to a kit each (the plan for all twelve is in
`docs/boss-kits.md`). A boss without a kit swipes, slams and charges (`src/sim/brains/enemy/boss.js`).
A boss with one (`src/data/enemies/boss-kits/`) is run by `src/sim/brains/enemy/boss-kit.js`: it moves
its own way (`boss-movement.js`: Gravel Khan's `duelist` backs off, closes and feints; the Rust
Colossus's `bulldozer` walks in and never steps back; Ironhorn's `bull` keeps room to run; the Cobra
Matriarch's `slither` keeps the middle distance; the Scorpion Queen's `scuttle` darts to and fro at
the edge of her sting's reach; the Gnoll Packlord's `packHunter` darts in and out; the Storm Djinn's
`floater` drifts at the edge of his reach and, crowded, whirls away across the arena; the Furnace
Knight's `juggernaut` walks in, never backs off and vents steam; the Sand Pharaoh's `illusionist`
glides at the middle distance and, crowded, steps out of the sand at the far end; the Naga Raja's
`glider` glides in bursts at the middle distance and glides back from a hero who crowds her; the
Bayon Guardian's `colossus` stomps in, never steps back, and shakes the road at each footfall,
`src/sim/bosses/stomp.js`; the Warden Ox's `warden` comes on in measured strides and never gives
ground), swings its
`close` moves in reach, picks its `skills` by range, chance and cooldown, and on its own road (never as
a mid-boss) looses its `ultimate` below a share of its health, again every so often. Below half
health its `phaseTwo` moves quicker, shortens the cooldowns, may chain a skill and may `swap` one for
a stronger one, and its `opener` (the Bayon Guardian's crumbling) plays once as it crosses the line.
Its moves live with the other enemy moves (`src/data/enemies/moves/khan-moves.js`,
`colossus-moves.js`, `ironhorn-moves.js`, `cobra-moves.js`, `queen-moves.js`, `gnoll-moves.js`,
`djinn-moves.js`, `furnace-moves.js`, `pharaoh-moves.js`, `naga-moves.js`, `guardian-moves.js`) and each plays a strip of its name (or the one its `strip` names) in its sheet on
its own timeline (`frameAt`, the tick each frame starts on; `loopFrames`, a run of frames looped
while the move is active, for a rush or a daze; `frameOrder`, the strip's frame each step shows,
where a strip plays back on itself or skips a frame). A rush that meets the arena's wall turns into the
move its `wallNext` names (`src/sim/bosses/wall-hit.js`): Ironhorn is left dazed when his Horn Rush
misses, and his Stampede turns and runs back twice; every wall hit bursts and knocks a bamboo stalk
into the arena (`src/sim/hazards/bamboo.js`), unless the turn is `soft`, as the Gnoll's five frenzy
lunges are. What a move does at
set ticks is in `src/sim/bosses/move-cues.js`: the sword `glint` (a burst), the ultimate's call-out
(`announce.js`), the war `horn` that calls the road's raiders (`war-horn.js`), the `crescents`, waves
that skim the road (`src/sim/hazards/crescents.js`), the lobbed `boulder` and the landslide's
`rockfall` (`src/sim/hazards/boulders.js`, `src/sim/bosses/rockfall.js`: a boulder breaks where it lands,
a lobbed one into shards that skid both ways), the `stars` round a dazed head, the `spikes` that burst up in a row under cracks in the
road (`src/sim/hazards/spikes.js`; a shot's `armed` rule lets a spike strike only while it stands) and
the `quakes`, shockwaves of the ground pounded, the venom `globs` that arc onto marked spots and
spread into puddles burning whoever stands in them (`src/sim/hazards/venom-globs.js`), and the
Cobra's `gaze` (`src/sim/bosses/hypnotic-gaze.js`): a hero facing her when her eyes flash is held
still for her lunge, which stops where it bites (`stopOnHit`). The Scorpion Queen's burrow
(`src/sim/bosses/burrow.js`) sinks her `underground` (no hurt box, no shove, no shadow: `isOutOfReach`
in `src/sim/combat/boxes.js`, which also covers a move's `vanish`), her mound `tunnel`s after the hero, stops (a `rumble` only sprays
sand) and turns into the move its `then` names, the `emerge` that `erupts` up under the hero; her
Tail Sting leaves `poison` (`src/sim/summons/poison.js`), which bites a little at a time and never
takes the last of a life; her Hive Swarm's `swarm` sends wasps across the screen, low or high, each
waiting at the edge while its lane is marked (`src/sim/hazards/wasps.js`). The Gnoll Packlord's
`howls` ring out and call hounds in from both sides; his Leaping Maul (`leapAt`) springs onto the
spot the hero stands on, marked on the ground till he lands (`src/sim/hazards/pounce-mark.js`), and
his Blood Frenzy lunges trail red from his eyes, leave red afterimages (a move's `ghost`) and feed
him on each hit (`heals`; all in `src/sim/bosses/pack-hunt.js`). The Storm Djinn's Thunder Fist
looses a `thunderBolt` that dives from his fist to run along the floor (`src/sim/hazards/thunder-bolts.js`);
his `devils` drift after the hero, pull a hero on the ground in and throw them high
(`src/sim/hazards/dust-devils.js`); his Eye of the Storm's `storm` marks waves of spots round the
hero and then one great one, each struck by lightning that whites out the screen
(`src/sim/bosses/eye-of-storm.js`, `src/sim/hazards/storm-strikes.js`; their rules in
`storm-rules.js`). The Furnace Knight's Fire Flail sets a row of `blaze`s burning on the road
(`src/sim/hazards/blazes.js`), his Slag Pot arcs onto a marked spot and breaks into a lava pool
(`slag-pots.js`), and his Meltdown roars, then looses `lances` of flame from his chest that dive
to a hero's waist and run level (`flame-lances.js`, `src/sim/bosses/furnace.js`) and goes on, through `then`, into a move that is
`exposed`: an exposed boss takes double damage and every hit where it stands, staying in its move
(`src/sim/combat/apply-hit.js`); burning ground and lava are `groundOnly`, burning only feet on the
ground (`src/sim/hazards/shot-hits.js`; their rules in `forge-rules.js`). The Sand Pharaoh's
`mirages` are copies of him kept on the boss (`src/sim/bosses/mirage.js`, `mirage-run.js`): they
step out of the sand with him, move as he moves, fire `mirageBolt`s in phase two
(`src/sim/hazards/mirage-bolts.js`) and pop at one blow, as the jars break
(`src/sim/bosses/pharaoh-targets.js`, called where blows and the hero's shots break crates); his
`blink` steps him out at the far end, his `scarabs` crawl along the floor (`scarabs.js`), and his
`curse` (`src/sim/bosses/sun-curse.js`) raises three canopic jars (`canopic-jars.js`) and hangs the
sun's eye over the hero (`curse-marks.js`): every jar broken in time sends him into `sunBroken`,
reeling, and a jar left standing at `releaseAt` brings the sunfall down on the hero (rules in
`temple-rules.js`). The Naga Raja's coil crashes in a `splash` (`src/sim/bosses/naga.js`), her
`tides` roll along the floor from the front of her coil (`src/sim/hazards/tides.js`), her Seven
Heads' `heads` each spit a water naga that waits at its mouth while its lane is marked and dives to
it, low or high (`naga-bolts.js`), and her Rainbow Naga gathers the rainbow in her hand, sends a
spirit naga sweeping the floor from each side and marks the spot a serpent of water bursts up out
of (`spirit-nagas.js`; their rules in `moat-rules.js`). The Bayon Guardian's cues are gathered in
`src/sim/bosses/bayon-cues.js`: his `gaze` marks the ground under the hero, and either side of it in
phase two, and a gold pillar bursts there that leaves the hero `stoned`, slowed to under half pace
for a while (`src/sim/hazards/gaze-pillars.js`, `src/sim/summons/stone-skin.js`, through
`afflict.js`); his `roots` burst along the floor and then under the hero (`fig-roots.js`); his
`faces` rise at the screen's edges in turn and breathe a beam at a hero's waist across most of the
arena (`stone-faces.js`); and his crumble falls to rubble out of reach and reforms him `glowing`
(`src/sim/bosses/crumble.js`; rules in `bayon-rules.js`). The Warden Ox's `hook` (`src/sim/hazards/chain-hook.js`, `chain-pull.js`)
flies at the hero's waist (jump it), drags a hero it catches to where his chop lands and lets go as he raises
the axe; his `guard` (`src/sim/bosses/guard-counter.js`) turns every blow from the front as a block
would, but a parry: the striker reels and he answers with `guardStrike`; his Executioner's Round
spins him with a red `whirl` that follows his body (a burst with `follow`, `src/sim/summons/bursts.js`)
and ends in a `cleave` (`src/sim/bosses/executioner.js`) whose crack runs off both ways at a steady
pace, each running end a `rift` read from the same reach as the drawn fissure (`rifts.js`; rules in
`warden-rules.js`). They are all projectiles,
drawn from the `fx/` strips (`src/render/fx/rock-hazards.js`, `venom-hazards.js`,
`wasp-hazards.js`, `storm-hazards.js`, `forge-hazards.js`, `temple-hazards.js`, `moat-hazards.js`,
`bayon-hazards.js`, `stone-face-draw.js` with the face's beam drawn in code in `face-beam.js` and
`beam-flares.js`, `warden-hazards.js`, gathered in
`boss-hazards.js`; the copies are drawn with the boss in `src/render/fighters/mirages.js`); a
puddle, a lava pool, a jar or a stone face, standing on the
road, is drawn under the fighters' feet, and so is the mark of a lightning strike, while the strike
itself is drawn over them. While an ultimate
gathers and plays the world dims behind the boss in its own color (`src/render/fighters/boss-ultimate.js`,
colors in `src/art/boss-colors.js`), a rush or wave marks its lane on the ground, and a boulder its
landing spot.

The loop runs the simulation at exactly 60 ticks a second and renders once per animation frame.
A frame that runs several ticks offsets each tick's sounds (`audio.setTickOffset`) so they keep their spacing.

Long sessions must not grow:

- Every one-shot sound and every step of the music is built through `playOneShot`
  (`src/audio/live/one-shot.js`), and bank voices release themselves the same way: when the last
  source ends, every node it built is disconnected. Safari keeps connected nodes in the audio graph,
  so anything left connected piles up run after run until the sound stutters and stops.
- Flashes, glows and afterimages tint one frame at a time into a small least-recently-used cache
  (`src/render/fighters/tint.js`), never a whole sprite sheet.
- `test/regression/bugs/audio-node-leak.test.js`, `tint-memory.test.js` and
  `test/integration/sim/long-run.test.js` hold these lines.

### Behavior lock

`test/regression/` replays bot-played scenarios and compares every 30th tick and every rendered frame
against recorded fixtures: two long runs as the Moss Shade (first captured from the original
single-file game), one shorter run for each of the other Shades, one against each boss kit (Gravel Khan, the Rust
Colossus, Ironhorn, the Cobra Matriarch, the Scorpion Queen, the Gnoll Packlord, the Storm Djinn, the
Furnace Knight, the Sand Pharaoh, the Naga Raja, the Bayon Guardian), one run
through the wide zones
of the fourth mission, one over the hills of the third, one through the seventh, the sandstorm canyon,
and one through the twelfth, the Bayon.
Any change to
arithmetic, to the order of `Math.random()` calls or to the order of canvas calls shows up there.
When a change is meant to alter behavior, regenerate the fixtures with `npm run test:regression -- -u`
and review the diff.
The replays swap `Math.sin` and `Math.cos` for a port of V8's fdlibm (`test/support/portable-trig.js`):
on Apple Silicon the native ones round about one result in 200 differently from x64, where the
fixtures were recorded and CI runs, so without it a Mac fails runs no change touched.

## Tests

Each app keeps its tests next to it, split by kind, and Vitest runs them as three projects:

| Folder              | Project       | What belongs there                                                                                                                                |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/unit/`        | `unit`        | one plain function or module at a time                                                                                                            |
| `test/integration/` | `integration` | several modules together: the real HTTP server, the home page and the game menus on their real markup (happy-dom), whole fights in the simulation |
| `test/regression/`  | `regression`  | the recorded game runs and sound bank, and one test per fixed bug (`regression/bugs/`, `regression/past-fixes/`)                                  |

`apps/web/games/steel-and-dust/test/support/` holds the scenario bot, the recording canvas and the
game drivers the regression and integration tests share.

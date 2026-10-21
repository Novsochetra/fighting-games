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

The menus and the HUD share one carved-sandstone kit in `assets/ui/` (see its README): nine-slice
frames for the hero cards, the settings panel and the HUD panels, which the HUD draws with
`src/render/nine-slice.js`.

The touch buttons can be moved and resized (Settings, Button layout). The editor is its own menu,
`layout`, in `src/ui/layout/` with `styles/layout-editor.css`: it drags a copy of the touch layer's
buttons and works on a draft (`layout-draft.js`), so only Done saves. The setting `buttonLayout` holds
one layout per orientation, or `null` for the original one in `styles/touch-buttons.css`: each button's
centre as fractions of the touch layer and a size on top of Button size, checked on load by
`sanitizeButtonLayout` (`src/data/button-layout.js`). `screen-fit.js` applies the layout for the way
the phone is held on every fit, as the `custom` class and `--tb-x`, `--tb-y`, `--tb-size` on each button.

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
- The twelve missions are one road, painted end to end with PixelLab: six forests from sunrise to
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

Each Shade fights in its own style and has its own ultimate:

- `src/data/styles/` turns every weapon's moves into a Shade's moves once, at load
  (`heroMoves(heroId, weaponId)`); `movesetOf(game, fighter)` hands the hero the chosen Shade's set.
  A Shade's own techniques (`src/data/styles/techniques/`) join every weapon's set unscaled, linked
  off the heavies' free light follow-ups (`technique-links.js`): `K J`, `K K J`, `K K K J`, `Air K J`.
- `src/sim/summons/` runs what a Shade calls up: thorns, fireflies, spirit stags, ice, flame
  pillars, the fire on a burning raider, the phoenix, the golden lion, the Angkor Warrior's carved
  soldiers and one-shot bursts, kept in `game.summons`; the phoenix and the lion fly a list of points
  (`flight.js`), and a point may carry a hop, so the lion bounds to it in an arc and lands there. A carved soldier is drawn from the strips of the hero who raised it, in flat
  sandstone behind the fighters (`src/render/fx/soldiers.js`). A move's signature
  (`thorns`, `fireflies`, `stags`, `pillars`, `lions`, `soldiers`, and the name call-out of a
  `technique`) fires on its first active frame; a style's `weapons` patch marks every move of one
  weapon (the Ember Shade's spear moves all carry `feathers`, a burst where each hit lands); what a landed move leaves on the raider is in
  `src/sim/combat/afflict.js`: `freeze` encases it (`src/sim/combat/freeze.js`), `shatters` breaks
  that ice at once, and `burn` sets it alight, losing a little health every so often without
  flinching (`src/sim/summons/burn.js`).
- `src/sim/ultimates/` holds one timeline per Shade, picked by `game.settings.hero`; the numbers are in
  `src/data/ultimates/`. The effect strips are in `assets/sprites/fx/` (`src/data/fx-sprites.js`).

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
single-file game), one shorter run for each of the other Shades, one run through the wide zones
of the fourth mission, one over the hills of the third, one through the seventh, the sandstorm canyon,
and one through the twelfth, the Bayon.
Any change to
arithmetic, to the order of `Math.random()` calls or to the order of canvas calls shows up there.
When a change is meant to alter behavior, regenerate the fixtures with `npm run test:regression -- -u`
and review the diff.

## Tests

Each app keeps its tests next to it, split by kind, and Vitest runs them as three projects:

| Folder              | Project       | What belongs there                                                                                                                                |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test/unit/`        | `unit`        | one plain function or module at a time                                                                                                            |
| `test/integration/` | `integration` | several modules together: the real HTTP server, the home page and the game menus on their real markup (happy-dom), whole fights in the simulation |
| `test/regression/`  | `regression`  | the recorded game runs and sound bank, and one test per fixed bug (`regression/bugs/`, `regression/past-fixes/`)                                  |

`apps/web/games/steel-and-dust/test/support/` holds the scenario bot, the recording canvas and the
game drivers the regression and integration tests share.

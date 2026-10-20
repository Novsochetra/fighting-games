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
| `src/ui/`     | menus, settings, help, screen fit, full screen                      | yes                                 |
| `src/main.js` | wires the pieces together and runs the fixed-step loop              | yes                                 |

`sim/` reaches the outside world only through `game.io` ports
(`sfx`, `vibrate`, `saveRecords`, `saveHints`, `saveSettings`, `setMuted`), so it runs in Node tests unchanged.

### Missions

The game is twelve missions (`src/data/missions/specs/`), each a road of its own with a scene theme, a
boss, the raiders that boss calls in, crate contents and roadside props. A spec only lists its zones
and the raider kinds in each wave; `layoutMission` (`src/data/missions/layout.js`) turns that into
places on the road: zone walls, where each wave starts, crates and props, and the mission's length.

- A zone is one screen or several. On a single screen every wave comes as soon as the field is
  clear. In a wide zone the camera keeps scrolling with the hero, and each wave waits until the
  hero walks up to it with at most one raider left; the last wave of every zone is a lock wave that
  pins the camera to the screen it starts on (`src/sim/stage/zones.js`).
- `screenEdges` (`src/sim/fighters/arena-bounds.js`) is the part of the road a fight happens in: the
  locked screen, or what the camera shows of a wide zone. Raiders walk in from just past it.
- A mission ends when its own boss falls (`isMissionBoss` in `src/sim/stage/mission.js`); a boss met
  earlier on its road is a mid-boss and only opens the road. The score, clock, continues and ULT bar
  carry into the next mission (`enterNextMission`); the hero starts it fresh. Beating mission N
  unlocks mission N + 1 on the title's mission select (`records.bestMission`).
- Missions 1 to 6 walk through six painted forests, sunrise to night; missions 7 to 10 are desert
  roads ending at Warden's Fortress under a blood moon; missions 11 and 12 walk on into two painted
  temples, Angkor Wat at dawn and the Bayon at dusk, where the Bayon Guardian ends the game.
  Forests and temples are painted roads alike (`src/data/backdrops.js`, the temples' entries in
  `src/data/temple-backdrops.js`): PixelLab layers in `assets/backdrops/<folder>/`, a far plate, a
  near strip and sometimes a middle layer, that each tile sideways and scroll at their own share of
  the camera (`src/render/scene/painted-backdrop.js`), with colors for its road, ferns and air in
  `src/art/forest-themes.js`. A road may also list `fronts`, layers such as an overhanging canopy
  that scroll faster than the camera and are drawn over the fight, after the world and its front
  air and before the foreground ferns; a road without them draws exactly as before. Its air moves
  on its own (`src/render/scene/ambient/`): mist, birds, bats, leaves and petals, motes,
  butterflies, light shafts, glints on water, fireflies, and flames, embers and smoke at points of
  the near strip, each worked out from the tick count and the camera alone, never `Math.random()`,
  so a replay draws the same frames. Its road carries no loose props, since the painted strips
  dress it; a palisade closes a forest road and a stone naga gate a temple road
  (`assets/sprites/props/`).
- The painted roads rise and fall: a zone's spec lists its `ground` as shapes from
  `src/data/missions/ground-shapes.js` (`mound`, `bank`, `ramp`, `stairs`) and its `platforms`
  (plank decks in the forests, sandstone ledges in the temples). `layoutTerrain` (`src/data/missions/terrain.js`) turns them into a height for every
  pixel of the road and the platforms' tops, kept on `mission.terrain` and `game.terrain`; a flat
  road has no height table at all, so the desert roads keep their arithmetic exactly.
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
  forest's painted cross-section laid along the surface (`src/render/scene/terrain-ground.js`), and
  the decks from `assets/sprites/platforms/` with legs grown to the ground. The temple roads are
  built from the same shapes as raised causeways, terraces with walkable steps, steep stairs that
  need a jump and root-heaved mounds. A shape may run on past the end of the road, since `groundAt`
  holds the last height, so Angkor Wat's boss arena stands level 16px above the road.
- Each desert theme in `src/art/scene-themes.js` gives a few base colors and a skyline kind (`city`,
  `dunes`, `factory`, `ruins`); `scenePalette` works out every other shade, and each mission's far
  scenery is painted once, the first time it is drawn (`src/render/scene/backdrop.js`).

Fighters are drawn from PixelLab sprite sheets in `assets/sprites/`: one folder of strips per playable
Shade (`src/data/heroes.js`, loaded the first time it is picked) and one sheet per enemy
(`src/data/enemies/enemy-sprites.js`). `src/sim/hero-animation.js` and `src/sim/enemy-animation.js`
pick the frame for a fighter's state; colors that belong to a Shade live in `src/art/hero-themes.js`.

Each Shade fights in its own style and has its own ultimate:

- `src/data/styles/` turns every weapon's moves into a Shade's moves once, at load
  (`heroMoves(heroId, weaponId)`); `movesetOf(game, fighter)` hands the hero the chosen Shade's set.
  A Shade's own techniques (`src/data/styles/techniques/`) join every weapon's set unscaled, linked
  off the heavies' free light follow-ups (`technique-links.js`): `K J`, `K K J`, `K K K J`, `Air K J`.
- `src/sim/summons/` runs what a Shade calls up: thorns, fireflies, spirit stags, ice and one-shot
  bursts, kept in `game.summons`. A move's signature (`thorns`, `fireflies`, `stags`, and the name
  call-out of a `technique`) fires on its first active frame; `freeze` encases the raider it lands on
  (`src/sim/combat/freeze.js`) and `shatters` breaks that ice at once.
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
of the fourth mission, one over the hills of the third and one through the seventh, a desert road.
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

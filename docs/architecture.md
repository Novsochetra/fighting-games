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

The game is ten missions (`src/data/missions/specs/`), each a road of its own with a scene theme, a
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
- Each theme in `src/art/scene-themes.js` gives a few base colors and a skyline kind (`city`,
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
of the fourth mission and one through the seventh, a desert road. Any change to
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

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
| `src/data/`   | tuning tables: moves, weapons, enemies, stage                       | no                                  |
| `src/art/`    | sprite and scene colors (the only JS allowed to hold hex values)    | no                                  |
| `src/sim/`    | the 60 Hz simulation: one `game` object in, the same object changed | no                                  |
| `src/render/` | draws a `game` onto a 2D canvas context it is given                 | canvas only                         |
| `src/audio/`  | synthesized sound and music                                         | Web Audio only                      |
| `src/input/`  | keyboard, gamepad and touch write into `game.input`                 | yes                                 |
| `src/ui/`     | menus, settings, help, screen fit, full screen                      | yes                                 |
| `src/main.js` | wires the pieces together and runs the fixed-step loop              | yes                                 |

`sim/` reaches the outside world only through `game.io` ports
(`sfx`, `vibrate`, `saveRecords`, `saveHints`, `saveSettings`, `setMuted`), so it runs in Node tests unchanged.

The loop runs the simulation at exactly 60 ticks a second and renders once per animation frame.
A frame that runs several ticks offsets each tick's sounds (`audio.setTickOffset`) so they keep their spacing.

### Behavior lock

`test/regression/` replays two long bot-played scenarios and compares every 30th tick and every
rendered frame against fixtures captured from the original single-file game. Any change to
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

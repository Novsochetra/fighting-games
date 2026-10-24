# Project rules

A retro arcade: a Node server with a games API, a home page that lists the games, and the games
themselves. Read `docs/architecture.md` before changing structure.

## Commands

| Command              | What it runs                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | the server on http://localhost:8765, restarting on change           |
| `npm run check`      | lint, format check and every test; run it before you call work done |
| `npm run lint`       | ESLint and Stylelint                                                |
| `npm run format`     | Prettier, writes files                                              |
| `npm test`           | all Vitest projects: `unit`, `integration`, `regression`            |
| `npm run build`      | a static copy of the site in `dist/` (Railway serves the source)    |
| `npm run db:migrate` | applies new migrations to the Postgres at `DATABASE_URL`            |

## Coding

- Simplest solution that works. Small files and functions with one job each. Lint enforces size and
  complexity limits (150 lines a file, 40 lines a function, complexity 10, depth 3, 4 parameters);
  split code instead of raising limits.
- Put code where it belongs (see `docs/architecture.md`). No god objects, god functions or god files.
- No comments that say what code does. Only write a comment to explain **why** something non-obvious
  is done (workarounds, platform quirks, security reasons).
- Lint enforces this for `/** */` and `/* */` blocks in app and package source (`local/no-jsdoc-blocks`
  in `eslint.config.js`) and for section banners (`local/no-banner-comments`): write a why as a short
  `//` comment.
- No `TODO` / `FIXME` comments (`no-warning-comments`). Put follow-up work in the tracker as a ticket.
- Put logic in plain functions with unit tests. Components and route handlers stay thin.
- Each game is independent: it loads nothing from outside its own folder, and the home page loads
  nothing from a game (`apps/web/test/integration/independence.test.js` checks both). Never share a
  file, token or module between the home page and a game, or between games.
- The home page's UI colors, type, radii, shadows and motion come from `apps/web/src/home/tokens.css`,
  and each game's from its own `games/<id>/styles/tokens.css`. No raw hex values in components
  (`local/no-raw-hex`, Stylelint). Colors painted on a game's canvas (sprites, scenery, effects, HUD)
  are pixel-art data, like the PNGs, and live only in that game's `src/art/` palette files, the one
  place lint allows hex in JS.
- Never install packages without asking; concurrent installs corrupt `node_modules`.

## Code style

- Write self-explaining code: descriptive names, no single-letter names except `x`, `y`, `i`, `j`.
- Keep comments minimal: no comments that restate the code, no section-banner comments, no long
  JSDoc on obvious functions.
- Prettier owns formatting (`.prettierrc.json`).

## Testing

- Unit tests are not enough. Each change needs the right mix of:
  - **unit** tests (`test/unit/`) for plain functions,
  - **integration** tests (`test/integration/`) for modules working together: the HTTP server, the
    home page against the real catalog, the game simulation running many systems at once,
  - **regression** tests (`test/regression/`) that lock in fixed bugs and the game's recorded behavior.
- Fixing a bug: first write a test that reproduces it and fails, then fix it, then keep the test.
- Verify your work: run `npm run check`, and look at UI changes in a browser.
- Changing game behavior on purpose (balance, new moves) changes the recorded runs in
  `test/regression/fixtures/`: update them with `npm run test:regression -- -u` and review the diff.

## Layout of a game

`apps/web/games/<id>/` holds `game.json` (the catalog entry), `index.html`, `assets/`, `styles/`
(with the game's own `tokens.css`), `src/` and `test/`. Adding a folder with a valid `game.json` adds the game to the home page.
A game hosted on its own site keeps only `game.json` (with an `https:` `url`) and `assets/` here.

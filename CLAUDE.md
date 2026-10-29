# Project rules

A retro arcade: a Node server with a games API, the arcade itself (a React and TypeScript app, built
by Vite, whose home lists the games), and the games themselves. Read `docs/architecture.md` before
changing structure.

## Commands

| Command              | What it runs                                                       |
| -------------------- | ------------------------------------------------------------------ |
| `npm run dev`        | the server on http://localhost:8765 with Vite, reloading on change |
| `npm run check`      | lint, format, types, every test and the build; run it before done  |
| `npm run lint`       | ESLint and Stylelint                                               |
| `npm run format`     | Prettier, writes files                                             |
| `npm run typecheck`  | TypeScript over the arcade (`tsconfig.json`)                       |
| `npm test`           | all Vitest projects: `unit`, `integration`, `regression`           |
| `npm run build`      | the arcade into `dist/`, which `npm start` and Railway serve       |
| `npm run db:migrate` | applies new migrations to the Postgres at `DATABASE_URL`           |

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
- Each game is independent: it loads nothing from outside its own folder but the shared packages
  (`apps/web/packages/`), and the home page loads nothing from a game
  (`apps/web/test/integration/independence.test.js` checks both). Never share a file, token or
  module between the home page and a game, or between games: code a second game needs goes in a
  package (see "Shared packages").
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
- Prettier owns formatting (`.prettierrc.json`), but it never adds a blank line, so space code into
  steps yourself. Put a blank line:
  - after the setup (the `const`s that gather what a function needs), before its logic,
  - after a block (`if`, `for`, `try`, `switch`) that closes with `}` when more code follows,
  - after an early return (`if (!pad) { ...; return; }`),
  - before the final `return`, unless it is the only line of the function,
  - between the methods of an object.

  Never put one right after `{` or right before `}`. Blank lines don't count toward the lint size
  limits (`skipBlankLines` in `eslint.config.js`).

  ```js
  function rumblePad(navigator, rumbles) {
    const pads = navigator.getGamepads?.();
    const actuator = pads && firstStandardPad(pads)?.vibrationActuator;

    if (actuator?.playEffect) {
      rumble(actuator, rumbles);
    }
  }
  ```

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

## Versions

The arcade's version is SemVer, the `version` in the root `package.json`; each build adds its
commit after a `+` (`1.0.0+5f272d9`, see "The build" in `docs/architecture.md`). Raise it without
being asked, in the change that ships something players see:

- `npm version patch --no-git-tag-version` for fixes, balance and tuning, art and sound redone,
- `npm version minor --no-git-tag-version` for something new: a game, a screen, a mode, a hero, a
  mission, a move,
- `npm version major --no-git-tag-version` only for a change that breaks what a player keeps (their
  saves, an installed arcade), and only once the user agrees.

A change players never see (tests, docs, tooling, a refactor) keeps the version. A branch raises it
once, by the most its change needs, over the version on `main` as it merges; say in the reply which
version it now is.

## Layout of a game

`apps/web/games/<id>/` holds `game.json` (the catalog entry), `index.html`, `assets/`, `styles/`
(with the game's own `tokens.css`), `src/` and `test/`. Adding a folder with a valid `game.json` adds the game to the home page.
A game hosted on its own site keeps only `game.json` (with an `https:` `url`) and `assets/` here.

## Shared packages

Code more than one game uses (input, controls, screen fit) is a package, `apps/web/packages/<name>/`
with `src/` and `test/`, instead of a copy in each game (see "Shared packages" in
`docs/architecture.md`):

- it knows no game: it loads only packages, and the game passes in what is its own (its actions, its
  key and button maps, its cues),
- it has no colors or art of its own; what it draws reads the game's tokens,
- a game imports it by its path (`../../../../packages/input/src/gamepad.js`), nothing installed;
  the build joins it into the game's own bundles, so a shipped game still loads only its folder,
- a change to it reaches every game that uses it, so it keeps its own tests and `npm run check`
  runs every game's.

## Pages of the arcade

A page of the arcade that is not a game (like `credits/` and `supporters/`) is a screen of the one
React app (`src/arcade/`, see "One app" in `docs/architecture.md`), without being asked each time:

- its page, `apps/web/<name>/index.html`, keeps its own head (title, description, link-preview
  tags, `appearance-early.js`) and starts the app, `src/main.tsx`, as its only module, its body only
  `<div id="root" data-screen="<name>">`; the screen is listed in `SCREENS` (`src/arcade/screens.ts`)
  under its path, rendered by `renderScreen` and headed by `SCREEN_HEADS`, so a tap between screens
  changes the screen in the page and slides like an iOS screen,
- it lives in `src/<name>/` as components over plain logic modules, and resolves every address
  against the arcade's root (`useArcadeUrl`), since it shows under another screen's address too,
- its bar is `PageBar` (`src/arcade/PageBar.tsx`): Back is `<a data-back>` to the arcade (named with
  `aria-label` where a phone hides the label), which pops back to the arcade as it was left, over the
  iOS 26 soft edge of `src/home/scroll-edge.css` (`<header class="page-bar scroll-edge">`), as the
  arcade's own bar has, so what scrolls under it fades out, and it frosts over where a blur cannot be
  masked; its own CSS sets where its large title passes under the bar (`--page-bar-condense-*`),
- its ids are unique across every screen, as the screens share one document,
- it shares the arcade's tokens, buttons, sheets (`use-sheet.ts`) and appearance and sound
  (`useArcade`).

`apps/web/test/integration/page-motion.test.js`, `page-bar.test.js` and `scroll-edge.test.js` find
every such page on disk and render every screen, and fail until it does all this. A game never loads
these: it keeps its own launch.

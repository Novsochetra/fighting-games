# Project rules

A retro arcade: a Node server with a games API, the arcade itself (a React and TypeScript app, built
by Vite, whose home lists the games), and the games themselves. Read `docs/architecture.md` before
changing structure.

## Commands

| Command                 | What it runs                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`           | the server on http://localhost:8765 with Vite, reloading on change           |
| `npm run check`         | lint, format, types, every test and the build; run it before done            |
| `npm run lint`          | ESLint and Stylelint                                                         |
| `npm run format`        | Prettier, writes files                                                       |
| `npm run typecheck`     | TypeScript over the arcade (`tsconfig.json`)                                 |
| `npm test`              | all Vitest projects: `unit`, `integration`, `regression`                     |
| `npm run build`         | the arcade into `dist/`, which `npm start` and Railway serve                 |
| `npm run live`          | the live service (parties, voice tickets) on http://localhost:8766           |
| `npm run db:migrate`    | applies new migrations to the Postgres at `DATABASE_URL`                     |
| `npm run storage:check` | uploads one small file to the S3 bucket and reads it back through CloudFront |

## Coding

@docs/coding-style.md

- Lint holds files to 150 lines, functions to 40 lines, complexity 10, depth 3 and 4 parameters.
- Process-wide setup goes in the entry files: `apps/server/src/main.js` for the server's signal and
  stream handlers and `process.exit`; `main.tsx`, a game's `src/main.js`, or a module they call for
  it (`install-input.js`, `boot/`) for listeners on `window` or `document`.
- Each game is independent: it loads nothing from outside its own folder but the shared packages
  (`apps/web/packages/`), and the home page loads nothing from a game
  (`apps/web/arcade/test/integration/independence.test.js` checks both). Never share a file, token
  or module between the home page and a game, or between games: code a second game needs goes in a
  package (see "Shared packages").
- The home page's UI colors, type, radii, shadows and motion come from
  `apps/web/arcade/src/styles/tokens.css`, and each game's from its own
  `games/<id>/styles/tokens.css`. No raw hex values in components (`local/no-raw-hex`, Stylelint).
  Colors painted on a game's canvas (sprites, scenery, effects, HUD) are pixel-art data, like the
  PNGs, and live only in that game's `src/art/` palette files, the one place lint allows hex in JS.
- Never install packages without asking; concurrent installs corrupt `node_modules`.
- A commit by Claude waits for the `guideline-reviewer` subagent (`.claude/agents/`) to pass exactly
  the tree it commits: stage with `git add`, run it, fix what it finds, stage, run it again, then
  commit. `.githooks/pre-commit` refuses the commit until then (`tools/claude-hooks/`); `AGENTS.md`
  asks the same of other agents. `git revert` and `git cherry-pick` run with `--no-commit`, and a
  patch goes in with `git apply --index` rather than `git am`, so the result is reviewed and
  committed like any change; merge commits and rebases combine commits already reviewed and are
  outside the check, while a `git merge --squash` makes one new commit, reviewed like any other.
  This guards against skipping the review by mistake, not against an agent set on getting around it:
  CI and a person's review of the pull request are the backstop.

## Testing

@docs/testing.md

- Tests live in `test/unit/`, `test/integration/` and `test/regression/` of each part.
- Changing game behavior on purpose (balance, new moves) changes the recorded runs in
  `test/regression/fixtures/`: update them with `npm run test:regression -- -u` and review the diff.

## Versions

@docs/versioning.md

- The version is the `version` in the root `package.json`; raise it with
  `npm version <patch|minor|major> --no-git-tag-version`.
- Here a new game, screen, mode, hero, mission or move is minor; balance and tuning are patch;
  breaking a player's saves or an installed arcade is major.

## Layout of the arcade

`apps/web/` holds the arcade (`arcade/`), the games (`games/`) and the packages (`packages/`) side
by side. The arcade, `apps/web/arcade/`, holds `pages/` (its five pages, Vite's root), `public/`
(sent as it is at the root of the arcade's address: `assets/`, `robots.txt`, `sitemap.xml`,
`appearance-early.js`), `src/`, `test/`, `build-steps/` and `vite.config.ts`; paths below and in
"Pages of the arcade" are under it. `src/` holds `main.tsx`, `App.tsx` and these folders:

- `screens/`: one folder per screen (`home/`, `leaderboard/`, `supporters/`, `credits/`,
  `wallpapers/`), a folder
  per feature inside (`home/carousel/`, `home/details/`, `supporters/donate/`), and
  `render-screen.tsx`,
- `components/`: the UI parts two or more screens show (`page-bar/`, `sheet/`, `notice/`,
  `segmented/`, `layout-swap/`, `board/`, `avatar/`, `icons.tsx`),
- `api/`: every request to the server or the worker, its reader and the hook that loads it
  (`catalog/`, `leaderboard/`, `supporters/`, `offline/`),
- `services/`: what is made once per page and reached with `useArcade()` (`arcade-context.tsx`,
  `browser-ports.ts`, `preferences.js`, `appearance/`, `sound/`, `analytics/`, `install/`,
  `updates/`),
- `navigation/`: `routes/` (`SCREENS`, `SCREEN_HEADS`, `board-route.js`), `stack/` (the screen
  stack and its slides) and `back/` (Back to the arcade),
- `hooks/`: hooks that know no feature,
- `utils/`: plain helpers that know no feature (`dom.js`, `format.js`, `aria.js`,
  `marked-transition.js`),
- `styles/`: what every screen stands on: `tokens.css` (the colors, type and motion of every
  screen), `page.css`, `buttons.css`, `scroll-edge.css`, `motion-tokens.js`, `global-styles.ts`,
- `service-worker/`: the offline worker, a program of its own.

Where a file goes:

1. It knows no feature: a hook goes in `hooks/`, a plain helper in `utils/`.
2. It asks the server or the worker for data: `api/`.
3. It is a UI part two or more screens show: `components/`.
4. It is made once per page and reached with `useArcade()`: `services/`.
5. Everything else goes in the feature folder of the screen that uses it.
6. A screen never imports another screen, and only `screens/` imports a screen.

No catch-all folders (`types/`, `constants/`, `helpers/`): a type or a constant lives with its
owner. An import is `./` for a file in the same folder or under it, and `@/` (`apps/web/arcade/src/`)
for anything else, never climbing out with `../`; `@/` is set in `vite.config.ts` and, at the
repo's root, `vitest.config.js` and `tsconfig.json`. `apps/web/arcade/test/integration/layout.test.js` holds
`src/` to these folders and fails when a screen imports another or anything outside `screens/`
imports a screen, when `utils/` imports anything but `utils/`, `hooks/` anything but `hooks/`,
`utils/` and `services/`, or `service-worker/` anything outside itself, and when an import climbs
out with `../`. Tests mirror `src/`: `src/api/catalog/view-models.js` is tested in
`test/unit/api/catalog/view-models.test.js`.

A new screen is its page, `pages/<name>/index.html` (also an input in `vite.config.ts`, which
builds the pages it names, and an address in `public/sitemap.xml`), its folder
`src/screens/<name>/`, its entries in `SCREENS` (`src/navigation/routes/screens.ts`) and
`SCREEN_HEADS` (`src/navigation/routes/screen-heads.ts`), and its line in `renderScreen`
(`src/screens/render-screen.tsx`); "Pages of the arcade" says what each must do.

## Layout of a game

`apps/web/games/<id>/` holds `game.json` (the catalog entry), `index.html`, `assets/`, `styles/`
(with the game's own `tokens.css`), `src/` and `test/`, and may keep `dev/`: pages to work on the
game with (Naga Eleven's camera lab), which the build bundles beside themselves and serves at the
game's address, but never lists or keeps in the game's download for offline. Adding a
folder with a valid `game.json` adds the game to the home page, unless it says `"listed": false` (not ready
yet: built and played at its address, kept off the home page and the sitemap).
A trailer is an `.mp4` (H.264 and AAC) in `assets/trailer/` or at an `https:` address (a CDN), named
by `game.json`'s `trailer`, with `trailerSmall` a lighter copy for phones; the details sheet plays it
in place of the game's art, and no offline save keeps it.
A game hosted on its own site keeps only `game.json` (with an `https:` `url`) and `assets/` here.

## Shared packages

Code more than one game uses (input, controls, screen fit, the way back to the arcade) is a package,
`apps/web/packages/<name>/` with `src/` and `test/`, instead of a copy in each game (see "Shared
packages" in `docs/architecture.md`):

- it knows no game: it loads only packages, and the game passes in what is its own (its actions, its
  key and button maps, its cues),
- it has no colors or art of its own; what it draws reads the game's tokens,
- a game imports it by its path (`../../../../packages/input/src/gamepad.js`), nothing installed;
  the build joins it into the game's own bundles, so a shipped game still loads only its folder,
- a change to it reaches every game that uses it, so it keeps its own tests and `npm run check`
  runs every game's.

A game's touch controls come from `touch-pad`, drawn from a skin the game ships in
`src/data/skins/`: data, never code, and players never bring their own. The game's tests check
each skin with `skinProblems` (see "Touch pad and skins" in `docs/architecture.md`). A skin's
motion moves only size and opacity (`scale`, `transform`, `opacity`), which the compositor runs;
its colours change at once, as eased colours cost a fight frames on a phone's CPU. Every move a
skin draws (attack, jump, dash, a skill) is a round key, unless the player picks a pill for a key
the skin offers one for (`pills`, picked key by key on the Skins screen); a pill is otherwise only
for what runs the game (play, pause, settings).

## Pages of the arcade

A page of the arcade that is not a game (like `credits/` and `supporters/`) is a screen of the one
React app (`apps/web/arcade/src/`, see "One app" in `docs/architecture.md`), without being asked
each time:

- its page, `apps/web/arcade/pages/<name>/index.html`, keeps its own head (title, description,
  link-preview tags, `appearance-early.js`) and starts the app, `/src/main.tsx`, as its only module,
  its body only `<div id="root" data-screen="<name>">`; the screen is listed in `SCREENS`
  (`src/navigation/routes/screens.ts`) under its path, rendered by `renderScreen`
  (`src/screens/render-screen.tsx`) and headed by `SCREEN_HEADS`
  (`src/navigation/routes/screen-heads.ts`), so a tap between screens changes the screen in the page
  and slides like an iOS screen,
- it lives in `src/screens/<name>/` as components over plain logic modules, and resolves every
  address against the arcade's root (`useArcadeUrl`), since it shows under another screen's address
  too,
- its bar is `PageBar` (`src/components/page-bar/PageBar.tsx`): Back is `<a data-back>` to the
  arcade (named with `aria-label` where a phone hides the label), which pops back to the arcade as it
  was left, over the iOS 26 soft edge of `src/styles/scroll-edge.css`
  (`<header class="page-bar scroll-edge">`), as the arcade's own bar has, so what scrolls under it
  fades out, and it frosts over where a blur cannot be masked; its own CSS sets where its large title
  passes under the bar (`--page-bar-condense-*`),
- its ids are unique across every screen, as the screens share one document,
- it shares the arcade's tokens, buttons, sheets (`use-sheet.ts`) and appearance and sound
  (`useArcade`).

`apps/web/arcade/test/integration/page-motion.test.js`, `page-bar.test.js` and
`scroll-edge.test.js` find every such page on disk and render every screen, and fail until it does
all this. A game never loads these: it keeps its own launch.

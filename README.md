# Retro Arcade

A small arcade of browser games. A Node server lists the games through an API, the home page shows
them as app icons, like a tablet's home screen, and each game lives in its own folder.

Play it online at **https://novsochetra.github.io/fighting-games/**.

## Games

| Game                              | Folder                                                                      |
| --------------------------------- | --------------------------------------------------------------------------- |
| Steel & Dust, a pixel-art brawler | [`apps/web/games/steel-and-dust/`](apps/web/games/steel-and-dust/README.md) |

## Run it

Node 22 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:8765/. Open a game with a click or a tap, the arrow keys and Enter, or a
gamepad.

## Project layout

```
apps/server/   Node HTTP server: GET /api/games and the static files
apps/web/      everything the browser loads: the home page, design tokens and the games
scripts/       the static site build for GitHub Pages
tools/         the project's own ESLint rules
docs/          architecture notes
```

`docs/architecture.md` explains how the pieces fit, and `CLAUDE.md` holds the coding rules.

## Quality checks

| Command                | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run check`        | everything below; CI and the git pre-commit hook run it                        |
| `npm run lint`         | ESLint (size, complexity and comment rules) and Stylelint (design tokens only) |
| `npm run format:check` | Prettier                                                                       |
| `npm test`             | all tests; also `npm run test:unit`, `test:integration`, `test:regression`     |

The lint rules enforce small files (150 lines) and functions (40 lines), complexity 10, no section
banners, no `/** */` blocks, no `TODO` comments, and no raw colors outside the design tokens
(`apps/web/src/design/tokens.css`) and a game's art palette.

## Add a game

Create `apps/web/games/<id>/` with a `game.json` (id, title, tagline, description, genre, players,
cover), an `index.html` and the game's files. The server finds it and the home page shows its cover
as the game's icon, so make the cover a square image.

## Deploy

Every push to `main` runs `npm run build`, which writes the static site to `dist/` (including
`dist/api/games`, the API response as a file), and publishes it to GitHub Pages
(`.github/workflows/pages.yml`). `.github/workflows/ci.yml` runs `npm run check` on every push and pull request.

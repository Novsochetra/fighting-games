# Retro Arcade

A small arcade of browser games. A Node server lists the games through an API, the home page shows
them as a game hub, like the Apple TV app (a carousel of game cards over the selected game's art,
with sound), and each game lives in its own folder.

It runs on Railway, with Postgres for the supporters list (`docs/deploy-railway.md`).

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
gamepad. `npm run dev` serves the arcade from Vite as you write it; `npm run build` then `npm start`
serves the build, as Railway does, with the offline worker.

## Project layout

```
apps/server/         Node HTTP server: the games, supporters and health API, and the arcade's files
apps/web/            everything the browser loads, in three folders side by side:
  arcade/            the arcade, a React and TypeScript app built by Vite: pages/ (its home,
                     leaderboard, supporters and credits pages), public/ (its art, robots.txt and
                     sitemap.xml, sent as they are) and src/ (one folder per screen, and the parts
                     the screens share)
  games/             the games, each its own app with its own tokens
  packages/          code more than one game uses (input, touch-pad, screen)
tools/               the project's own ESLint rules and Claude Code hook
docs/                architecture notes
```

`docs/architecture.md` explains how the pieces fit, and `CLAUDE.md` holds the coding rules and where
each part of the arcade goes ("Layout of the arcade").

## Quality checks

| Command                | What it does                                                                   |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run check`        | everything below; CI and the git pre-commit hook run it                        |
| `npm run lint`         | ESLint (size, complexity and comment rules) and Stylelint (design tokens only) |
| `npm run format:check` | Prettier                                                                       |
| `npm run typecheck`    | TypeScript over the arcade                                                     |
| `npm test`             | all tests; also `npm run test:unit`, `test:integration`, `test:regression`     |
| `npm run build`        | the arcade into `dist/`                                                        |

The lint rules enforce small files (150 lines) and functions (40 lines), complexity 10, no section
banners, no `/** */` blocks, no `TODO` comments, and no raw colors outside the design tokens (the
home page's `apps/web/arcade/src/styles/tokens.css`, each game's `styles/tokens.css`) and a game's
art palette.

The home page and each game are independent apps: none loads a file from another.

## Add a game

Create `apps/web/games/<id>/` with a `game.json` (id, title, tagline, description, genre, players,
cover), an `index.html` and the game's files, including its own `styles/tokens.css`. A game loads
nothing from outside its folder. The server finds it and the home page shows it. Make the cover a
square icon, and add the optional `banner` (16:9 key art for the backdrop behind the game's card),
`poster` (a tall crop of it for phones) and `screenshot` (a 16:9 frame of play for the card itself);
without them the home page uses the cover.

## Deploy

The arcade runs on Railway as one service, the pages and the API from one address, next to a
Railway Postgres database. Every push to `main` deploys; `docs/deploy-railway.md` has the setup steps.
`.github/workflows/ci.yml` runs `npm run check` on every push and pull request.

Each build is versioned in SemVer with its commit as the build, as `1.0.0+5f272d9`, and the credits
show it as Version 1.0.0 (5f272d9). The release is the `version` in `package.json`: raise it in the
commit that ships a new game or feature (`npm version minor --no-git-tag-version`) or a fix
(`npm version patch --no-git-tag-version`); the build follows each commit by itself.

`npm run dev` needs no database: without `DATABASE_URL` the server keeps gifts in memory until it
stops.

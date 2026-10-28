# Architecture

A small retro arcade: a Node server, the arcade itself (a React app with its home, supporters and
credits screens), and one folder per game. The arcade is TypeScript and React, built by Vite; its
logic stays in plain modules (`.js`, tested on their own), which the components call. The games are
their own apps of native ES modules, which Vite never touches.

```
apps/
  server/                 Node HTTP server: the API (games, supporters, health) and the arcade's files
    src/
      db/                 the Postgres pool, the migrations and their runner (migrate-cli.js)
      routes/             the API's routes, and app-files.js: the build, or Vite as you write (dev)
      security/           the same-site check and the rate limit for the API
      supporters/         reading a gift, the Postgres and in-memory stores, the JSON they send
      as-is-files.js      what the arcade sends as it is, past Vite: the games, the art, robots.txt…
      build-version.js    the version each build of the arcade carries (see A new build)
    test/{unit,integration}
  web/                    everything the browser loads
    index.html            the arcade's page; supporters/ and credits/ hold the other two
    vite.config.ts        the build: the three pages into dist/, the as-is files copied beside them
    robots.txt            lets every crawler in and names the sitemap
    sitemap.xml           every page this server sends (see Search and link previews)
    assets/               the arcade's icons and manifest (tools/arcade_icons.py draws the icons),
                          donate/khqr.jpg, the KHQR code the donate sheet shows,
                          social/entry-screen.jpg, the picture a shared link shows, and
                          credits/, the maker's photos the credits screen shows
    src/main.tsx          the app every page starts, on the screen the page names
    src/arcade/           the app's frame: its services, the screen stack and its slides, and the
                          parts every screen shares (the page bar, sheets, notices)
    src/home/             the arcade's home screen, its logic modules and styles; tokens.css holds the
                          colors, type and motion of every screen
    src/supporters/       the supporters screen and its donate sheet
    src/credits/          the credits screen: who makes the arcade, and where to find them
    src/offline/          the service worker, which keeps the arcade and each game played for offline
    games/
      <game-id>/          one self-contained app: it loads nothing from outside its folder
        game.json         catalog entry, read by the server
        index.html        the game page
        assets/           sprites, icons, manifest
        styles/           the game page CSS; tokens.css holds the game's own design tokens
        src/              game modules
        test/{unit,integration,regression,support}
    test/{unit,integration,regression}  the arcade's tests (support/render-arcade.tsx renders it)
.railway/railway.ts       the Railway service's settings (docs/deploy-railway.md)
tools/eslint-rules/       the project's own lint rules
docs/                     this file and deploy-railway.md
```

## Independent games

The arcade and every game are separate apps that share no file. Each has its own design tokens
(`src/home/tokens.css`, `games/<id>/styles/tokens.css`), styles and modules, so a game can change its
look without touching the arcade or another game. The arcade knows a game only through its
`game.json` and the art it names (`cover`, `banner`, `poster`, `screenshot`); a game links back to the
arcade only by address (`../../`).
`test/integration/independence.test.js` fails if a game loads a file from outside its folder or the
arcade (any of its pages or modules) loads a file from a game.

A game hosted on its own site, such as Morodok Angkor (`games/morodok-angkor/`, at
`https://morodokangkor.com/`), keeps only its `game.json` and art here. Its `url` must be an `https:`
address (checked by the server, `game-entry.js`, and again by the arcade, `view-models.js`), and
Play opens it there instead of `games/<id>/`. The arcade draws art pixelated, block by block; a game
whose art is rendered, like a 3D world, sets `"pixelArt": false` and its card, tile, backdrop and
details art stay smooth (`is-smooth`).

## One app

The arcade, its supporters and its credits are screens of one React app, so a tap between them
changes the screen in the page, never through a load: on a phone's link a move to the supporters
took about 1.3 s, 47 files coming again every time, and now shows at once. Each still has a page of
its own on disk (`index.html`, `supporters/index.html`, `credits/index.html`), with its own title and
link-preview tags, which a visitor can open directly, reload or share. Every page starts the same
app, `src/main.tsx`, and names the screen it opens on (`<div id="root" data-screen="supporters">`).

- **The app** (`main.tsx`, `arcade/App.tsx`): the arcade's services are made once for the page,
  outside React (`createArcade` in `arcade-context.tsx`): its preferences, one appearance, one sound
  and the analytics, with what they take from the browser passed in (`browser-ports.ts`), so the
  tests hand them fakes. React Router follows the address, and TanStack Query holds what the screens
  read from the API: a screen shown again uses what it read, and reads again after a minute.
- **Addresses**: a screen shows under another's address (the arcade sits under the supporters when a
  visitor opened them), so every address in a screen resolves against the arcade's root
  (`useArcadeUrl`, `arcadeRoot` in `screens.ts`), never against the page.
- **The stack** (`ScreenStack.tsx`, `stack-model.ts`, `stack.css`): like an iOS navigation stack, the
  arcade is always at the bottom and the supporters or the credits are pushed over it. Each screen is
  a layer of its own, which scrolls on its own, so the arcade comes back as it was left, at its own
  scroll; a screen popped or covered goes once its slide ends, and the arcade stays, unseen and
  inert. A move is a push to a deeper screen, a pop to a shallower one, and between the two pushed
  screens a push on a link and a pop on the browser's back. The arcade's keys and pad are its own
  only while it is the top screen (`useIsTopScreen`).
- **Back** (`use-back.ts`, `PageBar.tsx`): a Back link (`data-back`) goes back through history when
  the screen before is the arcade, so it comes back as it was left; a page loaded from the arcade
  goes back through history too (`cameFrom`, `back-link.js`), so the browser brings the arcade back
  from its back/forward cache; opened on its own, Back takes the arcade in, sliding the way Back
  does. A click that opens a tab is left to the link.
- **Motion** (`stack-motion.ts`): on a phone a push slides the screen arriving in from the right
  with a shadow on its edge, over the one left, which slides a little left and dims, and a pop plays
  it backwards, on the navigation tokens (`--duration-navigation`, `--easing-navigation`). With a
  mouse or trackpad (`@media (hover: hover) and (pointer: fine)` in `tokens.css` sets
  `--motion-navigation: zoom`) the arcade moves like a desktop app instead: a push zooms in, the
  screen arriving growing into place as it fades in, and a pop zooms back out, only opacity and scale
  changing so the compositor plays it alone. With reduced motion the screen only fades, as iOS
  dissolves.

`test/integration/page-motion.test.js` finds every `index.html` under `apps/web/` outside the games,
code and art, and fails for one that does not start the app, name the screen `SCREENS` knows by its
path, or (over the arcade) have a Back link to it; a new screen of the arcade does all this (the rule
is in `CLAUDE.md`). The games are pages of their own and keep their own launch.
`test/regression/bugs/arcade-pages-reload.test.js` holds the arcade to changing screens without a
load.

## Request flow

1. `GET /` serves the built `index.html`, which loads the app (`build/main-<hash>.js` and its
   stylesheet). The arcade fetches `api/games`.
2. `GET /api/games` reads every `apps/web/games/*/game.json` and returns `{ games: [...] }`. The
   list needs no database: adding a game folder adds it.
3. Play opens `games/<id>/`, which serves that game's `index.html`, or the `url` of a game hosted
   on its own site.
4. The supporters screen fetches `GET /api/supporters`; its donate sheet sends `POST /api/supporters`.
   Steel & Dust reads the same list, by address (`../../api/supporters`) as its way back to the
   arcade is, for the credits that roll once its last mission is clear: as the game loads, and again
   as its last boss falls, so a gift made during the run is named. It shares no code with the arcade
   to read it (`games/steel-and-dust/src/ui/credits/`).
5. `GET /api/health` answers `{"ok":true}` once the supporters table answers (Railway's health check).

The arcade runs on Railway as one service: the same server sends the pages and the API, from one
address (`docs/deploy-railway.md`). `router.js` matches an API path and its method (`HEAD` goes to
`GET`, another method gets 405 with `Allow`); every other path is a static file, for `GET` and
`HEAD` only.

**Only the arcade's own pages call the API.** The server sends no CORS headers, so another site's
script can't read an answer, and a CORS preflight (`OPTIONS`) gets 405. Every API request whose
`Sec-Fetch-Site` is `same-site` or `cross-site`, or whose `Origin` names another host than `Host`,
gets 403 (`security/request-origin.js`), and a `POST` must carry an `Origin` of its own host, which
every browser sends. A script outside a browser can write any header, so the gifts also rest on the
rate limit and the checks below.

**The build.** `npm run build` has Vite build the three pages into `dist/` (`base: './'`, so the same
files work under any path) and copy what it never touches beside them (`as-is-files.js`: the games,
the art, `robots.txt`, `sitemap.xml` and `appearance-early.js`), then builds the service worker (see
Offline). Each build has a version (`build-version.js`), SemVer with the build after a `+`, as
`1.0.0+5f272d9`: the release is the `version` in the root `package.json`, and the build is the commit
Railway deploys (`RAILWAY_GIT_COMMIT_SHA`), else the one checked out, else the time of the build. The
release is raised by hand, in the commit that ships the change: MAJOR for a change that breaks what a
player keeps (their saves, an installed arcade), MINOR for something new (a game, a screen, a mode),
PATCH for fixes and tuning (`npm version minor --no-git-tag-version`). It writes the version into
each page's head (`<meta name="arcade-version">`) and into `version.json`, the version the server
holds now (see A new build). Railway builds on each deploy and `npm start` serves `dist/`; it refuses to start without a
build. Vite names each module and stylesheet it builds by its content, under `build/`, so the server
lets a browser keep those for a year (`immutable`) and has it check everything else on each visit
(`no-cache`). Every file carries an `ETag`, a hash of its content (`routes/file-tags.js`), so a check
of a file that has not changed costs a `304` and no body, even across deploys. `npm run dev`
serves the pages and modules from Vite as they are written, with hot reload, and the as-is files from
disk as in production. If a game's module fails to load, fails to come down at all (a dropped
connection, a phone that slept mid-load), or its load hears of no file coming in for 15 seconds (a
request that never answers), its page reloads itself under a fresh address, each try a second
later than the last, up to three times (`src/boot/boot-recovery.js`). The page's first script
watches for it and loads nothing more (`src/boot/boot-watch.js`), so the loading screen's own
modules are watched too.

## Offline

The arcade works offline like an installed app, and so does each game once it has been played here
(`src/offline/`, a service worker of plain modules; `register-worker.ts` registers it from the built
app in every browser, `npm run dev` runs without it). Morodok Angkor lives on its own site and is
not kept.

- **The arcade** (`arcade-cache.js`): the build writes the worker with the list of what it keeps
  (vite-plugin-pwa's `injectManifest`, in `vite.config.ts`): the three pages, the built modules and
  styles, the arcade's art, `appearance-early.js` and each game's card art (`catalog-art.js`), each
  with a revision. Installing fills one cache named by that list and, once it is all in, takes over
  at once; a page open on the old build keeps what it loaded, its next load is the new one, and the
  builds before go. The pages and files come from that cache, so the arcade opens without the network.
- **The API** (`api-cache.js`): the games and the supporters are read from the network first, and
  the last answer stands in offline; the worker reads them once as it installs, since the first
  visit read them before it was there. A gift sent offline fails as it always did, saying so.
- **A game** (`game-cache.js`): a game is kept once the player saves it (see Saving a game), and
  the whole of it comes down: the build writes each game's `offline.json` (`game-files.js`), every file it may load
  as it is played (not its screenshots, link-preview art or notes, nor a sprite that has a packed
  copy of itself in `packed/`, which only the packer reads) and a revision that changes with any of
  them. Only the game's own folder comes down, so a game keeps its fonts there too (Steel & Dust's
  Silkscreen, `assets/fonts/`): a font from another site, like Google Fonts, is lost offline. Each file is checked with the server, so what the game has just loaded for itself costs a
  `304`. A game is played from its download only once every file of one revision is in, marked last,
  so a half download, or one across two deploys, is never played; until then it comes from the
  network as before, and offline it says so. A play saves nothing the player has not saved, but it
  keeps a saved game fresh: after a deploy that changes the game, the next play brings the new
  revision down behind the old one, which it plays meanwhile. A page plays the revision it opened on
  to the end, even once the new one is in (the oldest whole one, `completeGame`), and the play after
  opens the new one and lets the old go (`keepNewestWhole`), since letting it go as the new one came
  in mixed the new revision's files into a page still loading the old. The worker works out which
  revision a game plays once, and again only as one comes in or goes, so each of its files reads one
  cache. A download waits while the game asks for files of its own, carrying on once it has asked
  for none for two seconds (`game-activity.js`), so on a phone the game's own files come first. A
  prefetch of a game's page (the home's speculation rules) downloads nothing.
- **Saving a game** (`game-downloads.js`): the player saves a game, and removes it, with the
  arcade's buttons; a play never waits for a download. The worker answers `api/offline/<id>`: a GET
  with `saved` once a revision is whole, else `saving` with how many of its files are in (`done`,
  `total`), `failed`, or `not-saved`; a POST starts the download; a DELETE removes every revision
  of the game, whole or half come down, and stops one on its way, so a removed game stays removed.
  Looking never downloads, so showing the buttons spends no data. One download runs per game,
  shared by a save and a play keeping it fresh. The server has no such address, so where no worker
  runs the arcade offers no save.

- **A new build** (`src/arcade/update-check.js`, `arcade-version.js`, `newest-worker.js`,
  `UpdateBanner.tsx`, `use-update.ts`): the pages come from what the worker keeps, so an arcade
  left open, or opened from the worker's copy, runs the build it loaded after a deploy, and a load
  before the new worker has taken over opens the old build again; an installed arcade that a phone
  brings back without a load could stay old for days. So the arcade compares its page's version
  with `version.json` as it opens and each time it is shown again (`visibilitychange`), past every
  cache (the worker leaves `version.json` to the network). When the server holds a newer build, it
  has the worker fetch it (`registration.update()`) and waits until it has taken over, then the home
  shows a banner, New version ready, whose Reload opens the new build at once. It takes the
  banners' place first (`has-update-banner`), as the others come again after the reload. Nothing
  reloads by itself, so a gift under way is never lost. The credits screen names the version the
  page runs, as Version 1.0.0 (5f272d9) (`src/credits/version-label.js`). A new build is one whose
  version differs, so a redeploy of the same commit asks no one to reload. `npm run dev` writes no
  version, so it never asks.

`test/integration/offline/worker.test.js` runs the worker's answers against fake caches and a
network that can go away.

## Home page

The arcade's home screen (`HomeScreen.tsx`, its state and what its controls do in `home-context.tsx`
and `home-actions.ts`) is a game hub like the Apple TV app: the selected game's key art fills the top of the
screen behind a carousel of 16:9 cards, and a library of every game sits below. Type follows Apple's
text styles (Large Title, Title, Body, Subheadline, Footnote) in SF Pro on Apple devices, with Inter
standing in for it elsewhere; buttons are Apple's Play pill and frosted glass ones (`buttons.css`).

It comes in Apple's dark and light appearances. Dark is the default set of tokens in `tokens.css`;
`:root[data-appearance='light']` swaps in the light colors, a lighter shadow, side cards that dim
less, and a painting left untouched down past the cards that frosts toward the bottom, behind the
title and buttons: a blur on its own layer (`.hero__frost`), faded in by a mask, under a wash of
white that starts there too. Over the bare painting the top bar and the prompt turn white with a
soft shadow; the hero's `data-backdrop` (`art` or `plain`) keeps them dark over a teaser's plain
backdrop. The root's `data-appearance`
follows the device, and the sun and moon button in the top bar flips it (`appearance.js`, which
cross-fades the page through a view transition). The choice is kept with the device's appearance at
the time, so when the device next changes (at sunset, say) the arcade follows it again.
`appearance-early.js`, a classic script in the head, sets the attribute before the first paint, so a
light screen never shows dark first; a test holds it to the same choice as `resolveAppearance`.

- **Top bar** (`topbar.css`): the arcade's name with the supporters, appearance and sound buttons.
  It heads the home outside the hero and takes no room of its own, so the painting runs up under it.
  Like an iOS 26 navigation bar over a scroll view, it stays at the top as the arcade scrolls: clear
  over the painting at the top, the arcade fades out under its soft edge (see the end of the credits
  page's section) once anything passes under it (`--scroll-home-condense-*` in `tokens.css`), and in
  the light appearance its name turns from the white it wears over the painting to the label color.
  It follows the hero's backdrop through `:has()`. That runs on scroll-driven animations alone, and a
  browser without them keeps a plain bar that scrolls away with the hero.
- **Hero** (`Hero.tsx`, `Spotlight.tsx`, `spotlight-motion.js`, `hero.css`): the game's `banner` (its `poster`, a tall crop, on
  narrow screens) cross-fades in behind a dim, under one slow Ken Burns zoom on the whole stack. Its
  title, genre line and first sentence rise in under the carousel, over Play, Details and a heart; a
  swipe that lands mid-rise carries on from where the text is, so quick swipes never blink. Between
  a game and a teaser the buttons change, so they fade out, change unseen and rise back in turn
  (`use-action-row.ts`, `action-swap.js`), each on its own, since an opacity on their row would cut the glass buttons'
  blur off from the art. The heart pops only when tapped.
- **Carousel** (`Carousel.tsx`, `carousel-layout.js`, `carousel-motion.js`, `carousel.css`): each card shows its game's
  `screenshot`, a frame of play, so it never repeats the key art behind it. Two Coming Soon teasers
  (`coming-soon.js`) follow the games: a dark slate with a slow sheen, a dark backdrop, and a quiet
  Coming Soon in place of Play. They move like games but open nothing (the card shakes and a low
  knock plays), and they stay out of the library and the favorites. The cards loop. A card's
  slot is a plain function of its distance from the selected one: the center card is full size and
  ringed in Apple's system blue (the selected tile below wears the same ring), the next ones shrink,
  dim and sit edge to edge, and from the third on they are hidden. React only puts the cards on the
  page; each turn (`card-motion.js`) writes each card's slot as custom properties (`--side`,
  `--shift`, `--scale`, ...), which the CSS turns into one transform, so every move is a compositor
  transition on the spring easing. A card that comes round the loop slides in from out of sight
  beyond its new place, and a copy of it slides out by the side it left. Arrows and A/D, the round arrow buttons, a click on a side card, a swipe
  (`gestures.js`) and a sideways trackpad scroll move it; Enter, Play or a click on the center card
  opens the game.
- **Library** (`Library.tsx`, `use-library.ts`, `library-filter.js`): a grid of tiles
  under an iOS segmented control: All (eight, then Show more), Recent (newest first) and Favorites.
  A tile selects its game and scrolls the hero back into view. Favorites, recent games and the sound
  switch are kept in `localStorage` (`preferences.js`); a browser that refuses storage just starts
  fresh. The arcade opens on the game played last. The library reads the favorites and the games
  played as it changes filter or page and when asked, so a game opened is in Recent once the arcade
  is back from it, not while its card flies.
- **Save for offline** (`SaveButton.tsx`, `OfflineTag.tsx`, `save-button.css`,
  `use-save-status.ts`, `use-offline-saves.ts`, `offline-saves.js`, `offline-save.js`): a small
  round cloud-download button floats on the center card's top corner (one for the carousel, coming
  in again once each new card has turned to the center) and on the corner of each tile, and keeps
  one of the arcade's own games for offline (see Offline). While it saves, a ring around it fills
  with the share saved. A saved game wears an Available offline tag on its art (every card and tile, and the
  details sheet), and its button turns into a trash can, red under the pointer, that asks before
  removing the game (`RemoveSaveSheet.tsx`, `use-remove-save.ts`, a small sheet whose Remove is
  Apple's red). Its tooltip, one short line on hover after a beat or on keyboard focus, says what a
  tap does or how far the save has got; the button's name says it all aloud, so the tooltip and the
  tag are only for the eye. One store holds every game's status for the home screen, so the card,
  the tile and the details sheet show the same save; it asks the worker as a game first shows, every
  half second while one saves, and again for each game back from a play. The ring and tooltip are
  drawn inside the button, so a fade of the button takes them along. Where no worker answers, or for
  a game on its own site, no button shows.
- **Details** (`DetailsSheet.tsx`, `use-details.ts`, `sheet.css`): a `<dialog>` form sheet with the whole description
  and the controls, centered on wide screens and rising from the bottom on phones. Beside its Play,
  Save offline (`SaveOffline.tsx`) is the same save as the round buttons, spelled out: it asks the
  worker again as the sheet opens, fills a ring with the share saved while it saves, then reads
  Remove offline copy once saved (asking first, in a sheet of its own), or Try again after a failed
  save. While it is up
  the page behind holds still (`has-open-sheet` on the root), since a modal dialog alone lets iOS
  Safari and a mouse wheel scroll the arcade under it, and the sheet itself takes the focus. Every
  sheet of the arcade works through `use-sheet.ts` over `sheet.js`: it shows while its screen asks
  for it, Escape and a tap on the dimmed page close it with its animation, and a screen that goes
  takes its sheet down at once.

Opening a game plays an app-launch animation before the page changes (`src/home/launcher.js`, made
on the first launch by `use-launcher.ts`), like
opening a game in Apple Arcade: a panel grows from the card to fill the screen while the home zooms
away behind it, and the card's art, still sharp, moves to rest in the middle of the screen at the
size of a large card (`launchArtRect`), a little above center. Behind it the same art fills the
panel, blurred and dimmed (`.launch__backdrop`), so every game opens into its own colors; the colors
of the art's corners (`launch-splash.js`) stand in while it cannot be drawn. The game's name rises
in under the card as the screen fills, and Apple's activity indicator joins it only if the game
takes a moment to load (`launch.css`). The banners and the coffee button float outside the home, so
the root is marked `is-launching` while a game opens and they leave with it rather than stay sharp
over the launch. It
flies from the carousel card, or from the library tile when the carousel has scrolled out of sight
(`launch-source.js`). The keyframes are plain functions of the art's box and the screen
(`launch-geometry.js`), and their timing comes from `--duration-launch` and `--easing-launch` in
`src/home/tokens.css`. When the browser brings the page back from its back/forward cache, the panel
shrinks back into the card and the Recent list catches up. A game's own way back should go back in
the tab's history when the arcade opened it, as Steel & Dust's Back to arcade does
(`src/ui/menus/arcade-exit.js`); loading the arcade again would start it over. With reduced motion the game opens at
once, and the zoom, the slides and the rises are off.

Every interaction has a short sound (`sound-cues.js`): one crisp click, `switch`, both as a card
moves into the center and as the segmented control changes, a rising C major chime and a breath of
noise on Play, a pop for the heart, and airy sweeps for the sheet and for coming back. They are synthesized with Web Audio
(`sound-synth.js`), so the home page ships no audio files; `sound-player.js` makes the audio context
on the first cue, which always follows a tap, click or key press as browsers require, and plays
everything through one master gain and a limiter. The speaker button in the top bar turns them off.

The arcade installs as an app (`assets/manifest.webmanifest`, standalone, its scope the whole arcade
with every game in it). Its logo is a white joystick on an orange to pink gradient, in front of the
title in the top bar and on every icon; `tools/arcade_icons.py` draws all sizes, run it again after
changing the design. An install banner floats at the bottom (`InstallBanner.tsx`, `use-install.ts`,
`install.css`):
where the browser hands over its install prompt (`beforeinstallprompt`, Chrome and Edge) it offers
Install, and on an iPhone or iPad, where Safari installs only from its Share menu, it says where to
tap. It never shows inside the installed app, and Not now (or turning down the browser's dialog)
holds it back for two weeks (`install-offer.js`, the time kept by `preferences.js`). While it is up
on a short screen, the hero's buttons rise above it. Chrome prompts only for a page with a service
worker that has a fetch handler, which the arcade's offline worker is (see Offline).

A support banner floats in the same place (`Banners.tsx`, `use-support.ts`, the install banner's
styles with a heart for the icon, `support.css`) and asks a regular to chip in, with Support opening the donate
sheet (`supporters/#give`). It asks only someone back from a game who has opened 3 games or more
(`support-offer.js`; `preferences.js` counts plays, and a player from before the count was kept has
their Recent list). Back from a game means a game was opened since the banner last looked, so it
sees every way back: the Back button (the back/forward cache), Steel & Dust's own step back, a
reload, or a game on another site. Its very first look only takes the count, so no one is asked on
arrival. It never asks after a gift from this device (the supporters screen records it, and the
arcade reads it afresh, so a banner brought back from the back/forward cache, or uncovered as Back
pops the supporters screen, after a gift steps aside), nor while the install banner is up, so only one asks at a time. A banner left alone comes back in a
week, and Not now holds it back for 30 days.

## Search and link previews

The arcade lives at `https://www.khmerarcade.games/`. Search engines and link previews (Facebook,
Telegram, X, Discord) want whole addresses, so the few tags written for them are the one place the
pages name that domain; every other URL stays relative. Each page served here carries:

- a `<title>` and a description with the words people search for (Khmer, Cambodia, Angkor),
- `<link rel="canonical">`, its one address, since the bare domain and `www.` send the same page
  and a game page can be loaded under a query (`boot-recovery.js`),
- Open Graph tags and `twitter:card` `summary_large_image`, so a shared link opens into a picture.

The home, supporters and credits pages share `assets/social/entry-screen.jpg`, the arcade's entry screen at
1200x630: the home page in its light appearance with Steel & Dust picked, taken in a 1200x630 window
at 2x and scaled down. A game shares a picture of its own from its own folder (Steel & Dust's title
screen, `games/steel-and-dust/assets/social/`). The home page also names the site for search results
in JSON-LD (`WebSite`). `robots.txt` blocks nothing, as Google renders the home page and its list
comes from `api/games`, and names `sitemap.xml`, which lists the home, supporters and credits pages
and every game served here, but not one on its own site. `test/integration/seo.test.js` fails when a page
is missing from the sitemap or its tags, or its picture is not a 1200x630 JPEG the server sends.

**Analytics.** Cloudflare Web Analytics counts visits to every page: Cloudflare adds its beacon at the
edge, so no file in the repo loads it. Google Analytics 4 counts what players do on the home page,
and only for those who say yes. On the live site (`LIVE_HOSTS` with a `MEASUREMENT_ID`, both in
`analytics-config.js`) a banner in the install banner's place asks first (`use-consent.ts`,
`Banners.tsx`, `consent.css`), and the install and support banners wait until it is answered. Allow loads Google's
tag (`google-tag.js`, with ads and Google signals off); No thanks loads nothing. The answer is kept in
`localStorage` under its own key in `analytics.js`, not in `preferences.js`, since a browser can
still hold an older `preferences.js` after a deploy. Privacy choices at the foot of the page asks
again; a no after a yes turns storage off and clears the `_ga` cookies. `analytics.js` sends an event only while a yes
stands. The events and their names are in `analytics-events.js`: a play (with the game and its
source: Play, Details, a card, the keyboard or a gamepad), a tap on a teaser, Details, the heart, the
library filters and Show more, the sound and appearance switches, each link to the supporters and
credits pages, and the install and support banners shown, taken and turned down. Each one is sent
from where it happens, through the arcade's one `analytics` (`createArcade`). A copy run anywhere else (a laptop, the
tests) asks nothing and sends nothing.

A coffee button floats at the bottom right (`Coffee.tsx`, `use-coffee-note.ts`, `coffee.css`), round and in the orange the
maker picked for Buy Me a Coffee's own widget, which it replaced so no script of theirs loads. It
pops in a moment after the arcade opens, and a note pops out of it with the maker's photo and a
thank-you in Khmer (`lang="km"`, with the taller line Khmer needs), then steps back into it after
nine seconds; tapping the note opens the sheet too, and its own button puts it away. The sheet
(`CoffeeSheet.tsx`, `coffee-sheet.css`) offers both ways to give: Pay with KHQR, which pushes the
supporters screen with its donate sheet open (`supporters/#give`), and Buy me a coffee in their
yellow, which takes a card from anywhere in a new tab. Gifts on Buy Me a Coffee do not reach the
supporters list. On a phone the hero's buttons rise above the coffee button. The note sits beside
the button where it fits under them, as on a tall phone, where the hero stops growing and leaves room
below its buttons, and floats above them where it does not (`coffee-note-spot.js` measures when it
shows), so Play stays in reach. The button and note wait while a banner is up across the bottom.

## Supporters page

Every game is free, so the arcade thanks the people who chip in on a screen of its own,
`supporters/` (`SupportersScreen.tsx` and the rest of `src/supporters/`, with a page of its own,
`supporters/index.html`). It is part of the arcade, not a game, so it shares the home's tokens,
buttons, segmented control and notice, and follows the same light or dark choice
(`appearance-early.js`, `appearance.js`). Two links lead there from the home page:
a heart in the top bar (the heart alone on a phone, `support.css`) and a card under the library.
It is pushed over the arcade (see One app): it slides in, and its Back pops back to the arcade as it
was left. Its bar is the credits page's (`src/home/page-bar.css`): it stays at the top, and as the
large title scrolls under it, the page fades out under its soft edge and it shows Supporters small;
on a phone Back keeps its
chevron alone. Each page sets where its own large title passes under the bar (`--scroll-*-condense-*`
in `tokens.css`), and `test/integration/page-bar.test.js` holds both pages to it.

The list comes from the server, `GET /api/supporters`:

```json
{
  "currency": "USD",
  "supporters": [
    {
      "name": "Sok Dara",
      "amount": 25,
      "tier": "diamond",
      "date": "2026-10-20",
      "message": "Keep it free!"
    }
  ]
}
```

The list comes in the order the gifts were made, oldest first, the same for every reader, and each
page or game sorts it its own way (the supporters screen by Top or Recent, Steel & Dust's credits by
tier); one address with one answer is also the one the offline worker keeps. Each gift carries its
`tier` (`bronze`, `silver`, `gold` or `diamond`), named by the server from the amount
(`supporters/tiers.js`), so a game reads it without the arcade's code. No tier is stored: it follows
from the amount, so new steps need no migration.

The gifts live in Postgres, in one `supporters` table (`apps/server/src/db/migrations.js`): amounts
in whole cents, a `created_at`, and a `hidden` flag. The date sent is the day in Phnom Penh. Without
`DATABASE_URL` (a laptop, the tests) the server keeps them in memory until it stops; on Railway it
refuses to start without Postgres, since a deploy would wipe them (`railway.js`). Railway's
pre-deploy runs `migrate-cli.js`, which applies each new migration in its own transaction and
records it in `schema_migrations`; `npm run db:migrate` does the same against any `DATABASE_URL`.

**Giving.** Become a supporter (and Be the first supporter, under an empty list) opens a sheet in
three steps (`DonateSheet.tsx`, its steps in `DonateForm.tsx` and `DonateSteps.tsx`, the flow in
`use-donate-flow.ts`, `donate.css`, and the dialog through `use-sheet.ts`, as every sheet):

1. An amount (four quick ones, or any from $1 to $10,000 in dollars and cents), a name (empty gives
   anonymously) and a message. `donate-form.js` checks them, with the server's limits; a test keeps
   the two equal. As the amount changes, its tier shows under it (`tiers.js`): Bronze from $1,
   Silver from $5, Gold from $10 and Diamond from $25, one for each quick amount, with how much more
   reaches the next. A tier is a cut gem drawn in CSS (`tier.css`), in the podium's metals and a
   diamond blue with a glint; it pops when the tier changes. The server names each listed gift's tier
   from the same steps, and has the last word; a test keeps the sheet's steps equal to the server's.
2. The KHQR code (`assets/donate/khqr.jpg`, Wing Bank, NOV SOCHETRA) and the amount to send with any
   bank app that scans KHQR. A phone can't scan its own screen, so Save the code downloads it for
   the bank app's scan-from-photo. No one can see whether money arrived, so I sent it is the gift;
   it counts down for 10 seconds first (`use-pay-wait.ts`, `pay-wait.js`), time to open a bank app and pay, so it is
   not a tap straight through. Back and Continue start the count again.
3. Thanks, with the gift's tier, a cheer (a rising arpeggio, `cheer` in `sound-cues.js`) and confetti
   bursting from the heart (`confetti.js` moves the paper, `confetti-view.js` draws it on a canvas
   for `--duration-confetti`, `use-confetti.ts`). The canvas is a popover, so while it plays it sits in the top layer
   over the whole screen, above the sheet; with reduced motion there is none. The list loads again
   with the new name, staying up until the new one is in, so it never blinks out to the spinner.

The server reads the gift again (`read-donation.js`): it squeezes spaces, drops control characters,
counts a name's characters as Postgres does (by code point, as a Khmer name needs), and holds the
table's own checks. It takes 5 gifts per visitor in 10 minutes (`security/rate-limit.js`; behind
Railway's proxy, the visitor is the last `X-Forwarded-For` entry), bodies of at most 2 KB, and JSON
only. A fake gift is hidden, not deleted, with
`UPDATE supporters SET hidden = true WHERE id = …` (`docs/deploy-railway.md`).

`readSupporters` (`read-supporters.js`) checks the list: an entry needs an amount above zero, an empty
name shows as Anonymous, and a date must be `YYYY-MM-DD`. Everything on the list is public, so a
supporter who wants no name gets an empty one, not a hidden one. `ranking.js` ranks by amount (equal amounts share a place: 1, 2, 2, 4) and
sorts by day for Recent; `view-model.js` turns the list into labels (money and dates through `Intl`,
whole amounts without cents), and the components only write them out (`SupportersLists.tsx`,
`SupporterParts.tsx`); the list comes through TanStack Query (`use-supporters.ts`). The top three stand on a podium with
gold, silver and bronze, second, first and third from the left, and everyone follows in a grouped list
under a Top and Recent switch that clicks like the home page's. Each supporter gets a round monogram,
colored by their name (`paletteOf` in `format.js`); anonymous ones stay gray. Beside each name, on
the podium and the list, a chip shows the gift's tier: its gem and name (`TierChip`), kept apart
from the place medals so a Gold gift in second place reads plainly. With no one on the list
yet the page says so and invites the first.

**Loading.** The arcade's screens swap their loading notice for what they load, or for an error,
through `LayoutSwap.tsx` and `src/home/layout-swap.js`, given the blocks that change, so the screen
never jumps in one frame. It measures the blocks just before React changes them (the one thing only a
class component can do), lets the change happen and plays the difference; a change that lands while
the last still plays starts from where everything shows at that moment, as iOS animates a
layout change: what stays but moves glides from its old place on the spring (`--duration-rise`),
what goes leaves a copy where it stood that fades out (`--duration-normal`; the copy has no ids and
is inert, so it is never found, reached or announced), and what comes waits while the rest makes
room, then rises in, one after another. As the supporters come in, Become a supporter glides down
under the stats, which would otherwise shove it down 60px in one frame, while the spinner fades;
then the stats, the podium and the list rise in. On the home page the spinner fades out over the
stage's own fade-in (`stage-enter` in `hero.css`) and the library rises in under it. It moves
elements with the Web Animations API, on their own layer, so it never stops the slide in from the
arcade (see One app), which the list often lands in the middle of. With reduced motion, or without the tokens (the tests), the swap happens at once.
`test/regression/bugs/supporters-load-jump.test.js` holds the supporters page to it. The games and
the Details sheet load nothing this way, so they keep their own motion.

## Credits page

`credits/` (`CreditsScreen.tsx`) says who makes the arcade, like the profile card at the top of an iOS
contact, and is part of the arcade the way the supporters screen is: the home's tokens, buttons and
light or dark choice.
The home page signs off under the library with Made by Nov Sochetra (`made-by.css`), which leads
there; it sits after the controls hint, which touch screens hide, so every screen shows it.

It is mostly markup and CSS (`credits-links.tsx` lists its rows), pushed over the arcade (see One
app): it slides in, and its Back pops back to the arcade as it was left.

A photo of the maker and their brother as children heads the page, as an artist's photo heads their
page in Apple Music (`cover.css`, `assets/credits/childhood.jpg`): it fills the top behind the bar,
drifts in the arcade's slow Ken Burns zoom and fades into the page. The photo is small, so a wide
screen shows it no wider than `--layout-cover-max-width`, its sides fading out too. The maker's own
photo (`portrait.jpg`) sits on its lower edge in a slowly turning glow of system colors
(`maker.css`), over a monogram in the logo's orange to pink that shows until it loads; the home
page's Made by line shows a small copy (`portrait-small.jpg`). The name, the lead and each group
rise in after one another on the arcade's spring. Its links are an inset grouped list like iOS Settings (`rows.css`), each with a
rounded icon in its service's color (`tiles.css`): Find me (Buy Me a Coffee first, then GitHub and
Facebook), Thanks to (the supporters page) and Made with (Inter, Kokoro). A row lights up while it
is pressed, and on a mouse its arrow nudges toward where it leads. The bar floats over the cover; as
the large name scrolls under it, the page fades out under its soft edge and it shows the name small,
as an iOS large title does. That runs on scroll-driven animations alone (`src/home/page-bar.css`, which the supporters page
shares), and a browser without them keeps a plain bar that scrolls away with the cover.
With reduced motion nothing rises, pops or turns. Its foot names the version of the build the page
runs (see A new build), so a phone that seems behind can be checked against the latest deploy.

The arcade's bar and every page's stay clear as in iOS 26, and what scrolls under one fades out
behind a soft edge (`src/home/scroll-edge.css`, the class `scroll-edge` on the bar): a blur tinted
with the page's color (`--color-scroll-edge`, `--blur-scroll-edge`), strongest at the top and gone
a little below the bar (`--size-scroll-edge-fade`). Each bar sets where it comes in
(`--scroll-edge-start` and `--scroll-edge-end`). Where a blur cannot be masked the edge would end in
a hard line, so the bar frosts over with a material and a hairline instead, as iOS bars did before.
`test/integration/scroll-edge.test.js` renders every screen and fails for one whose bar does not
wear the edge. The games keep their own screens.

The arcade and the screens over it change like screens in an iOS navigation stack, in one page (see
One app): a push slides the screen arrived at in over the one left, and a pop plays it backwards.

## Game: Steel & Dust

The game keeps a strict split:

| Folder        | Job                                                                 | May touch the DOM, canvas or audio? |
| ------------- | ------------------------------------------------------------------- | ----------------------------------- |
| `src/data/`   | tuning tables: moves, weapons, enemies, missions                    | no                                  |
| `src/art/`    | sprite and scene colors (the only JS allowed to hold hex values)    | no                                  |
| `src/sim/`    | the 60 Hz simulation: one `game` object in, the same object changed | no                                  |
| `src/render/` | draws a `game` onto a 2D canvas context it is given                 | canvas only                         |
| `src/audio/`  | synthesized sound and music, and the announcer's recorded calls     | Web Audio only                      |
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
`src/render/scene-loaded.js`), after a short grace so a cached road never flashes it. The hero select
shows each hero from card strips of one row (`cards` in `src/data/heroes.js`): a Shade's are the
sword row of its idle and win strips, cut out by `tools/pack_hero_strips.py` (`cutFrom`), and the
Khmer fighters' are drawn for them (`tools/hero_cards`).

The menus and the HUD share one carved-sandstone kit in `assets/ui/` (see its README): nine-slice
frames for the hero cards, the settings panel and the HUD panels, which the HUD draws with
`src/render/nine-slice.js`.
The HUD sits along the top (`src/render/hud/top-bar.js`): the weapon box (icon, name and hits left)
with the lives in a small box under it, health over the ULT gauge beside it, the clock in the middle
(with the wave under it while the camera is locked on a zone), and the score and best combo flush
with the top right corner.
The boxes that change only now and then (the weapon, the lives, the score and the purse) are each
drawn once into a stamp of what they show (`src/render/hud/box-stamp.js`) and laid down with one
`drawImage` a frame; drawn part by part they took most of the HUD's time.

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
(`sfx`, `announce`, `vibrate`, `saveRecords`, `saveHints`, `saveSettings`, `saveRun`, `saveLeaderboard`,
`setMuted`, and `now` for the day a run ends), so it runs in Node tests unchanged.

The hero's blows landing, the hero being hit, a knockout, an ultimate firing, a weapon or gem picked
up and a mission cleared each send a haptic cue through `vibrate` (`buzz` in `src/sim/fx/haptics.js`,
the cues in `src/data/haptics.js`). Each cue is written twice: a vibration pattern for a phone and
rumbles of a gamepad's two motors, longer since a pad's motors take a moment to spin up. The
ultimate's swells to full strength over its cut-in (`startUlt`) and ends before the first blow lands,
which would cut it short; `test/unit/data/haptics.test.js` holds it inside every hero's `intro`.
`src/platform/haptics.js` plays a cue in whatever the player used last (`ui.lastInput`): the first
standard gamepad's `vibrationActuator` (Chrome, Edge and Safari on a Mac), or the phone's
`navigator.vibrate` (Android), and nothing under a keyboard or a mouse. A pad plays one effect at a
time, so each rumble of a cue starts when the last one ends, and a new cue cuts off the rest of the
one playing. Safari on iPhone and iPad can do neither, so Settings shows Vibration only where one of
them exists (`canVibrate`); turning it on plays a blow's cue as a taste.

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
- A wave in a spec may be an ambush instead (`dropIn` or `burrowIn`, `src/data/missions/ambushes.js`;
  timings in `src/data/ambush.js`), whose raiders come in mid-screen (`src/sim/stage/ambush.js`).
  A drop waits overhead for `warn` ticks while its shadow gathers on the road, then falls with its
  weapon raised (the first frame of its attack strip) and lands striking, in a `dropSlam` that
  knocks a hero still on the spot away (`src/sim/hazards/drop-marks.js`), the soil puffing up in
  the road's own color. What it waits on is the road's own painting:
  - Under a `canopy` (Old Grove, Bamboo Pass, Firefly Hollow: the painted trees overhead, their
    `trunks` and `stalks` held to the painting by `test/unit/data/canopy-trees.test.js`) it waits
    above the screen anywhere round the hero, and the trees round the spot sway: the boughs and all
    that hangs from them, easing still toward the patch's sides and down to the canopy's `foot`, in
    clear air below the vines, the trunks among them standing still; bamboo leans from far below,
    each stalk as one (`src/render/scene/canopy-rustle.js`, `canopy-columns.js`).
  - On a road with `perches` (`src/data/backdrops/<folder>.js`: spots in a repeating layer's own
    pixels, held to the painting by `test/unit/data/drop-perches.test.js`) it waits at the free
    place in sight nearest its spot (`src/sim/hazards/drop-perches.js`), its mark kept under it
    as the layer scrolls slower than the road. A crown hides one raider; a ledge stands as many as
    have `DROP.room`, spread from end to end; and none waits behind a hammer or a face tower
    standing on the road, nor drops under one. With no place free, the next raider waits its turn
    on the place soonest left, climbing on `DROP.turn` ticks after the last has leapt, so a lookout
    tower sends a wave down one after another (`src/sim/hazards/perch-turns.js`); with none in sight,
    or its place gone out of sight by its turn, it walks in as any raider does. In a
    `crown` (Pine Ridge's pines, Ember Woods' autumn trees) it hides in the thick of the leaves at
    `x, y`: only that crown sways, in its own layer, and as it lets go the crown's own pixels are
    laid back over it, so it drops out of the leaves (`src/render/scene/crown-cover.js`). On a
    `ledge` (the Raider Camp's lookout tower, the Iron Works' derrick girder and furnace roof, the
    Warden's tower walkways, the Bayon's lintel) it is drawn climbing up over the edge, clipped
    there, waiting, and crouching to spring (`src/render/fx/perched-raider.js`); behind a parapet
    the wall's own pixels from its `wall` line down are laid back over it, so it shows only
    between the merlons, and it springs up onto the wall to leap.
  - The trees move as a bough does under the raider's weight (`src/render/scene/bough-sway.js`):
    it sinks and settles, leans once as the raider shifts, dips and trembles as it gets ready, and
    springs up past rest as it lets go, whipping aside and dying away, eased all the way. Each part
    takes its share of that by how much it gives and moves by whole pixels: only once well past
    halfway to the next, never straight back, never more than a pixel a tick, so nothing
    staircases, tears or flickers (`held-sway.js`, played through from the drop's first tick, so
    a frame is the same however many were drawn; `sway-memory.js` only saves the replay). Where
    the trees of two raiders overlap, their motions add up before that rounding. The patch is laid
    in blocks of rows moved alike, the far plate still under them (`sway-patch.js`,
    `sway-blocks.js`, `layer-spans.js`); `test/integration/render/tree-sway.test.js` plays a wave
    on every road.
  - A phone draws all that every frame, so none of it is worked out twice: a bough's motion once a
    tick for every drop (`bough-sway.js`), a canopy's trunks and stalks once a road
    (`canopy-columns.js`), and how a patch's columns and rows share out the give once while it
    stays put on the screen (`sway-layout.js`, its blocks kept until a part of the trees moves). A
    still layer is laid back in as few pieces as the moved parts touching make, and the shadow in
    runs of pixels alike. Each of these only saves work: the pixels are the same as working it all
    out afresh (`test/unit/render/sway-patch.test.js`).
  - All of that is laid on the still screen with the shake sampled in, and before the air, so light
    shafts, motes and mist still pass in front. Leaves (the road's `ambient.leaves`, or a crown's
    `debris`) drift down and come to rest on the ground, a night road startles fireflies out of the
    branches, and a ledge knocks loose grit in its road's `debris` colors that bounces once and lies
    there (`src/sim/fx/canopy-fx.js`, `grit-fx.js`; from the seeded `fxRandom`, so they never change
    a fight; `src/sim/hazards/drop-styles.js` picks them by what the raider waits on). `rustle`,
    `branchSnap`, `gritTrickle`, `perchLeap`, `clank` and a thud go with it
    (`src/audio/live/ambush-sounds.js`).
  - The shadow multiplies what it lies on, column by column on the road as it is drawn or a deck
    (`floorUnderSky` in `src/render/scene/ground.js`), faint and wide as the raider settles,
    darkening as it gets ready and sharpening as it falls, until it is the raider's own shadow
    (`src/render/fx/drop-shadow.js`; the raider draws none of its own while it drops).

  Out of the sand (Sandstorm Pass, Mirage Temple), it digs in at a screen edge and its mound crawls
  after the hero, stops to shake, and bursts it up, throwing a hero who stayed on it
  (`src/sim/hazards/mounds.js`, the mound cut from the Scorpion Queen's burrow frames). Both are
  projectiles kept inside the screen until their raider is in the fight, and a zone counts a raider
  still waiting to ambush as standing, so it never moves on without it.

- A mission ends when its own boss falls (`isMissionBoss` in `src/sim/stage/mission.js`); a boss met
  earlier on its road is a mid-boss and only opens the road. The score, clock, continues, lives and
  ULT bar carry into the next mission (`enterNextMission`); the hero starts it fresh. A new run
  starts at mission 1; there is no mission select.
- A run has five lives (`START_LIVES` in `src/data/player.js`), shown as hearts on the hero's
  panel (`src/render/hud/lives.js`). Every fall costs one (`loseLife` in `src/sim/stage/lives.js`)
  and nothing gives one back: not a continue, a restart of the mission or a new mission. While lives
  are left, a fallen hero continues where they fell, as any Shade: Continue opens the Shade list,
  and `continueAs` (`src/sim/stage/flow.js`) brings the hero back as the one picked, keeping the
  run. The last fall is Game over: the defeat menu offers only Start from mission 1, a new run with
  five lives, the Leaderboard and Quit.
- A run is saved as each mission starts (`saveCheckpoint`, `src/sim/stage/checkpoint.js`, kept in
  `localStorage` as `sd_run`): the mission and what the run carries into it, the score, clock,
  continues, lives and ULT bar. Closing the game costs at most the mission being played, and never
  hands back the points scored on it; a fall saves the life it cost (`saveFall`). With a run saved,
  the title leads with Continue mission N, which sets that road up behind the Shade list
  (`resumeCheckpoint` in `src/sim/stage/flow.js`), and Play becomes New game, whose run replaces the
  save once it starts. A run ends at its last fall or at the All clear (`endRun`,
  `src/sim/stage/run-end.js`): its save is let go and, unless it scored nothing or ran with training
  tools, it goes on the leaderboard (`src/data/leaderboard.js`, `sd_leaderboard`), the ten best runs
  played on the device, with the Shade, how far it got, the difficulty, the clock and the day. The
  Leaderboard panel (`src/ui/leaderboard/`, `styles/leaderboard.css`) opens from the title, the Game
  over menu and the All clear screen and marks the run that just ended. A save or board read back
  from storage is checked first (`sanitizeSavedRun`, `sanitizeLeaderboard`): one it cannot use loads
  as no save and an empty board. GitHub Pages has no server, so the board is the device's own.
- A mission ends and the next begins the way the arcade run-and-guns do it. A mission's title
  card (a `stamp` banner: "Mission 2" as it starts, "Mission complete" or "All clear" as its boss
  falls) stamps in a letter at a time (`src/render/hud/title-card.js`, the letters in
  `src/render/text/card-letter.js`, colors in `src/art/title-card.js`): each falls, strikes its
  place, bounces and cools from white to gold, then a band of light runs over the card. Under the
  clear card a pane of dark glass with a gold rim sums up the road's loot
  (`src/render/hud/mission-summary.js`, `summary-panel.js`, colors in `src/art/mission-summary.js`):
  each kind comes in with the sound of taking it and its count rolling up a climbing scale, then the
  purse's take rolls up in coins and lands on a chord (`src/sim/stage/summary-cues.js`, live sounds in
  `src/audio/live/summary-sounds.js`); its ticks are in `src/data/mission-summary.js`, and the clear
  (`CLEAR_TICKS`) is the card, the summary and the wipe. The walk on to the next mission is never
  seen: over the end of the clear screen a wave of diamonds burning at
  their edges sweeps night over the cleared road while the road breaks up into ever bigger blocks
  (`src/render/overlays/mission-wipe.js`, `mosaic.js`, timed by `wipe-timing.js`), and the next
  mission opens out of that night the same way over `REVEAL_FRAMES` drawn frames; the last mission
  stays lit behind the All clear. The ticks it all keeps to are in `src/data/mission-handoff.js`,
  and `src/sim/stage/handoff-cues.js` sends out the sounds on the same ticks: the announcer's call
  ("Mission one! Complete!" as the clear starts, "Mission two! Start!" as its card starts to
  fall), a `stamp` as each letter strikes, the `wipe` rushing in and the `reveal` as the next road
  opens. The calls are the game's one set of recorded sounds, since oscillators cannot say words:
  `assets/audio/announcer/`, two MP3s a mission, voiced by `tools/announcer_voice.py` (Kokoro's
  bm_george, pitched down, cut to the Neo Geo's 18.5 kHz and left to ring in a stone hall).
  `src/audio/announcer.js` loads a mission's calls and the next one's start as it is played, as its
  road does, and plays them through the effects bus; a call not yet in is skipped. A
  mission is drawn and its clock runs only once its painted road has loaded (`missionRoadLoaded`
  in `src/render/scene/backdrop.js`) and so have the picked Shade's strips (`sceneLoaded` in
  `src/render/scene-loaded.js`), so the hero is never drawn as the bare body; until then `main.js` holds the ticks and the screen shows
  `src/render/overlays/loading-screen.js`. Once a road is in, the next mission's road loads behind
  it, so the wait is usually over before the mission is. A file that fails to load still settles,
  and the plain road is drawn in its place.
- A mission waits for its enemies' sheets too, and only for those: every kind that can walk onto
  its road (`missionEnemyKinds` in `src/data/missions/mission-enemies.js`: its waves, mid-bosses
  and boss among them, its reinforcements, and a pack a boss howls in, a move's `packKind`). Once
  they are in, the next mission's load behind them, and as a mission starts every other enemy's
  sheet is let go (`keepMissionEnemies` in `src/render/fighters/enemy-sheets.js`), so a run holds
  one road's raiders and bosses and the next's, never the whole game's. A fighter whose sheet no
  road listed loads it the first time it is drawn and keeps it until the mission changes.
  `test/regression/bugs/enemy-sheets-per-mission.test.js` holds this, and the boss fights in
  `test/integration/sim/boss-long-run.test.js` check every raider a boss calls is on its road's list.
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
  on the sheer step. A raised road whose cross-section is too short to reach the bottom of the
  screen under its high steps gives its backdrop a `deep` body (`deep.png`, 216 tall): only the
  cross-section's rows above `deep.from` follow the surface, and under them the body is laid at the
  world's own rows, so every step stands on the same courses and earth down to the bottom of the
  screen (`src/render/scene/deep-ground.js`). A body built of courses (`deep.faces`) also loads
  `face.png` and `breach.png`, the ends of its courses where a step cuts through it and the two
  broken banks of a cut that runs on down out of sight, drawn at the same world rows.
  `tools/road_body.py` paints them from `ground.png`.

Fighters are drawn from PixelLab sprite sheets in `assets/sprites/`: one folder of strips per playable
Shade (`src/data/heroes.js`; only the picked Shade's are kept, `keepPickedHero` in
`src/render/fighters/hero-sheets.js`, so another picked to go on as loads behind the loading screen
and the last one's are let go) and one sheet per enemy
(`src/data/enemies/enemy-sprites.js`). `src/sim/hero-animation.js` and `src/sim/enemy-animation.js`
pick the frame for a fighter's state; colors that belong to a Shade live in `src/art/hero-themes.js`.
An enemy's grid sheet (a row per strip, a cell per frame) is the source its art is drawn in, but a
cell is as big as the enemy's widest move and a browser keeps every pixel of a sheet it draws, so
the game loads each sheet packed: `tools/pack_enemy_sheets.py` cuts every frame to its paint with a
clear pixel round it, packs the pieces into `assets/sprites/enemies/packed/` in the sheet's own
palette and writes where each piece sat in its cell to `src/data/enemies/atlas/` (the 31 sheets
take 40 MB unpacked instead of 251 MB). `drawEnemyFrame` lands each piece on the screen pixels its
cell put it on, its edges drawn in to whole screen pixels and a centre exactly between two sheet
pixels taking the first (`TIE_BREAK`). Run the tool again after changing a grid sheet:
`test/unit/data/enemy-atlas.test.js` checks every packed piece against its cell, and
`test/regression/bugs/enemy-sheet-memory.test.js` keeps the loaded sheets small. The Scorpion
Queen's grid sheet and her swarm's wasp are baked from ChatGPT images by `tools/queen_sheet/bake.py`
(the prompts and images are in `concepts/enemies/scorpion-queen/`); pack the sheets after it.
A Shade's strips are packed the same way (`tools/pack_hero_strips.py`, both tools on
`tools/sheet_packing.py`): each strip's packed copy sits in `packed/` beside it, in its own palette
or colors, and `src/data/hero-atlas/<shade>.js` holds each strip's frame height and pieces, a line
to a strip (the seven Shades take 49 MB unpacked instead of 142 MB). A hero is drawn a sheet pixel
to a screen pixel, so its pieces land exactly where their frames did. Run the tool again after
changing or baking a strip:
`test/unit/data/hero-atlas.test.js` and `test/regression/bugs/hero-strip-memory.test.js` hold it.
The hero runs wherever it goes on foot (`src/sim/brains/player/run.js`): a held direction sets off
at a walk's pace and picks up to `RUN_SPEED`, and a ground dash held its way runs straight on, in the
hero's run strip, kicking dust up behind each stride and sounding a footstep with it
(`src/sim/fighters/motion-effects.js`; the `step` sound in `src/audio/bank/movement.js`, the bank's
lowest priority, so a footstep never takes a voice from another sound and is the first to go in a
crowded fight). A dash sounds as a swirl of air (`src/audio/bank/dashes.js`): two bands of noise
crossing like a phaser over a dark rush and a low whomp, a padded push-off under the ground dash.
Every part eases in and out (`swell` in `src/audio/synth/curves.js`, `rush` and `hush` in `air.js`)
and the hiss is rolled off its top, so it never clicks, rattles or hisses
(`test/regression/bugs/rough-dash.test.js`). Attacks
out of the run are the ones from a stand; jump is a long running leap.
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
pixels of every frame the way the Ember Shade's frames burn. A strip drawn for one weapon's row
alone, in `heroes/<id>/<weapon>/`, takes that row in place of the baked one: the Ember Shade's spear
moves, Bokator's bare-hand moves, and the Angkor Warrior's run and dash with his dav gripped in his
trailing fist. The two Khmer fighters' select cards play loops drawn for them, `card_pose.png` and
`card_idle.png`, cut from their sheets and lit by `tools/hero_cards/`.

Every hero sets out with their own weapon (`weapon` in `src/data/heroes.js`: the Shades' sword,
the Angkor Warrior's gold dav, a sword too, and Bokator's fists), which never breaks
(`takeOwnWeapon` in `src/sim/fighters/loadout.js`, given by `resetRun` and again by `startPlay`,
since the road is set up before the hero is picked); a weapon picked up breaks after its hits and
leaves the hero their own again.

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
- Light fills the ULT bar and Heavy spends it (`src/sim/combat/ult-bar.js`). The bar holds two
  ultimates (`ULT_MAX`); a ULT spends one (`ULT_FULL`). Only the hero's own light blows fill it
  (`meterForHit`: not heavies, ultimates, or the summons and shots they leave), and so do blows
  the hero takes. Every heavy move (`isHeavyMove`, `src/data/moves/heavy-moves.js`) pays the
  difficulty's `heavyCost`; the player brains start moves through `src/sim/brains/player/heavy-gate.js`,
  which refuses a heavy, or a charge, the bar cannot pay for, with a fizzle, "No power", the
  `heavyBar` hint and a red blink of the gauge (`src/render/hud/ult-gauge.js`, drawn in two halves);
  the touch HEAVY button greys out (`empty`). A heavy let go out of a charge always comes out.
- Each Shade's heavy is dressed by a kit of its own, run by `src/sim/fx/heavy-feel.js` on every
  tick of a hero's heavy: `windup` and its charge sound as it starts, `gather` over the wind-up,
  `release` (and a lunge, unless the move moves on its own) as it strikes, `trail` while it is
  active, and `impact` on each blow that lands (from `showImpact`); afterimages in the Shade's
  trail color run from just before the strike to just after. A Shade's heavy is five files named
  after it: `src/art/heavy-fx/` (its glow, flash, trail and mote colors), `src/data/heavy-feel/`
  (lean, lunge, afterimages), `src/sim/fx/heavy/` (the kit and its own particle kinds, which
  `update-effects.js` moves), `src/render/fx/heavy/` (those kinds' drawing and layers under and
  over the hero, through `src/render/fighters/heavy-glow.js`) and `src/audio/live/heavy/`
  (its sounds, which its `index.js` sends out louder than the event sounds, the charge about
  12 dB, as they play under the swing and the music), and its own effect strips, if it has any, in `src/data/heavy-fx-sprites/` (joined to
  `FX_SPRITES`, played with `addBurst`; `test/unit/data/heavy-fx-sprites.test.js` checks each strip's size
  and keeps it to 32 colors); each folder's `index.js` gathers the seven. The wind-up glow (dim, full, then hot
  as it strikes) and the lean are drawn only (`heavy-glow.js`), so a heavy reaches as far as ever.
  A kit draws its randomness from `fxRandom` (`src/sim/fx/fx-random.js`), a seeded stream of the
  game's own, never `Math.random`, so dressing a heavy never changes how a fight goes;
  `test/unit/sim/heavy-kits.test.js` and `test/integration/sim/heavy-feel.test.js` hold every kit
  to this contract.

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
`tides` roll along the floor from the front of her coil (`src/sim/hazards/tides.js`), each out of
a crash of its own (in phase two she rises and crashes again for the second), her Seven
Heads' `heads` each spit a water naga that takes shape just ahead of its mouth while its lane is
marked and dives to it, low or high (`naga-bolts.js`), and her Rainbow Naga gathers the rainbow in
her hand, sends a spirit naga sweeping the floor from each side and marks the spot a serpent of water bursts up out
of (`spirit-nagas.js`; their rules in `moat-rules.js`). The Bayon Guardian's cues are gathered in
`src/sim/bosses/bayon-cues.js`: his `gaze` marks the ground under the hero, and either side of it in
phase two, and a gold pillar bursts there that leaves the hero `stoned`, slowed to under half pace
for a while (`src/sim/hazards/gaze-pillars.js`, `src/sim/summons/stone-skin.js`, through
`afflict.js`); his `roots` burst along the floor and then under the hero (`fig-roots.js`); his
`faces` rise at the screen's edges in turn and breathe a beam at a hero's waist across most of the
arena (`stone-faces.js`); and his crumble falls to rubble out of reach and reforms him `glowing`
(`src/sim/bosses/crumble.js`; rules in `bayon-rules.js`). The Warden Ox's `hook` (`src/sim/hazards/chain-hook.js`, `chain-pull.js`)
flies at the hero's waist (jump it), drags a hero it catches to where his chop lands and lets go as he raises
the hammer (the chain runs from the fist of the frame he is drawn on, `chain-fist.js`, and a held
hook's ring never sits behind it); his `guard` (`src/sim/bosses/guard-counter.js`) turns every blow from the front as a block
would, but a parry: the striker reels and he answers with `guardStrike`; his Executioner's Round
spins him with a red `whirl` that follows his body (a burst with `follow`, `src/sim/summons/bursts.js`)
and ends in a `cleave` (`src/sim/bosses/executioner.js`) whose crack runs off both ways at a steady
pace, each running end a `rift` read from the same reach as the drawn fissure (`rifts.js`; rules in
`warden-rules.js`). They are all projectiles,
drawn from the `fx/` strips (`src/render/fx/rock-hazards.js`, `venom-hazards.js`,
`wasp-hazards.js`, `storm-hazards.js`, `forge-hazards.js`, `temple-hazards.js`, `moat-hazards.js`,
`bayon-hazards.js`, `stone-face-draw.js`, `warden-hazards.js`, gathered in
`boss-hazards.js`; the copies are drawn with the boss in `src/render/fighters/mirages.js`); a
puddle, a lava pool, a jar or a stone face, standing on the
road, is drawn under the fighters' feet, and so is the mark of a lightning strike, while the strike
itself is drawn over them. The Bayon Guardian's light is drawn in code, a screen pixel at a time
(`fine-pixels.js`, its stars and halos in `light-star.js`): the gaze's ray and the flares at his
eyes and where it lands (`gaze-ray.js`, `gaze-flares.js`), the ring of runes it marks and the
pillar's shock ring (`rune-ring.js`, `pillar-burst.js`), the crack a root opens in the road
(`root-crack.js` along `crack-path.js`), and a face's beam (`face-beam.js`, `beam-flares.js`) and
the light it gathers first (`mouth-gather.js`), which is drawn over the fighters and over his
ultimate's dim. His footfalls' dust, the light of his reforming, and once reformed his gold rim
and the motes rising off him are drawn with his sprite (`src/render/fighters/guardian-light.js`).
Every boss and everything it leaves lands on the screen's pixel grid: a boss's frame and an
effect's frame grown with a boss have their edges cut to whole screen pixels (`snap` in
`fine-pixels.js`, `onScreenPixels` in `fx-sheets.js`), and a strip laid along a slant (the Furnace
Knight's flame lances, the Warden Ox's chain and flying hook) is never rotated but stepped down the
slope a column of screen pixels at a time (`slanted-frame.js`).
While an ultimate
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
- `test/regression/bugs/audio-node-leak.test.js`, `tint-memory.test.js`,
  `test/integration/sim/long-run.test.js` (every Shade, zone after zone) and `boss-long-run.test.js`
  (every road's boss, kept in phase two so its ultimate and hazards keep coming) hold these lines.

### Loot

Only some raiders pay: one knocked down now and then spills a few gold coins where it falls, at times
with a gem among them, and on its own odds an apple; every boss leaves a chest (`dropLoot` in
`src/sim/items/loot-drops.js`, called from `knockOutEnemy`; the table, values and timings in
`src/data/loot.js`). The pieces live in `game.loot`, the chests in `game.chests`: a piece fountains
up, bounces lower each time on the floor under it, off a sheer rise and off the screen's edges, then
rolls on along the floor, slowing until it rests, and drops off the end of a deck it rolls over
(`loot-motion.js`). The hero takes a piece only by touching it with their body (their hurt
box), once it has been out a moment: nothing is pulled in from afar, so a piece jumped clear over
stays where it lies (`loot.js`); one no one takes, a raider's or the boss's, blinks out after five
seconds. A coin is one
coin in the purse and 10 points, a gem ten coins and 100, an apple a bite of health
(`loot-collect.js`); coins taken in a quick run climb a major scale through the coin sound's playback
rate. A chest pops up out of the boss, lands, rattles, bursts open in a column of gold light and
flings its loot out to both sides, fast and slow (`scatterPieces`, `CHEST_SCATTER`), so it bounces and
rolls all over the arena (`loot-chest.js`). When the mission's own boss falls, the loot time starts
(`src/sim/stage/loot-time.js`, `game.lootTime`): every raider left falls with it, none come after,
the clock stops, the music goes quiet, nothing left on the road can hurt the hero (`applyHit`) and
no ultimate starts, and the hero walks about fetching the loot. It ends a short beat after the last
piece on screen is taken or has blinked out, and never runs past `LOOT_TIME.limit`. Only then does the clear start (`stageClear`). What the
hero took on the road is counted in `game.missionLoot` (`addToPurse`) for the clear's summary. The
purse (`game.coins`) carries into the next mission with the score, is saved
with the run as each mission starts (`saveCheckpoint`; a save from before the purse loads with an
empty one), and hangs under the score on the HUD (`src/render/hud/purse.js`). The road holds at most `MAX_LOOT` pieces; a
crowd felled at once pays the rest straight into the purse.

Loot draws from a seeded stream of its own (`loot-random.js`), never `Math.random`, and moves the
camera only with a kick, never a shake (whose offsets are random draws), so the raiders and bosses
fight the same whether the hero gathers it or not: coins and gems never change a fight, and an
apple only through the hero's health (`test/regression/loot-leaves-the-fight.test.js`). The art is
in `assets/sprites/loot/` (`src/data/loot-sprites.js`): coins, gems, apples and sparkles at the
fighters' density, the chest at the crates'. Pieces on the road are drawn over the fallen and under
everyone standing; the sparkle where each is taken, over everything. The
sounds are bank sounds of their own `loot` group (`src/audio/bank/loot-pieces.js`, `loot-chest.js`)
that never outrank a blow landing when every voice is busy.

### Behavior lock

`test/regression/` replays bot-played scenarios and compares every 30th tick and every rendered frame
against recorded fixtures: two long runs as the Moss Shade (first captured from the original
single-file game), one shorter run for each of the other Shades, one against each boss kit (Gravel Khan, the Rust
Colossus, Ironhorn, the Cobra Matriarch, the Scorpion Queen, the Gnoll Packlord, the Storm Djinn, the
Furnace Knight, the Sand Pharaoh, the Naga Raja, the Bayon Guardian), one run
through the wide zones
of the fourth mission, one over the hills of the third, one into the second's ambush out of the
trees, one through the seventh, the sandstorm canyon (and its ambush out of the sand), and one
through the twelfth, the Bayon.
Any change to
arithmetic, to the order of `Math.random()` calls or to the order of canvas calls shows up there.
When a change is meant to alter behavior, regenerate the fixtures with `npm run test:regression -- -u`
and review the diff.
The replays swap `Math.sin` and `Math.cos` for a port of V8's fdlibm (`test/support/portable-trig.js`):
on Apple Silicon the native ones round about one result in 200 differently from x64, where the
fixtures were recorded and CI runs, so without it a Mac fails runs no change touched.

## Tests

Each app keeps its tests next to it, split by kind, and Vitest runs them as three projects:

| Folder              | Project       | What belongs there                                                                                                                                                                                     |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `test/unit/`        | `unit`        | one plain function or module at a time                                                                                                                                                                 |
| `test/integration/` | `integration` | several modules together: the real HTTP server, the whole arcade rendered with its fakes (`support/render-arcade.tsx`, happy-dom), the game menus on their real markup, whole fights in the simulation |
| `test/regression/`  | `regression`  | the recorded game runs and sound bank, and one test per fixed bug (`regression/bugs/`, `regression/past-fixes/`)                                                                                       |

`apps/web/games/steel-and-dust/test/support/` holds the scenario bot, the recording canvas and the
game drivers the regression and integration tests share. `npm run typecheck` checks the arcade's
TypeScript (`tsconfig.json`); its plain logic modules stay JavaScript, typed from their code.

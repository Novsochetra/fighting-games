# Naga Eleven

The Sochetra story: pixel-art football from a village in Kampong Cham to the world stage. A boy with
a gift trains hard, loses, learns, and lifts the trophy for Cambodia for the first time. The game
is for young Cambodian players: **we have good players, and one day we will lift a trophy for our
country.**

It is inspired by the _kind_ of game the 1990s football anime games were (a story mode, rival stars,
big special shots, cut-ins), never by their content: every character, name, move, screen and menu
here is our own, Khmer in feel. Real countries are fine; real players, real federation names and
logos, and trademarked cup names are not (we play the **Asian Youth Championship** and the **World
Championship**).

This file is the game's bible: the story, the rules every helper follows, who owns which files, and
the contracts the parts meet at. Read it whole before you change anything.

## The story

### Cast (ids in `code`)

| id             | who                                                                                             | look                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `sochetra`     | the hero, #10, a forward with a gift; ages `child` (ch 1), `teen` (2), `young` (3), `adult` (4) | brown skin, thick black hair standing up at the front, bright fierce eyes |
| `neary`        | his mother, sells num banh chok at Chrey market                                                 | warm smile, hair in a bun, gold stud earrings, patterned blouse           |
| `ta-sok`       | his grandfather, a village keeper in his youth; tells the legend of the Naga                    | white hair, deep wrinkles, red-and-white krama scarf, kind eyes           |
| `coach-vannak` | the village school teacher and coach, who never got his own chance                              | 40s, cap, whistle, thin moustache, white teacher's shirt                  |
| `dara`         | Sochetra's best friend, the goalkeeper, loyal and funny; ages like Sochetra                     | round face, short hair, big grin, keeper's gloves                         |
| `rithy`        | the Phnom Penh star, proud; rival in ch 1 and 2, teammate in 3 and 4; ages like Sochetra        | sharp eyes, swept city haircut, confident smirk                           |
| `coach-sokha`  | the strict Kampong Cham High coach (ch 2)                                                       | glasses, tracksuit, folded arms                                           |
| `coach-bora`   | the national youth coach who scouts Sochetra (ch 2 end, 3, 4)                                   | 50s, grey temples, national team jacket                                   |
| `haruto`       | Japan's playmaker, calm and precise (ch 3 rival)                                                | neat black hair, cool narrow eyes                                         |
| `minjun`       | Korea's engine in midfield, never tires (ch 3)                                                  | short sporty hair, intense stare                                          |
| `farhad`       | Iran's giant keeper (ch 3)                                                                      | tall, short beard, gloves                                                 |
| `rafael`       | Brazil's joyful genius (ch 4 rival)                                                             | curly hair, headband, wide grin                                           |
| `lukas`        | Germany's iron defender (ch 4)                                                                  | blond crew cut, square jaw                                                |
| `announcer`    | the match commentator                                                                           | headset and microphone                                                    |
| `narrator`     | the story's voice; no portrait                                                                  |                                                                           |
| `villager`     | any villager, child or fan; no fixed face                                                       |                                                                           |
| `footballer`   | any plain player in a duel; no fixed face                                                       | a boy or man of the chapter's age in his side's kit, skin and hair        |

### Chapters

1. **The Boy from Chrey Village** (7 v 7, Sochetra 11). Ta Sok tells the legend of the Naga that
   guards the Mekong. Coach Vannak sees the gift. Chrey School plays a friendly with the next
   village (the tutorial), wins the Kampong Cham semi-final, and travels to Phnom Penh for the
   National Primary Schools Cup final against Royal Kids and Rithy. Rithy runs the first half.
   Late in the final, losing, Sochetra remembers the legend: **Naga Shot** wakes. Chrey wins.
2. **Fire of Youth** (11 v 11, 15). Kampong Cham High under Coach Sokha; Dara in goal. Training at
   dawn by the temple steps. The National High School Championship: a group of three (Siem Reap
   High, Battambang High), a semi-final (Kampot High) and the final against Phnom Penh Elite and a
   stronger Rithy (**Preah Khan Strike**). Sochetra learns **Hanuman Leap** and, in the final,
   **Garuda Volley**. Coach Bora watches from the stand; the call-up letter comes.
3. **Asia Awakens** (11 v 11, 19). Cambodia's youth team: Rithy is now a teammate, and the two must
   learn to trust each other. The Asian Youth Championship group: **Japan first, and Haruto beats
   them** (the story's great loss; see "Losing once"), then Thailand and Korea (Minjun). A night of
   training, the semi-final against Iran and Farhad, and the final against Japan again. Sochetra
   and Rithy's **Twin Naga** wins Cambodia's first Asian trophy.
4. **The World Stage** (11 v 11, 24). Cambodia at the World Championship for the first time; Chrey
   watches on one TV. The group: **Brazil first, and Rafael beats them**, then Nigeria and
   Mexico. The semi-final against Germany and Lukas, and the final against Brazil. Late in the
   final Sochetra's last form wakes: **Seven-Headed Naga**. Cambodia lifts the trophy. The epilogue
   is a sunrise at Angkor, and a child in Chrey kicking a ball: "One day, it will be you."

### Losing once

A cup starts with a group: each team plays the others once and the top two go on, so a loss there
does not end the story. Japan (ch 3) and Brazil (ch 4) are made strong enough to beat Sochetra the
first time, but the game **never forces a loss**: every match has a `lose` and a `win` scene, and a
player good enough to win the first meeting gets the rival's "I was not playing at full power. See
you in the final." In a knockout match or a final the player must win; a loss plays its scene and a
training scene, and the match is played again. A drawn knockout goes to penalties.

The rival is at its very best that first day: the opener's `opponentForm` (+15 for Japan, +10 for
Brazil) plays it above its table, and Cambodia's nerves, its `teamForm`, add the rest: -5 at its
first Asian match, where Haruto, like every rival a duel scene is written for, hunts Sochetra in the
first part of the match until they meet and leaves Japan's attack a man short, and -11 at its first
World Championship, where Brazil's table is already near the top of the stat scale. The target: a
decent player (`test/support/decent-human/`) loses each opener 55-70% of the time (measured over 450
matches each: Japan 62%, Brazil 64%) and wins the final against the same side about four times in
five (89% and 85% over 150, penalties included), the final played with no form. Measured once shots
fall away with distance rather than all or nothing (`KEEPER.reaction`, `readSpread` and `diveReach`,
`KICK.shotMin`), tackles come less often with a moment after each (`AI.challengeChance`,
`TACKLE.respiteTicks`), a long ball can be contested (`src/sim/chasers.js`) and the player's side
runs for every loose ball (`SWITCH.looseLag`, `PLAYER.steeredEdge`).

### Special moves (ids in `code`)

| id                  | owner    | kind    | wakes                              |
| ------------------- | -------- | ------- | ---------------------------------- |
| `naga-shot`         | sochetra | shot    | ch 1 final, losing late            |
| `hanuman-leap`      | sochetra | dribble | ch 2 training                      |
| `garuda-volley`     | sochetra | shot    | ch 2 final                         |
| `twin-naga`         | sochetra | shot    | ch 3 final (a duo: Rithy near him) |
| `seven-headed-naga` | sochetra | shot    | ch 4 final, losing late            |
| `preah-khan-strike` | rithy    | shot    | his from ch 2                      |
| `angkor-wall`       | dara     | save    | his from ch 2                      |
| `silent-moon`       | haruto   | shot    |                                    |
| `mirror-step`       | haruto   | dribble |                                    |
| `hwarang-charge`    | minjun   | dribble |                                    |
| `mountain-guard`    | farhad   | save    |                                    |
| `samba-mirage`      | rafael   | dribble |                                    |
| `carnival-rocket`   | rafael   | shot    |                                    |
| `iron-gate`         | lukas    | tackle  |                                    |
| `power-shot`        | any star | shot    | a strong shot any named player has |

These are the stars' moves (`family: 'star'` in `src/data/moves.js`). Every other player has a skill
of his own, and players string skills together: see "Skills and combos".

## Skills and combos

Specials were rare: spirit came back at `SPIRIT.refill` (0.003 a tick), Sochetra struck two or three
a match and the other players had nothing. Now **every player has one skill**, **good play fills
spirit**, and players **combine**: quick passes build a pass combo, two players strike a duo, and a
skill straight into another is a chain. The one rule a player learns: **one skill plays on; two
together stop for a cut-in.**

Every skill also **reads on the pitch** in the normal view (a trail, an aura, an impact), and every
shot that meets a keeper in a big moment plays the **save cam**, a short shot from in front of the
goal of the keeper diving, punching or beaten.

The data is written (`src/data/skills.js`, `src/data/combos.js`, the new keys of `SPIRIT` in
`src/data/tuning.js`, the `role` and `combo` families in `src/data/moves.js`,
`src/data/move-effects.js`, `src/data/save-cam.js`, `src/data/look-stand-ins.js`,
`src/data/skill-words.js`, tested in `test/unit/data/`); nothing plays it yet. The jobs at the end
build it.

### Who has which skill

1. A star with moves plays his own moves and no role skill (Sochetra, Rithy, Dara from ch 2, the
   rivals).
2. A star with none takes his `CAST_SKILLS` entry: Dara in goal for Chrey in ch 1, **Belly Block**.
3. Everyone else takes `ROLE_SKILLS[style][post]`. The style is `world` for a side whose kit is in
   `WORLD_KITS` (the foreign sides), else `khmer`. The post is the formation role, but a midfielder
   or forward whose slot stands `SKILL_RULES.wingFromMiddle` (0.3) or more across from the middle
   plays the `wing`: the two wide midfielders in 7 v 7, the two wide forwards in 11 v 11.

| post       | Khmer sides                     | world sides                 | kind / play   | power | cost | look (planned)     |
| ---------- | ------------------------------- | --------------------------- | ------------- | ----- | ---- | ------------------ |
| keeper     | `bayon-eyes` Bayon Eyes         | `panther-dive` Panther Dive | save / save   | 24    | 20   | `bayon` `panther`  |
| defender   | `elephant-guard` Elephant Guard | `steel-block` Steel Block   | block / block | 14    | 35   | `elephant` `steel` |
| midfielder | `apsara-curl` Apsara Curl       | `curl-pass` Curl Pass       | pass / pass   | 12    | 40   | `apsara` `plain`   |
| wing       | `kite-cross` Kite Cross         | `whip-cross` Whip Cross     | pass / cross  | 12    | 40   | `kite` `plain`     |
| forward    | `kouprey-kick` Kouprey Kick     | `thunder-shot` Thunder Shot | shot / shot   | 14    | 35   | `kouprey` `plain`  |
| Dara, ch 1 | `belly-block` Belly Block       |                             | save / save   | 20    | 25   | `belly`            |

`kind` is the duel option the skill is, `play` what it does in the open. The two styles carry the
same numbers post by post, so a side is never stronger for its names. For Chrey in ch 1 that is Srey
Pov and Kosal on Elephant Guard, Pisey and Tola on the Kite Cross, Vuthy on the Apsara Curl.
Cambodia's centre forward is always Sochetra, so the Kouprey Kick is the school sides' number nines.

### Using a skill

- **A shot skill**: the player holds SHOOT to a full charge (`KICK.chargeTicks`) and lets go, with
  the spirit for it. The computer, with the spirit, strikes half its shots so (`SKILL_AI.shot`).
- **A pass or cross skill**: the player holds PASS to a full charge and lets go: the skill pass
  instead of the longest lofted ball. The computer, with the spirit, plays a quarter of its long
  passes so (`SKILL_AI.pass`) and 0.4 of its crosses (`SKILL_AI.cross`).
- **A dribble move** (stars only): with the ball, the player taps RUN twice within
  `SKILL_RULES.doubleTap` (15 ticks). The computer plays it with `SKILL_AI.dribble` (0.3) as a
  defender closes in front.
- **A block, save or tackle skill**: no button. It fires by itself, on both sides alike, and pays
  only when it fires.

Keys, pad and touch keep the buttons they have: SHOOT is K / X, pad X or B, the SHOOT key; PASS is J
/ Z / Enter / Space, pad A, the PASS key; RUN is L / Shift, a right shoulder, the RUN key. No new
keys. With no spirit for it a full charge is what it is today.

What each does in the open (`SKILL_PLAY`):

- **shot**: leaves 1.15 times as fast as a full charge, with half the spread. A star's shot move is
  a special and opens the keeper duel, as today; a role shot plays on.
- **pass**: goes to the mate the stick points at; only a man within 24 of the receiver can cut it
  out; it reaches his feet soft (no heavy touch) and counts 2 pass-combo steps.
- **cross** (a wing's pass): a lofted ball dropped on the head of the mate in the box it is struck
  to, who meets it first time within 30 ticks; 2 steps.
- **dribble**: a burst 1.35 times as fast for 36 ticks in which no tackle wins the ball; each man
  passed is a beat. Only stars carry dribble moves, which stay on the field-duel menu too.
- **block**: the defender throws himself in front of a shot struck past him within 30, or of a pass
  struck past him in his own box (thrown in front of every pass, it broke up every attack).
- **save**: the keeper reaches a shot his own dive would miss, 1.4 times `KEEPER.diveReach`, only in
  a dive (a shot he never read in time still beats him).
- **tackle** (Lukas's Iron Gate): his tackles win the ball 0.25 more often.

After any skill or special a player waits `SKILL_RULES.cooldown` (300 ticks) for his next. A skill
in the open pushes `{ type: 'skill', player, move }` and its name shows over the player.

### Spirit

The base refill stays (`SPIRIT.refill`, about 36 a 7 v 7 match and 52 an 11 v 11), and so do the
gauges (`SPIRIT.max` by stamina, about 70 to 95 for a plain player; Sochetra 100 and 0.8 a level;
the rivals' own 150 to 170) and the start (a quarter full). Good play fills the gauge of the one who
plays it (`SPIRIT.gain`, in gauge points):

| key         | for                                                                  | points |
| ----------- | -------------------------------------------------------------------- | ------ |
| `pass`      | a pass a mate takes                                                  | 2      |
| `oneTwo`    | the ball back from a one-two (A to B to A), to A, on top of B's pass | 3      |
| `beat`      | beating a tackle, or a dribble duel won (`broke`)                    | 6      |
| `tackle`    | the ball won in a tackle, or a duel won by the defender (`stolen`)   | 6      |
| `intercept` | an opponent's pass or loose ball taken by an outfield player         | 4      |
| `block`     | a shot or pass blocked (a duel's `blocked`, a block skill)           | 5      |
| `save`      | a keeper holding a shot                                              | 6      |
| `parry`     | a keeper pushing one away                                            | 4      |

On top: each pass-combo step (`PASS_COMBO.stepSpirit`), a duel won (`DUELS.winSpirit`, 8), and two
shares for the stars. Each star on a side takes `SPIRIT.starShare` (0.1) of every gain a mate makes,
so a side that plays well wakes its stars; a goal against fills every star of the side that let it
in by `SPIRIT.conceded` (10).

Targets for a match (the story's matches, the decent player): **Sochetra 5 to 8 cut-in shots**
(specials, finishers, duos and chains he strikes; 4 to 6 in the shorter ch 1), **each teammate 0 to
2 skills**, **a rival star 2 to 4 specials**, the opponents' other players 0 to 2 skills each.

The budget behind them, from today's sim (computer against computer and the decent player, ch 1 and
ch 3): an 11 v 11 side completes 55 to 65 passes, about 9 one-twos, 8 to 12 interceptions, 1 to 3
tackles and 3 to 7 saves a match, and Sochetra touches the ball 6 to 14 times. His spirit then comes
to about 25 at the start, 52 refilled, 20 to 25 from his own play, 25 from duels, 80 from his mates
(0.4 of about 200) and 10 from combo steps: some 215, five or six specials at about 40. A plain
midfielder comes to about 90 against a gauge of about 80 and a skill of 30: two at most, fewer when
the moment does not come.

Measured once it all played (the decent player, the ch 2 and ch 3 finals): his mates' gains ran well
over 200 once pass combos filled them, so `starShare` came down to 0.1, and Sochetra's spirit comes
to about 195 a match (some 145 in the ch 1 final). The midfield and wing skills cost 40, so a plain
player plays one or two; the keepers' role saves cost 20 at power 24, so a keeper answers most of
the specials struck at him.

Specials stay strong but fair: they cost; the cooldown spaces them; every keeper and defender now
has a save or block skill on his duel menu to answer them, which the computer picks against a
special with weight `SKILL_AI.answer` (20, against `DUEL_WEIGHTS.special` 6); a combo and a chain add
at most `SKILL_RULES.mostBonus` (16) power between them; `DUELS.specialRange` is unchanged.

### Pass combos

A **step** is a pass a mate takes, played within `PASS_COMBO.holdTicks` (45 ticks in 7 v 7, 45 in
11 v 11) of the touch that took the ball. The first pass makes x1; each step adds 1; a one-two (the
ball back to the one who played the pass before) adds `oneTwo` (2), and so does a skill pass or
cross. The counter stops at x5 (`most`); passes after keep it there and still fill spirit. Beating a
man with the ball, or a dribble duel won, keeps the combo and starts the hold clock again; a duel's
`passed` is a step.

It **breaks** when the other side touches the ball (a tackle, an interception, a block, their
keeper's hold or punch), when the holder keeps it past `holdTicks` without passing, at any restart,
goal or half time, and when it is spent: any shot spends it.

| level | shown             | spirit to the passer | shot power in a duel | shot speed in the open | finisher (Khmer / world)         |
| ----- | ----------------- | -------------------- | -------------------- | ---------------------- | -------------------------------- |
| x1    | no                | 0                    | 0                    | 0                      |                                  |
| x2    | yes               | 2                    | +3                   | +3%                    |                                  |
| x3    | gold              | 3                    | +6                   | +6%                    | Mekong Current / Wave Strike, 18 |
| x4    | gold              | 4                    | +9                   | +9%                    | the same                         |
| x5    | gold, with flames | 5                    | +12                  | +12%                   | Tonle Sap Tide / Tidal Wave, 26  |

The power and speed lift the holder's next shot, struck within `holdTicks` of taking the last pass;
the hold waits while he charges a kick (`src/sim/charge.js`), as a chain's ticks do.
From x3 (`finisherFrom`) the holder's full-charge SHOOT in range (`DUELS.specialRange`) opens the
keeper duel with his side's **finisher** (`PASS_COMBO.finishers`): free, the passing paid for it. A
star there sees the finisher and his own shot specials, lifted by the level, on the menu; the
computer plays it with `SKILL_AI.finisher` (0.7) of its shots from x3. Its cut-in draws the passers'
run as a river of light across the band and stamps "x3 COMBO".

### Duo combos

Two players strike together (`DUO_COMBOS`). A partner is a cast member or any mate on a post. Each
pays his share from his own gauge; the shares make the move's cost.

| move                                | striker and partner               | entry                              | shares  | reach | wakes                    | power |
| ----------------------------------- | --------------------------------- | ---------------------------------- | ------- | ----- | ------------------------ | ----- |
| `twin-naga` Twin Naga               | Sochetra and Rithy                | strike                             | 36 + 24 | 0.14  | knows `twin-naga` (ch 3) | 36    |
| `kite-header` Kite Header           | Sochetra and a winger             | pass: a Kite Cross, a header       | 25 + 25 | 0.25  | from `ch2-semi`          | 26    |
| `chrey-lightning` Chrey Lightning   | Sochetra and Dara                 | pass: Dara's long throw, a volley  | 30 + 25 | 0.45  | from `ch4-group-nigeria` | 30    |
| `moon-relay` Moon Relay             | Haruto and Japan's centre forward | pass: a lay-off, Haruto first time | 35 + 20 | 0.2   | always his               | 30    |
| `carnival-bicycle` Carnival Bicycle | Rafael and a Brazil winger        | pass: a cross, an overhead kick    | 40 + 20 | 0.35  | always his               | 34    |

Reach is a share of the pitch's length (Twin Naga's is 252 units in 11 v 11). The striker must stand
in `DUELS.specialRange`, the partner on his side and not stunned, both with their shares. A duo
struck with the head or an overhead kick (Kite Header, Carnival Bicycle) has its own `range`, a
plain shot's `DUELS.shotRange`: a header from halfway looks wrong, however special.

- **strike**: the striker has the ball and the partner is within reach: his full-charge SHOOT has
  the duo on the keeper-duel menu (as Twin Naga is today, but with Rithy near him, not only on the
  pitch).
- **pass**: the partner, within reach of a striker nearer the goal than he is (a duo's pass goes
  toward goal, never laid back from the goal line to a man near halfway), plays the full-charge PASS
  to him (his skill pass, paid with his share instead of its cost), and the striker strikes it
  first time (SHOOT as it comes, the first-time strike there is today; the computer always does):
  that opens the keeper duel with the duo, and the striker pays then. No first-time strike, and it
  was only a skill pass. Dara is the computer's even on the player's side: holding the ball with
  Sochetra in reach and both shares ready, he throws with `SKILL_AI.duo` (0.6), and the player
  strikes.

A duo's cut-in shows both portraits, the partner's sliding in behind the striker's, and stamps
"DUO". Where a duo and a chain both fit the same strike, it plays as the duo.

### Skill chains

A skill that plays dribble, pass or cross (`CHAIN_RULES.starts`), then within `CHAIN_RULES.ticks`
(120) a shot skill or shot special by the same player (after his dribble) or by the mate the pass
went to, is a **chain**: the shot gains `CHAIN_RULES.power` (8, with the combo's no more than 16)
and opens the keeper duel. Its cut-in shows both names ("APSARA CURL > NAGA SHOT") with a "CHAIN"
stamp, in the shot's look. The ball lost, the ticks run out or a plain pass between them breaks it.
Chains play from `SYSTEMS_FROM.chains` (`ch2-group-siem-reap`).

A star's own chains have a name, a move and a look (`NAMED_CHAINS`), the shot's power and 8 at the
shot's cost:

| move                        | chain                                      | power | cost | look (planned) |
| --------------------------- | ------------------------------------------ | ----- | ---- | -------------- |
| `flying-naga` Flying Naga   | Hanuman Leap, then Naga Shot               | 30    | 40   | `flying-naga`  |
| `storm-garuda` Storm Garuda | Hanuman Leap, then Garuda Volley           | 36    | 50   | `storm-garuda` |
| `eclipse-moon` Eclipse Moon | Haruto: Mirror Step, then Silent Moon      | 38    | 50   | `eclipse`      |
| `samba-rocket` Samba Rocket | Rafael: Samba Mirage, then Carnival Rocket | 44    | 60   | `rocket`       |

### What stops for a cut-in, and the duel menu

One skill plays on in the open: a role skill, a star's dribble move by RUN twice, a block, save or
tackle skill. A cut-in (a duel, as today) plays for a star's special and for every combo: a
finisher, a duo, a chain. Duels also still start as they do today: two stars meet, or a star lets go
of a special. On one full-charge SHOOT every shot on offer goes on the keeper-duel menu; with only
one it plays at once (as `presetShot` does today), and the computer takes the strongest by its
weights. Offered in this order: duo, named chain, chain, finisher, the star's specials, the role
shot skill. A move's cut-in plays in full the first time in a match and at half length after (the
versus and cut-in stages), so the 8 to 14 cut-ins of a match keep it moving.

The menu stays as it is, `VISIBLE_ROWS` (5) rows that scroll. Rows: the basics (Dribble, Pass,
Shoot; Tackle, Block, Intercept; Catch, Punch), then skills and specials, then combos, only what can
be paid and used. The defending side now has a skill row whenever it has the spirit: a plain
defender's block skill in a field duel, a plain keeper's save skill against the shot. A skill row
shows its icon (star move, skill or combo), its name, "+8" when a combo or chain lifts it, and what
the picker pays: FREE for a finisher, a duo the striker's share. A duo's tag names the partner
beside its word ("DUO + RITHY", "គូ + រិទ្ធី"; a partner with no Khmer name keeps the pixel face),
or names him alone ("+ RITHY") where the move's name would not fit by both. With a duo's row lit,
the menu's head tells what each of the two pays, the striker's share first ("36 + 24"), since the
row already names the partner (`duoShares` in `src/render/duel/menu-detail.js`). The tags are flat
plates on the row's own colour, with no ink frame. The cursor opens on the strongest combo or
special on offer (attacking) or on the skill that answers a special (defending), so a quick PASS
plays the big move. The words are `SKILL_WORDS` (`src/data/skill-words.js`). In Khmer a cut-in stamp
(DUO, CHAIN, a combo) carries its Khmer word in its plate, beside the English, at the size of the
move's Khmer name.

### On the pitch

Every skill, special and combo reads in the normal 2.5D view, whether or not a cut-in follows: a
cut-in is for the big moments, an effect on the pitch is for every one. The effects are drawn in
world pixels (the match's 1536 x 864 world canvas, sprites at 1x; the UI over it under a 2x
transform), in the colours of the move's look (`LOOK_ART[move.plannedLook]`, else its stand-in's),
from `src/data/move-effects.js`:

- An **aura** wraps the player from the moment a full charge would fire a skill (the charge is full
  and the spirit is there, so the player sees it will fire) until it has, and for
  `EFFECT_TICKS.aura` (30) after; the computer's players, who charge out of sight, show it for those
  30 as they fire. `motes` (sparks rising), `wind` (a swirl at the feet), `stone` (a shimmering
  outline, for blocks and walls), `flame`, `halo` (a ring of light over the head, for the great
  moves).
- A **trail** follows the ball while it flies, as `drawSpecialTrail` does today, or the player for a
  move he carries (`follows: 'player'`: a dribble, a tackle): `streak` (today's hot streak), `coils`
  (a serpent's body winding round the ball's path, its head at the ball), `twin-coils` (two, about
  each other), `heads` (seven heads fanning out behind), `wings` (wings beating off the path),
  `blade` (a sword's arc), `arc` (a crescent riding the ball), `flame`, `horns` (two horns of dust),
  `ribbon` (along a bending pass), `kite` (a diamond kite and its tail), `river` (a band of water
  along the passes before it), `wave` (a wave rising behind it), `bolt` (zigzag lightning),
  `afterimage` (the player's ghosts), `confetti`, `wind` (white arcs).
- An **impact** bursts where it is struck, blocked or saved, for `EFFECT_TICKS.impact` (24): `burst`
  (a star of light), `splash` (water thrown up), `feathers`, `ring` (a shock ring across the grass,
  20 ticks), `wall` (light and dust rising in front of the blocker, 36), `sparks`, `dust`.
- Each play has its three (`PLAY_EFFECTS`) and a move may change any (`MOVE_EFFECTS`): the Naga
  Shot's coils and splash, Garuda Volley's wings and feathers, Silent Moon's arc, Carnival Rocket's
  flame, the Kouprey Kick's horns, the Mekong Current's river, Chrey Lightning's bolt. Every shot
  leaves a trail.
- A pass-combo step pops on the passer: his new level ("x3") rises from his head for
  `EFFECT_TICKS.comboPop` (30) as the counter climbs. The skill's name pop-up is the HUD's.

When a short effect is enough and when play stops:

| what happens                                                         | on the pitch                      | play stops for                       |
| -------------------------------------------------------------------- | --------------------------------- | ------------------------------------ |
| a skill charged to full                                              | the aura grows                    | nothing                              |
| a role skill, a star's dribble by RUN twice, a block, a tackle skill | aura, trail, impact, its name     | nothing                              |
| a pass-combo step                                                    | the level pops on the passer      | nothing                              |
| a save skill, or a skill shot on target, in open play                | aura, trail, impact               | the save cam, when `SAVE_CAM` allows |
| a star's special, a finisher, a duo, a chain                         | the aura as it fires              | the duel, with the save cam inside   |
| the ball moving on after a duel (a parry, a block, a pass)           | its trail, as the special's today | nothing                              |

Cut-ins and save cams together take no more than a fifth of a match's real time.

### Keeper skills and the save cam

Every keeper has a save skill: his side's role save (Bayon Eyes, Panther Dive), Dara's Belly Block
in ch 1 and Angkor Wall from ch 2, Farhad's Mountain Guard. `SAVE_STYLES` (`src/data/skills.js`)
says how each keeps the ball out, which decides the result and what the save cam shows.

A post's skill (a role save, a role block) stops an ordinary striker's trick, but against a star's
special or a combo it adds no power (`outclassed` in `src/sim/duel/odds.js`): only a star's own
answer, Angkor Wall or Mountain Guard, or a cast member's (Belly Block), stands up to one. So
Sochetra's specials score about three times in five against a keeper who answers with his post's
skill, and a rival star keeper is a real wall.

- **catch**: he holds it, or pushes it away when it only just reaches him (`DUELS.parryMargin`).
  Both role saves catch, so neither side is stronger.
- **punch**: he fists it out wide of the goal, a parry thrown further (Mountain Guard, and the
  menu's Punch).
- **wall**: he stands big and it bounces back off him into play (Angkor Wall, Belly Block).

In a duel the computer's keeper picks by its weights (his skill against a special with
`SKILL_AI.answer`, 20); the player's keeper (Dara, or any keeper of his side) is picked in the duel
menu, the player defending. In open play a save skill fires by itself when the keeper's own dive
would miss (`SKILL_PLAY.save`).

**The save cam** is a front view, as if from the penalty spot: the goal frame and its net from in
front, posts and bar across the view, the keeper facing the camera (`idle`, `south`), the ball
flying in from the camera to the goal with its move's trail, smaller as it goes, then the result.
While the ball flies, thin lines in the move's light rush in on the aim from the edge of the view,
the venue showing through them and the goal left clear: over a bright sky the fourth shade of its
ramp and stronger, over a night stand that shade halfway to its palest, so they tint the stand in
its colour (`focusLight` in `src/render/save-cam/focus.js`, by each backdrop's `sky`).

Behind the goal stands the match's own venue (`src/render/save-cam/backdrops/`, its colours in
`src/art/save-cam/venues/`, taken from the venue's own): the village field by morning, its bamboo
goal with a sagging bar lashed with rope and an old slack net, the goalmouth worn to red earth, the
paddies, sugar palms, stilt houses and the wat's spire behind, kids on the dike and egrets over; the
provincial ground's banner wall and grass bank of standing fans, scooters along its top; the school
stadium at sunset, its red track, red wall and terraces of schoolchildren, the city's towers and the
floodlight masts; the national stadium's bowl by day; the Asian stadium's bowl by night under its
starry sky, banks of floodlights blazing along its roof's edge over the upper tier in its shade, a
ring of LED panels in the championship's five colours between its tiers and its glowing boards
(`backdrops/asia/`); the World Stadium's floodlit stand. Each venue's still is painted once at the
cam's pixel scale (`createMatchSession` paints it ahead) and laid down whole each frame, with what
moves (the crowd's second frame, egrets, flashes) drawn over it. A match with no venue plays under
the World Stadium's floodlights. `createSaveCam(match, moment, { venue })` takes it, and
`createDuelShow(match, { venue })` hands it to its keeper rounds.

For a ball to one side he dives toward the camera on a dive of his own: hand-made pixel maps in
`src/art/save-cam/keeper-dive/`, drawn diving to the screen's right and mirrored for its left, at
the save cam's own pixel scale, in his own kit, skin and hair (his look), his shirt number from the
shirt-number art printed on his chest, never mirrored. Frame by frame (`DIVE_BEATS` in
`src/render/save-cam/dive-frames.js`): set in the ready stance facing the camera (feet wider than
his shoulders, knees bent, gloves out in front of his waist, palms to the shot); loaded on his near
leg from 14 ticks before the contact, leaning to the ball with both arms swinging across to it;
leaving the grass from 9 ticks before it, the near leg driving long and the far knee up, his boots
off the grass and apart from his shadow, the toe of his near boot leaving where that boot stood; for
a ball close to him a short hop instead, the near leg kicked out under him toward it, his load and
spring smaller the closer the ball and never back the way he came; the full stretch 3/4 to the
camera from 5 ticks before it, held through the contact; then down flatter onto his side on the
grass, his shadow under him all the way.

- **Height**: a ball high enough for his boots to stay off the grass at full stretch takes the
  diagonal (about 37 degrees: head, arms and ball up by the post, chest in the middle, legs bent a
  little and trailing to the middle of the goal); one at mid height a shallower slant; a lower one a
  flat dive, his gloves reaching down along the grass, his knees bent and his shins rising to his
  boots as he flies low and lies down. Each height has its own load and take-off: for a high ball
  his arms swing up across him and he springs up at the corner; at mid height they swing out at
  chest height; for a low ball they reach down and across to the low corner and he falls to his
  side.
- **Hands**, by what he does: open as he reaches; both gloves round the ball from the contact on a
  catch, the fingers curled over it and a thumb on each glove (the frame draws the ball, and he
  lands holding it, a thumb over the top of the ball from each side); both fists leading for a
  punch, each thumb wrapped over its fist; open at full stretch with the ball beyond them on a goal,
  a miss, a post or a parry.
- **Gloves**: `keeperPose` says where the drawn gloves are (`gloves`), so the ball meets them on a
  save and passes them when he is beaten; the frame's navel (`x`, `y`) moves on one path: set,
  loaded, then one arc from his near boot on toward the stretch, never back (across at an easing
  pace while he rises fast and slows, or for a low ball drops slowly and then faster), and down to
  the grass. A ball he keeps out curls into his gloves over its last 8 ticks, since a stretch
  reaches past a ball close to him, and a punch or a parry leaves from them
  (`src/render/save-cam/glove-pull.js`).

A ball at him he takes standing on his sheets (`idle`, arms up from `celebrate`, beaten on
`fall`). A punch adds a fist flash and the ball flying out of the view; a wall raises the move's
impact in front of him; a goal bulges the net, the ball held in it as a hand-drawn ball with its
shade on the strings behind it (`src/art/save-cam/net-ball.js`), slipping down slowly, the beaten
keeper landing short of it. One that comes in over him is held there, slipping no lower than leaves
it showing over him; a low one he lands on rolls on along the foot of the net, away from him, to
where his landing leaves it showing (`src/render/save-cam/net-rest.js`). At the contact: 6 ticks of
hit-stop, a flash, the move's impact behind him (so his gloves and the ball show on it), a small
shake, the venue laid down unshaken under it so the view stays covered. From his push-off the move's
trail and beast go behind him and the ball stays in front, so his head and gloves read through the
stretch and the contact (`layersOf` in `src/render/save-cam/layers.js`).

The Naga of Naga Shot, Twin Naga, Seven-Headed Naga and Flying Naga is one profile head
(`src/render/duel/looks/naga-head.js`): a scaled cobra hood rimmed in gold and ringed in kbach
flames, a narrow red eye with a bright pupil, jaws swung open on the ball with fangs, on a body with
a gold-plated belly and gold fins, in the move's colours (`LOOK_ART`), lit along its top left and
ringed in ink so it reads over any venue's sky. Its head stays in profile, lifting its snout at most
0.65 rad as the ball climbs, and its neck bends into the back of the head. In the save cam the head
grows with the ball (`headSize`, the ball's radius over 2.9, capped at 4); Twin Naga's two heads
close on the ball from either side, and Seven-Headed Naga's six other heads stand in an arc over it
on necks, the middle pair highest, all looking the way the ball goes, gold-faced with jade hoods
like the title's, a step darker than the one in front (`fanOf` in
`src/render/save-cam/trails/seven-naga.js`). It is drawn on a sheet of the art grid in plain
JavaScript and laid on the canvas in one call (`trails/sheet.js`), its six heads behind on whole
pixels, each drawn once for its size and stamped (`trails/head-stamps.js`).

- **In a duel** every keeper round (a special, a finisher, a duo, a chain, a shot carried on from a
  field duel) plays it in place of the clash at the keeper: intro, versus, menu, cut-ins, save cam,
  result, outro, with `STAGE_TICKS.saveCam` 96 (1.6 s); a press after 18 ticks skips to the result.
- **In open play** only a shot on target that a skill acts in plays it: struck with a skill or
  special, lifted by a pass combo of x3 or more (`SAVE_CAM.fromLevel`), answered by the keeper's
  save skill, or saved at 0.9 of his reach or more (`stretchShare`: the great save). Never sooner
  than `gapTicks` (1200) after the last and no more than `mostPerHalf` (2) a half; no other shot
  stops play. The sim pauses in a `saveCam` phase just after the save (or as the ball crosses
  the line, the goal phase coming after): 90 ticks (1.5 s) of show, skippable after 18. An unwatched
  match never pauses; a watched one plays on after `SAVE_CAM.timeout` (240) if nothing ends it.
- **The sim decides, the cam shows.** A keeper round's result gains `aim` (`{ side, height }`: -1 to
  1 across the goal, 0 to 1 up it), `dive` (-1, 0 or 1) and `style` (`'catch' | 'punch' | 'wall'`),
  drawn when the round is resolved so that the show and `finishDuel` agree (the shot's finish reads
  them instead of drawing its own). The open-play moment carries the same, with the shooter, the
  keeper, the move and the keeper's skill (`guard`). In the cam a keeper who keeps the ball out with
  a dive always dives the way it went (open play's dive is taken from where he stood, and the cam
  draws him in the middle of the goal); one it beats went the wrong way about one goal in four
  (`WRONG_WAY` in `src/sim/duel/keeper-result.js`, never for a wall). One who keeps it out standing
  has the ball come at him: the cam moves its aim in to within his reach (`standingAim` in
  `src/render/save-cam/moment.js`), and a wall rises under the ball wherever it comes.

### The story brings them in

One at a time (`SYSTEMS_FROM`, each duo's `needs` or `from`); both sides play each from there on.
The lines to add, in English (the Khmer comes later, for review):

1. **`ch1-friendly`: pass combos and the finisher.** In `ch1-friendly-kickoff`, Coach Vannak: "Quick
   passes build a COMBO. Watch the count: x2, x3!" and "Every good pass, tackle and save fills your
   spirit." A trigger `{ when: 'combo', level: 3, scene: 'ch1-friendly-combo' }` and its scene
   (`black`, `hope`): Coach Vannak "Three passes! The ball runs like the Mekong. Hold SHOOT, let go:
   Mekong Current!"; Dara "I passed it too! Does that count? It counts!"
2. **`ch1-semi`: role skills.** In `ch1-semi-before`, Coach Vannak: "Each of you has a skill now.
   Play well and your spirit fills."; "Vuthy, hold PASS to full: the Apsara Curl bends round them.
   Pisey, Tola, from the wings: the Kite Cross."; "Srey Pov, Kosal: Elephant Guard. Stand in front,
   and nothing passes."; Dara "And me? I have... the Belly Block!" A trigger
   `{ when: 'skill', first: true, scene: 'ch1-semi-skill' }`: the announcer "What was that? Chrey's
   children have skills!"
3. **`ch1-final`**: Naga Shot, as today.
4. **`ch2-temple-after`: chains** (they play from `ch2-group-siem-reap`). Coach Sokha: "Leap past
   him, then strike at once. One skill straight into the next is a chain."; Sochetra "Hanuman Leap
   into Naga Shot... the Flying Naga!"
5. **`ch2-semi`: Kite Header.** In `ch2-semi-before`, Coach Sokha: "Tola, float the Kite Cross.
   Sochetra, meet it with your head. Two players, one goal: the Kite Header." A trigger
   `{ when: 'specialGoal', move: 'kite-header', scene: 'ch2-semi-kite' }`: the announcer "KITE
   HEADER! Tola floats it, Sochetra rises!"
6. **`ch2-final`**: Garuda Volley, as today.
7. **`ch3-pass-before`: the idea of a duo.** Coach Bora: "A duo needs two gauges and two hearts.
   Rithy, stay near him."
8. **`ch3-final`**: Twin Naga, as today, now a duo.
9. **`ch4-letters`: Chrey Lightning** (it plays from `ch4-group-nigeria`). Dara: "The Chrey kids
   wrote to us: 'Score a Chrey goal!'"; Dara "Remember our game by the paddies? My long throw, your
   volley."; Sochetra "Chrey Lightning!" A trigger in `ch4-group-nigeria`
   `{ when: 'specialGoal', move: 'chrey-lightning', scene: 'ch4-nigeria-lightning' }`
   (`village-tv`): a villager "That's our Dara! That's our Sochetra!"

Japan's Moon Relay and Brazil's Carnival Bicycle are theirs from the openers on, part of why those
sides beat Sochetra the first time. The duos wake by stage, not by `unlock`, so the story's
`CHAPTER_MOVES` (`test/unit/data/story/readme-ids.js`) stay as they are; the triggers `combo` (with
`level`) and `skill` (with `first`) are new.

### HUD

- **Where it stands** (`src/render/hud/layout.js`): the score bug and the player card at the top
  left, the pause button a phone shows at the top right, and the **minimap centred at the foot of
  the view**, between the stick under the left thumb and the kicks under the right, 30 px over the
  foot (an iPhone's home bar). The minimap fades while the ball or a goal passes under it
  (`minimap-fade.js`); the camera frames play under the top boxes (`HUD_COVER`) but does not
  lift its rooms over the minimap, which jolted the view (`src/render/camera/room.js`); the edge
  arrows and what floats over the players keep clear of every box
  (`src/render/actors/hud-clear.js`, `src/render/hud/clear-place.js`); the big banners cross just
  over the minimap.
- **Combo counter**: from x2, under the player card at the top left for the player's side, and in
  the top right corner, by the pause button, for the other side, so he sees one being built against
  him. "x3" in 24 px pixel digits over COMBO, in the side's shirt ramp; under it a thin bar draining
  over `holdTicks` since the last touch. Each counter stands on a plate of the HUD's own
  (`combo-plate.js`), so it reads over a crowd; a shirt too dark for the plate is lifted toward the
  HUD's text, its hue kept (`readableRamp`). From x3 it turns gold with a SHOOT key and FINISHER; x5
  flickers with flame pixels. A climb pops the number (scale 1.4 to 1 over 8 ticks); a break shakes
  it 2 px and greys it out over 20 ticks; a finisher bursts it into sparks. Its box joins
  `hudBoxes(match)` while it shows, so the edge arrows keep clear of it, and it fades while the ball
  passes under it.
- **Skill pop-up**: on each `skill` event the move's name over the player's head (an 8 px pixel
  word, its Khmer line under it in Khmer), on a small plate in its look's colours (`LOOK_ART`),
  rising 8 px and fading over 60 ticks, for both sides. It is UI, drawn under the 2x transform at
  the player's place on the pitch; his aura, trail and impact are the pitch's ("On the pitch").
- **Spirit gauge**: ready counts the player's skill as well as his moves, with a notch at each cost,
  the ready glow it has, and at its end the key for what is ready (SHOOT, PASS, or RUN twice).
- **When the HUD waits**: before kick-off, while television's opening card plays, the HUD is off;
  the cup's title rides in on its band. While a story scene is over the match, the match is held, so
  the goal flash, the banners and television's half-time and full-time boards wait under it and play
  once it is over, and the minimap is hidden (`src/ui/flow/match-draw.js`). Behind the line-up and
  result cards the canvas shows the match still, without television's cards (`stillScreen`).

### Balance targets

- The story's targets hold with all of this on: the friendly won more than twice as often as lost,
  Sochetra scoring most; each opener lost 55 to 70% of the time; each final won about two in three.
- A match: the spirit targets above, 8 to 14 cut-ins in all and no more than 4 open-play save cams;
  cut-ins and save cams together no more than a fifth of its real time.
- Goals: 2 to 6 a match on average; specials and combos make 35 to 60% of the player's side's goals,
  never nearly all; a special or combo shot scores 30 to 45% of the time against a keeper with his
  skill to answer, 45 to 60% against one without.
- Pass combos: x3 or more two to five times a match a side, a finisher one to three.
- The knobs, in this order: `SPIRIT.starShare`, `SKILL_AI`, `PASS_COMBO.holdTicks`, the skills'
  costs. Today's sim, measured: about 3 specials a match for the player's side, under 1 for the
  rival's, 40 to 50% of them scoring, 3 to 5 duels a match; x3 or more 6 to 10 times a side at a
  hold of 90 ticks, a shot at x3 or more 1 to 2 times.

### Contract additions

Job A has written these into "Contracts" (below), where they now stand.

- `createMatch({ ..., systems })`: `systems = { passCombo, roleSkills, chains, duos }` (booleans,
  and the duo moves on); all on when it is left out (a quick match). The campaign fills it from
  `SYSTEMS_FROM` and each duo's `needs` or `from` against the save's stage.
- A player: `skill` (the role or cast skill's id; null for a star with moves), `cooldown` (ticks to
  his next skill), `chain` (null or `{ move, tick, receiver }`).
- The match: `combo` (null or `{ team, level, holder, since, passer, before }`).
- Events: `{ type: 'skill', player, move }`; `{ type: 'combo', team, level, player }` at each climb
  from x2; `{ type: 'comboEnd', team, level, reason }`, reason
  `'lost' | 'held' | 'restart' | 'shot'`; `special` and `goal` carry duo, chain and finisher moves
  too, `special` a `partner` index for a duo.
- `duelOptions` options add `family` (`'basic' | 'star' | 'role' | 'combo'`), `bonus` (the power a
  combo or chain adds), `tag` (null, `'duo'`, `'chain'` or `'finisher'`), `from` (a chain's first
  move) and `partner` (a duo partner's index).
- A keeper round's `result` adds `aim` (`{ side, height }`), `dive` (-1, 0 or 1) and `style`
  (`'catch' | 'punch' | 'wall'`), and `finishDuel` places the ball and the keeper by them.
- A new phase `'saveCam'` (watched matches only): `match.saveCam` is the moment
  `{ shooter, keeper, move, guard, from, aim, dive, style, result, bonus }` (a result of `saved`,
  `parried`, `goal`, `post` or `wide`), pushed as `{ type: 'saveCam', moment }`; the show calls
  `endSaveCam(match)` when it is over or skipped, and play goes on (to the goal phase after a goal).
- Input: no new actions; a full charge of `pass` and two presses of `sprint` are read in
  `src/sim/human.js`; a press during a save cam skips it, as in a duel.

### Jobs

Four helpers can build this side by side; each stays in its files. A starts once the helper now
changing `src/sim/` (shots, tackles, long balls, corners, duel cooldowns) has landed, and B2 once
the camera and HUD helper (and the 1536 x 864 world canvas) has. B1 and B2 read what A will provide
from hand-made match states and events until A lands. The lead raises the version (minor: new moves
and modes).

**A, sim.** Skills in play and in duels, spirit, the three combos, the computer's use, the keepers'
skills and results, the save cam's phase, balance.

- Files: new `src/sim/skills/` (who has which skill and his post; a skill in the open: shot, pass,
  cross, dribble; block, save and tackle firing by themselves; the cooldown) and `src/sim/combos/`
  (the pass-combo counter, chains, duos); `src/sim/human.js` (full-charge PASS, RUN twice),
  `src/sim/spirit.js` (gains, star share, conceded), `src/sim/create-match.js`, `src/sim/player.js`,
  `src/sim/specials.js`, and the kick, pass, receive, tackle and `src/sim/brains/` files the
  computer's use needs; `src/sim/duel/` (`options.js` role skills, combo rows and tags; `special.js`
  finisher, duo and chain entries; `spirit.js` duo shares and free finishers; `computer.js` the
  answer weight; `settle.js` a `passed` step; `resolve.js` and `finish-shot.js` a keeper round's
  `aim`, `dive` and `style`, punches and walls as `SAVE_STYLES` says); the keeper's save skill in
  the open (`src/sim/goal-frame.js`, `src/sim/brains/keeper.js`); a new `src/sim/save-cam.js` (when
  it plays by `SAVE_CAM`, the moment, `endSaveCam`) with its `saveCam` phase in `src/sim/phases.js`
  and the goal after it in `src/sim/goal.js`; a new `src/campaign/systems.js` (what is on from
  `SYSTEMS_FROM` and the duo gates, against the save's stage) and `src/campaign/team-spec.js`
  (`matchSidesFor` and `quickMatchTeams` pass it on); the numbers in `src/data/skills.js`,
  `src/data/combos.js`, `src/data/save-cam.js` and `SPIRIT` (and its comment) in
  `src/data/tuning.js`; `PARTNERS` out of `src/data/moves.js` once the duos read `DUO_COMBOS`;
  `test/unit/sim/**`, `test/integration/sim/**`, `test/unit/campaign/systems.test.js` and
  `team-spec.test.js`, `test/unit/data/skills.test.js`, `combos.test.js`, `save-cam.test.js` and
  `tuning.test.js` (as the numbers move), `test/support/decent-human/` (full charges, RUN twice,
  playing for combos), `test/integration/data/story-balance.test.js` (and the counts above), the
  regression fixtures (re-recorded and reviewed), and the README's "Contracts".
- Done when the balance targets are measured and hold.

**B1, render: the cut-ins and the save cam.** The looks, the duel menu, the cut-ins, the front-view
save cam.

- Files: `src/render/duel/looks/` (each new look, in `index.js`), `src/art/duel/looks.js` (its
  colours: land every planned look's colours first, which B2 draws with), `src/audio/cues/looks.js`
  (its sound), `src/data/look-stand-ins.js` (a line out as its look lands);
  `src/render/duel/menu.js`, `menu-draw.js`, `src/art/duel/icons.js` (rows, tags, FREE, the cursor);
  `src/render/duel/cutin.js` (a duo's two portraits, a chain's two names and stamp, the combo
  stamp), `timeline.js`, `stages.js` and `show.js` (the half-length second showing, the `saveCam`
  stage in a keeper round); a new `src/render/save-cam/` (the front view: the goal frame and net
  from in front, the keeper facing the camera, the ball flying in with its trail, catch, punch, wall
  and goal, the hit-stop; `createSaveCam(match, moment, { venue })`, `updateSaveCam(cam, input)`,
  `drawSaveCam(context, cam, { lang })`) with its art in a new `src/art/save-cam.js`, played by the
  duel's timeline and, for a `saveCam` phase, by `src/ui/flow/match-shows.js`;
  `test/unit/render/duel/**`, `test/unit/render/save-cam/**`, `test/integration/render/duel/**`,
  `test/unit/audio/cues/**`.
- The looks, the Cambodian side's first: `bayon` (the Bayon's stone faces open their eyes round the
  goal), `elephant` (a war elephant rears behind the defender), `kite` (a khleng kite and its tail
  ride the ball; a two-figure cut-in for Kite Header), `kouprey` (horns of dust behind the ball),
  `apsara` (a gold trail curved like a dancer's hand), `mekong` (a river of light along the passes),
  `tonle-sap` (the lake's tide turning into a wave), `lightning` (a white bolt from Dara's hands to
  Sochetra's boot), `flying-naga` (the Naga with Hanuman's white wind), `storm-garuda` (Garuda in a
  storm), `belly` (Dara's comic round save, a bounce); then the world's: `panther`, `steel`, `wave`,
  `eclipse` (the Silent Moon going dark). Each move borrows its stand-in until then.
- Until A lands, draw the save cam from hand-made moments and keeper rounds (`aim`, `dive`, `style`,
  the result).

**B2, render: the pitch and the HUD.** Every skill's effects in the normal view, the combo counter,
the skill pop-up, the gauge.

- Files: `src/render/effects/` (new files for the auras, the trail shapes and the impacts of
  `src/data/move-effects.js`, fed from the `skill`, `special`, `combo`, `tackle`, `save` and `shot`
  events and from the players' charges; today's `trail.js` grows into the shapes),
  `src/art/actors.js` (`MOVE_TRAILS` gives way to `LOOK_ART`, read from B1's
  `src/art/duel/looks.js`, which B2 does not edit), `src/render/draw-frame.js` (auras under the
  players, trails and impacts over them), `src/data/move-effects.js`; new
  `src/render/hud/combo-counter.js` and `src/render/hud/skill-popup.js`, `src/render/hud/index.js`,
  `layout.js`, `spirit-gauge.js`, `src/art/hud.js`; `test/unit/render/effects/**`,
  `test/unit/render/hud/**`, `test/integration/render/draw-frame.test.js`,
  `test/integration/render/hud/**`, `test/unit/data/move-effects.test.js`.
- Look at every shape on the 1536 x 864 world canvas (`test/support/pixel-canvas.js`), both sides,
  both kits, over grass and over the goal mouth.
- Until A lands, draw from hand-made match states and events (`match.combo`, a full charge with
  spirit, `skill`, `combo`, `comboEnd`).

**C, text.** The words, How to play, the coach's lessons.

- Files: `src/data/skill-words.js`; `src/ui/screens/strings-help.js` and `howto-controls.js`;
  `src/data/story/` (the lines, scenes and triggers above); `src/story/` (the triggers `combo` with
  `level` and `skill` with `first`); `src/campaign/problems/triggers.js` (the new `when`s);
  `src/data/commentary.js` (lines for a skill, a combo, a duo, a chain); `test/unit/data/story/**`,
  `test/unit/data/skill-words.test.js`, `test/unit/story/**`, `test/unit/ui/screens/**`. A Khmer
  line for every English one, each listed for the user to review.
- How to play: a Skills part ("Every player has a skill. With the spirit for it, hold SHOOT or PASS
  to full and let go."; "With the ball, tap RUN twice: a dribble skill."; "Blocks and saves fire by
  themselves.") and a Combos part ("Quick passes build a COMBO. From x3, hold SHOOT to full: a free
  finisher."; "A skill straight into a shot skill is a CHAIN."; "Two friends near the ball strike
  together: a DUO. Both pay."); `specialsGauge` becomes "Spirit fills from good play: passes,
  tackles, saves and beating a man."; the control notes gain "Hold to full: your pass skill" (PASS),
  "Hold to full: your shot skill or special" (SHOOT) and "Tap twice with the ball: a dribble skill"
  (RUN).

## Rules for every helper

These are the project's rules (`CLAUDE.md` at the repository root says them in full; read it) and
this game's. Every helper follows all of them.

- **Stay in your files.** Change only the paths your brief gives you. Need something from another
  area? Read it, code to the contract below, and say what you need in your report. Never delete or
  rewrite another helper's file. If a test fails in someone else's area, leave it and report it.
- **No git that changes state**: no commit, stash, checkout, reset, merge or branch. No package
  installs. No `npm run check`, `npm run build` or `npm run format` over the whole repository (the
  lead runs those); run the tools on your own paths:
  `PATH=/opt/homebrew/opt/node@22/bin:$PATH ./node_modules/.bin/eslint <paths>`,
  `... ./node_modules/.bin/prettier --write <paths>`, `... ./node_modules/.bin/vitest run <paths>`,
  `... ./node_modules/.bin/stylelint "<css paths>"`, all from the worktree root.
- **Code size and shape** (lint enforces it): 150 lines a file, 40 lines a function, complexity 10,
  depth 3, 4 parameters (pass an object for more). Small files with one job; split instead of
  raising limits. No god files.
- **Comments only say why**, never what; no `/* */` or `/** */` blocks in source, no section
  banners, no TODO or FIXME. A hook shows you each comment you add: delete the what-comments.
- **Names explain themselves**: no one-letter names but `x`, `y`, `i`, `j`, `_`.
- **Blank lines**: after the setup `const`s, after a block that ends in `}` when code follows,
  after an early return, before the final `return` (unless it is the only line), between an
  object's methods; never right after `{` or right before `}`.
- **Colours**: hex only in `src/art/` (pixel-art data) and `styles/tokens.css`; components and
  other CSS use tokens. Never import or copy a file of another game or of the arcade.
- **One gold look**: focus (keys, pad, a tap, and a mouse moving over a button or a row,
  `src/ui/screens/pointer-focus.js`) is the one gold look, with the cursor; a mouse resting over a
  button the keys have moved off lights it pale, never gold.
- **Logic in plain functions with tests.** Each change has the right mix of `test/unit/`,
  `test/integration/` and `test/regression/`, mirroring `src/` (`src/sim/ball.js` is tested in
  `test/unit/sim/ball.test.js`). Determinism: the sim uses the match's own seeded random
  (`src/sim/random.js`) and square roots, never `Math.random` or trig.
- **Browser code only**: nothing in `src/` reads `process`, `require` or `__dirname`
  (`test/regression/bugs/no-node-globals.test.js`); an experiment's knob lives in a scratch copy,
  never in `src/`.
- **Pixel art quality is the bar.** Draw on whole pixels (round every coordinate), keep
  `imageSmoothingEnabled = false`, outline sprites, light from the top left, shade with 3 or 4
  steps of a colour ramp (hue-shifted, not just darker), dither large flat areas sparingly. Look at
  what you drew: `test/support/pixel-canvas.js` is a canvas for Node that turns a renderer's
  drawing into a png (`createPixelCanvas(768, 432)` for a UI screen, `createPixelCanvas(1536, 864)`
  with `useUiSpace` for a match frame; draw into `canvas.getContext('2d')`, write
  `canvas.toPng()` to a file in your scratch folder, open it with the Read tool). Iterate until it
  looks like a finished game, not a prototype.
- **Paid PixelLab tools are for the sprite helper only**, inside its budget. The free
  `pixelart_workbench` and `vfx_workbench` tools are open to any art helper.
- **Your report** (your final message) lists the files you made or changed, the public functions
  and their arguments, what you could not finish, and anything another helper must know.

## The game's layout

Steel & Dust's split, kept: `src/data/` (tuning and content tables, no DOM), `src/art/` (colours),
`src/sim/` (the 60 Hz match: one `match` object in, the same object changed), `src/story/` (the
scene player and match triggers), `src/campaign/` (progress, cups, levels, saves), `src/training/`
(the drills' rules), `src/render/` (draws onto a 2D canvas it is given, nothing else),
`src/audio/` (Web Audio only), `src/input/` (keys, pad, touch), `src/ui/` (DOM screens, the stage
fit, the loop) and `src/main.js` (wiring). The canvas is 1536 x 864 pixels (`WORLD_VIEW` in
`src/config.js`): the match world (venue, players, ball, effects) draws at 1x on it, so a match
shows twice as much pitch each way; everything else (the HUD, television's cards, cut-ins, scenes,
menus on the canvas, drills) draws in a 768 x 432 space (`VIEW`) under a 2x transform
(`UI_SCALE`), which `drawApp` sets with `useUiSpace` (`src/render/spaces.js`); a draw of the world
inside it goes through `inWorldSpace`. Taps are in the 768 x 432 space. A headless match render
needs a `WORLD_VIEW`-sized canvas and `useUiSpace` around the UI layers.

## Contracts

### Ids

- Formats: `'7'` (7 v 7: keeper, 2 defenders, 3 midfielders, 1 forward) and `'11'` (4-3-3:
  keeper, 4 defenders, 3 midfielders, 3 forwards). A team's `players[i]` plays the format's
  `formation[i]` (index 0 is the keeper; in `'11'` index 9 is the centre forward, in `'7'` index 6).
- Teams and kits (a team's kit id is its own id, except youth and senior national teams share their
  country's kit): `chrey-school`, `neighbor-village`, `riverside-school`, `royal-kids` (ch 1);
  `kampong-cham-high`, `siem-reap-high`, `battambang-high`, `kampot-high`, `phnom-penh-elite`
  (ch 2); `cambodia-youth`, `japan-youth`, `thailand-youth`, `korea-youth`, `iran-youth` (ch 3,
  kits `cambodia`, `japan`, `thailand`, `korea`, `iran`); `cambodia`, `brazil`, `nigeria`,
  `mexico`, `germany` (ch 4).
- Venues: `village-field` (a dirt-and-grass field by the rice paddies, bamboo goals, palm trees,
  stilt houses, kids on the fence), `provincial-ground` (a small grandstand, banners),
  `city-school-stadium` (Phnom Penh, a concrete bowl), `national-stadium` (a big modern bowl,
  day), `asia-stadium` (night, floodlights), `world-stadium` (huge, night, flags and fireworks).
- Backdrops for story scenes: `village-dawn`, `village-dusk`, `home-night`, `school-yard`,
  `city-street`, `high-school`, `temple-dawn`, `training-ground`, `dressing-room`,
  `federation-office`, `airport`, `hotel-night`, `stadium-tunnel`, `village-tv`, `trophy-stage`,
  `angkor-sunrise`, `black`.
- Drills: `cone-dribble`, `target-shot`, `spirit-focus`.
- Portrait moods: `neutral`, `happy`, `determined`, `shocked`, `sad`, `angry`, `smirk`, `cry`.
- Scene moods (music): `calm`, `hope`, `tense`, `sad`, `triumph`.

### Text

A text is a plain string or `{ en, km }`. `textOf(value, lang)` and `drawText`, `measureText`,
`wrapText` in `src/render/text.js` resolve and draw it (Silkscreen for Latin at 8, 16 or 24 px,
the device's Khmer face for Khmer). Story and menu text is written in both languages. The page's
`lang` follows the language picked (`applyStrings`); a key's cap keeps the pixel face in Khmer.

### A match

`createMatch(options)` in `src/sim/create-match.js`:

```js
createMatch({
  seed, // uint32
  humanTeam, // 0, 1 or null (the computer plays both)
  format, // '7' | '11'
  teams, // [teamSpec, teamSpec]; team 0 attacks toward x = pitch.length
  halfSeconds, // real seconds a half lasts, defaults to the format's
  input, // optional shared input (src/sim/input-state.js)
  systems, // optional { passCombo, roleSkills, chains, duos: [move ids] }, else teams[0].systems
});
// with no format or teams it makes a quick 11 v 11 of two plain teams
teamSpec = { id, name, short, kit, players, systems }; // name: text, short: 3 letters, kit: kit id
playerSpec = { id, name, number, role, stats, star, moves, spiritMax, hunts };
// role: 'keeper' | 'defender' | 'midfielder' | 'forward'
// stats: { speed, shot, pass, dribble, tackle, keeping, stamina }, each 1..99
// star: a character id for a named player, else null; moves: move ids
// hunts: a star's character id the player hunts (src/sim/hunts.js), else left out
```

`systems` (`src/sim/systems.js`) says which of the skills and combos play: all of them, every duo
too, when neither the options nor the first team carry it (a quick match, a test); the campaign's
sides carry what the story has brought in by the match (`src/campaign/systems.js`). With
`roleSkills` off no player has a skill.

The match object (read it, but change it only through the sim, the duel module or the hooks):

```js
match = {
  tick,
  phase,
  phaseTicks, // phase: 'kickoff' | 'play' | 'restart' | 'duel' | 'saveCam' | 'goal' | 'halfTime' | 'over'
  half,
  minute, // half 1 or 2; minute is the football minute shown (0..90, or 0..40 in '7')
  clock,
  halfTicks, // ticks left in this half, ticks a half lasts
  format,
  pitch,
  goal, // the format id; { length, width }; { width, height, depth } in world units
  teams, // [{ id, name, short, kit }]
  score, // [team 0, team 1]
  humanTeam,
  controlled, // index of the player the human steers, or null
  players, // see below
  ball, // { x, y, z, vx, vy, vz, owner (player index or null), inGoal, travel }
  restart, // null or { kind: 'throwIn' | 'corner' | 'goalKick' | 'kickoff', team, x, y }
  duel, // null or the duel module's state
  events, // what happened this tick, see below; whoever reads them calls drainEvents(match)
  hooks, // { duel(match) -> bool, special(match, player), duelTick(match) }, set by attachDuels
  random,
  input,
  lastScorer,
  kickoffTeam,
  systems, // what plays, see above
  combo, // null or { team, level, holder, since, passer, before }: the pass combo of a side
  comboPass, // null or { passer, team, tick, steps, quick }: a pass on its way, for the combo
  lastShot, // null or { shooter, move, level, tick }: the last shot struck, for the save cam
  duoPass, // null or { move, striker, partner, tick }: a duo's pass on its way to its striker
  saveCam, // null or the open-play save cam's moment, while phase is 'saveCam'
  saveCams, // { last, halves: [n, n] }: when the last played and how many each half
};
player = {
  index,
  team,
  slotIndex,
  role,
  id,
  name,
  number,
  star,
  stats,
  moves,
  spirit,
  spiritMax, // the special gauge: specials cost it, it refills slowly
  hunts, // null or the character id of the star he hunts (src/sim/hunts.js)
  x,
  y,
  vx,
  vy,
  facing: { x, y },
  stride,
  stun,
  tackle,
  recover,
  noPickup,
  receiving,
  holding,
  charge,
  lastKick, // tick of their last pass or shot, for the kick animation
  dive, // null or { tick, side: -1 | 1 } for a keeper's dive
  post, // 'keeper' | 'defender' | 'midfielder' | 'wing' | 'forward', the post his skill is for
  skill, // his role or cast skill's id, or null (a star with moves, or role skills not yet on)
  cooldown, // play ticks to his next skill or special
  chain, // null or { move, tick, receiver }: a chain he started, for `receiver` to finish
  burst, // ticks left of a dribble skill's burst, in which no tackle wins the ball
};
```

World units: `x` along the pitch from team 0's goal line, `y` from the far touchline to the near
one, `z` up. Team 0 always attacks toward `x = pitch.length`.

Events, pushed by the sim and the duel module, drained once a tick by the app (a `shot` and a
`goal` carry the move of a skill, special or combo they were struck with):

```js
{ type: 'whistle', kind: 'kickoff' | 'halfTime' | 'fullTime', half }
{ type: 'pass', player }
{ type: 'shot', player, power, move } // power 0..1, move id or null
{ type: 'goal', team, scorer, move } // scorer: player index or null
{ type: 'save', keeper, parried }
{ type: 'tackle', player, target, won }
{ type: 'out', kind: 'throwIn' | 'corner' | 'goalKick', team } // team takes the restart
{ type: 'special', player, move, tag, partner } // tag null | 'duo' | 'chain' | 'finisher'; a duo's partner index
{ type: 'duel', duel } // a duel starts
{ type: 'duelEnd', duel } // and ends, with duel.outcome
{ type: 'skill', player, move } // a skill plays on in the open: its name shows over him
{ type: 'combo', team, level, player } // a pass combo climbs, from x2; player: the passer
{ type: 'comboEnd', team, level, reason } // reason 'lost' | 'held' | 'restart' | 'shot'
{ type: 'saveCam', moment } // open play stops for the save cam (match.saveCam)
```

### Duels

`src/sim/duel/` decides when two named players meet (a star with the ball and a star of the other
side close in front), or when a star with a full charge, spirit to spend and a shot move lets go of
shoot. `attachDuels(match)` sets `match.hooks`; the sim calls `hooks.duel(match)` each play tick
after the players move (true means a duel began, the tick stops there), `hooks.special(match,
player)` for the action `{ kind: 'special' }`, and `hooks.duelTick(match)` while `phase` is
`'duel'`. The module's own API: `duelOptions(match, side)` -> options `{ id, kind, label, move,
cost }`; `chooseDuel(match, side, optionId)`; `finishDuel(match)`, which the cut-in calls when its
show is over, applies the outcome (it writes the ball and the players directly and pushes events)
and returns the match to `'play'`. The computer's side chooses for itself. Penalties for a drawn
knockout live there too (`src/sim/duel/penalties.js`).

- `hooks.special(match, player, { firstTime })` opens the keeper duel for what a full-charge SHOOT
  has on offer (`shotOffersOf` in `src/sim/combos/offers.js`, in the menu's order: duo, named
  chain, chain, finisher, the star's specials, the role shot skill; a lone role shot plays on in
  the open instead), or for a duo's or a chain's ball struck first time (`firstTime`). The round
  keeps what was on offer and the combo's lift as it starts (`round.offers`, `round.lift`), as the
  match's clock runs on while the human picks.
- Options add `family` (`'basic' | 'star' | 'role' | 'combo'`), `bonus` (the power a combo or a
  chain adds, at most `SKILL_RULES.mostBonus` between them), `tag` (null, `'duo'`, `'chain'` or
  `'finisher'`), `from` (a chain's first move), `partner` and `partnerShare` (a duo's partner and
  what he pays with the striker) and `level` (a finisher's combo). A defender's skill (a block, a
  save) is on his menu with the spirit for it; every pick but a chain's and a finisher's needs its
  player rested (`cooldown` 0).
- A keeper round's `result` adds `aim` (`{ side, height }`: -1 to 1 across the goal from the
  shooter's right as he faces it, past 1 for a miss; 0 to 1 up it), `dive` (-1, 0 or 1, the same
  way) and `style` (`'catch' | 'punch' | 'wall'`, `SAVE_STYLES`), drawn as the round settles
  (`src/sim/duel/keeper-result.js`); `duel.outcome` carries them with `tag` and `from`, and
  `finishDuel` places the ball and the keeper by them: a goal where it was aimed, the keeper the way
  he dived; a wall's save back into play; a punch out wide, further than a parry.
- The open-play save cam (`src/sim/save-cam.js`): a watched match (`duelMemory.watched`) stops in
  the `'saveCam'` phase for a shot a skill acts in (`isSkillShot`), a keeper's save skill or a save
  at `SAVE_CAM.stretchShare` of his reach, after the save, or as a skill's shot goes in (the goal
  scored after it); never within `SAVE_CAM.gapTicks` of the last, nor more than
  `SAVE_CAM.mostPerHalf` a half. `match.saveCam` is the moment `{ shooter, keeper, move, guard,
from, aim, dive, style, result, bonus }`. The show calls `endSaveCam(match)` when it is over or
  skipped; the sim ends it itself after `SAVE_CAM.timeout`.

### Story

A chapter (`src/data/story/chapter-<n>.js`, all four in `src/data/story/index.js` as `CHAPTERS`):

```js
{
  id: 'chapter-1', number: 1, title, // text
  format: '7', team: 'chrey-school', heroAge: 'child',
  cups: { 'kids-cup': { name, kind: 'knockout' }, 'hs-champ': { name, kind: 'group', teams, advance: 2, failScene } },
  stages: [
    { kind: 'scene', scene: 'ch1-intro' },
    { kind: 'training', drill: 'cone-dribble', before, after }, // scene ids, optional
    {
      kind: 'match', id: 'ch1-final', rule: 'friendly' | 'group' | 'knockout', cup, round, // round: text
      opponent: 'royal-kids', venue: 'city-school-stadium',
      opponentForm, teamForm, // optional { stats }: a side plays this match above or below its table
      before, // scene id
      triggers: [{ when, ...condition, scene, unlock, boost }],
      after: { win, lose, draw }, // scene ids
      rewards: { xp, moves },
    },
  ],
  scenes: {
    'ch1-intro': {
      backdrop: 'village-dawn', mood: 'calm',
      lines: [{ speaker: 'ta-sok', mood: 'happy', side: 'left', text: { en, km } }],
    },
  },
}
```

`opponentForm: { stats }` adds `stats` (a whole number from -15 to 15, not 0) to every stat of
every opponent player for that one match, kept within 1..99; `teamForm` does the same to
Sochetra's teammates, never to Sochetra, who plays as the save has him. The team tables stay inside
their bands and every other match plays them as they are (`matchSidesFor(save, stage, teams)` in
`src/campaign/` builds both sides).

Trigger `when` values: `kickoff`; `firstDuel` (with `with: characterId`: the first duel between
Sochetra and that rival, in the field, or a keeper duel when the rival keeps goal; the rival's shot
at Sochetra's keeper or his run at a teammate does not count); `goalFor` and `goalAgainst`
(optional `first: true`, `by: characterId`); `halfTime`; `secondHalf`; `losingLate` and `drawLate`
(with `minute`); `specialGoal` (with `move`); `minute` (with `at`); `combo` (with `level`: the
player's side's pass combo climbs to it or past, from the sim's `combo` event); `skill` (optional
`first: true` for the side's opening skill of the match, `move`, `by: characterId`, from the sim's
`skill` event). Each fires once a match. `unlock: moveId` gives Sochetra the move from that moment
on, for good; `boost: 'spirit'` fills his gauge.

Teams (`src/data/teams/`, all in `src/data/teams/index.js` as `TEAMS`): `{ id, name, short, kit,
format, players: [playerSpec] }`, players in formation order. Sochetra's place is
`{ id: 'sochetra', star: 'sochetra', hero: true, ... }`; the campaign fills in his stats and
moves from the save. Stars carry their character id and moves. Ordinary kids have stats around
30-50, high school players 45-65, youth internationals 60-75, the world's best 75-90; rivals start
above Sochetra.

A rival a duel scene is written for carries `hunts: 'sochetra'` (Rithy in `royal-kids` and
`phnom-penh-elite`, Haruto, Minjun, Rafael and Lukas). He hunts Sochetra only in the first part of
the match: until the two have met in a duel, and for at most the first two fifths of a full match's
play (the same time in a short match, though never past half of it). While the hunt lasts and
Sochetra is within 0.3 of the pitch's length, the rival waits on the goal side of him, 90 world
units off and a step ahead of where he is running, whether his own side has the ball or not; he goes
for any loose ball within 200 units of Sochetra; and when Sochetra has the ball he is his side's
first presser and steps into the way Sochetra faces, so the two meet face to face
(`src/sim/hunts.js`, `src/sim/brains/hunting.js`). After the duel, or once the time is up, he plays
his own game. So the rival's scene plays and the rival still plays: with a decent player and full
halves, each rival's scene played in 44 to 48 matches of 48, the hunt took 13–22% of the play on
average and never more than two fifths of it (up to 97% before), and after it the rival has the ball
as often as one who never hunts. A short match gives the hunt less time, and the scene plays there
about four times in five.

`src/story/` plays scenes and watches matches: `createScene(scene, { lang, heroAge })`,
`updateScene(state, { confirm, skip })` once a tick, `currentLine(state)`, `isSceneDone(state)`;
`createWatch(triggers)` and `checkTriggers(watch, match, events)`, which returns what fired.
`src/render/dialogue/` draws a scene: `drawScene(context, state, { lang, tick })`.

### Campaign

`src/campaign/` keeps the save and walks the chapters: `newSave()`, `loadSave(storage)`,
`storeSave(storage, save)` (key `naga-eleven/save`), `stageOf(save, chapters)`,
`teamSpecFor(save, teamId, teams)` (a team with Sochetra's level put in),
`finishMatch(save, stage, result)` and `finishTraining(save, stage, result)` (pure: they return
the next save, with XP, levels, unlocked moves, cup tables and the next stage),
`groupTable(save, cupId)`. A `result` from a match is `{ goalsFor, goalsAgainst, penalties,
unlocked, duelsWon, goalsBySochetra }`; from training `{ drill, score, grade }`.

`matchSidesFor(save, stage, teams, chapters = CHAPTERS)` and `quickMatchTeams(save, teams,
chapters = CHAPTERS)` give each side `systems`: what the story has brought in by the match
(`systemsForStage(stage, chapters)`, from `stage.at`) or by where the save stands
(`systemsForSave(save, chapters)`), in `src/campaign/systems.js`. Each part is on from the first
match `SYSTEMS_FROM` names, both sides alike; a duo from its `from` match, a duo that `needs` a move
whenever the striker knows it (asked in the match, so Twin Naga wakes with its trigger), a rival's
always. A place past the story's end, or a stage the story lacks, plays everything.

### Drawing

- `src/render/camera.js`: `createCamera(match)`, `updateCamera(camera, match)` once a tick,
  `project(camera, x, y, z)` -> `{ x, y, scale }` in world pixels, `shakeCamera(camera, power)`
  (a power under 4 is ignored), `panCamera(camera, { x, y, ticks })` for cinematic moves.
  The camera is calm: it holds still while play stays in its dead zone, leads a run a little,
  follows on slow springs, and gathers or sheds pace by at most a quarter of a pixel a tick along
  and a fifth in depth, from the way it really moved the tick before
  (`src/render/camera/motion.js`). It brakes for the ends of its rail, so it eases into the end of
  the pitch and never stops dead against it (`brakes.js`). Only a ball flying faster than that lets
  it follow pans it harder: it reads the ball's flight 45 ticks ahead and pans as hard as it must to
  keep it in view, up to 0.8 px a tick (`keep-up.js`). The hard hold of `keep-in-view.js` is the
  last resort and is braked for the rail too, and nothing takes the ball off the screen. Only goals
  and duel ends shake the view. `test/regression/bugs/camera-pitch-end.test.js` holds both sizes of
  pitch to this.
- `src/render/venues/`: `drawVenue(context, camera, match, { venue, tick })` draws all that lies
  behind the players; `venueDrawables(camera, match, { venue, tick })` returns depth-sorted props
  (goals, trees, people by the line) as `{ depth, draw(context) }`; `drawVenueFront(context,
camera, match, { venue, tick })` draws what stands in front. `drawMinimap(context, match, rect,
{ alpha })` (it fades while the ball or a goal comes under it). Photographers behind the goals
  kneel with long white lenses on monopods (`art/venues/photographer.js`). They fire at every chance
  while the crowd cheers a goal, and in open play in bursts of two flashes, now and then, and most
  while the play is near the goal they kneel behind (`isFlashing` in `props/drawables.js`). The
  village puddle has an uneven shore, a mud rim, and the far bank and the sky in it
  (`village-field/puddle.js`). Now and then a drop falls in it and three rings grow slowly from it
  and fade, lit on their far side, drawn over the water each frame (`village-field/ripple.js`).
- `src/render/actors/`: the players and the ball, from sprites when `src/data/sprites.js` names
  them, else from the block figure (`src/render/figure.js`), recoloured to each team's kit
  (`src/art/kits.js`).
- `src/render/hud/` the score, clock, names, gauge and banners; `src/render/draw-frame.js` puts a
  frame together.
- `src/render/portraits/`:
  `drawPortrait(context, { character, age, mood, variant, x, y, scale, flip })`, `PORTRAIT_SIZE`
  art pixels square. For `character: 'footballer'` the `variant` is `footballerOf(player, match)`
  (`src/render/portraits/footballer-of.js`: `{ team, kit, wear, place }`, `wear` being `home`,
  `away`, `keeper` or `keeper-<n>`). `portraitOf(player, { mood, heroAge, match })` in
  `src/render/duel/portrait-card.js` picks it; the versus card and the cut-in pass the match so away
  kits and keepers' spare shirts show.
- The face kit (`src/render/portraits/kit/`): with `kit: true` (the versus card and the cut-ins ask
  for it) a portrait is put together from parts ChatGPT painted (`concepts/naga-eleven/face-kit/`,
  baked by `tools/face_kit/bake.py` into `src/art/face-kit/`): one of six faces (hero, friend, ace,
  wall, child, adult) in a mood (neutral, shout, grin, hurt, angry, surprised, calm; the story's
  moods map onto them), one of eighteen hairstyles, facial hair on the wall and adult faces whose
  jaw it was painted for (stubble, moustache, beard, goatee, sideburns: Farhad's beard, and a grown
  man's at nineteen and up, never a keeper's full beard), and a band or a hat. The parts are letter
  grids in the portraits' own letters, lined up by the top of the skull, so they paint in the
  colours the player's recipe already has: his skin, hair, eyes and kit; a keeper keeps his gloves.
  A star wears the look `kitLookOf` gives him (Sochetra the hero's face and spikes, Rafael his curls
  under a white headband); a plain player's is seeded by his side and place, no mate's twin, from
  his side's hairstyles, and one in five ties a band on in his side's colours. Under a cap or a
  beanie hair shows only below the brim and behind the face (`kit/hats.js`,
  `test/regression/bugs/hat-hair.test.js`). The cut-in shouts; the versus card looks determined.
  Every other portrait (the story's scenes) is drawn from its recipe as before.
- `src/render/backdrops/`: `drawBackdrop(context, id, { tick })` fills the view. The village's mist
  (`backdrops/parts/mist.js`) is soft, dithered wisps low over the fields, and passes behind what
  stands up out of them (`villageMistMask`).
- `src/render/dialogue/`: in a full-screen scene the name plate stands on the box's edge beside the
  speaker, toward the middle; a name too long slides back over their shoulder, never into the
  crest; the portrait shows down to the box's edge.
- `src/render/duel/`: the cut-ins: `createDuelShow(match, { venue })`,
  `updateDuelShow(show, input)`, `drawDuelShow(context, show, { lang })`. The field duel's clash
  draws both players from the footballer's sheets, one sheet pixel to one of the cut-in's, each in
  his own kit, skin, hair and chest number (`src/render/duel/clash/`): the run and the defender's
  jockeying crouch 3/4 to the camera, the strike, the slide and the stretch side on, each lit along
  his back and top by the move's light, and a move's afterimages are his own frames in its tint; a
  dribbler a tackle beats goes down flat on the grass in a puff of dust: over a plain slide he flies
  on past the tackler, and a block, a stretch or a wall a guard's move raised throws him back on his
  own side, while the tackler gets up with the ball, clear of him
  (`src/render/duel/clash/tackle.js`); a duo's partner strikes beside the striker in his own look,
  turned to the camera; with no sheets loaded, and in the penalty show, the lit shadow of
  `src/render/duel/clash/silhouette.js` stands in.
- `src/render/training/`: each drill's screen.

### Input

Actions: `up`, `down`, `left`, `right`, `pass` (also confirms in a menu, a scene or a duel),
`shoot` (also goes back), `sprint`, `pause`. Keys: arrows and WASD, J / Z / Enter / Space, K / X,
L / Shift, Escape / P. A pad: stick or d-pad, A, X or B, a right shoulder, Start. Touch: the stick
and the PASS, SHOOT and RUN buttons, and a tap on what a canvas menu draws (each canvas menu
exports a `hitTest(show, point)` for it).

No action is new for the skills: `src/sim/human-ball.js` reads a full charge of `pass` (the pass or
cross skill, or a duo's pass to its striker), a full charge of `shoot` (what is on offer) and two
presses of `sprint` within `SKILL_RULES.doubleTap` with the ball (a star's dribble move); a press
during a save cam skips it, as in a duel.

On a phone:

- Held upright, a phone (touch on, narrower than 600 px) shows the turn card
  (`src/ui/turn-card.js`, art `src/art/turn-phone.js`): a pixel phone turning sideways over 'Turn
  your phone sideways' and its Khmer, in the gold panel. The match pauses under it, and the pause
  menu waits when the phone turns; a tablet upright plays with the stage over its controls.
- Sideways, the touch keys keep to the side bars and the lower corners, behind the goal lines: the
  stick (96 px) rests in the lower left, and SHOOT (76), PASS (60) and RUN (54) stand up the right
  edge inside the safe area (`test/regression/bugs/keys-over-goal.test.js`).
- On a touch screen whose stage would show duel menu rows under 44 CSS px, the duel menu is a
  finger's menu (`ROOMY_MENU`, picked by `fitDuelMenu` from the stage fit): three rows 20 art px
  tall under VS. A tap on a row picks it, and a tap over or under the rows scrolls the list
  (`hitTest` answers `{ scroll }`).
- Shown at less than one screen pixel to a canvas pixel, the canvas is smoothed
  (`#pitch.is-shrunk`); at 1x and above it stays pixelated.

# គិតលុយ (Kit Luy)

You keep the money at a Cambodian market stall. Customers sit on the five plastic stools in front of
it, and the one at the front has a bill with a blank: a total, the change from the money they hold
out, so many at a price, a bill shared. You work it out and count the riel out of your till onto
the checked cloth, piece by piece, then hand it over. Nothing is offered to pick from. Customers
keep walking up, faster as the day goes on; when one comes and every stool is taken, the stall
closes and the day's takings are counted out.

Plain JavaScript, native ES modules, run as they are written on the dev server; the arcade's build
joins them into one bundle (`apps/web/arcade/build-steps/bundle-game.js`). Open it from the arcade
home page, or go straight to `games/kit-luy/` on the dev server (`npm run dev` at the repo root).

## How it plays

- The title is the stall already open: the first customer asks 500 + 500. Counting out 1,000 and
  giving it starts the day.
- A right count is stamped and paid: more on later stages, extra for counting it in the fewest
  pieces, for paying before the next customer sits, and for every fifth right in a row (when the
  customer at the back of the row also goes to the stall next door).
- A wrong count is refused, short or over, and stays on the cloth to be put right; from the second
  try on a bill the seller is told by how much.
- The till starts with 500, 1,000, 2,000 and 5,000; 10,000, then 100 and 20,000, then 50,000 snap
  in as the day goes on, and the sums grow with them. The pencilled total on the bill goes from the
  third stage, unless Settings keeps it.
- A day lasts two to three minutes for most players.

## Controls

| Action                | Touch or mouse   | Keyboard                       |
| --------------------- | ---------------- | ------------------------------ |
| Count a piece out     | press its bundle | 1 to 8 (100 up to 50,000)      |
| Take a piece back     | press its pile   | Backspace (the last one dealt) |
| Clear the cloth       |                  | Delete                         |
| Hand the count over   | Give             | Enter or Space                 |
| Pull the shutter down | II               | Esc or P                       |

Settings holds Sound, Vibration (on phones that can), Language (ខ្មែរ or English), Numerals (១២៣
or 123), the running total, and which of the four sums customers ask.

The money is game pieces, not riel banknotes: a flat strip with one corner cut, its hue, its figure
and the pattern of its end band, and nothing a banknote carries.

## Changing the balance

`src/data/tuning.js` holds the arrivals, the pay and the lock after a wrong count, and
`src/data/stages.js` each stage's pieces and sums. A change to either changes the recorded runs in
`test/regression/fixtures/`: record them again with `npm run test:regression -- -u` and read the
diff. `docs/architecture.md` ("Game: គិតលុយ") tells the rest.

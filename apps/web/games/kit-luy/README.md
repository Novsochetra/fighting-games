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
- A fuse burns along the top of every bill: the customer's patience, longer on later stages. It
  turns red and ticks through its last three seconds while the customer fidgets. Burnt out, the
  customer storms off unpaid and the stall loses one of its three trust stamps; the third to go
  closes it.
- A right count is stamped and paid: more on later stages, and more the faster it came. Paid in the
  first 40% of the patience it is ពូកែ-fast (Lightning, twice the stage's pay on top), by 70% Quick
  (once more), later just Paid. Counting in the fewest pieces earns its own, and every fifth right
  in a row an extra (and the customer at the back of the row goes to the stall next door). The
  praise bursts over the customers with the seconds it took, and the earnings fly up to the sign a
  chip at a time.
- A wrong count is refused, short or over, and stays on the cloth to be put right; from the second
  try on a bill the seller is told by how much.
- The till starts with 500, 1,000, 2,000 and 5,000; 10,000, then 100 and 20,000, then 50,000 snap
  in as the day goes on, and the sums grow with them. The pencilled total on the bill goes from the
  third stage, unless Settings keeps it.
- A day lasts two to three minutes for most players.

Settings' **Answer with** picks counting money (the default) or a number pad: a market calculator
in place of the cloth and the till, the amount typed into the bill. Each keeps its own best day, as
typing is the quicker.

Settings' Answer with picks counting money (the default) or a number pad: a market calculator in
place of the cloth and the till, the amount typed into the bill. Each keeps its own best day, as
typing is the quicker.

## Controls

| Action                 | Touch or mouse   | Keyboard                       |
| ---------------------- | ---------------- | ------------------------------ |
| Count a piece out      | press its bundle | 1 to 8 (100 up to 50,000)      |
| Take a piece back      | press its pile   | Backspace (the last one dealt) |
| Clear the cloth        |                  | Delete                         |
| Hand the count over    | Give             | Enter or Space                 |
| Type on the number pad | its keys         | 0 to 9, Backspace, Delete      |
| Pull the shutter down  | II               | Esc or P                       |

Settings holds Sound, Vibration (on phones that can), Language (ខ្មែរ or English), Numerals (១២៣
or 123), the running total, and which of the four sums customers ask.

The money is game pieces, not riel banknotes: a flat strip with one corner cut, its hue, its figure
and the pattern of its end band, and nothing a banknote carries.

## Changing the balance

`src/data/tuning.js` holds the arrivals, the pay and the lock after a wrong count, and
`src/data/stages.js` each stage's pieces and sums. A change to either changes the recorded runs in
`test/regression/fixtures/`: record them again with `npm run test:regression -- -u` and read the
diff. `docs/architecture.md` ("Game: គិតលុយ") tells the rest.

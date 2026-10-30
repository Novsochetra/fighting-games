// What a gift is called by its size, from the smallest up: a tier starts at each quick amount the
// donate sheet offers ($1, $5, $10, $25), and Bronze at zero, so every gift the server takes has
// one. No tier is stored: it follows from the amount, so a change of steps needs no migration. The
// server has the last word; the donate sheet keeps the same steps to show the tier while an amount
// is typed (web/arcade/src/screens/supporters/tiers.js, which a test keeps equal to these).
export const TIERS = [
  { id: 'bronze', minCents: 0 },
  { id: 'silver', minCents: 500 },
  { id: 'gold', minCents: 1000 },
  { id: 'diamond', minCents: 2500 },
];

export const tierOfCents = (cents) => TIERS.findLast((tier) => cents >= tier.minCents).id;

export const SORTS = ['top', 'recent'];
export const PODIUM_SIZE = 3;

const byAmount = (left, right) => right.amount - left.amount || left.name.localeCompare(right.name);
// ISO days sort as text; a supporter with no day goes last.
const byNewest = (left, right) => right.date.localeCompare(left.date) || left.rank - right.rank;

// Supporters who gave the same amount share a place, so the next one skips ahead: 1, 2, 2, 4.
export function rankByAmount(supporters) {
  const sorted = [...supporters].sort(byAmount);
  return sorted.reduce((ranked, supporter, index) => {
    const previous = ranked[index - 1];
    const rank = previous?.amount === supporter.amount ? previous.rank : index + 1;
    return [...ranked, { ...supporter, rank }];
  }, []);
}

export function sortSupporters(ranked, order) {
  return order === 'recent' ? [...ranked].sort(byNewest) : ranked;
}

export const podiumOf = (ranked) => ranked.slice(0, PODIUM_SIZE);

// Summed in cents, so 0.1 + 0.2 shows as 0.30 and not 0.30000000000000004.
export const totalOf = (supporters) =>
  supporters.reduce((cents, { amount }) => cents + Math.round(amount * 100), 0) / 100;

const THOUSAND = 1000;

function orderOf(value) {
  if (value >= 10 * THOUSAND) {
    return 'ten-thousands';
  }

  return value >= THOUSAND ? 'thousands' : 'hundreds';
}

// 5,000 is written as a large 5 and three small zeros, so 1,000 is never taken for 10,000
export function pieceFigures(value) {
  return value >= THOUSAND
    ? { lead: String(value / THOUSAND), zeros: '000' }
    : { lead: String(value), zeros: '' };
}

export function createPiece(document, value, text, { small = false } = {}) {
  const piece = document.createElement('span');
  const { lead, zeros } = pieceFigures(value);

  piece.className = small ? 'piece piece-small' : 'piece';
  piece.dataset.value = String(value);
  piece.dataset.order = orderOf(value);
  piece.append(text.digits(lead));

  if (zeros) {
    const rest = document.createElement('small');

    rest.textContent = text.digits(zeros);
    piece.append(rest);
  }

  return piece;
}

"""Cleans stray pixels: a shade of a part with no pixel of the same shade around it takes the shade
most of its own part's pixels around it have, so a flat area reads as one cluster. Parts whose single
pixels are drawn on purpose (the face's features, the eyes, the trims) are left alone."""

from collections import Counter

from letters import LETTERS

CLEANED = {'hair', 'shirt', 'shorts', 'socks', 'boots'}
AROUND = [(dx, dy) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dx or dy]


def cleaned_letter(rows, x, y):
    letter = rows[y][x]
    ramp = LETTERS.get(letter, (None,))[0]

    if ramp not in CLEANED:
        return letter

    around = [rows[y + dy][x + dx] for dx, dy in AROUND
              if 0 <= y + dy < len(rows) and 0 <= x + dx < len(rows[0])]

    if letter in around:
        return letter

    kin = Counter(other for other in around if LETTERS.get(other, (None,))[0] == ramp)

    return kin.most_common(1)[0][0] if kin else letter


def despeckled(rows):
    grid = [list(row) for row in rows]

    return [''.join(cleaned_letter(grid, x, y) for x in range(len(row))) for y, row in enumerate(grid)]

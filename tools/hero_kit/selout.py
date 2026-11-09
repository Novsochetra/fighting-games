"""Selective outlining: black stays only where the figure's edge turns from the light (its bottom
and right) and round small features. Where the edge faces the upper-left light, and where one part
of the figure is drawn against another, the line takes a dark shade of the part it bounds: the darkest between parts, one lighter on the lit edge."""

from letters import EMPTY, LETTERS, OUTLINE, RAMP_LETTERS

KEPT_BLACK = {'trim', 'stripe', 'eyes', 'metal', 'hair'}

# light parts whose lit edge can take a shade above their darkest and still hold against the ground
SOFT_EDGED = {'skin', 'shirt', 'socks', 'boots'}
NEIGHBOURS = ((1, 0), (-1, 0), (0, 1), (0, -1))
AROUND = NEIGHBOURS + ((1, 1), (1, -1), (-1, 1), (-1, -1))

# the order in which a line between two parts takes the colour of one of them: the darker first
DARKEST_FIRST = ['shorts', 'hair', 'sole', 'shirt', 'socks', 'skin', 'gear', 'boots']


def letter_at(rows, x, y):
    return rows[y][x] if 0 <= y < len(rows) and 0 <= x < len(rows[0]) else EMPTY


def ramps_around(rows, x, y):
    return {LETTERS[letter][0] for dx, dy in AROUND if (letter := letter_at(rows, x + dx, y + dy)) in LETTERS}


def line_colour(rows, x, y):
    ramps = ramps_around(rows, x, y)

    if not ramps or ramps & KEPT_BLACK:
        return OUTLINE

    edge = [letter_at(rows, x + dx, y + dy) == EMPTY for dx, dy in NEIGHBOURS]

    lit = edge[1] or (edge[3] and not edge[0])

    if any(edge) and not lit:
        return OUTLINE

    ramp = next((name for name in DARKEST_FIRST if name in ramps), None)
    shade = 1 if any(edge) and ramp in SOFT_EDGED else 0

    return RAMP_LETTERS[ramp][shade] if ramp else OUTLINE


def sel_out(rows):
    grid = [list(row) for row in rows]

    return [''.join(line_colour(grid, x, y) if letter == OUTLINE else letter for x, letter in enumerate(row))
            for y, row in enumerate(grid)]

"""The hero's hair from behind: the reference's hair turned round, so its spikes stand where the
front's do, and the face filled with hair falling to the nape in locks."""

from locks import paint
from reference.hair import rows as front_hair

NAPE = 33
LOCKS = [
    {'points': [(50.5, 15), (44.5, 17), (39.5, 23), (43.5, 25.5), (48.5, 21)]},
    {'points': [(50.5, 15), (56.5, 17), (61.5, 23), (57.5, 25.5), (52.5, 21)]},
    {'points': [(39.5, 22), (44.5, 24), (43.5, 31), (40.5, 36), (38.5, 30)]},
    {'points': [(56.5, 22), (61.5, 22), (61.5, 30), (60, 36), (57.5, 31)]},
    {'points': [(43.5, 24), (48.5, 25), (47.5, 33), (44.5, 38.5), (43.5, 31)]},
    {'points': [(52.5, 25), (57.5, 24), (57, 31), (55.5, 38.5), (53, 33)]},
    {'points': [(47.5, 24), (53.5, 24), (53, 33), (50.5, 39.5), (48, 33)]},
    {'points': [(47.5, 17), (53.5, 17), (53.5, 24), (50.5, 27), (47.5, 24)]},
]


def skull_span(body, y):
    filled = [x for x, letter in enumerate(body[y]) if letter in 'LSsxo']

    return (min(filled), max(filled)) if filled else None


def rows(body):
    hair = [[{'J': 'h'}.get(letter, letter) for letter in reversed(row)] for row in front_hair()]

    for y in range(14, NAPE):
        span = skull_span(body, y)

        if span:
            fill_row(hair, y, span)

    locks = paint(LOCKS, len(hair[0]), len(hair))

    for y, row in enumerate(locks):
        for x, letter in enumerate(row):
            if letter != '.':
                hair[y][x] = letter

    return hair


def fill_row(hair, y, span):
    left, right = span

    for x in range(left, right + 1):
        if hair[y][x] == '.':
            hair[y][x] = 'h'

    if hair[y][left] in 'h':
        hair[y][left] = 'o'

    if hair[y][right] in 'h':
        hair[y][right] = 'o'

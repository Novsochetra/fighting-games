"""The hero from behind: the front's body turned round (the reference mirrored), repainted where the
back differs: the back of his head and neck, a collar band for the V, no raglan trim, the backs of
his fists."""

from body_art.south import HEAD, SHIFT
from body_art.south import drawn_rows as front_rows

LAST_COLUMN = 99

BACK_OF_HEAD = [
    (38, 31, 'oSSSSSSSSSSSSSSSSSSsso'),
    (38, 32, 'sSSSSSSSSSSSSSSSSSSsss'),
    (38, 33, 'sSSSSSSSSSSSSSSSSSSsss'),
    (38, 34, 'sSSSSSSSSSSSSSSSSSSsss'),
    (39, 35, 'oSSSSSSSSSSSSSSSSsso'),
    (40, 36, 'oSSSSSSSSSSSSSSsso'),
    (42, 37, 'oosSSSSSSSssoo'),
    (44, 38, 'osSSSSSsso'), (44, 39, 'osSSSSSsso'), (44, 40, 'osSSSSSsso'),
    (37, 31, 'o'), (36, 32, 'oS'), (35, 33, 'oSs'), (35, 34, 'oSs'), (36, 35, 'oo'),
    (60, 31, 'o'), (60, 32, 'so'), (60, 33, 'sso'), (60, 34, 'sso'), (60, 35, 'oo'),
    (36, 41, 'ooooooooo'), (45, 41, 'TTTTTTTT'), (53, 41, 'oooooooooo'),
    (44, 42, 'TttttttttT'),
]

FISTS = [(30, 69, 'SS'), (30, 70, 'Ss'), (70, 69, 'S'), (70, 70, 'S'), (28, 71, 'sxsx'), (66, 71, 'o'),
         (68, 71, 'xsxs')]

NO_TRIM = {'T': 'R', 't': 'r', 'Y': 'R'}


def mirrored():
    return [list(reversed(row)) for row in front_rows()]


def drawn_rows():
    rows = mirrored()

    for y in range(10, 41):
        rows[y] = ['.'] * len(rows[y])

    for y in range(42, 49):
        for x in range(36, 64):
            rows[y][x] = NO_TRIM.get(rows[y][x], rows[y][x])

    for x, y, run in HEAD + BACK_OF_HEAD:
        rows[y][x + SHIFT:x + SHIFT + len(run)] = run

    for x, y, run in FISTS:
        rows[y][x:x + len(run)] = run

    return rows

"""The hero side on, facing right: his head drawn whole as an anime profile, row by row from the
back of the skull to the line of his face."""

BACK_AND_FRONT = {
    17: (45, 52), 18: (43, 55), 19: (42, 56), 20: (41, 57), 21: (40, 58), 22: (40, 58),
    23: (39, 59), 24: (39, 59), 25: (39, 59), 26: (39, 60), 27: (39, 60), 28: (39, 60),
    29: (39, 60), 30: (39, 60), 31: (39, 61), 32: (39, 60), 33: (39, 60), 34: (39, 61),
    35: (39, 62), 36: (40, 63), 37: (41, 61), 38: (44, 61), 39: (45, 60), 40: (45, 61),
}

LIT = {17: 0, 18: 7, 19: 8, 20: 9, 21: 9, 22: 9, 23: 9, 24: 8, 25: 7, 26: 6, 27: 5, 28: 4,
       29: 4, 30: 3, 31: 2, 32: 1}

FEATURES = [
    (45, 17, 'oooooooo'), (43, 18, 'oo'), (54, 18, 'oo'),
    (53, 30, 'ggg'), (56, 31, 'gggg'),
    (54, 32, 'ooooo'), (56, 33, 'Eoo'), (56, 34, 'Eoo'), (57, 35, 'oo'),
    (60, 34, 's'), (61, 35, 's'), (61, 36, 'ss'), (60, 37, 'x'),
    (40, 36, 'oSSSSossoSSSSSSSSSSSssso'),
    (41, 37, 'osSSSooSSSSSSSSSSSSxo'),
    (43, 38, 'oosssoSSSSSSSSSSSso'),
    (44, 39, 'ossssoSSSSSSSSxxo'),
    (44, 40, 'osSSssooSSSSSSSso'),
    (44, 41, 'osSSSSssooooooooo'),
    (44, 42, 'osSSSSSssso'),
]


def head_row(y, back, front):
    lit = LIT.get(y, 0)
    inside = front - back - 1
    shadow = 2 if y >= 36 else 0

    return 'o' + 'L' * lit + 'S' * (inside - lit - shadow) + 's' * shadow + 'o'


def runs():
    rows = [(36, y, '.' * 28) for y in range(14, 43)]
    rows += [(back, y, head_row(y, back, front)) for y, (back, front) in BACK_AND_FRONT.items()]

    return rows + FEATURES


RUNS = runs()

RUNS += [
    (54, 71, 'L'), (55, 72, 'x'), (55, 73, 'x'), (54, 74, 'x'), (54, 75, 'x'), (53, 76, 'x'),
    (49, 70, 'sx'),
]

SHORTS_BEHIND_ARM = [(41, y, '.obBBBBBBBBBBBBbbo' if y in (65, 78, 79) else 'obbBBBBBBBBBBBBbbo')
                     for y in range(65, 80)]

ARM = [
    (44, 64, 'oSSSSSSsso'), (44, 65, 'oSSSSSSsso'), (45, 66, 'oSSSSSsso'), (45, 67, 'oLSSSSsso'),
    (46, 68, 'oLSSSsso'), (46, 69, 'oLSSSsso'), (46, 70, 'oSSSSsso'), (47, 71, 'oSSsso'),
    (46, 72, 'ooLSSSSoo'), (45, 73, 'oLSSSSSLso'), (45, 74, 'oSSSSSSsxo'), (45, 75, 'oSSSSSssxo'),
    (45, 76, 'oSSSSsssxo'), (46, 77, 'osssssxo'), (47, 78, 'oooooo'),
]

RUNS = [run for run in RUNS if not (41 <= run[0] <= 58 and 64 <= run[1] <= 79)]
RUNS += SHORTS_BEHIND_ARM + ARM


TRIM_TO_SHIRT = {'T': 'R', 't': 'r', 'Y': 'R'}

TORSO = [
    (40, 46, 'oR'), (40, 47, 'oR'), (40, 48, 'oR'), (40, 49, 'oR'), (40, 50, 'oR'),
    (59, 47, 'ro'), (59, 48, 'ro'), (59, 49, 'ro'), (59, 50, 'ro'), (59, 51, 'ro'), (59, 52, 'ro'),
    (55, 59, 'r'), (56, 60, 'r'), (56, 61, 'd'), (57, 62, 'r'),
]


def touch_up(rows, mirrored):
    """Side on, the raglan seam would run down the chest as a stripe, so the front's trim is left
    off; the chest swells forward and the shoulder blade back."""
    chest = range(51, 60) if not mirrored else range(40, 49)

    for y in range(43, 56):
        for x in chest:
            rows[y][x] = TRIM_TO_SHIRT.get(rows[y][x], rows[y][x])

    for x, y, run in TORSO:
        if mirrored:
            x, run = 99 - (x + len(run) - 1), run[::-1]

        rows[y][x:x + len(run)] = run

    return rows

DETAIL = [
    (46, 61, 's'), (47, 62, 's'), (49, 65, 'ss'), (46, 68, 's'), (47, 69, 's'), (45, 66, 'L'), (45, 67, 'L'),
    (43, 71, 'b'), (44, 72, 'b'), (55, 75, 'b'), (55, 76, 'b'),
    (52, 83, 'LL'), (52, 84, 'L'), (51, 86, 'ss'), (53, 86, 's'), (46, 86, 's'), (47, 87, 's'),
    (44, 90, 'eeeeeeee'), (44, 91, 'fffffff'),
    (46, 92, 'f'), (45, 94, 'f'), (45, 96, 'f'),
    (45, 109, 'uuuu'), (45, 110, 'uuuuuuuu'), (45, 111, 'uuuuuuuuuuu'),
    (49, 106, 'u'), (51, 107, 'u'), (53, 108, 'u'), (55, 108, 'u'), (57, 109, 'uu'), (59, 108, 'u'),
    (45, 112, 'nnnnnnnn'),
]

RUNS += DETAIL

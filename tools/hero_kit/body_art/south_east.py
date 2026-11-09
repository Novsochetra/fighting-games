"""The hero three-quarters to the front, turned to his left (our right): his head drawn whole, the
near eye wide, the far one narrowed by the turn, his ear on the near side."""

EDGES = {
    17: (46, 53), 18: (44, 55), 19: (43, 56), 20: (42, 57), 21: (41, 58), 22: (41, 58),
    23: (40, 59), 24: (40, 59), 25: (40, 59), 26: (40, 59), 27: (40, 59), 28: (40, 59),
    29: (40, 59), 30: (40, 59), 31: (40, 59), 32: (40, 59), 33: (41, 59), 34: (42, 59),
    35: (43, 58), 36: (44, 58), 37: (46, 57), 38: (48, 56),
}

LIT = {18: 6, 19: 7, 20: 8, 21: 8, 22: 7, 23: 6, 24: 5, 25: 4, 26: 3, 27: 2, 28: 2, 29: 2,
       30: 2, 31: 2, 32: 2, 33: 1}

FEATURES = [
    (46, 17, 'oooooooo'), (44, 18, 'oo'), (54, 18, 'oo'),
    (45, 24, 'ggg'), (47, 25, 'ggg'), (44, 26, 'oo'), (50, 26, 'gg'),
    (45, 27, 'oooo'), (45, 28, 'oEEoooo'), (45, 29, 'oEEkkko'), (46, 30, 'Ekkkko'), (46, 31, 'oiiio'),
    (56, 24, 'gg'), (54, 25, 'ggg'), (53, 26, 'g'),
    (55, 27, 'ooo'), (54, 28, 'ooooo'), (54, 29, 'oEkkE'), (55, 30, 'kkkE'), (55, 31, 'iio'),
    (56, 31, 's'), (56, 32, 's'), (55, 33, 'sx'),
    (52, 35, 'sxxs'),
    (39, 28, 'o'), (38, 29, 'oSx'), (38, 30, 'oSx'), (38, 31, 'osx'), (39, 32, 'o'),
    (48, 39, 'ooooooooo'), (45, 39, 'oxx'), (57, 38, 'o'),
    (45, 40, 'oxxxsssxxxo'), (45, 41, 'oxxxxxxxxxo'),
]


def head_row(y, left, right):
    lit = LIT.get(y, 0)
    inside = right - left - 1
    shadow = 2

    return 'o' + 'L' * lit + 'S' * (inside - lit - shadow) + 's' * shadow + 'o'


def runs():
    rows = [(36, y, '.' * 28) for y in range(17, 40)]
    rows += [(left, y, head_row(y, left, right)) for y, (left, right) in EDGES.items()]

    return rows + FEATURES


RUNS = runs()

RUNS += [
    (38, 72, 'xo'), (38, 73, 'ox'), (35, 74, 'ss'), (36, 75, 'x'),
    (63, 66, 'xo'), (64, 67, 'x'),
]

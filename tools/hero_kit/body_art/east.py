"""The hero side on, facing right: his head drawn whole as an anime profile, row by row from the
back of the skull to the line of his face."""

BACK_AND_FRONT = {
    17: (45, 52), 18: (43, 55), 19: (42, 56), 20: (41, 57), 21: (40, 58), 22: (40, 58),
    23: (39, 59), 24: (39, 59), 25: (39, 60), 26: (39, 60), 27: (39, 61), 28: (39, 60),
    29: (39, 60), 30: (39, 61), 31: (39, 62), 32: (39, 63), 33: (39, 62), 34: (40, 61),
    35: (40, 61), 36: (41, 60), 37: (42, 61), 38: (43, 61), 39: (44, 60),
}

LIT = {17: 0, 18: 7, 19: 8, 20: 9, 21: 9, 22: 9, 23: 9, 24: 8, 25: 7, 26: 6, 27: 5, 28: 4,
       29: 4, 30: 3, 31: 2, 32: 1}

FEATURES = [
    (45, 17, 'oooooooo'), (43, 18, 'oo'), (54, 18, 'oo'),
    (54, 26, 'ggg'), (56, 27, 'gggg'), (53, 27, 'o'),
    (54, 28, 'ooooo'), (54, 29, 'oEkkk'), (55, 30, 'EkEk'), (56, 31, 'okk'),
    (61, 31, 's'), (61, 32, 'ss'), (60, 33, 'sx'), (59, 34, 'x'),
    (58, 36, 'xx'), (59, 37, 's'),
    (46, 28, 'oo'), (45, 29, 'oSso'), (45, 30, 'oSxo'), (45, 31, 'oSxo'), (45, 32, 'osso'), (46, 33, 'oo'),
    (47, 34, 'x'), (48, 35, 'x'), (49, 36, 'o'), (50, 37, 'o'), (51, 38, 'oo'), (53, 39, 'oooooooo'),
    (44, 38, 'osssxxs'), (44, 39, 'ossxxxxxx'), (44, 40, 'osxxxxxxxxxo'), (44, 41, 'osxxxxxxxxxo'),
]


def head_row(y, back, front):
    lit = LIT.get(y, 0)
    inside = front - back - 1
    shadow = 2 if y >= 33 else 0

    return 'o' + 'L' * lit + 'S' * (inside - lit - shadow) + 's' * shadow + 'o'


def runs():
    rows = [(36, y, '.' * 28) for y in range(17, 42)]
    rows += [(back, y, head_row(y, back, front)) for y, (back, front) in BACK_AND_FRONT.items()]

    return rows + FEATURES


RUNS = runs()

RUNS += [
    (54, 71, 'L'), (53, 72, 'xx'), (54, 73, 'L'), (53, 74, 'xx'), (54, 75, 'L'), (53, 76, 'xx'),
    (49, 70, 'sx'),
]

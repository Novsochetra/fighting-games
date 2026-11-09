"""The hero three-quarters to the front, turned to his left (our right): his head drawn whole, the
near eye wide, the far one narrowed by the turn, his ear on the near side."""

EDGES = {
    17: (45, 54), 18: (43, 56), 19: (42, 57), 20: (41, 58), 21: (40, 59), 22: (40, 59),
    23: (39, 60), 24: (39, 60), 25: (39, 60), 26: (39, 60), 27: (39, 60), 28: (39, 60),
    29: (39, 60), 30: (39, 60), 31: (39, 60), 32: (39, 60), 33: (39, 60), 34: (39, 60),
    35: (40, 60), 36: (41, 60), 37: (42, 59), 38: (44, 59), 39: (46, 58), 40: (48, 57),
}

LIT = {18: 6, 19: 7, 20: 8, 21: 8, 22: 7, 23: 6, 24: 5, 25: 4, 26: 3, 27: 2, 28: 1, 29: 1}

FEATURES = [
    (45, 17, 'oooooooooo'), (43, 18, 'oo'), (55, 18, 'oo'),
    (43, 30, 'gggg'), (46, 31, 'ggggg'), (55, 30, 'gggg'), (52, 31, 'ggg'),
    (45, 32, 'oooo'), (45, 33, 'oEooo'), (46, 34, 'Eooo'), (46, 35, 'Eoo'),
    (54, 32, 'oooo'), (54, 33, 'ooEo'), (54, 34, 'ooE'), (54, 35, 'oE'),
    (52, 36, 's'), (53, 37, 'o'),
    (51, 39, 'ooo'),
    (40, 31, 'oo'), (39, 32, 'oSso'), (39, 33, 'oSxo'), (39, 34, 'oSso'), (40, 35, 'oo'),
    (42, 36, 'ss'), (43, 37, 'sss'), (45, 38, 'ss'), (47, 39, 's'),
    (50, 41, 'ooooooo'), (57, 40, 'o'),
    (42, 38, 'os'), (42, 39, 'oSSs'), (42, 40, 'oSSSss'), (42, 41, 'oSSSSsss'),
    (38, 42, 'oooooTSSSSSsssTooo'),
    (39, 43, 'RRRRTTSSSSssTT'),
    (44, 44, 'TTSSssTT'), (45, 45, 'TTssTT'), (46, 46, 'TTTT'),
]


def head_row(y, left, right):
    lit = LIT.get(y, 0)
    inside = right - left - 1
    shadow = 2 if y < 36 else 3

    return 'o' + 'L' * lit + 'S' * (inside - lit - shadow) + 's' * shadow + 'o'


def runs():
    rows = [(36, y, '.' * 28) for y in range(14, 42)] + [(38, 42, '.' * 20)]
    rows += [(left, y, head_row(y, left, right)) for y, (left, right) in EDGES.items()]

    return rows + FEATURES


RUNS = runs()


BODY = [
    (33, 58, 'L'), (33, 59, 'L'), (33, 60, 'L'), (33, 61, 'L'), (33, 62, 'L'), (34, 63, 'L'), (34, 64, 'L'),
    (35, 61, 's'), (36, 62, 's'), (35, 64, 's'), (36, 65, 's'),
    (33, 70, 'L'), (33, 71, 'L'), (33, 72, 'L'), (37, 72, 'oo'), (37, 73, 'ox'), (38, 74, 's'), (35, 76, 'ss'),
    (44, 57, 'r'), (45, 58, 'r'), (46, 59, 'r'), (47, 60, 'r'), (48, 61, 'r'), (45, 62, 'dd'), (52, 62, 'dd'),
    (40, 82, 'L'), (42, 83, 's'), (41, 84, 's'), (42, 85, 'ss'),
    (39, 104, 'u'), (40, 105, 'uu'), (41, 106, 'uu'), (42, 107, 'uu'), (43, 108, 'uu'), (44, 109, 'uu'),
    (44, 110, 'uu'), (43, 111, 'uu'), (37, 112, 'nnnnnnnn'), (36, 106, 'W'), (36, 107, 'W'),
]

RUNS += BODY


def near_boot():
    """The near boot, three-quarters on, points down and out to our right, as the front's right boot
    does, so it is that boot's drawing, moved under this sock."""
    from body_art.south import drawn_rows as front_rows

    front = front_rows()
    cleared = [(33, y, '.' * 18) for y in range(101, 114)]
    boot = [(58 - 24, y + 3, ''.join(front[y][58:73]).replace('.', '_')) for y in range(98, 110)]

    return cleared + boot


RUNS = [run for run in RUNS if not (run[1] >= 103 and run[0] < 50)] + near_boot()

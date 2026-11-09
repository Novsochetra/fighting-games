"""The hero from the front: his head and face drawn by hand over the bake."""

HEAD = {
    17: (45, 54, 0, 0, 0),
    18: (44, 55, 6, 1, 0),
    19: (42, 57, 7, 2, 0),
    20: (41, 58, 8, 2, 0),
    21: (40, 59, 8, 2, 0),
    22: (40, 59, 7, 2, 0),
    23: (39, 60, 6, 2, 0),
    24: (39, 60, 5, 2, 0),
    25: (39, 60, 3, 2, 0),
    26: (39, 60, 2, 2, 0),
    27: (39, 60, 1, 2, 0),
    28: (39, 60, 1, 2, 0),
    29: (39, 60, 1, 2, 0),
    30: (39, 60, 1, 2, 0),
    31: (39, 60, 1, 2, 0),
    32: (39, 60, 1, 2, 0),
    33: (39, 60, 0, 2, 1),
    34: (40, 59, 0, 2, 1),
    35: (41, 58, 0, 2, 1),
    36: (42, 57, 0, 2, 1),
    37: (43, 56, 0, 3, 1),
    38: (45, 54, 0, 2, 1),
}

RUNS = [
    (45, 17, 'oooooooooo'), (44, 18, 'oo'), (54, 18, 'oo'),
    (44, 38, 'o'), (55, 38, 'o'), (44, 39, 'ox'), (46, 39, 'oooooooo'), (54, 39, 'xo'),
    (44, 40, 'osssSSSssso'), (44, 41, 'osSSSSSSsso'),
    (41, 24, 'ggg'), (43, 25, 'ggg'), (40, 26, 'oo'), (46, 26, 'ggg'),
    (41, 27, 'oooo'), (41, 28, 'oEEoooo'), (41, 29, 'oEkEkko'), (42, 30, 'Ekkkko'), (42, 31, 'Soiio'),
    (56, 24, 'ggg'), (54, 25, 'ggg'), (58, 26, 'oo'), (51, 26, 'ggg'),
    (55, 27, 'oooo'), (52, 28, 'ooooEEo'), (52, 29, 'okEkkEo'), (52, 30, 'okkkkE'), (53, 31, 'oiioS'),
    (50, 32, 's'), (49, 33, 'sx'),
    (48, 35, 'sxxs'),
    (38, 28, 'o'), (37, 29, 'oSx'), (37, 30, 'osx'), (37, 31, 'osx'), (38, 32, 'o'),
    (61, 28, 'o'), (60, 29, 'xso'), (60, 30, 'xxo'), (60, 31, 'xxo'), (61, 32, 'o'),
]

LEFT_FIST = [
    '___oSSSso__',
    '__oLSSSsso_',
    '_oLLSSSSso_',
    '_oLSSSSSsso',
    'oLLSSSSSSso',
    'oLSSSSxosso',
    'oSSSSsoxsso',
    'oSSSSssSSso',
    'oSSSSSSSsso',
    '_ossSSSsso_',
    '__ossssso__',
    '___ooooo___',
]

RIGHT_FIST = [
    '__oSSSSo___',
    '_oSSSSSso__',
    '_oLSSSSSso_',
    'oLSSSSSSso_',
    'oLSSSSSSsso',
    'oLSoxSSSsso',
    'oSxosSSSsso',
    'oSSssSSSsso',
    'oSSSSSSSsso',
    '_oSSSSSsso_',
    '__ossssso__',
    '___ooooo___',
]

LEFT_BOOT = {
    98: (30, 'oWWWUuumo'),
    99: (30, 'oUmUmUuuo'),
    100: (29, 'oWUUmUUuuo'),
    101: (29, 'oWUmUmUuuo'),
    102: (28, 'oWWUUmUUUuuo'),
    103: (27, 'oWWWWUUUUUuuo'),
    104: (26, 'oWWWWWWUUUUuuo'),
    105: (25, 'oWWWWWWWWUUuuuo'),
    106: (24, 'oWWWWWWWWUUUuumo'),
    107: (24, 'oUWWWWWUUUUuuumo'),
    108: (24, 'oUUUUUUUUuuuumo'),
    109: (25, 'onNNNNNnnnnno'),
    110: (26, 'ooooooooooo'),
}

RIGHT_BOOT = {
    98: (61, 'oWWUUuumo'),
    99: (61, 'oUmUmUuuo'),
    100: (61, 'oWUUmUUuuo'),
    101: (61, 'oWUmUmUuuo'),
    102: (60, 'oWWUUmUUUuuo'),
    103: (60, 'oWWWUUUUUUuuo'),
    104: (60, 'oWWWWWUUUUUuuo'),
    105: (60, 'oWWWWWWWUUUUuuo'),
    106: (60, 'oWWWWWWWWUUUUumo'),
    107: (60, 'oWWWWWWUUUUUuumo'),
    108: (61, 'oUUUUUUUUUuuumo'),
    109: (62, 'onNNNNNNnnnno'),
    110: (63, 'ooooooooooo'),
}


def boot_rows(boot, left, right):
    """A boot redrawn whole: its rows cleared between `left` and `right`, then drawn."""
    runs = [(left, y, '.' * (right - left + 1)) for y in range(98, 112)]

    return runs + [(x, y, run) for y, (x, run) in boot.items()]


BLOCKS = [
    (25, 63, LEFT_FIST), (64, 63, RIGHT_FIST),
]

RUNS += boot_rows(LEFT_BOOT, 22, 41) + boot_rows(RIGHT_BOOT, 58, 77) + [
    (36, 81, 'LL'), (35, 83, 's'), (36, 84, 'ss'), (38, 83, 's'),
    (60, 81, 'LL'), (59, 83, 's'), (60, 84, 'ss'), (62, 83, 's'),
]

RUNS += [
    (38, 55, 'P'), (39, 55, 'r'), (39, 56, 'P'), (40, 56, 'r'), (41, 57, 'r'), (42, 58, 'r'), (43, 59, 'r'),
    (61, 55, 'd'), (60, 56, 'd'), (59, 57, 'd'), (58, 58, 'd'),
    (40, 62, 'rrrrrr'), (56, 61, 'd'), (55, 62, 'dd'),
]

RUNS += [
    (29, 55, 'LLsss'), (29, 56, 'L'), (31, 58, 's'), (32, 59, 's'), (30, 61, 'LL'),
    (64, 55, 'LLsss'), (64, 56, 'L'), (67, 58, 's'), (68, 59, 's'), (65, 61, 'LL'),
]

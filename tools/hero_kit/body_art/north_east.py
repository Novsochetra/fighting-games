"""The hero from behind and to his left: the backs of his fists drawn over the bake."""

RUNS = [
    (43, 47, 'rr'), (45, 48, 'r'), (52, 47, 'rr'), (54, 48, 'r'),
    (41, 56, 'r'), (42, 57, 'r'), (43, 58, 'r'), (44, 59, 'r'), (57, 57, 'd'), (56, 58, 'd'), (55, 59, 'd'),
    (46, 62, 'rrr'),
    (61, 72, 'LSLSL'), (62, 74, 'x'), (64, 74, 'x'), (66, 74, 'x'),
    (33, 66, 'LS'), (34, 67, 'x'),
]


NECK = range(31, 43)


def touch_up(rows, mirrored):
    """The back of his neck below the hair takes the light on its near side, as the back view's
    does, instead of sitting in one shadow."""
    near = range(37, 51) if not mirrored else range(49, 63)

    for y in NECK:
        for x in near:
            if rows[y][x] == 's':
                rows[y][x] = 'S'

    return rows

DETAIL = [(57, y, 'Vv') for y in range(67, 76)] + [
    (54, 89, 'eeeeeeee'), (54, 90, 'fffffff'), (35, 85, 'eeeeeeee'), (35, 86, 'ffffff'),
    (55, 84, 'ss'), (56, 85, 'sss'), (60, 92, 'f'), (61, 94, 'f'), (60, 96, 'f'),
    (59, 62, 's'), (60, 63, 's'), (61, 66, 's'), (62, 67, 's'), (58, 64, 'L'), (58, 65, 'L'),
    (43, 73, 'b'), (44, 74, 'b'),
]

RUNS += DETAIL

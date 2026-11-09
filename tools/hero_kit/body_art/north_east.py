"""The hero from behind and to his left: the backs of his fists drawn over the bake."""

RUNS = [
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

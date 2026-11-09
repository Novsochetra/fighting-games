"""The hero's spiky hair from behind, shared by north and north-east: the locks fanning from the
crown, clumps ending in three points at the nape, his long swept locks on his right (our right) and short spikes on his
left. `back_locks(shift, swept_right)` places it; the mirrored side is the twin."""

CROWN = [
    [(50, 16), (44, 14), (38.5, 21), (37.5, 27), (42, 24)],
    [(50, 16), (56, 14), (61.5, 21), (62.5, 27), (58, 24)],
    [(49, 17), (45, 20), (42, 27), (43.5, 33), (47, 26)],
    [(51, 17), (55, 20), (58, 27), (56.5, 33), (53, 26)],
    [(48.5, 18), (51.5, 18), (52, 27), (50, 35), (48, 27)],
]
NAPE = []
MASS = [(40.5, 31), (37.5, 26), (35.5, 19), (38, 14.5), (43, 12), (50, 11.5), (57, 12), (62, 15), (64.5, 20),
        (62.5, 26), (59.5, 31), (55, 33.5), (45, 33.5)]
TOP = [
    [(57, 15), (55.5, 9), (53, 5), (50.5, 8), (48, 13)],
    [(47, 14), (44.5, 8.5), (41.5, 6.5), (41.5, 11), (41, 16)],
]
SWEPT = [
    [(58, 16), (63, 13.5), (69, 12.5), (64, 17), (59, 19.5)],
    [(61, 19), (67, 19), (72.5, 20.5), (67, 23), (61, 24)],
    [(61.5, 23.5), (66, 26), (70.5, 28), (65, 27.5), (60.5, 26.5)],
]
SHORT = [
    [(40, 15), (35.5, 14), (31, 15.5), (34.5, 19), (38, 21)],
    [(37.5, 21), (33.5, 23.5), (30.5, 27.5), (35, 27.5), (38, 26)],
]


def placed(points, shift, flip):
    return {'points': [((99 - x if flip else x) + shift, y) for x, y in points]}


def back_locks(shift=0, swept_right=True):
    """The locks, moved `shift` across; with `swept_right` false the side locks swap sides."""
    sides = [placed(points, shift, not swept_right) for points in SWEPT + SHORT]

    return ([placed(MASS, shift, False)] + [placed(points, shift, False) for points in TOP] + sides
            + [placed(points, shift, False) for points in CROWN + NAPE])


SHEENED = [0, 8, 9, 10, 11, 12]

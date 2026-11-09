"""The hero's spiky hair from behind, shared by north and north-east: the locks fanning from the
crown, the nape's points, his long swept locks on his right (our right) and short spikes on his
left. `back_locks(shift, swept_right)` places it; the mirrored side is the twin."""

CROWN = [
    [(43, 15), (50, 14.5), (47, 21), (40.5, 28), (40.5, 21)],
    [(49, 14.5), (57, 15), (60, 21.5), (60.5, 28), (54, 21)],
    [(38.5, 21), (45, 20), (44.5, 27), (41, 33), (39, 27.5)],
    [(54.5, 20), (61.5, 21), (61, 27.5), (58.5, 33), (55, 27)],
    [(45, 18), (54, 18), (53, 25.5), (50, 32), (47, 25.5)],
]
NAPE = [
    [(40, 29), (40.5, 34.5), (43, 38.5), (45, 34), (46, 30)],
    [(45.5, 30.5), (47.5, 35.5), (50, 39), (51.5, 35), (52.5, 31)],
    [(52, 30), (55, 35), (58, 38), (58.5, 33.5), (59, 29)],
]
MASS = [(38, 33), (35.5, 26), (35.5, 19), (38, 14.5), (43, 12), (50, 11.5), (57, 12), (62, 15), (64.5, 20),
        (64, 27), (61, 33), (55, 35), (45, 35)]
TOP = [
    [(57, 15), (55.5, 9), (53, 5), (50.5, 8), (48, 13)],
    [(47, 14), (44.5, 8.5), (41.5, 6.5), (41.5, 11), (41, 16)],
]
SWEPT = [
    [(58, 16), (63, 13.5), (69, 12.5), (64, 17), (59, 19.5)],
    [(61, 19), (67, 19), (72.5, 20.5), (67, 23), (61, 24)],
    [(61.5, 23.5), (66, 26), (70.5, 28.5), (65, 28.5), (60, 28)],
]
SHORT = [
    [(40, 15), (35.5, 14), (31, 15.5), (34.5, 19), (38, 21)],
    [(37.5, 21), (33.5, 23.5), (30.5, 27.5), (35, 27.5), (38, 26)],
    [(38, 26), (35, 29), (34, 32.5), (37.5, 31), (39, 29)],
]


def placed(points, shift, flip):
    return {'points': [((99 - x if flip else x) + shift, y) for x, y in points]}


def back_locks(shift=0, swept_right=True):
    """The locks, moved `shift` across; with `swept_right` false the side locks swap sides."""
    sides = [placed(points, shift, not swept_right) for points in SWEPT + SHORT]

    return ([placed(MASS, shift, False)] + [placed(points, shift, False) for points in TOP] + sides
            + [placed(points, shift, False) for points in CROWN + NAPE])


SHEENED = [0, 9, 10, 11, 12, 13]

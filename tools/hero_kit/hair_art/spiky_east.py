"""The hero's spiky hair side on, facing right: we see his right side, where the long locks sweep
back, with the forelock at his temple and the fringe jutting over his brow. The twin shows his left
side's short spikes instead, for the mirrored west."""

from locks import band

MASS = {'points': [(42, 38), (37.5, 30), (37, 20), (40, 14.5), (46, 12), (53, 12), (58.5, 14.5), (61.5, 19),
                   (62, 27), (58, 28), (54.5, 26), (51, 28), (50, 32), (47.5, 31), (44.5, 31.5),
                   (44, 36)]}
TOP = [
    {'points': [(46, 13.5), (47, 7.5), (49, 4), (51, 8), (53, 13)]},
    {'points': [(51, 13.5), (54, 9), (57.5, 6.5), (57.5, 11), (58.5, 15.5)]},
]
FRINGE = [
    {'points': [(56, 16), (61.5, 17.5), (65, 22), (62.5, 25), (61.5, 29.5), (58.5, 24)]},
    {'points': [(53, 17.5), (59, 19), (59.5, 25), (60, 31), (57, 28.5), (55.5, 23)]},
]

LOCKS = [MASS] + TOP + [
    {'points': [(44, 16), (38, 13), (31, 12), (36, 17), (41, 20)]},
    {'points': [(41, 19), (34, 19.5), (28, 21.5), (34, 24), (40, 25)]},
    {'points': [(40, 26.5), (35, 30), (31.5, 34.5), (36.5, 34), (42, 33)]},
] + FRINGE + [
    {'points': [(49, 23), (53, 24), (52.5, 29), (51.5, 33.5), (49.5, 29)]},
]

TWIN_LOCKS = [MASS] + TOP + [
    {'points': [(44, 15), (41, 10), (38, 7), (44, 10), (48, 14)]},
    {'points': [(41, 19), (36, 17.5), (32, 17), (36, 21), (41, 23)]},
    {'points': [(40, 26), (37, 29.5), (35.5, 33), (39.5, 32), (42.5, 31)]},
] + FRINGE

SHEEN = band((51, 28), (12, 8), 1.8)

SHEENED = [0, 1, 2, 6, 7, 8]

TWIN_SHEENED = [0, 1, 2, 6, 7]

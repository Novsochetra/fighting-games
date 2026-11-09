"""The hero's spiky hair side on, facing right: we see his right side, where the long locks sweep
back, with the forelock at his temple and the fringe jutting over his brow. The twin shows his left
side's short spikes instead, for the mirrored west."""

from locks import band

MASS = {'points': [(41, 35), (37.5, 28), (37, 20), (40, 14.5), (46, 12), (53, 12), (58.5, 14.5), (61.5, 19),
                   (62, 24), (58, 24.5), (54.5, 22.5), (51, 24.5), (50, 29), (47.5, 27), (44, 27.5),
                   (43.5, 32)]}
TOP = [
    {'points': [(46, 13.5), (47, 7.5), (49, 4), (51, 8), (53, 13)]},
    {'points': [(51, 13.5), (54, 9), (57.5, 6.5), (57.5, 11), (58.5, 15.5)]},
]
FRINGE = [
    {'points': [(56, 16), (61.5, 17.5), (65, 20.5), (62, 22), (60.5, 25.5), (58.5, 21.5)]},
    {'points': [(53, 17.5), (59, 19), (59.5, 23), (60.5, 27.5), (57.5, 25), (55.5, 22)]},
]

LOCKS = [MASS] + TOP + [
    {'points': [(44, 16), (38, 13), (31, 12), (36, 17), (41, 20)]},
    {'points': [(41, 19), (34, 19.5), (28, 21.5), (34, 24), (40, 25)]},
    {'points': [(40, 24.5), (35, 27.5), (31, 31.5), (36, 31), (41, 30)]},
] + FRINGE + [
    {'points': [(49, 21), (53, 21.5), (52, 26), (51, 31), (49.5, 26.5)]},
]

TWIN_LOCKS = [MASS] + TOP + [
    {'points': [(44, 15), (41, 10), (38, 7), (44, 10), (48, 14)]},
    {'points': [(41, 19), (36, 17.5), (32, 17), (36, 21), (41, 23)]},
    {'points': [(40, 24), (37, 27), (35, 30), (39, 29), (42, 28)]},
] + FRINGE

SHEEN = band((51, 28), (12, 8), 1.8)

SHEENED = [0, 1, 2, 6, 7, 8]

TWIN_SHEENED = [0, 1, 2, 6, 7]

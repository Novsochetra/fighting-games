"""The mohawk from behind: the crest runs down the middle of his head to the nape."""

from locks import band

BASE = 'shaved'

LOCKS = [
    {'points': [(46, 34), (45, 20), (44.5, 13), (46.5, 9), (50, 7), (53.5, 9), (55.5, 13), (55, 20), (54, 34),
                (50, 36)]},
    {'points': [(45, 14), (46.5, 9.5), (50, 7.5), (53.5, 9.5), (55, 14), (50, 18)]},
    {'points': [(45.5, 13), (54.5, 13), (53.5, 21), (50, 26), (46.5, 21)]},
    {'points': [(45.5, 21), (54.5, 21), (53.5, 29), (50, 34.5), (46.5, 29)]},
]

SHEEN = band((50, 22), (6, 12), 1.4, left_of=50)

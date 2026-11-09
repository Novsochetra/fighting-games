"""The mohawk from the front: a narrow crest of spikes standing up off the stubble."""

from locks import band

BASE = 'shaved'

LOCKS = [
    {'points': [(44, 21), (43.5, 15), (46, 10), (50, 7.5), (54, 10), (56.5, 15), (56, 21)]},
    {'points': [(44.5, 21), (44, 15), (45, 10.5), (48, 14), (48.5, 21)]},
    {'points': [(47.5, 21), (48, 13), (50, 8), (52, 13), (52.5, 21)]},
    {'points': [(51.5, 21), (52, 14), (55, 10.5), (56, 15), (55.5, 21)]},
]

SHEEN = band((50, 19), (5, 7), 1.4)

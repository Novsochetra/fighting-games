"""The mohawk from the front: a narrow crest of three tall spikes standing up off the stubble, the
same crest the side view shows as a row."""

from locks import band

BASE = 'shaved'

LOCKS = [
    {'points': [(44, 21), (43.5, 15), (45, 11.5), (50, 10), (55, 11.5), (56.5, 15), (56, 21)]},
    {'points': [(44.5, 21), (43.5, 13), (44, 6), (48, 12), (48.5, 21)]},
    {'points': [(47.5, 21), (48, 11), (50, 3.5), (52, 11), (52.5, 21)]},
    {'points': [(51.5, 21), (52, 12), (56, 6), (56.5, 13), (55.5, 21)]},
]

SHEEN = band((50, 19), (5, 7), 1.4)

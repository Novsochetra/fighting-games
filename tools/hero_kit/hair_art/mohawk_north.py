"""The mohawk from behind: the crest of spikes runs down the middle of his head to the nape, its
top the three spikes of the front and its sides jagged with the spikes the side view shows."""

from locks import band

BASE = 'shaved'

LOCKS = [
    {'points': [(46, 34), (46, 20), (45, 14), (46.5, 11.5), (50, 10), (53.5, 11.5), (55, 14), (54, 20), (54, 34), (50, 37)]},
    {'points': [(46, 20), (43, 16), (46.5, 24.5)]},
    {'points': [(54, 20), (57, 16), (53.5, 24.5)]},
    {'points': [(46, 28), (43.5, 25), (46.5, 32)]},
    {'points': [(54, 28), (56.5, 25), (53.5, 32)]},
    {'points': [(45.5, 15), (44.5, 9), (45, 6), (48.5, 12), (49, 16)]},
    {'points': [(48, 15), (48.5, 10), (50, 3.5), (51.5, 10), (52, 15)]},
    {'points': [(51, 16), (51.5, 12), (55, 6), (55.5, 9), (54.5, 15)]},
    {'points': [(46.5, 22), (53.5, 22), (53, 29), (50, 35), (47, 29)]},
]

SHEEN = band((50, 22), (6, 12), 1.4, left_of=50)

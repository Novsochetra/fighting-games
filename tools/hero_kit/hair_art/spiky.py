"""The hero's spiky hair as clumps, drawn for the five directions with their own art: seven spikes
of different lengths swept up and to his left, and bangs, temple locks or nape locks falling from it as the head turns. The
west-facing three are drawn from their mirror images, lit again from the upper left."""

from pathlib import Path

from grid import read_grid, write_grid
from hair_clumps import painted
from mirror import MIRRORS
from render import WIDTH
from despeckle import despeckled
from selout import sel_out

OUT = Path(__file__).resolve().parents[3] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair' / 'spiky'

SOUTH = [
    [(36, 27), (35, 18), (38, 12.5), (44, 10), (51, 9.5), (57, 10.5), (62, 13), (65, 18), (64.5, 27),
     (61.5, 30), (59, 21.5), (41, 21.5), (38.5, 30)],
    [(37.5, 21), (28.5, 14), (37.5, 15.5)],
    [(37.5, 17), (36, 7.5), (46.5, 11.5)],
    [(44, 12), (54, 0.5), (57, 11.5)],
    [(54, 12), (71, 4), (63, 17)],
    [(61.5, 15), (75, 17.5), (64, 23)],
    [(63, 21.5), (70.5, 29), (62.5, 27.5)],
    [(36.5, 17.5), (43.5, 16), (44.5, 22), (42.5, 27), (40, 32), (38, 27), (36, 22.5)],
    [(55.5, 16), (63, 17.5), (64, 22.5), (62.5, 27.5), (60.5, 32.5), (58, 27), (55.5, 22)],
    [(43, 15), (49, 15), (48.5, 19), (46.5, 21.5), (45, 23.5), (44, 21), (43.5, 19)],
    [(53.5, 15), (58.5, 15.5), (58, 19.5), (57, 21.5), (56.5, 23.5), (55, 21), (54, 19)],
    [(47.5, 14.5), (54.5, 14.5), (54, 19), (52, 22), (50.5, 26.5), (49, 22), (48, 19)],
]

SOUTH_EAST = [
    [(36, 30), (34, 20), (36, 14), (41, 10.5), (48, 9.5), (55, 10.5), (60, 13), (62.5, 18), (62, 22.5),
     (44, 22.5), (40, 30)],
    [(36, 20.5), (28, 14), (36.5, 15)],
    [(36.5, 16), (34.5, 7.5), (45.5, 11)],
    [(43, 11.5), (53, 0.5), (56, 11)],
    [(53.5, 12), (69, 4.5), (61.5, 16.5)],
    [(60.5, 15), (73, 17.5), (62.5, 22.5)],
    [(61.5, 21), (68.5, 28.5), (61, 27)],
    [(35, 23), (32.5, 34), (40, 29)],
    [(37.5, 18), (44.5, 16), (45.5, 22), (43.5, 27), (41.5, 32.5), (40, 27.5), (38.5, 23)],
    [(53, 15.5), (60.5, 16.5), (62.5, 21), (61.5, 26.5), (60.5, 31), (58.5, 26.5), (55.5, 21.5)],
    [(45, 15), (53, 15), (54, 20), (53.5, 22.5), (52.5, 26.5), (50.5, 23), (47.5, 20)],
]

EAST = [
    [(37, 32), (36, 20), (39, 14), (45, 10.5), (52, 10.5), (58, 13), (61.5, 18), (61, 23), (56, 24),
     (50.5, 25), (49.5, 28.5), (44, 28.5), (42.5, 36), (38.5, 36.5)],
    [(47, 12), (43.5, 3.5), (54, 11)],
    [(39.5, 15), (30, 9), (45, 11.5)],
    [(37, 20.5), (28, 19.5), (38, 26)],
    [(37.5, 27), (31, 33), (41, 32)],
    [(53, 11.5), (60.5, 6), (59.5, 15)],
    [(48.5, 11), (52, 1.5), (56, 11.5)],
    [(49, 21), (54.5, 21.5), (54, 27.5), (52.5, 33), (50.5, 28)],
    [(52, 17), (59, 18), (60, 23.5), (58.5, 26.5), (56.5, 24.5), (54.5, 22)],
    [(55, 15), (62.5, 17), (65, 22.5), (61, 25.5), (59, 23.5)],
]

NORTH_EAST = [
    [(38.5, 28), (36.5, 19), (39, 13), (45, 10.5), (51, 10), (57, 11), (62, 14), (64.5, 20), (63, 26),
     (59, 28.5), (55.5, 29), (53, 36.5), (44, 37.5), (40.5, 34)],
    [(36.5, 16), (34.5, 7.5), (45.5, 11)],
    [(43, 11.5), (53, 0.5), (56, 11)],
    [(53.5, 12), (69, 4.5), (61.5, 16.5)],
    [(60.5, 15), (73, 17.5), (62.5, 22.5)],
    [(61.5, 21), (68.5, 28.5), (61, 27)],
    [(50, 12), (40, 15.5), (37, 24), (40, 31), (44.5, 34.5), (47, 24)],
    [(53, 12), (61, 15), (64.5, 22.5), (62, 30.5), (58, 31), (55.5, 23)],
    [(51, 12.5), (46.5, 20), (46, 30), (50.5, 37), (55, 30), (55.5, 20)],
]

NORTH = [
    [(37.5, 27), (34.5, 19), (38, 13), (44, 10.5), (50, 10), (56, 10.5), (62, 13), (65.5, 19),
     (62.5, 27), (60, 32), (50, 33), (40, 32)],
    [(62.5, 21), (71.5, 14), (62.5, 15.5)],
    [(62.5, 17), (64, 7.5), (53.5, 11.5)],
    [(56, 12), (46, 0.5), (43, 11.5)],
    [(46, 12), (29, 4), (37, 17)],
    [(38.5, 15), (25, 17.5), (36, 23)],
    [(37, 21.5), (29.5, 29), (37.5, 27.5)],
    [(49, 12), (39, 15.5), (35.5, 24), (38.5, 31), (43.5, 34.5), (46, 24)],
    [(52, 12), (61, 15), (64.5, 24), (61.5, 31), (56.5, 34.5), (54, 24)],
    [(50, 12.5), (45.5, 20), (45, 30), (49.5, 34), (54.5, 30), (54.5, 20)],
    [(44, 29), (46, 36.5), (48.5, 30.5)],
    [(48, 30.5), (50, 37.5), (52, 30.5)],
    [(51.5, 30.5), (54, 36.5), (56, 29)],
]

DRAWN = {'south': SOUTH, 'south-east': SOUTH_EAST, 'east': EAST, 'north-east': NORTH_EAST, 'north': NORTH}

# the middle of the head's crown in each direction, round which the sheen arcs
CROWNS = {'south': (50, 25), 'south-east': (48, 25), 'east': (47, 25), 'north-east': (51, 25), 'north': (50, 25)}


def mirrored(clumps):
    return [[(WIDTH - x, y) for x, y in clump] for clump in clumps]


# the front is the reference's own hair, cleaned, and the three-quarter and back views are drawn
# from it; only the side views are painted as clumps
MASTERS = Path(__file__).parent


def master(direction):
    path = MASTERS / f'spiky_{direction}.txt'

    return read_grid(path) if path.exists() else None


def layers():
    drawn = {direction: master(direction) or painted(clumps, CROWNS[direction]) for direction, clumps in DRAWN.items()}
    turned = {direction: [row[::-1] for row in master(source)] if master(source)
              else painted(mirrored(DRAWN[source]), (WIDTH - CROWNS[source][0], CROWNS[source][1]))
              for direction, source in MIRRORS.items()}

    return {**drawn, **turned}


def main():
    for direction, rows in layers().items():
        write_grid(OUT / f'{direction}.txt', sel_out(despeckled(rows)))


if __name__ == '__main__':
    main()

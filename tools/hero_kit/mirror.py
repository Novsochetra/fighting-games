"""The three directions drawn from their mirror image: south-west from south-east, west from east,
north-west from north-east. The 3D parts are rendered for them outright; the hand-drawn art is
carried across (its sides swapped) and its shading lit again from the upper left, as everywhere."""

MIRRORS = {'south-west': 'south-east', 'west': 'east', 'north-west': 'north-east'}

LAST_COLUMN = 99
SHADES = 'LSsx'


def flipped_x(x):
    return LAST_COLUMN - x


def relit(run):
    """A run of plain skin shading, lit again from the left: its outlines at the ends kept, the
    shades between them ordered light to dark."""
    inner = run[1:-1] if run[0] == 'o' and run[-1] == 'o' and len(run) > 2 else run

    if not inner or any(letter not in SHADES for letter in inner):
        return None

    ordered = ''.join(sorted(inner, key=SHADES.index))

    return 'o' + ordered + 'o' if inner is not run else ordered


def flipped_run(x, y, run, relight=True):
    turned = run[::-1]
    lit = relit(turned) if relight else None

    return flipped_x(x + len(run) - 1), y, lit or turned


def flipped_runs(runs, relight=True):
    return [flipped_run(x, y, run, relight) for x, y, run in runs]


def flipped_points(points):
    return [(LAST_COLUMN + 1 - x, y) for x, y in points]

"""Gathers the kit's grids, colours and sample players into kit.json, and writes the inspector page
with them inside it, so the page is one file that opens anywhere."""

import json
import re
from pathlib import Path

from grid import read_grid
from letters import LETTERS
from looks import BOOTS, EYES, GEAR_COLOURS, HAIRS, KITS, PLAYERS, SKINS
from number import CLEARANCE, CLEARED, FONTS, PLACES, PRINTED
from palette import OUTLINE, RAMPS
from render import FACINGS, HEIGHT, WIDTH

HERE = Path(__file__).resolve().parent
KIT = HERE.parents[1] / 'concepts' / 'naga-eleven' / 'hero-kit'


def cropped(rows):
    """A layer cut to the box round its pixels: {x, y, rows}."""
    filled = [(x, y) for y, row in enumerate(rows) for x, letter in enumerate(row) if letter != '.']

    if not filled:
        return None

    left = min(x for x, _ in filled)
    right = max(x for x, _ in filled)
    top = min(y for _, y in filled)
    bottom = max(y for _, y in filled)

    return {'x': left, 'y': top, 'rows': [row[left:right + 1] for row in rows[top:bottom + 1]]}


def folder_layers(folder):
    layers = {}

    for item in sorted(path for path in (KIT / folder).iterdir() if path.is_dir()):
        layers[item.name] = {path.stem: cropped(read_grid(path)) for path in sorted(item.glob('*.txt'))}

    return layers


def kit():
    return {
        'width': WIDTH, 'height': HEIGHT, 'directions': list(FACINGS),
        'letters': LETTERS, 'outline': OUTLINE, 'ramps': RAMPS,
        'body': {direction: cropped(read_grid(KIT / 'body' / f'{direction}.txt')) for direction in FACINGS},
        'hair': folder_layers('hair'), 'scars': folder_layers('scars'), 'gear': folder_layers('gear'),
        'number': {'fonts': FONTS, 'places': PLACES, 'printed': PRINTED, 'cleared': CLEARED,
                   'clearance': CLEARANCE},
        'swatches': {'skin': SKINS, 'hair': HAIRS, 'kit': KITS, 'boots': BOOTS, 'eyes': EYES},
        'gearColours': GEAR_COLOURS, 'players': PLAYERS,
    }


def main():
    data = json.dumps(kit(), separators=(',', ':'))
    (KIT / 'kit.json').write_text(data)
    template = (HERE / 'inspector.html').read_text()
    page = re.sub(r'(<script id="kit" type="application/json">).*?(</script>)', lambda match: match[1] + data + match[2],
                  template, flags=re.S)
    (KIT / 'inspector.html').write_text(page)
    print(f'kit.json {len(data) // 1024} KB')


if __name__ == '__main__':
    main()

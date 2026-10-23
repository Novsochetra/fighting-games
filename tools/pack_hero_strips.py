"""Pack each Shade's grid strips into small strips of their painted pieces, the ones the game draws.

    python3 tools/pack_hero_strips.py

A Shade's strips (hero_<strip>.png, a row per weapon and a cell per frame, most of them written by
tools/bake_hero_weapons.py) stay the source the art is drawn in, and the hero select keeps showing
hero_idle.png and hero_win.png themselves. A cell is as big as the Shade's widest blow, and the
seven Shades' strips took 142 MB once a browser had unpacked them; tools/sheet_packing.py cuts them
down. Each strip's packed copy goes to packed/ beside it, and src/data/hero-atlas/<id>.js gets each
strip's frame height and each frame's piece, a strip to a line so a Shade's table stays short.

The hero select shows only the sword row (the first) of a Shade's idle and win strips, so that row
is cut out to the card strips its `cards` name (card_idle.png and card_win.png), and the menu
loads a quarter of each strip; the Khmer fighters' cards are drawn for them (tools/hero_cards).

Run it again after changing or baking a strip: test/unit/data/hero-atlas.test.js fails until you do.
"""

import json
import os
import subprocess
import sys

from PIL import Image

from sheet_packing import pack_sheet, save_like

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust')
ATLAS = os.path.join(GAME, 'src', 'data', 'hero-atlas')
HEADER = (
    "// written by tools/pack_hero_strips.py from this Shade's strips: run it again after changing one\n"
    '// a strip is [frame height, then a row of pieces per weapon], a line to a strip\n'
    '// prettier-ignore\n'
)
INDEX_HEADER = '// written by tools/pack_hero_strips.py: run it again after adding a Shade\n'

# the strips each Shade loads come from the game's own tables, so the two never disagree
READ_STRIPS = """
const data = await import(process.argv[1]);
const { HEROES } = await import(process.argv[2]);
const heroes = HEROES.map((hero) => [
  hero.id,
  data.stripsOf(hero).map((name) => [name, data.stripPath(hero, name), data.packedStripPath(hero, name), data.stripRows(name)]),
  Object.entries(hero.cards.cutFrom ?? {}).map(([slot, name]) => [hero.cards[slot], data.stripPath(hero, name), data.stripRows(name)]),
]);
console.log(JSON.stringify({ frameWidth: data.HERO_SPRITES.frameWidth, heroes }));
"""


def read_strips():
    data = os.path.join(GAME, 'src', 'data', 'hero-sprites.js')
    heroes = os.path.join(GAME, 'src', 'data', 'heroes.js')
    output = subprocess.run(
        ['node', '--input-type=module', '-e', READ_STRIPS, '--', 'file://' + data, 'file://' + heroes],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(output)


def pack_strip(path, packed_path, rows, frame_width):
    sheet = Image.open(os.path.join(GAME, path))
    if sheet.height % rows:
        raise ValueError(f'{path}: {sheet.height} rows of pixels do not split into {rows} rows')
    os.makedirs(os.path.dirname(os.path.join(GAME, packed_path)), exist_ok=True)
    frame_height = sheet.height // rows
    entries, pixels = pack_sheet(sheet, frame_width, frame_height, os.path.join(GAME, packed_path))
    return frame_height, entries, pixels


def cut_cards(cards):
    for card_path, strip_path, rows in cards:
        sheet = Image.open(os.path.join(GAME, strip_path))
        row = sheet.crop((0, 0, sheet.width, sheet.height // rows))
        save_like(row, sheet, os.path.join(GAME, card_path))
        print(f'  card {card_path}: {sheet.width}x{sheet.height // rows} of {strip_path}')


def module_text(lines):
    return HEADER + 'export const PIECES = {\n' + ''.join(lines) + '};\n'


def index_text(ids):
    imports = ''.join(f"import {{ PIECES as {i} }} from './{i}.js';\n" for i in ids)
    return INDEX_HEADER + imports + '\nexport const HERO_ATLAS = {\n' + ''.join(
        f'  {i},\n' for i in ids) + '};\n'


def pack_hero(hero_id, strips, frame_width):
    lines = []
    before = after = 0
    for name, path, packed_path, rows in strips:
        frame_height, entries, (grid_pixels, packed_pixels) = pack_strip(
            path, packed_path, rows, frame_width)
        lines.append(f'  {name}: [{frame_height}, ' + ', '.join(json.dumps(r) for r in entries) + '],\n')
        before, after = before + grid_pixels, after + packed_pixels
    with open(os.path.join(ATLAS, f'{hero_id}.js'), 'w') as out:
        out.write(module_text(lines))
    print(f'{hero_id:8s} {len(strips)} strips: {before * 4 / 2**20:5.1f} MB -> {after * 4 / 2**20:4.1f} MB')
    return before, after


def main():
    os.makedirs(ATLAS, exist_ok=True)
    table = read_strips()
    before = after = 0
    for hero_id, strips, cards in table['heroes']:
        grid, packed = pack_hero(hero_id, strips, table['frameWidth'])
        before, after = before + grid, after + packed
        cut_cards(cards)
    index = os.path.join(ATLAS, 'index.js')
    with open(index, 'w') as out:
        out.write(index_text(sorted(hero_id for hero_id, *_ in table['heroes'])))
    subprocess.run(['npx', 'prettier', '--write', '--log-level', 'warn', index], cwd=ROOT, check=True)
    print(f'all strips unpacked: {before * 4 / 2**20:.0f} MB -> {after * 4 / 2**20:.0f} MB')


if __name__ == '__main__':
    sys.exit(main())

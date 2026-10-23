"""Pack each enemy's grid sheet into a small sheet of its painted pieces, the one the game loads.

    python3 tools/pack_enemy_sheets.py

The grid sheets in assets/sprites/enemies/ stay the source the art is drawn in: one row per strip
and one cell per frame, laid out as src/data/enemies/enemy-sprites.js says. Most of a cell is empty
(a boss's cell is as big as its widest move), and the twelve boss sheets took 218 MB once a browser
had unpacked them; tools/sheet_packing.py cuts them down. The packed sheets go to
assets/sprites/enemies/packed/, and src/data/enemies/atlas/<id>.js gets each frame's piece.

Run it again after changing a grid sheet: test/unit/data/enemy-atlas.test.js fails until you do.
"""

import json
import os
import subprocess
import sys

from PIL import Image

from sheet_packing import pack_sheet

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust')
SHEETS = os.path.join(GAME, 'assets', 'sprites', 'enemies')
PACKED = os.path.join(SHEETS, 'packed')
ATLAS = os.path.join(GAME, 'src', 'data', 'enemies', 'atlas')
HEADER = '// written by tools/pack_enemy_sheets.py from {}: run it again after changing the sheet\n'
INDEX_HEADER = '// written by tools/pack_enemy_sheets.py: run it again after adding an enemy sheet\n'

# the frame size of each sheet comes from the game's own table, so the two never disagree
READ_SPRITES = """
const { ENEMY_SPRITES } = await import(process.argv[1]);
const sizes = Object.entries(ENEMY_SPRITES).map(([id, s]) => [id, s.file, s.frameWidth, s.frameHeight]);
console.log(JSON.stringify(sizes));
"""


def read_sprites():
    table = os.path.join(GAME, 'src', 'data', 'enemies', 'enemy-sprites.js')
    output = subprocess.run(
        ['node', '--input-type=module', '-e', READ_SPRITES, '--', 'file://' + table],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(output)


def module_text(file, atlas):
    rows = ',\n'.join(
        '  [\n' + ''.join(f'    {json.dumps(f)},\n' for f in row) + '  ]' if row else '  []'
        for row in atlas
    )
    return HEADER.format(file) + f'export const PIECES = [\n{rows},\n];\n'


def index_text(ids):
    imports = ''.join(f"import {{ PIECES as {i} }} from './{i}.js';\n" for i in ids)
    return INDEX_HEADER + imports + '\nexport const ENEMY_ATLAS = {\n' + ''.join(
        f'  {i},\n' for i in ids) + '};\n'


def main():
    os.makedirs(PACKED, exist_ok=True)
    os.makedirs(ATLAS, exist_ok=True)
    sprites = read_sprites()
    written = []
    before = after = 0
    for sprite_id, file, frame_width, frame_height in sprites:
        sheet = Image.open(os.path.join(SHEETS, file))
        atlas, (grid_pixels, packed_pixels) = pack_sheet(
            sheet, frame_width, frame_height, os.path.join(PACKED, file))
        path = os.path.join(ATLAS, f'{sprite_id}.js')
        with open(path, 'w') as out:
            out.write(module_text(file, atlas))
        written.append(path)
        before, after = before + grid_pixels, after + packed_pixels
        print(f'{file:16s} {grid_pixels * 4 / 2**20:5.1f} MB -> {packed_pixels * 4 / 2**20:4.1f} MB')
    ids = sorted(sprite_id for sprite_id, *_ in sprites)
    index = os.path.join(ATLAS, 'index.js')
    with open(index, 'w') as out:
        out.write(index_text(ids))
    written.append(index)
    # the written modules are laid out as the repo's Prettier lays them out, so a check passes
    subprocess.run(['npx', 'prettier', '--write', '--log-level', 'warn', *written], cwd=ROOT, check=True)
    print(f'all sheets unpacked: {before * 4 / 2**20:.0f} MB -> {after * 4 / 2**20:.0f} MB')


if __name__ == '__main__':
    sys.exit(main())

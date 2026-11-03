"""Write the kit's parts as the game's data: one line a part.

A part is `"<width> <height> <anchor x> <anchor y>|<rows>"`: rows are split by `/`, each a run of
letters, a letter followed by how many times it repeats when more than once, `.` for nothing. The
skin's letters are digits in the portraits, so they are stored as `a` to `d` to keep the counts
readable (apps/web/games/naga-eleven/src/render/portraits/kit/decode.js reads them back).
"""
import re

STORED = {'1': 'a', '2': 'b', '3': 'c', '4': 'd'}
HEADER = ('// baked by tools/face_kit/bake.py from concepts/naga-eleven/face-kit/; change the sheets and\n'
          '// bake again rather than edit these lines, which are pixels\n')


def number(value):
    return str(int(value)) if float(value).is_integer() else f'{value:.1f}'


def runs(row):
    out, i = [], 0
    while i < len(row):
        j = i
        while j < len(row) and row[j] == row[i]:
            j += 1
        out.append(row[i] + (str(j - i) if j - i > 1 else ''))
        i = j
    return ''.join(out)


def encode(letters, anchor):
    left = min(x for x, _ in letters)
    top = min(y for _, y in letters)
    width = max(x for x, _ in letters) - left + 1
    height = max(y for _, y in letters) - top + 1
    rows = []
    for y in range(top, top + height):
        row = ''.join(STORED.get(letters.get((x, y), '.'), letters.get((x, y), '.')) for x in range(left, left + width))
        rows.append(runs(row.rstrip('.')))
    head = f'{width} {height} {number(anchor[0] - left)} {number(anchor[1] - top)}'
    return f'{head}|{"/".join(rows)}'


# written the way Prettier (.prettierrc.json) lays it out, so a fresh bake leaves no diff: a long
# value goes under its key, unless the key is too short for the break to gain anything
PRINT_WIDTH = 100
SHORT_KEY = 2 + 3


def entry(key, value):
    name = key if re.fullmatch(r'[A-Za-z_$][\w$]*', key) else f"'{key}'"
    line = f"  {name}: '{value}',"
    return line if len(line) <= PRINT_WIDTH or len(name) < SHORT_KEY else f"  {name}:\n    '{value}',"


def module(name, parts):
    lines = [entry(key, value) for key, value in parts.items()]
    return HEADER + f'export const {name} = {{\n' + '\n'.join(lines) + '\n};\n'

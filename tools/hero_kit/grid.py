"""Reads and writes a layer's grid: one text row per pixel row, each row numbered so a hand edit
can find it, e.g. `042 |....oSSo....|`."""

from pathlib import Path


def write_grid(path, rows):
    lines = [f'{index:03d} |{row}|' for index, row in enumerate(rows)]
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text('\n'.join(lines) + '\n')


def read_grid(path):
    rows = []

    for line in Path(path).read_text().splitlines():
        if '|' in line:
            rows.append(line.split('|')[1])

    return rows

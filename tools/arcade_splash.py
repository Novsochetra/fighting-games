#!/usr/bin/env python3
"""The installed arcade's launch screens on iPhone and iPad: the app icon in the middle of black.

    python3 tools/arcade_splash.py [OUT_DIR]

Android draws its own from the manifest (background_color and the 512 icon); iOS shows only an
image the page links for the exact screen, so this draws one per screen and orientation into
apps/web/arcade/public/assets/splash/ (or OUT_DIR), named splash-<width>x<height>@<ratio>x.png in
CSS pixels as the screen is held. The build links each one from the pages (build-steps/startup-images.js).
"""
import os
import shutil
import sys

from PIL import Image

from arcade_icons import render

BACKGROUND = (0, 0, 0)
ICON_POINTS = 128

# Portrait CSS size and pixel ratio of each iPhone and iPad screen iOS 16 and later runs on.
SCREENS = [
    (440, 956, 3), (420, 912, 3), (402, 874, 3), (430, 932, 3), (393, 852, 3), (428, 926, 3),
    (390, 844, 3), (375, 812, 3), (414, 896, 3), (414, 896, 2), (414, 736, 3), (375, 667, 2),
    (1032, 1376, 2), (1024, 1366, 2), (834, 1210, 2), (834, 1194, 2), (820, 1180, 2),
    (834, 1112, 2), (810, 1080, 2), (744, 1133, 2), (768, 1024, 2),
]


def splash(width, height, ratio, icon):
    image = Image.new('RGB', (width * ratio, height * ratio), BACKGROUND)
    left = (image.width - icon.width) // 2
    top = (image.height - icon.height) // 2
    image.paste(icon, (left, top), icon)
    return image


def splashes():
    icons = {ratio: render(ICON_POINTS * ratio, rounded=True) for _, _, ratio in SCREENS}
    for width, height, ratio in SCREENS:
        for shown in ((width, height), (height, width)):
            yield f'splash-{shown[0]}x{shown[1]}@{ratio}x.png', splash(*shown, ratio, icons[ratio])


def main():
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(repo, 'apps', 'web', 'arcade', 'public', 'assets', 'splash')
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir)
    for name, image in splashes():
        image.save(os.path.join(out_dir, name), optimize=True)
        print(f'{name} {image.width}x{image.height}')


if __name__ == '__main__':
    main()

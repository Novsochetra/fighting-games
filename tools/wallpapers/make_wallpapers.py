#!/usr/bin/env python3
"""The arcade's wallpapers, cut from the full-size PNGs into the files the wallpapers screen loads.

    python3 tools/wallpapers/make_wallpapers.py SOURCE_DIR OUT_DIR

Reads tools/wallpapers/sources.json and writes, for each wallpaper, under OUT_DIR/wallpapers/<id>/:
  thumb-<hash>.webp       640 wide, for the grid on a phone
  view-<hash>.webp        1280 wide, for the grid on a big screen and the preview on a phone
  large-<hash>.webp       2560 wide, for the preview on a big screen
  phone-view-<hash>.webp  720 x 1560, the phone cut as the preview shows it
  phone-<hash>.jpg        the download for a phone: 9 by 19.5, up to 1440 x 3120, cut round `focus`
  desktop-<hash>.png      the download for a computer: the PNG itself, every pixel as it was made
Each name carries a hash of its bytes, as CloudFront keeps a file a year and never sees it change.
Then writes the screen's list, apps/web/arcade/src/screens/wallpapers/wallpapers.json (each file at
<base>/<id>/<name>), the picture a shared link to the screen shows,
apps/web/arcade/public/assets/social/wallpapers.jpg, and the banners the home page's link to it
turns through, apps/web/arcade/public/assets/wallpapers/banner-<id>-<width>.webp (21 by 9, each
dark enough in its lower left for the words over it).
Upload OUT_DIR with tools/wallpapers/upload-wallpapers.js.
"""
import concurrent.futures
import hashlib
import json
import os
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
LIST_OUT = os.path.join(REPO, 'apps/web/arcade/src/screens/wallpapers/wallpapers.json')
SOCIAL_OUT = os.path.join(REPO, 'apps/web/arcade/public/assets/social/wallpapers.jpg')
BANNER_OUT = os.path.join(REPO, 'apps/web/arcade/public/assets/wallpapers/banner-{}-{}.webp')
BANNER_WIDTHS = [960, 1600, 2400]
# the home's WallpapersCallout.tsx names the same, in the same order
BANNERS = ['worlds-edge-night', 'highlands-moonrise', 'entry-close-night', 'entry-wide-night',
           'ta-prohm-hill-sunset', 'highlands-night']
SOCIAL_FROM = 'entry-sunset'
CDN = 'https://dphwn49s8chpb.cloudfront.net'

PHONE_SHAPE = 9 / 19.5
PHONE_HEIGHT = 3120
# the sun up or the moon: the screen's two filters
MOODS = {'Afternoon': 'day', 'Dawn': 'day', 'Sunset': 'day', 'Moonrise': 'night',
         'Moonset': 'night', 'Night': 'night'}

# The phone's download keeps every pixel's color (4:4:4): halving it blurs the thin glowing paths.
# It is progressive, so a slow phone draws the whole picture blurred first.
DOWNLOAD = ['-quality', '92', '-sampling-factor', '4:4:4', '-interlace', 'JPEG']
JPEG = ['-sampling-factor', '4:2:0', '-interlace', 'JPEG']
WEBP = ['-define', 'webp:method=6']


def size_of(path):
    out = subprocess.run(['magick', 'identify', '-format', '%w %h', path + '[0]'],
                         check=True, capture_output=True, text=True).stdout
    return [int(value) for value in out.split()]


def phone_crop(width, height, focus):
    crop_width = round(height * PHONE_SHAPE)
    left = min(max(round(focus * width - crop_width / 2), 0), width - crop_width)
    return f'{crop_width}x{height}+{left}+0'


def cut(source, folder, width, height, focus):
    # The PNG is read once: the landscape files shrink one from the next, then the phone's cut.
    landscape = ['-resize', '2560x>', '-quality', '82', *WEBP, '+write', 'large.webp',
                 '-resize', '1280x', '+write', 'view.webp',
                 '-resize', '640x', '-quality', '78', '+write', 'thumb.webp', '+delete']
    phone = ['mpr:src', '-crop', phone_crop(width, height, focus), '+repage',
             '-resize', f'x{PHONE_HEIGHT}>', *DOWNLOAD, '+write', 'phone.jpg',
             '-resize', '720x1560!', '-quality', '80', *WEBP, 'phone-view.webp']
    subprocess.run(['magick', source, '-strip', '-colorspace', 'sRGB', '+repage',
                    '-write', 'mpr:src', *landscape, *phone], check=True, cwd=folder)


def named_by_hash(folder, file_name):
    path = os.path.join(folder, file_name)
    with open(path, 'rb') as file:
        digest = hashlib.sha256(file.read()).hexdigest()[:10]
    stem, extension = os.path.splitext(file_name)
    hashed = f'{stem}-{digest}{extension}'
    os.replace(path, os.path.join(folder, hashed))
    return hashed


def make(source_dir, out_dir, entry):
    folder = os.path.join(out_dir, 'wallpapers', entry['id'])
    os.makedirs(folder, exist_ok=True)
    for old in os.listdir(folder):
        os.remove(os.path.join(folder, old))
    source = os.path.join(source_dir, entry['file'])
    cut(source, folder, *size_of(source), entry['focus'])
    shutil.copyfile(source, os.path.join(folder, 'desktop.png'))
    names = {name.split('.')[0]: named_by_hash(folder, name) for name in sorted(os.listdir(folder))}

    def download(name):
        path = os.path.join(folder, names[name])
        return [*size_of(path), os.path.getsize(path)]

    return {
        'id': entry['id'], 'place': entry['place'], 'time': entry['time'],
        'mood': MOODS[entry['time']],
        'files': {'thumb': names['thumb'], 'view': names['view'], 'large': names['large'],
                  'phoneView': names['phone-view'], 'phone': names['phone'],
                  'desktop': names['desktop']},
        # width, height and bytes, which the download buttons show
        'phone': download('phone'), 'desktop': download('desktop'),
    }


def cover(source_dir, entries, wallpaper, size, out, quality):
    entry = next(entry for entry in entries if entry['id'] == wallpaper)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run(['magick', os.path.join(source_dir, entry['file']), '-strip', '-colorspace',
                    'sRGB', '-resize', f'{size}^', '-gravity', 'center', '-extent', size,
                    *quality, out], check=True)


def main(source_dir, out_dir):
    with open(os.path.join(HERE, 'sources.json')) as file:
        entries = json.load(file)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        made = list(pool.map(lambda entry: make(source_dir, out_dir, entry), entries))
    os.makedirs(os.path.dirname(LIST_OUT), exist_ok=True)
    with open(LIST_OUT, 'w') as file:
        json.dump({'base': f'{CDN}/wallpapers', 'wallpapers': made}, file, indent=2)
        file.write('\n')
    cover(source_dir, entries, SOCIAL_FROM, '1200x630', SOCIAL_OUT, ['-quality', '84', *JPEG])
    for banner in BANNERS:
        for width in BANNER_WIDTHS:
            cover(source_dir, entries, banner, f'{width}x{round(width * 9 / 21)}',
                  BANNER_OUT.format(banner, width), ['-quality', '78', *WEBP])
    print(f'{len(made)} wallpapers in {out_dir}, their list in {LIST_OUT}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])

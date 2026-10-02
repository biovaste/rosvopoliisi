#!/usr/bin/env python3
"""Turns the generated source images in art-src/ into game-ready WebP files.

- Buildings: removes the white background, crops, scales to fit their slot, and
  measures the roof line (for chimneys), door and jail-window positions.
- Tiles: cuts a repeating tile and makes it seamless where needed.
- Skies: resized panoramas.

Writes src/assets/art/*.webp and src/art-meta.json (sizes in logical px; images
are stored at 2x for sharp tablet screens).

Usage: python3 tools/prepare_art.py   (needs Pillow and numpy)
"""

import json
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'art-src')
OUT = os.path.join(ROOT, 'src', 'assets', 'art')
META = os.path.join(ROOT, 'src', 'art-meta.json')
SCALE = 2  # stored pixels per logical pixel
MAGENTA = (255, 0, 255)

# Fit box (logical px), door position (fraction of width), regions to blank out,
# and extra seed points for white pockets enclosed by sign brackets.
BUILDINGS = {
    'home': {'box': (200, 240), 'door': 0.5, 'erase': [(0, 640, 492, 1140)], 'seeds': []},
    'bakery': {'box': (200, 240), 'door': 0.8, 'erase': [], 'seeds': [(300, 760), (420, 760)]},
    'bank': {'box': (200, 240), 'door': 0.5, 'erase': [], 'seeds': []},
    'jewelry': {'box': (200, 240), 'door': 0.79, 'erase': [], 'seeds': [(300, 760), (420, 760)]},
    'station': {'box': (330, 290), 'door': 0.5, 'erase': [], 'seeds': []},
}


def cut_out(path, erase, seeds):
    im = Image.open(path).convert('RGB')
    draw = ImageDraw.Draw(im)
    for box in erase:
        draw.rectangle(box, fill=(255, 255, 255))
    w, h = im.size
    border = [(x, 0) for x in range(0, w, 40)] + [(x, h - 1) for x in range(0, w, 40)]
    border += [(0, y) for y in range(0, h, 40)] + [(w - 1, y) for y in range(0, h, 40)]
    for p in border + list(seeds):
        r, g, b = im.getpixel(p)
        if min(r, g, b) > 225:
            ImageDraw.floodfill(im, p, MAGENTA, thresh=40)
    a = np.asarray(im).copy()
    bg = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8))
    # Shrink 1px to drop the white fringe, then soften the edge.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    rgba = im.convert('RGBA')
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    return rgba.crop(bbox), bbox


def building(name, cfg, meta):
    img, bbox = cut_out(os.path.join(SRC, f'{name}.jpg'), cfg['erase'], cfg['seeds'])
    bw, bh = cfg['box']
    k = min(bw / img.width, bh / img.height)
    lw, lh = round(img.width * k), round(img.height * k)
    out = img.resize((lw * SCALE, lh * SCALE), Image.LANCZOS)
    out.save(os.path.join(OUT, f'{name}.webp'), quality=88, method=6)
    # Roof line: first opaque row for every 2 logical px.
    alpha = np.asarray(out.split()[3])
    roof = []
    for x in range(0, lw, 2):
        col = np.where(alpha[:, x * SCALE] > 128)[0]
        roof.append(int(col[0] / SCALE) if len(col) else lh)
    entry = {'w': lw, 'h': lh, 'door': cfg['door'], 'roof': roof}
    if name == 'station':
        entry['cells'] = station_cells(bbox, k)
    meta['buildings'][name] = entry


def station_cells(bbox, k):
    """Finds the three barred windows in the source and returns logical rects."""
    a = np.asarray(Image.open(os.path.join(SRC, 'station.jpg')).convert('RGB')).astype(int)
    dark = a.max(axis=2) < 90
    cells = []
    for x0, x1 in [(690, 900), (935, 1140), (1180, 1385)]:
        cols = np.where(dark[480:800, x0:x1].sum(axis=0) > 60)[0]
        rows = np.where(dark[480:800, x0:x1].sum(axis=1) > 40)[0]
        sx0, sx1 = x0 + cols.min(), x0 + cols.max()
        sy0, sy1 = 480 + rows.min(), 480 + rows.max()
        cells.append({
            'x': round((sx0 - bbox[0]) * k, 1),
            'y': round((sy0 - bbox[1]) * k, 1),
            'w': round((sx1 - sx0) * k, 1),
            'h': round((sy1 - sy0) * k, 1),
        })
    return cells


def tile(name, src, quadrant, size, mirror_v=False):
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    if quadrant:
        im = im.crop((0, 0, im.width // 2, im.height // 2))
    if mirror_v:
        tall = Image.new('RGB', (im.width, im.height * 2))
        tall.paste(im, (0, 0))
        tall.paste(im.transpose(Image.FLIP_TOP_BOTTOM), (0, im.height))
        im = tall
    lw, lh = size
    im.resize((lw * SCALE, lh * SCALE), Image.LANCZOS).save(os.path.join(OUT, f'{name}.webp'), quality=82, method=6)
    return {'w': lw, 'h': lh}


def sky(name, meta):
    path = os.path.join(SRC, f'{name}.jpg')
    if not os.path.exists(path):
        return
    im = Image.open(path).convert('RGB')
    w = 1320
    h = round(im.height * w / im.width)
    im.resize((w * SCALE // 2 * 2, h * SCALE // 2 * 2), Image.LANCZOS).save(os.path.join(OUT, f'{name}.webp'), quality=80, method=6)
    meta['skies'][name] = {'w': w, 'h': h}


def main():
    os.makedirs(OUT, exist_ok=True)
    meta = {'buildings': {}, 'tiles': {}, 'skies': {}}
    for name, cfg in BUILDINGS.items():
        building(name, cfg, meta)
    meta['tiles']['grass'] = tile('tile-grass', 'tile-grass.jpg', True, (220, 220))
    meta['tiles']['sand'] = tile('tile-sand', 'tile-sand.jpg', True, (240, 240))
    meta['tiles']['sidewalk'] = tile('tile-sidewalk', 'tile-sidewalk.jpg', False, (120, 240), mirror_v=True)
    if os.path.exists(os.path.join(SRC, 'tile-street.jpg')):
        meta['tiles']['street'] = tile('tile-street', 'tile-street.jpg', True, (200, 200))
    for s in ['sky-day', 'sky-evening', 'sky-night']:
        sky(s, meta)
    with open(META, 'w') as f:
        json.dump(meta, f, separators=(',', ':'))
    print(json.dumps({k: list(v.keys()) for k, v in meta.items()}))


if __name__ == '__main__':
    main()

#!/usr/bin/env bash
# make-readme-demo.sh — build .github/assets/demo.webp (README demo) from exports/flows/tap-flow.mp4.
# tap-flow.mp4 is full-bleed with SQUARE corners (cheyshen.com rounds it via CSS);
# GitHub allows no CSS, so bake transparent rounded corners in: 44px-radius phone
# silhouette (4x-supersampled) -> alphamerge -> RGBA frames -> img2webp lossy.
# NOT ffmpeg libwebp_anim: it flattens alpha to a black box (see EXPORTS.md / memory).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="$HERE/exports/flows/tap-flow.mp4"; OUT="$HERE/../.github/assets/demo.webp"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
python3 -c "
from PIL import Image, ImageDraw
k=4; im=Image.new('L',(410*k,864*k),0)
ImageDraw.Draw(im).rounded_rectangle((0,0,410*k-1,864*k-1),radius=44*k,fill=255)
im.resize((410,864),Image.LANCZOS).save('$TMP/mask.png')"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
ffmpeg -v error -y -i "$SRC" -loop 1 -i "$TMP/mask.png" -filter_complex \
  "[0:v]fps=20,format=rgba[v];[1:v]format=gray[m];[v][m]alphamerge,format=rgba" -t "$DUR" "$TMP/f%04d.png"
img2webp -loop 0 -lossy -q 90 -m 6 -d 50 "$TMP"/f*.png -o "$OUT"
# Verify: every frame's corners must be fully transparent.
python3 -c "
from PIL import Image, ImageSequence; import numpy as np
bad=sum(1 for f in ImageSequence.Iterator(Image.open('$OUT'))
        if np.asarray(f.convert('RGBA'))[[0,0,-1,-1],[0,-1,0,-1],3].max()!=0)
print('corner check:', 'OK' if bad==0 else f'{bad} BAD frames'); exit(bad>0)"
ls -la "$OUT"

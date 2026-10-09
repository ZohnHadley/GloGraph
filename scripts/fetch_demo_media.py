#!/usr/bin/env python3
"""Download CC0 demo media into demos/media/ for the media-rich demo projects.

All sources are Kenney.nl asset packs, which are released under Creative Commons
CC0 (public domain) — safe to use in marketing/video with no attribution required.
A short "gameplay preview" video is synthesised locally from the CC0 sprite art
with ffmpeg, so it inherits CC0 too (no third-party video needed).

Outputs:
  demos/media/*.png|*.ogg|*.mp4   the extracted / generated assets
  demos/media/manifest.json       consumed by scripts/gen_gamedev_demo.py
  demos/media/CREDITS.txt         provenance + license

Re-runnable. Standard library only + ffmpeg on PATH (for the video).

Usage:  python scripts/fetch_demo_media.py
"""
import json
import os
import pathlib
import subprocess
import sys
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = ROOT / "demos" / "media"
MEDIA.mkdir(parents=True, exist_ok=True)

# Kenney CC0 packs (direct .zip download URLs).
PACKS = {
    "pixel-platformer": "https://kenney.nl/media/pages/assets/pixel-platformer/33bb4921eb-1696667883/kenney_pixel-platformer.zip",
    "music-jingles":    "https://kenney.nl/media/pages/assets/music-jingles/f37e530b9e-1677590399/kenney_music-jingles.zip",
    "interface-sounds": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
}


def fetch_zip(url: str) -> zipfile.ZipFile:
    import io
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (GloGraph demo media fetch)"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return zipfile.ZipFile(io.BytesIO(r.read()))


def select(zf: zipfile.ZipFile, exts: tuple, prefer: list, limit: int) -> list:
    """Pick up to `limit` distinct files: highest-preference keyword first, then
    largest. Dedupe by basename so the cards show different-looking assets."""
    infos = [i for i in zf.infolist()
             if not i.is_dir() and i.filename.lower().endswith(exts)]

    def score(i):
        name = i.filename.lower()
        pref = next((k for k, kw in enumerate(prefer) if kw in name), len(prefer))
        return (pref, -i.file_size)

    infos.sort(key=score)
    out, seen = [], set()
    for i in infos:
        b = os.path.basename(i.filename).lower()
        if b in seen:
            continue
        seen.add(b)
        out.append(i)
        if len(out) >= limit:
            break
    return out


def extract(zf: zipfile.ZipFile, info: zipfile.ZipInfo, pack: str) -> pathlib.Path:
    dest = MEDIA / f"{pack}__{os.path.basename(info.filename)}"
    dest.write_bytes(zf.read(info))
    return dest


def make_video(image_paths: list, out: pathlib.Path):
    """Synthesise a short slideshow video from the (CC0) sprite stills, upscaled
    with nearest-neighbour so the pixel art stays crisp. Inherits CC0."""
    if not image_paths:
        return None
    listfile = MEDIA / "_slides.txt"
    lines = []
    for p in image_paths:
        fp = str(p).replace("\\", "/")
        lines.append(f"file '{fp}'")
        lines.append("duration 1.4")
    lines.append(f"file '{str(image_paths[-1]).replace(chr(92), '/')}'")  # repeat last so it holds
    listfile.write_text("\n".join(lines), encoding="utf-8")
    vf = ("scale=1280:720:force_original_aspect_ratio=decrease:flags=neighbor,"
          "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x1a1a1a,format=yuv420p")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile),
             "-vf", vf, "-r", "30", "-pix_fmt", "yuv420p", str(out)],
            check=True, capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"  ! video synth failed ({e}); skipping video item.")
        return None
    finally:
        listfile.unlink(missing_ok=True)
    return out


def main():
    print("Fetching CC0 packs from Kenney.nl ...")
    zips = {}
    for pack, url in PACKS.items():
        try:
            zips[pack] = fetch_zip(url)
            print(f"  ok  {pack}")
        except Exception as e:
            print(f"  FAIL {pack}: {e}")
            return 1

    # Images: a few distinct sprite/tileset sheets from the platformer pack.
    img_infos = select(zips["pixel-platformer"], (".png",),
                       prefer=["preview", "sample", "spritesheet-characters",
                               "spritesheet-tiles", "tilemap-characters", "tilemap"],
                       limit=3)
    images = [extract(zips["pixel-platformer"], i, "pixel-platformer") for i in img_infos]

    # Audio: one music jingle + two interface sounds.
    music = [extract(zips["music-jingles"], i, "music-jingles")
             for i in select(zips["music-jingles"], (".ogg", ".mp3", ".wav"),
                             prefer=["win", "menu", "jingle"], limit=1)]
    sfx = [extract(zips["interface-sounds"], i, "interface-sounds")
           for i in select(zips["interface-sounds"], (".ogg", ".mp3", ".wav"),
                          prefer=["confirmation", "click", "select", "switch"], limit=2)]
    audio = music + sfx

    # Video: synth a short preview from the sprite stills (CC0-derived).
    video = make_video(images, MEDIA / "gameplay-preview.mp4")

    manifest = {
        "license": "CC0 (public domain) — Kenney.nl; video synthesised locally from CC0 art",
        "images": [str(p) for p in images],
        "audio":  [str(p) for p in audio],
        "video":  str(video) if video else None,
    }
    (MEDIA / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    (MEDIA / "CREDITS.txt").write_text(
        "GloGraph demo media — all assets are Creative Commons CC0 (public domain).\n\n"
        "Source: Kenney.nl asset packs (Pixel Platformer, Music Jingles, Interface Sounds).\n"
        "  https://kenney.nl  — released under CC0, no attribution required.\n\n"
        "gameplay-preview.mp4 was generated locally from the CC0 sprite art with ffmpeg,\n"
        "so it is CC0 as well. No third-party / copyrighted media is used.\n",
        encoding="utf-8",
    )

    print(f"\nwrote {len(images)} images, {len(audio)} audio, {1 if video else 0} video to {MEDIA}")
    print("manifest:", (MEDIA / 'manifest.json'))
    for k in ("images", "audio", "video"):
        print(f"  {k}: {manifest[k]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

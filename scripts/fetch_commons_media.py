#!/usr/bin/env python3
"""Fetch CC0 / public-domain media for the themed demo projects (film, homelab,
music) into demos/media/<theme>/, and write a per-theme manifest.json consumed by
scripts/gen_themed_demos.py.

Sources, all commercial-safe (no attribution required):
  - Images: Wikimedia Commons, filtered via the API to PUBLIC DOMAIN / CC0 only.
  - Audio:  Kenney.nl CC0 packs (Music Jingles + Interface Sounds).
  - Video:  synthesised locally from the fetched images with ffmpeg (inherits the
            images' public-domain status).

Re-runnable. Standard library only + ffmpeg on PATH.
Usage:  python scripts/fetch_commons_media.py
"""
import io
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
MEDIA = ROOT / "demos" / "media"
UA = {"User-Agent": "GloGraphDemoMediaBot/1.0 (https://glograph.com; demo asset fetch)"}

KENNEY_AUDIO = {
    "music-jingles":    "https://kenney.nl/media/pages/assets/music-jingles/f37e530b9e-1677590399/kenney_music-jingles.zip",
    "interface-sounds": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
}

THEMES = {
    "film": {
        "image_terms": ["film noir still", "silent film scene", "vintage movie camera",
                        "cinema interior", "film reel", "clapperboard"],
    },
    "homelab": {
        "image_terms": ["computer server rack", "data center server room", "network switch",
                        "computer motherboard", "circuit board", "ethernet patch panel"],
    },
    "music": {
        "image_terms": ["recording studio mixing console", "vinyl record", "studio microphone",
                        "sheet music manuscript", "synthesizer keyboard", "analog audio waveform"],
    },
}
N_IMAGES = 3


# ── Wikimedia Commons (public-domain / CC0 only) ────────────────────────────────
def api(params: dict) -> dict:
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def search_titles(term: str, limit: int = 25) -> list:
    d = api({"action": "query", "format": "json", "list": "search",
             "srsearch": f"{term} filetype:bitmap", "srnamespace": 6, "srlimit": limit})
    return [s["title"] for s in d.get("query", {}).get("search", [])]


def image_infos(titles: list) -> dict:
    if not titles:
        return {}
    d = api({"action": "query", "format": "json", "titles": "|".join(titles[:40]),
             "prop": "imageinfo", "iiprop": "url|extmetadata|mime|size", "iiurlwidth": 1280})
    return d.get("query", {}).get("pages", {})


def is_free(ext: dict) -> bool:
    short = ((ext.get("LicenseShortName") or {}).get("value") or "").lower()
    lic = ((ext.get("License") or {}).get("value") or "").lower()
    return ("cc0" in short or "cc0" in lic or "public domain" in short
            or short in ("pd", "cc-pd") or lic.startswith("pd"))


def sanitize(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", name).strip("-")[:80]


def download(url: str, dest: pathlib.Path):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        dest.write_bytes(r.read())


def fetch_images(theme: str, terms: list, outdir: pathlib.Path) -> list:
    collected, seen = [], set()
    for term in terms:
        if len(collected) >= N_IMAGES:
            break
        try:
            titles = search_titles(term)
        except Exception as e:
            print(f"    search '{term}' failed: {e}")
            continue
        pages = image_infos(titles)
        for p in pages.values():
            ii = p.get("imageinfo")
            if not ii:
                continue
            info = ii[0]
            if info.get("mime") not in ("image/jpeg", "image/png"):
                continue
            if not is_free(info.get("extmetadata", {})):
                continue
            if (info.get("width") or 0) < 600:
                continue
            url = info.get("thumburl") or info.get("url")
            if not url or url in seen:
                continue
            ext = ".png" if info["mime"] == "image/png" else ".jpg"
            slug = sanitize(p["title"].replace("File:", "").rsplit(".", 1)[0])[:40]
            dest = outdir / f"{len(collected) + 1:02d}-{slug}{ext}"
            try:
                download(url, dest)
            except Exception as e:
                print(f"    download failed ({e})")
                continue
            seen.add(url)
            collected.append(dest)
            print(f"    image: {dest.name}")
            if len(collected) >= N_IMAGES:
                break
        time.sleep(0.3)
    return collected


# ── Kenney CC0 audio (downloaded once, split across themes) ─────────────────────
def fetch_zip(url: str) -> zipfile.ZipFile:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=120) as r:
        return zipfile.ZipFile(io.BytesIO(r.read()))


def select(zf: zipfile.ZipFile, exts: tuple, prefer: list, limit: int) -> list:
    infos = [i for i in zf.infolist() if not i.is_dir() and i.filename.lower().endswith(exts)]

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


# ── Video synth (photo slideshow, bicubic) ──────────────────────────────────────
def make_video(image_paths: list, out: pathlib.Path):
    if not image_paths:
        return None
    listfile = out.parent / "_slides.txt"
    lines = []
    for p in image_paths:
        lines.append(f"file '{str(p).replace(chr(92), '/')}'")
        lines.append("duration 1.6")
    lines.append(f"file '{str(image_paths[-1]).replace(chr(92), '/')}'")
    listfile.write_text("\n".join(lines), encoding="utf-8")
    vf = ("scale=1280:720:force_original_aspect_ratio=decrease,"
          "pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x111111,format=yuv420p")
    try:
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile),
                        "-vf", vf, "-r", "30", "-pix_fmt", "yuv420p", str(out)],
                       check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"    video synth failed: {e}")
        return None
    finally:
        listfile.unlink(missing_ok=True)
    return out


def main():
    print("Downloading Kenney CC0 audio packs ...")
    try:
        zmusic = fetch_zip(KENNEY_AUDIO["music-jingles"])
        zsfx = fetch_zip(KENNEY_AUDIO["interface-sounds"])
    except Exception as e:
        print(f"  FAIL audio: {e}")
        return 1
    music_picks = select(zmusic, (".ogg", ".mp3", ".wav"), prefer=[], limit=len(THEMES))
    sfx_picks = select(zsfx, (".ogg", ".mp3", ".wav"),
                       prefer=["confirmation", "select", "click", "switch"], limit=len(THEMES))

    import shutil
    for ti, (theme, cfg) in enumerate(THEMES.items()):
        outdir = MEDIA / theme
        shutil.rmtree(outdir, ignore_errors=True)  # clear stale assets from a prior run
        outdir.mkdir(parents=True, exist_ok=True)
        print(f"\n[{theme}] images from Wikimedia Commons (PD/CC0 only) ...")
        images = fetch_images(theme, cfg["image_terms"], outdir)
        if not images:
            print(f"  ! no PD/CC0 images found for {theme}; image/video items will be empty")

        # audio: one distinct music jingle + one distinct sfx per theme
        audio = []
        if ti < len(music_picks):
            d = outdir / f"music__{os.path.basename(music_picks[ti].filename)}"
            d.write_bytes(zmusic.read(music_picks[ti])); audio.append(d)
        if ti < len(sfx_picks):
            d = outdir / f"sfx__{os.path.basename(sfx_picks[ti].filename)}"
            d.write_bytes(zsfx.read(sfx_picks[ti])); audio.append(d)

        video = make_video(images, outdir / "preview.mp4")

        manifest = {
            "license": "Public domain / CC0 — images: Wikimedia Commons (PD/CC0); audio: Kenney.nl CC0; video: synthesised from PD images",
            "images": [str(p) for p in images],
            "audio": [str(p) for p in audio],
            "video": str(video) if video else None,
        }
        (outdir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        (outdir / "CREDITS.txt").write_text(
            f"GloGraph '{theme}' demo media — all public domain / CC0, commercial-safe, no attribution required.\n"
            "Images: Wikimedia Commons (filtered to Public Domain / CC0 via the Commons API).\n"
            "Audio: Kenney.nl CC0 packs. Video: generated locally from the PD images with ffmpeg.\n",
            encoding="utf-8")
        print(f"  {theme}: {len(images)} images, {len(audio)} audio, {1 if video else 0} video")

    print("\ndone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

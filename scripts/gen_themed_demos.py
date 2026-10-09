#!/usr/bin/env python3
"""Generate three media-rich demo projects (v8) for recording videos/gifs, each
exercising EVERY graph-item kind (standard nodes, note, image, video, audio) plus
regions and typed/coloured edges:

  demos/film-production-demo.glograph   — a short-film production
  demos/homelab-demo.glograph           — a self-hosted home lab
  demos/album-production-demo.glograph  — an album project

Media paths come from demos/media/<theme>/manifest.json — run
scripts/fetch_commons_media.py first to populate them with CC0 / public-domain
assets. Media is referenced as local files (srcType=file) by absolute path.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATE = "2026-06-04T00:00:00Z"


def build(spec: dict):
    key = spec["key"]
    L = spec["pfx"]
    man = ROOT / "demos" / "media" / key / "manifest.json"
    if not man.exists():
        sys.exit(f"Missing {man} — run scripts/fetch_commons_media.py first.")
    M = json.loads(man.read_text(encoding="utf-8"))

    def media_path(kind, idx):
        mk = {"image": "images", "audio": "audio", "video": "video"}[kind]
        val = M.get(mk)
        if isinstance(val, str):
            return val
        lst = val or []
        if not lst:
            sys.exit(f"[{key}] manifest has no {mk}")
        return lst[min(idx, len(lst) - 1)]

    def uid(grp, n):
        return f"{L}{grp}-0000-0000-0000-{n:012d}"

    P = f"{L}0000000-0000-0000-0000-000000000001"

    # ── node param defs: Type (colour) + <number> + Status ──
    TYPE, NUM, STATUS = uid("1000000", 1), uid("1000000", 2), uid("1000000", 3)
    param_defs = [
        {"id": TYPE, "presetId": P, "displayName": "Type", "paramType": "select_color",
         "defaultValue": None, "drivesColor": True, "showOnCardDefault": True, "sortOrder": 0,
         "options": [{"id": uid("2000000", i + 1), "paramDefId": TYPE, "valueSlug": s,
                      "label": l, "color": c, "sortOrder": i}
                     for i, (s, l, c) in enumerate(spec["type_opts"])]},
        {"id": NUM, "presetId": P, "displayName": spec["number_label"], "paramType": "number",
         "defaultValue": None, "drivesColor": False, "showOnCardDefault": False, "sortOrder": 1, "options": []},
        {"id": STATUS, "presetId": P, "displayName": "Status", "paramType": "select",
         "defaultValue": None, "drivesColor": False, "showOnCardDefault": True, "sortOrder": 2,
         "options": [{"id": uid("2500000", i + 1), "paramDefId": STATUS, "valueSlug": s,
                      "label": l, "color": None, "sortOrder": i}
                     for i, (s, l) in enumerate(spec["status_opts"])]},
    ]

    # ── edge param defs: Relation (colour) + Directed (arrow) + Weight (width) ──
    REL, DIRECTED, WEIGHT = uid("3000000", 1), uid("3000000", 2), uid("3000000", 3)
    REL_COLOR = {s: c for s, _, c in spec["rel_opts"]}
    edge_param_defs = [
        {"id": REL, "presetId": P, "displayName": "Relation", "paramType": "select_color",
         "defaultValue": None, "drivesArrow": False, "drivesStyle": False, "drivesColor": True,
         "drivesWidth": False, "sortOrder": 0,
         "options": [{"id": uid("4000000", i + 1), "paramDefId": REL, "valueSlug": s,
                      "label": l, "color": c, "sortOrder": i}
                     for i, (s, l, c) in enumerate(spec["rel_opts"])]},
        {"id": DIRECTED, "presetId": P, "displayName": "Directed", "paramType": "boolean",
         "defaultValue": "true", "drivesArrow": True, "drivesStyle": False, "drivesColor": False,
         "drivesWidth": False, "sortOrder": 1, "options": []},
        {"id": WEIGHT, "presetId": P, "displayName": "Weight", "paramType": "number",
         "defaultValue": "2", "drivesArrow": False, "drivesStyle": False, "drivesColor": False,
         "drivesWidth": True, "sortOrder": 2, "options": []},
    ]

    NID, nodes = {}, []
    for i, (k, title, kind, typ, x, y, num, status, desc, media, w, h) in enumerate(spec["nodes"], start=1):
        nid = uid("5000000", i)
        NID[k] = nid
        pvs = []
        j = 0
        for pdid, val, show in ((TYPE, typ, True), (NUM, num, False), (STATUS, status, True)):
            if val is None:
                continue
            j += 1
            pvs.append({"id": uid("6000000", i * 10 + j), "nodeId": nid, "paramDefId": pdid,
                        "value": str(val), "isEnabled": True, "showOnCard": show})
        media_rows = []
        if media is not None:
            mtype, midx = media
            media_rows.append({"id": uid("9000000", i), "nodeId": nid, "label": title or mtype,
                               "src": media_path(mtype, midx), "srcType": "file",
                               "mediaType": mtype, "sortOrder": 0, "showOnCard": True})
        nodes.append({"id": nid, "title": title, "description": desc or None, "eventDate": None,
                      "dateAdded": DATE, "x": x, "y": y, "color": None, "confidence": None,
                      "impactMagnitude": None, "tags": [], "links": [], "media": media_rows,
                      "paramValues": pvs, "isPinned": False, "isExpandPinned": False,
                      "zOrder": 0, "kind": kind, "width": w, "height": h})

    edges = []
    for i, (s, t, rel, weight, sh, th) in enumerate(spec["edges"], start=1):
        eid = uid("e000000", i)
        edges.append({"id": eid, "sourceId": NID[s], "targetId": NID[t],
                      "sourceHandle": sh, "targetHandle": th, "waypoints": None,
                      "paramValues": [
                          {"id": uid("f000000", i * 10 + 1), "edgeId": eid, "paramDefId": REL, "value": rel, "isEnabled": True},
                          {"id": uid("f000000", i * 10 + 2), "edgeId": eid, "paramDefId": DIRECTED, "value": "true", "isEnabled": True},
                          {"id": uid("f000000", i * 10 + 3), "edgeId": eid, "paramDefId": WEIGHT, "value": str(weight), "isEnabled": True},
                      ], "color": REL_COLOR[rel]})

    regions = [{"id": uid("7000000", i + 1), "title": tt, "x": rx, "y": ry,
                "width": rw, "height": rh, "color": rc, "createdAt": DATE}
               for i, (tt, rx, ry, rw, rh, rc) in enumerate(spec["regions"])]

    # Spread node positions + region bounds for adequate expanded-card spacing
    # (card sizes left unscaled — only the layout grid grows).
    SCALE = 1.6
    for _n in nodes:
        _n["x"] = round(_n["x"] * SCALE, 2); _n["y"] = round(_n["y"] * SCALE, 2)
    for _r in regions:
        for _k in ("x", "y", "width", "height"):
            _r[_k] = round(_r[_k] * SCALE, 2)

    doc = {"version": 8, "exportedAt": DATE,
           "settings": {"presetName": spec["preset_name"], "paramDefs": param_defs,
                        "edgeParamDefs": edge_param_defs},
           "nodes": nodes, "edges": edges, "regions": regions}

    out = ROOT / "demos" / spec["out"]
    out.write_text(json.dumps(doc, indent=2), encoding="utf-8")
    kinds = {}
    for n in nodes:
        kinds[n["kind"]] = kinds.get(n["kind"], 0) + 1
    print(f"wrote {out.name}  nodes={len(nodes)} edges={len(edges)} regions={len(regions)} kinds={kinds}")


# ════════════════════════════ THEME SPECS ════════════════════════════
# node tuple: (key, title, kind, type, x, y, number, status, desc, media, w, h)
#   media = ("image", idx) | ("audio", idx) | ("video", 0) | None
# edge tuple: (src, tgt, relation, weight, sourceHandle, targetHandle)

FILM = {
    "key": "film", "pfx": "c", "out": "film-production-demo.glograph",
    "preset_name": "Film Production", "number_label": "Days",
    "type_opts": [("scene", "Scene", "#5588bb"), ("shot", "Shot", "#7766aa"),
                  ("cast", "Cast", "#d68b2a"), ("sound", "Sound", "#3d9e5f"),
                  ("task", "Task", "#888888"), ("deliverable", "Deliverable", "#c83030")],
    "status_opts": [("todo", "To do"), ("doing", "In progress"), ("done", "Locked")],
    "rel_opts": [("depends-on", "Depends on", "#5588bb"), ("blocks", "Blocks", "#c83030"),
                 ("part-of", "Part of", "#7766aa"), ("related", "Related", "#888888")],
    "regions": [("Pre-production", -40, 110, 700, 430, "#7766aa"),
                ("Production (shoot)", 760, 110, 480, 360, "#5588bb"),
                ("Post & sound", -40, 580, 880, 480, "#d68b2a"),
                ("Deliverables", 880, 580, 620, 480, "#c83030")],
    "nodes": [
        ("script", "Script (final draft)", "standard", "task", 40, 180, 3, "done",
         "Locked shooting script. Everything downstream depends on it.", None, None, None),
        ("shotlist", "Shot list", "standard", "shot", 340, 180, 2, "done",
         "Every setup and lens for the two scenes.", None, None, None),
        ("location", "Location: lighthouse", "standard", "task", 40, 360, 4, "doing",
         "Permit + set dressing for the lighthouse interior and exterior.", None, None, None),
        ("storyboard", "Storyboards", "image", "shot", 340, 360, None, "done", "", ("image", 0), 260, 180),
        ("scene1", "Scene 1: Arrival", "standard", "scene", 800, 180, 2, "doing",
         "The keeper rows ashore at dusk.", None, None, None),
        ("scene2", "Scene 2: The Storm", "standard", "scene", 1040, 180, 3, "todo",
         "The light fails as the storm peaks.", None, None, None),
        ("lead", "Lead: the Keeper", "standard", "cast", 800, 360, None, "done",
         "Principal actor, present in every scene.", None, None, None),
        ("broll", "B-roll / coverage", "video", "shot", 1040, 360, None, "doing", "", ("video", 0), 320, 200),
        ("pedit", "Picture edit", "standard", "task", 40, 640, 5, "todo",
         "Assembly through to fine cut.", None, None, None),
        ("grade", "Color grade", "standard", "task", 300, 640, 2, "todo",
         "Cold, desaturated palette.", None, None, None),
        ("score", "Original score", "audio", "sound", 40, 880, None, "doing", "", ("audio", 0), None, None),
        ("foley", "Foley & SFX", "audio", "sound", 300, 880, None, "todo", "", ("audio", 1), None, None),
        ("still", "Reference still", "image", "shot", 560, 640, None, "done", "", ("image", 1), 260, 180),
        ("dnote", "", "note", None, 560, 880, None, None,
         "Director's note\n\nTone: cold, isolated, patient. Let silences breathe. The sea is a character.", None, 300, 170),
        ("festival", "Festival cut (DCP)", "standard", "deliverable", 1240, 660, None, "todo",
         "The submission master.", None, None, None),
        ("trailer", "Trailer", "standard", "deliverable", 1240, 860, None, "todo",
         "90-second cut for festivals and socials.", None, None, None),
        ("about", "", "note", None, 900, 700, None, None,
         "About this demo. A short-film production as a typed graph: script, scenes, cast, sound, edit, "
         "and deliverables, with image / video / audio / note items and regions. Trace upstream of the "
         "festival cut to see what it depends on.", None, 320, 200),
    ],
    "edges": [
        ("scene1", "script", "depends-on", 3, "left", "right"),
        ("scene2", "script", "depends-on", 3, "left", "right"),
        ("shotlist", "script", "depends-on", 2, "left", "right"),
        ("storyboard", "script", "part-of", 1, "top", "bottom"),
        ("scene1", "location", "depends-on", 2, "bottom", "right"),
        ("scene1", "lead", "depends-on", 2, "bottom", "top"),
        ("scene2", "lead", "depends-on", 2, "bottom", "top"),
        ("broll", "scene2", "part-of", 1, "top", "bottom"),
        ("pedit", "scene1", "depends-on", 3, "top", "bottom"),
        ("pedit", "scene2", "depends-on", 3, "top", "bottom"),
        ("grade", "pedit", "depends-on", 3, "left", "right"),
        ("score", "pedit", "part-of", 1, "top", "bottom"),
        ("foley", "pedit", "part-of", 1, "top", "bottom"),
        ("still", "grade", "related", 1, "top", "left"),
        ("dnote", "scene2", "related", 1, "right", "bottom"),
        ("scene2", "festival", "blocks", 2, "right", "top"),
        ("festival", "grade", "depends-on", 3, "left", "right"),
        ("festival", "score", "depends-on", 2, "left", "right"),
        ("trailer", "festival", "depends-on", 2, "top", "bottom"),
    ],
}

HOMELAB = {
    "key": "homelab", "pfx": "d", "out": "homelab-demo.glograph",
    "preset_name": "Home Lab", "number_label": "Effort (h)",
    "type_opts": [("host", "Host", "#5588bb"), ("service", "Service", "#7766aa"),
                  ("storage", "Storage", "#3d9e5f"), ("network", "Network", "#d68b2a"),
                  ("task", "Task", "#888888"), ("risk", "Risk", "#c83030")],
    "status_opts": [("planned", "Planned"), ("running", "Running"), ("down", "Needs work")],
    "rel_opts": [("depends-on", "Depends on", "#5588bb"), ("blocks", "Blocks", "#c83030"),
                 ("part-of", "Part of", "#7766aa"), ("related", "Related", "#888888")],
    "regions": [("Hardware", -40, 110, 700, 430, "#5588bb"),
                ("Core services", 760, 110, 480, 360, "#7766aa"),
                ("Media & storage", -40, 580, 880, 480, "#3d9e5f"),
                ("Backlog & risks", 880, 580, 620, 480, "#c83030")],
    "nodes": [
        ("pve", "Proxmox host (NUC)", "standard", "host", 40, 180, 4, "running",
         "Hypervisor. Runs most services as VMs/containers.", None, None, None),
        ("pi", "Raspberry Pi 4", "standard", "host", 340, 180, 2, "running",
         "Low-power always-on box for DNS.", None, None, None),
        ("nas", "NAS (TrueNAS)", "standard", "storage", 40, 360, 6, "running",
         "Bulk storage + ZFS snapshots. Everything media depends on it.", None, None, None),
        ("switch", "UniFi switch", "standard", "network", 340, 360, 2, "running",
         "Core 8-port switch with VLANs.", None, None, None),
        ("caddy", "Reverse proxy (Caddy)", "standard", "service", 800, 180, 2, "running",
         "TLS termination + routing for every service.", None, None, None),
        ("pihole", "Pi-hole DNS", "standard", "service", 1040, 180, 1, "running",
         "Network-wide DNS + ad blocking.", None, None, None),
        ("hass", "Home Assistant", "standard", "service", 800, 360, 5, "running",
         "Automations + dashboards.", None, None, None),
        ("vault", "Vaultwarden", "standard", "service", 1040, 360, 2, "running",
         "Self-hosted password vault.", None, None, None),
        ("jelly", "Jellyfin", "standard", "service", 40, 640, 3, "running",
         "Movies and TV streaming.", None, None, None),
        ("immich", "Photo backup (Immich)", "standard", "service", 300, 640, 3, "planned",
         "Phone photo backup + timeline.", None, None, None),
        ("rackimg", "Rack photo", "image", "host", 40, 860, None, "running", "", ("image", 0), 260, 180),
        ("netmap", "Network map (sketch)", "image", "network", 300, 860, None, "running", "", ("image", 1), 260, 180),
        ("chime", "Doorbell chime", "audio", "service", 600, 640, None, "running", "", ("audio", 0), None, None),
        ("alert", "Alert sound", "audio", "service", 600, 770, None, "running", "", ("audio", 1), None, None),
        ("tour", "Dashboard tour", "video", "service", 560, 900, None, "running", "", ("video", 0), 320, 200),
        ("offsite", "Offsite backup", "standard", "task", 1240, 660, 4, "planned",
         "3-2-1 rule: encrypted backup to a friend's NAS.", None, None, None),
        ("spof", "Risk: NAS is a SPOF", "standard", "risk", 1240, 860, None, "planned",
         "If the NAS dies, media, photos, and backups all go with it.", None, None, None),
        ("whynote", "", "note", None, 900, 660, None, None,
         "Why local-first\n\nEverything here runs on my own hardware, offline, no monthly fees. My data "
         "never leaves the house.", None, 300, 170),
        ("about", "", "note", None, 900, 870, None, None,
         "About this demo. A self-hosted home lab as a typed graph: hosts, services, storage, network, "
         "plus image / video / audio / note items and regions. Trace upstream of the NAS to see the blast "
         "radius if it fails.", None, 320, 190),
    ],
    "edges": [
        ("caddy", "pve", "depends-on", 3, "left", "right"),
        ("hass", "pve", "depends-on", 2, "left", "right"),
        ("vault", "caddy", "depends-on", 2, "left", "right"),
        ("pihole", "pi", "depends-on", 2, "left", "right"),
        ("jelly", "nas", "depends-on", 3, "top", "bottom"),
        ("immich", "nas", "depends-on", 3, "top", "bottom"),
        ("jelly", "pve", "part-of", 1, "top", "right"),
        ("immich", "pve", "part-of", 1, "top", "right"),
        ("caddy", "switch", "related", 1, "bottom", "top"),
        ("pihole", "switch", "related", 1, "bottom", "top"),
        ("chime", "hass", "part-of", 1, "top", "bottom"),
        ("alert", "hass", "part-of", 1, "top", "bottom"),
        ("tour", "hass", "related", 1, "top", "bottom"),
        ("rackimg", "pve", "related", 1, "top", "left"),
        ("netmap", "switch", "related", 1, "top", "bottom"),
        ("offsite", "nas", "depends-on", 3, "left", "right"),
        ("spof", "offsite", "blocks", 2, "top", "bottom"),
    ],
}

MUSIC = {
    "key": "music", "pfx": "f", "out": "album-production-demo.glograph",
    "preset_name": "Album Project", "number_label": "Length (s)",
    "type_opts": [("track", "Track", "#5588bb"), ("stem", "Stem", "#7766aa"),
                  ("art", "Art", "#d68b2a"), ("audio", "Audio", "#3d9e5f"),
                  ("task", "Task", "#888888"), ("release", "Release", "#c83030")],
    "status_opts": [("idea", "Idea"), ("doing", "In progress"), ("done", "Mastered")],
    "rel_opts": [("depends-on", "Depends on", "#5588bb"), ("part-of", "Part of", "#7766aa"),
                 ("related", "Related", "#888888"), ("blocks", "Blocks", "#c83030")],
    "regions": [("Songs", -40, 110, 700, 430, "#5588bb"),
                ("Production", 760, 110, 480, 380, "#7766aa"),
                ("Art & assets", -40, 580, 880, 480, "#d68b2a"),
                ("Release", 880, 580, 620, 480, "#c83030")],
    "nodes": [
        ("t1", "Track 1: Neon Tides", "standard", "track", 40, 180, 210, "doing",
         "The title track and lead single.", None, None, None),
        ("t2", "Track 2: Afterglow", "standard", "track", 340, 180, 195, "idea",
         "Slow, reverb-heavy closer.", None, None, None),
        ("t3", "Track 3: Undertow", "standard", "track", 40, 360, 230, "idea",
         "Up-tempo, bass-driven.", None, None, None),
        ("single", "Single: Neon Tides", "standard", "release", 340, 360, None, "idea",
         "Lead single, dropped before the album.", None, None, None),
        ("drums", "Drum stems", "standard", "stem", 800, 180, None, "doing",
         "Programmed beats + live overdubs.", None, None, None),
        ("bass", "Synth bass", "standard", "stem", 1040, 180, None, "doing",
         "Mono sub + saw layer.", None, None, None),
        ("vox", "Vocal comp", "standard", "stem", 800, 360, None, "idea",
         "Comped from four takes.", None, None, None),
        ("mix", "Mix session", "standard", "task", 1040, 360, None, "idea",
         "Balance, automation, bus FX.", None, None, None),
        ("master", "Mastering", "standard", "task", 920, 300, None, "idea",
         "Loudness + final polish for release.", None, None, None),
        ("cover", "Album cover", "image", "art", 40, 640, None, "doing", "", ("image", 0), 260, 180),
        ("singleart", "Single artwork", "image", "art", 300, 640, None, "done", "", ("image", 1), 260, 180),
        ("rough", "Title track (rough)", "audio", "audio", 40, 880, None, "doing", "", ("audio", 0), None, None),
        ("hook", "Hook idea", "audio", "audio", 300, 880, None, "idea", "", ("audio", 1), None, None),
        ("lyricvid", "Lyric video (draft)", "video", "art", 560, 640, None, "idea", "", ("video", 0), 320, 200),
        ("lyrics", "", "note", None, 560, 880, None, None,
         "Lyrics, verse 1\n\nCity lights bleed into the bay,\nwe ride the neon tide away,\nhold the line "
         "till break of day.", None, 300, 180),
        ("distro", "Distribute (DistroKid)", "standard", "release", 1240, 660, None, "idea",
         "Push to Spotify, Apple Music, etc.", None, None, None),
        ("press", "Press kit", "standard", "task", 1240, 860, None, "idea",
         "Bio, cover, single, one-sheet.", None, None, None),
        ("about", "", "note", None, 900, 700, None, None,
         "About this demo. An album project as a typed graph: tracks, stems, art, audio, and release "
         "tasks, with image / video / audio / note items and regions. Trace upstream of the single to "
         "see what it depends on.", None, 320, 200),
    ],
    "edges": [
        ("drums", "t1", "part-of", 2, "left", "right"),
        ("bass", "t1", "part-of", 2, "left", "right"),
        ("vox", "t1", "part-of", 2, "left", "right"),
        ("mix", "drums", "depends-on", 2, "top", "bottom"),
        ("mix", "bass", "depends-on", 2, "top", "bottom"),
        ("mix", "vox", "depends-on", 2, "left", "right"),
        ("master", "mix", "depends-on", 3, "right", "left"),
        ("single", "master", "depends-on", 3, "right", "bottom"),
        ("t1", "single", "part-of", 2, "bottom", "top"),
        ("cover", "single", "related", 1, "top", "left"),
        ("singleart", "single", "related", 1, "top", "left"),
        ("rough", "t1", "related", 1, "top", "left"),
        ("hook", "t1", "related", 1, "top", "left"),
        ("lyricvid", "t1", "depends-on", 1, "top", "bottom"),
        ("lyrics", "t1", "related", 1, "right", "bottom"),
        ("vox", "mix", "blocks", 2, "bottom", "left"),
        ("distro", "master", "depends-on", 3, "left", "right"),
        ("distro", "cover", "depends-on", 2, "left", "bottom"),
        ("press", "cover", "depends-on", 1, "left", "bottom"),
    ],
}

if __name__ == "__main__":
    for spec in (FILM, HOMELAB, MUSIC):
        build(spec)

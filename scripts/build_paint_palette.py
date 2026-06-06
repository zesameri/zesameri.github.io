#!/usr/bin/env python3
"""Build grouped paint palette from wada-colors.json and 24x24 Grid.html."""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from css_named_colors import HEX_TO_CSS

ROOT = Path(__file__).resolve().parents[1]
WADA = ROOT / "data" / "wada-colors.json"
GRID = ROOT / "24x24 Grid.html"
OUT = ROOT / "data" / "paint-palette.json"
JS_OUT = ROOT / "js" / "paint-palette-data.js"

CSS_NAMED = {
    "goldenrod": "#daa520",
    "navy": "#000080",
    "plum": "#dda0dd",
    "paleturquoise": "#afeeee",
    "lightseagreen": "#20b2aa",
    "salmon": "#fa8072",
    "dodgerblue": "#1e90ff",
    "midnightblue": "#191970",
    "deepskyblue": "#00bfff",
    "wheat": "#f5deb3",
    "blanchedalmond": "#ffebcd",
    "powderblue": "#b0e0e6",
}

GROUPS = [
    ("reds", "Reds & pinks"),
    ("oranges-yellows", "Oranges & yellows"),
    ("greens", "Greens"),
    ("blues", "Blues & turquoise"),
    ("purples", "Purples & violets"),
    ("browns-earth", "Browns & earth"),
    ("neutrals", "Neutrals"),
]

# Explicit group overrides (checked before keyword rules).
NAME_GROUP_OVERRIDES = {
    "light green yellow": "greens",
    "yellow green": "greens",
    "olive buff": "greens",
    "citron yellow": "greens",
    "olive yellow": "greens",
    "citrine": "greens",
    "dark citrine": "greens",
    "fresh color": "reds",
    "pale purplish vinaceous": "reds",
    "vinaceous tawny": "browns-earth",
    "orange citrine": "browns-earth",
    "khaki / tawny olive": "browns-earth",
    "blue violet": "purples",
    "dull blue violet": "purples",
    "light mauve": "purples",
}

# Pinned order at top of each group (name or #hex).
GROUP_PRIORITY = {
    "greens": [
        "Light Green Yellow",
        "Yellow Green",
        "Olive Buff",
        "Citron Yellow",
        "Olive Yellow",
        "Citrine",
        "Dark Citrine",
    ],
    "browns-earth": [
        "Khaki / Tawny Olive",
        "Dark Golden Ocher",
        "Burnt Umber Brown",
        "Orange Citrine",
        "Vinaceous Tawny",
    ],
    "blues": ["dodgerblue", "Pale Cerulean Blue"],
    "purples": ["Blue Violet", "Dull Blue Violet"],
}

GRID_HEX_GROUP = {
    "#8b6914": "browns-earth",
    "#7e3f12": "browns-earth",
    "#1e90ff": "blues",
    "#78bcff": "blues",
}

# Wada-style names for 24x24 Grid.html colors without a CSS or Wada match.
GRID_WADA_NAMES = {
    "#f00000": "Vivid Spectrum Red",
    "#c00000": "Bright Carmine",
    "#900000": "Deep Burnt Lake",
    "#600000": "Dark Lake Red",
    "#300000": "Blackish Red",
    "#3e2723": "Dark Russet Brown",
    "#ff6b35": "Flame Orange",
    "#e1904e": "Ochraceous Orange",
    "#f0b77d": "Light Cinnamon Buff",
    "#f7931e": "Golden Orange",
    "#f6c790": "Pale Maple",
    "#d4a017": "Deep Golden Ocher",
    "#2d4a3e": "Deep Grayish Olive",
    "#3d6b5a": "Medium Sea Glaucous",
    "#1a3a30": "Blackish Olive",
    "#78bcff": "Pale Cerulean Blue",
    "#1b5e4a": "Deep Sea Green",
    "#062422": "Blackish Slate Green",
    "#79d1cc": "Pale Turquoise Green",
    "#136b66": "Deep Peacock Blue",
    "#0a4a4a": "Dark Cyan Green",
    "#004d4d": "Deep Turquoise Green",
    "#ccccff": "Pale Periwinkle",
    "#6666ff": "Light Violet Blue",
    "#0000aa": "Deep Medici Blue",
    "#000055": "Dark Indigo Blue",
    "#5c4d7a": "Slate Purple",
    "#b19cd9": "Light Lilac",
    "#290146": "Blackish Violet",
    "#8b6914": "Dark Golden Ocher",
    "#7e3f12": "Burnt Umber Brown",
    "#2f2f2f": "Dark Mineral Gray",
    "#1c1c1c": "Deep Slate Color",
    "#111111": "Near Black",
}

WADA_LIGHTNESS = [
    (0.9, "Pale"),
    (0.78, "Light"),
    (0.62, ""),
    (0.45, "Deep"),
    (0.28, "Dark"),
    (0.12, "Blackish"),
    (0.0, "Blackish"),
]

WADA_HUE_NOUNS = {
    "reds": ["Red", "Lake", "Carmine", "Rose"],
    "oranges-yellows": ["Orange", "Ocher", "Yellow", "Buff"],
    "greens": ["Green", "Olive", "Glaucous", "Citrine"],
    "blues": ["Blue", "Turquoise", "Cyan", "Glaucous"],
    "purples": ["Violet", "Purple", "Lilac", "Lavender"],
    "browns-earth": ["Brown", "Drab", "Umber", "Russet"],
    "neutrals": ["Gray", "Slate", "Drab"],
}


def normalize_hex(h):
    h = h.strip().lower()
    if not h.startswith("#"):
        h = "#" + h
    if len(h) == 4:
        h = "#" + "".join(c * 2 for c in h[1:])
    return h


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def hex_to_hsl(hexv):
    r, g, b = (x / 255 for x in hex_to_rgb(hexv))
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == r:
        h = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    return (h / 6) * 360, s, l


def is_pink(name):
    n = name.lower()
    if n in ("fresh color",):
        return True
    return any(
        k in n
        for k in (
            "pink",
            "rose",
            "corinthian",
            "hermosa",
            "cameo",
            "grenadine",
            "eosine",
            "seashell",
            "purplish vinaceous",
            "laelia",
        )
    )


def is_yellow_band(name):
    n = name.lower()
    if any(
        k in n
        for k in (
            "yellow",
            "lemon",
            "cream",
            "naples",
            "ivory",
            "golden yellow",
            "sulphur",
            "sulphine",
            "pyrite",
            "ocher",
            "ochre",
            "buff",
            "ecru",
            "maple",
            "isabella",
        )
    ):
        if "orange" in n and "yellow" not in n:
            return False
        return True
    return False


def hsl_sort_key(entry):
    hue, sat, light = hex_to_hsl(entry["hex"])
    return (hue, -light, -sat)


def catalog_name(entry):
    return entry.get("wadaName") or entry.get("name", "")


def lightness_prefix(light):
    for threshold, word in WADA_LIGHTNESS:
        if light >= threshold:
            return word
    return "Blackish"


def generate_wada_style_name(hexv, group_id):
    hue, sat, light = hex_to_hsl(hexv)
    prefix = lightness_prefix(light)
    nouns = WADA_HUE_NOUNS.get(group_id, ["Color"])
    noun = nouns[int(hue / 360 * len(nouns)) % len(nouns)]
    if sat < 0.12:
        noun = "Gray" if group_id == "neutrals" else "Drab"
    parts = [p for p in (prefix, noun) if p]
    return " ".join(parts) if parts else noun


def resolve_display_name(hexv, wada_name=None, group_id=None):
    hx = normalize_hex(hexv)
    if hx in HEX_TO_CSS:
        return HEX_TO_CSS[hx]
    if wada_name:
        return wada_name
    if hx in GRID_WADA_NAMES:
        return GRID_WADA_NAMES[hx]
    if group_id:
        return generate_wada_style_name(hx, group_id)
    return hx


def pin_priority(entries, keys):
    pinned = []
    rest = list(entries)
    for key in keys:
        key_norm = normalize_hex(key) if key.startswith("#") else key.lower()
        for i, entry in enumerate(rest):
            if key.startswith("#"):
                match = entry["hex"] == key_norm
            else:
                match = catalog_name(entry).lower() == key_norm
            if match:
                pinned.append(rest.pop(i))
                break
    return pinned, rest


def sort_group(entries, group_id):
    pinned, rest = pin_priority(entries, GROUP_PRIORITY.get(group_id, []))

    if group_id == "reds":
        rest.sort(key=lambda e: (1 if is_pink(catalog_name(e)) else 0, *hsl_sort_key(e)))
    elif group_id == "oranges-yellows":
        rest.sort(key=lambda e: (1 if is_yellow_band(catalog_name(e)) else 0, *hsl_sort_key(e)))
    elif group_id == "neutrals":
        rest.sort(key=lambda e: (-hex_to_hsl(e["hex"])[2], hex_to_hsl(e["hex"])[1]))
    else:
        rest.sort(key=hsl_sort_key)

    entries[:] = pinned + rest


def hue_group(hexv):
    r, g, b = (x / 255 for x in hex_to_rgb(hexv))
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn < 0.08:
        if mx < 0.2:
            return "neutrals"
        if mx > 0.85:
            return "neutrals"
        return "browns-earth"
    d = mx - mn
    if mx == r:
        h = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    hue = h / 6
    if hue < 0.03 or hue >= 0.97:
        return "reds"
    if hue < 0.12:
        return "oranges-yellows"
    if hue < 0.22:
        return "oranges-yellows"
    if hue < 0.45:
        return "greens"
    if hue < 0.58:
        return "blues"
    if hue < 0.78:
        return "purples"
    return "reds"


def wada_group(name):
    n = name.lower()
    if n in NAME_GROUP_OVERRIDES:
        return NAME_GROUP_OVERRIDES[n]

    if any(
        k in n
        for k in (
            "white",
            "gray",
            "grey",
            "black",
            "neutral",
            "mineral",
            "warm gray",
            "slate color",
        )
    ):
        return "neutrals"
    if any(
        k in n
        for k in (
            "red",
            "rose",
            "pink",
            "coral",
            "carmine",
            "scarlet",
            "spinel",
            "eugenia",
            "jasper",
            "brick",
            "pompeian",
            "hydrangea",
            "pomegranate",
            "lake",
            "rufous",
            "peach",
            "fresh color",
        )
    ):
        return "reds"
    if any(
        k in n
        for k in (
            "yellow",
            "ocher",
            "ochre",
            "buff",
            "lemon",
            "cream",
            "apricot",
            "orange",
            "cinnamon",
            "maple",
            "isabella",
            "sulphur",
            "sulphine",
            "citron",
            "citrine",
            "naples",
            "ivory",
            "golden",
            "pyrite",
        )
    ):
        return "oranges-yellows"
    if any(
        k in n
        for k in (
            "green",
            "olive",
            "glaucous",
            "turquoise",
            "artemisia",
            "pistachio",
            "chromium",
            "viridian",
            "benzol",
            "porcelain",
            "turtle",
            "rainette",
            "andover",
            "cossack",
            "lincoln",
            "kronberg",
        )
    ):
        return "greens"
    if any(
        k in n
        for k in (
            "blue",
            "cerulean",
            "peacock",
            "nile",
            "indigo",
            "methyl",
            "lyons",
            "antwarp",
            "helvetia",
            "medici",
            "calamine",
            "olympic",
            "tyrian",
            "poel",
            "salvia",
            "cobalt",
        )
    ):
        return "blues"
    if any(
        k in n
        for k in (
            "violet",
            "purple",
            "lilac",
            "lavender",
            "perilla",
            "vernonia",
            "cotinga",
            "aconite",
            "ultramarine",
            "rosolanc",
            "pansy",
            "laelia",
            "eupatorium",
            "mauve",
        )
    ):
        return "purples"
    if any(
        k in n
        for k in (
            "brown",
            "umber",
            "sienna",
            "drab",
            "ecru",
            "fawn",
            "russet",
            "sepia",
            "madder",
            "tobacco",
            "vandyke",
            "taupe",
            "khaki",
            "sudan",
            "tawny",
        )
    ):
        return "browns-earth"
    return None


def wada_group_for(hexv, name):
    n = name.lower()
    if n in NAME_GROUP_OVERRIDES:
        return NAME_GROUP_OVERRIDES[n]
    g = wada_group(name)
    if g:
        return g
    return hue_group(hexv)


def extract_grid_hexes():
    text = GRID.read_text(encoding="utf-8")
    found = set()
    for m in re.finditer(r"#([0-9a-fA-F]{3,8})\b", text):
        found.add(normalize_hex(m.group(0)))
    extra_named = {
        "goldenrod": "#daa520",
        "navy": "#000080",
        "plum": "#dda0dd",
        "paleturquoise": "#afeeee",
        "lightseagreen": "#20b2aa",
        "salmon": "#fa8072",
        "dodgerblue": "#1e90ff",
        "midnightblue": "#191970",
        "deepskyblue": "#00bfff",
        "wheat": "#f5deb3",
        "blanchedalmond": "#ffebcd",
        "powderblue": "#b0e0e6",
    }
    for raw in re.findall(r"background:\s*([^;\"]+)", text):
        for part in raw.split(";"):
            part = part.strip().lower()
            if part.startswith("background:"):
                part = part.split(":", 1)[1].strip()
            if part in extra_named:
                found.add(normalize_hex(extra_named[part]))
            elif part.startswith("#"):
                found.add(normalize_hex(part))
    found.discard("#c0c0c0")
    return sorted(found)


def main():
    wada = json.loads(WADA.read_text(encoding="utf-8"))["colors"]
    grid_hexes = extract_grid_hexes()
    wada_hexes = {c["hex"] for c in wada}

    grouped = {gid: [] for gid, _ in GROUPS}
    seen = set()

    for c in wada:
        g = wada_group_for(c["hex"], c["name"])
        entry = {
            "hex": c["hex"],
            "name": resolve_display_name(c["hex"], c["name"]),
            "wadaName": c["name"],
            "source": "wada",
        }
        if c["hex"] not in seen:
            grouped[g].append(entry)
            seen.add(c["hex"])

    for hx in grid_hexes:
        if hx in seen:
            continue
        g = GRID_HEX_GROUP.get(hx, hue_group(hx))
        label = resolve_display_name(hx, group_id=g)
        grouped[g].append({"hex": hx, "name": label, "source": "grid"})
        seen.add(hx)

    for gid in grouped:
        sort_group(grouped[gid], gid)

    payload = {
        "groups": [{"id": gid, "label": label} for gid, label in GROUPS],
        "colors": grouped,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    JS_OUT.parent.mkdir(exist_ok=True)
    js_body = "window.PAINT_PALETTE=" + json.dumps(payload, separators=(",", ":")) + ";\n"
    JS_OUT.write_text(
        "/* Generated by scripts/build_paint_palette.py — do not edit */\n" + js_body,
        encoding="utf-8",
    )
    counts = {k: len(v) for k, v in grouped.items()}
    print(f"Wrote {OUT}")
    print(f"Wrote {JS_OUT}")
    print(counts, "total", sum(counts.values()))


if __name__ == "__main__":
    main()

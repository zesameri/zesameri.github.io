#!/usr/bin/env python3
"""Scrape Wada Sanzo colors and build wada-colors.html + grid-wada.html."""

import json
import math
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COLORS_URL = "https://www.wada-sanzo-colors.com/colors"
GRID_SRC = ROOT / "24x24 Grid.html"

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
    "darkorange": "#ff8c00",
    "darkviolet": "#9400d3",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkolivegreen": "#556b2f",
    "darkgoldenrod": "#b8860b",
    "darkcyan": "#008b8b",
    "darkmagenta": "#8b008b",
    "darkred": "#8b0000",
    "darkgreen": "#006400",
    "darkblue": "#00008b",
    "darkgray": "#a9a9a9",
    "lightgray": "#d3d3d3",
    "lightblue": "#add8e6",
    "lightgreen": "#90ee90",
    "lightyellow": "#ffffe0",
    "lightpink": "#ffb6c1",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightsteelblue": "#b0c4de",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "palevioletred": "#db7093",
    "palegreen": "#98fb98",
    "palegoldenrod": "#eee8aa",
    "orchid": "#da70d6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "peru": "#cd853f",
    "sienna": "#a0522d",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "yellowgreen": "#9acd32",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "indigo": "#4b0082",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370db",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "oldlace": "#fdf5e6",
    "seagreen": "#2e8b57",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "white": "#ffffff",
    "black": "#000000",
    "gray": "#808080",
    "grey": "#808080",
    "silver": "#c0c0c0",
}


def fetch_wada_colors():
    html = urllib.request.urlopen(COLORS_URL, timeout=60).read().decode()
    pattern = re.compile(
        r'href="/color-detail/([^"]+)"><div class="ColorsList_colorElement__[^"]*" '
        r'style="background-color:(#[0-9a-fA-F]{6})">'
        r'<div class="ColorsList_colorInfo__[^"]*">'
        r'<p class="ColorsList_colorName__[^"]*">([^<]+)</p>'
    )
    return [
        {"slug": slug, "hex": hexv.lower(), "name": name.strip()}
        for slug, hexv, name in pattern.findall(html)
    ]


def hex_to_rgb(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hue(rgb):
    r, g, b = (x / 255 for x in rgb)
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn:
        return 0.0
    d = mx - mn
    if mx == r:
        h = (g - b) / d + (6 if g < b else 0)
    elif mx == g:
        h = (b - r) / d + 2
    else:
        h = (r - g) / d + 4
    return h / 6


def color_dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(hex_to_rgb(a), hex_to_rgb(b)))


def normalize_token(raw):
    raw = raw.strip().lower()
    if raw.startswith("background:"):
        raw = raw.split(":", 1)[1].strip()
    if raw.startswith("#"):
        h = raw
        if len(h) == 4:
            h = "#" + "".join(c * 2 for c in h[1:])
        return h.lower()
    if raw in CSS_NAMED:
        return CSS_NAMED[raw]
    return None


def wada_by_hue(colors):
    return sorted(colors, key=lambda c: rgb_to_hue(hex_to_rgb(c["hex"])))


def pick_by_hue(colors_sorted, hue, offset=0):
    if not colors_sorted:
        return "#888888"
    idx = int((hue * len(colors_sorted) + offset) % len(colors_sorted))
    return colors_sorted[idx]["hex"]


def nearest(colors, target_hex):
    return min(colors, key=lambda c: color_dist(c["hex"], target_hex))["hex"]


def build_palette_maps(colors, variant_index):
    """Map source color tokens to Wada hex for one of four palette variants."""
    by_hue = wada_by_hue(colors)
    offsets = [0, 37, 74, 111]
    offset = offsets[variant_index % 4]

    warm = wada_by_hue(
        [
            c
            for c in colors
            if any(
                k in c["name"].lower()
                for k in ("red", "rose", "pink", "coral", "sienna", "orange", "scarlet")
            )
        ]
    )
    cool = wada_by_hue(
        [
            c
            for c in colors
            if any(
                k in c["name"].lower()
                for k in ("blue", "green", "turquoise", "cerulean", "indigo", "glaucous")
            )
        ]
    )
    violet = wada_by_hue(
        [
            c
            for c in colors
            if any(k in c["name"].lower() for k in ("violet", "purple", "lilac", "lavender"))
        ]
    )
    pools = [by_hue, warm or by_hue, cool or by_hue, violet or by_hue]
    pool = pools[variant_index % 4] or by_hue

    token_map = {
        "silver": next(
            (c["hex"] for c in colors if c["name"] == "Neutral Gray"),
            "#b4b6a8",
        )
    }
    hex_cache = {}

    for token, hexv in CSS_NAMED.items():
        if token == "silver":
            continue
        h = rgb_to_hue(hex_to_rgb(hexv))
        token_map[token] = pick_by_hue(pool, h, offset)
        hex_cache[hexv.lower()] = token_map[token]

    return token_map, pool, offset, hex_cache


def replace_backgrounds(section_html, colors, variant_index):
    token_map, pool, offset, hex_cache = build_palette_maps(colors, variant_index)

    def repl(match):
        raw = match.group(1)
        parts = [p.strip() for p in raw.split(";") if p.strip()]
        resolved = []
        for part in parts:
            key = part.lower()
            norm = normalize_token(part)
            if key in token_map:
                resolved.append(token_map[key])
            elif norm:
                cache_key = norm.lower()
                if cache_key not in hex_cache:
                    h = rgb_to_hue(hex_to_rgb(norm))
                    hex_cache[cache_key] = pick_by_hue(pool, h, offset)
                resolved.append(hex_cache[cache_key])
            else:
                resolved.append(part)
        return f'style="background: {resolved[-1]};"'

    return re.sub(r'style="background:\s*([^"]+);"', repl, section_html)


def split_tables(grid_html):
    parts = re.split(r"(<table[^>]*>)", grid_html)
    chunks = []
    i = 0
    while i < len(parts):
        if parts[i].startswith("<table"):
            chunks.append(parts[i] + parts[i + 1])
            i += 2
        else:
            i += 1
    return chunks


def write_wada_colors_html(colors):
    cells = "\n".join(
        f'    <div class="swatch" style="background:{c["hex"]}" '
        f'title="{c["name"]}" data-hex="{c["hex"]}" data-name="{c["name"]}"></div>'
        for c in colors
    )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wada Sanzo Colors — zesameri</title>
  <meta name="description" content="171 colors from Wada Sanzo's Dictionary of Color Combinations (via wada-sanzo-colors.com).">
  <style>
    * {{ box-sizing: border-box; }}
    html, body {{
      margin: 0;
      height: 100%;
      overflow: hidden;
      background: #111;
      font-family: system-ui, sans-serif;
    }}
    #palette {{
      display: grid;
      width: 100vw;
      height: 100vh;
      grid-template-columns: repeat(var(--cols), 1fr);
      grid-template-rows: repeat(var(--rows), 1fr);
    }}
    .swatch {{
      min-width: 0;
      min-height: 0;
      cursor: default;
    }}
    #tooltip {{
      position: fixed;
      left: 12px;
      bottom: 12px;
      padding: 8px 12px;
      background: rgba(0,0,0,.75);
      color: #f5f5f5;
      font-size: 13px;
      border-radius: 4px;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
    }}
    #tooltip.visible {{ opacity: 1; }}
    a.home {{
      position: fixed;
      top: 10px;
      right: 12px;
      color: rgba(255,255,255,.7);
      font-size: 12px;
      text-decoration: none;
      z-index: 2;
    }}
    a.home:hover {{ color: #fff; }}
  </style>
</head>
<body>
  <a class="home" href="./grid-wada.html">pattern grids →</a>
  <div id="palette" role="list" aria-label="Wada Sanzo color swatches">
{cells}
  </div>
  <div id="tooltip" aria-live="polite"></div>
  <script>
    (function () {{
      var n = {len(colors)};
      var palette = document.getElementById('palette');
      var tip = document.getElementById('tooltip');
      function layout() {{
        var w = window.innerWidth;
        var h = window.innerHeight;
        var cols = Math.max(1, Math.ceil(Math.sqrt(n * w / h)));
        var rows = Math.ceil(n / cols);
        palette.style.setProperty('--cols', cols);
        palette.style.setProperty('--rows', rows);
      }}
      layout();
      window.addEventListener('resize', layout);
      palette.addEventListener('mouseover', function (e) {{
        var el = e.target.closest('.swatch');
        if (!el) return;
        tip.textContent = el.dataset.name + ' · ' + el.dataset.hex;
        tip.classList.add('visible');
      }});
      palette.addEventListener('mouseout', function () {{
        tip.classList.remove('visible');
      }});
    }})();
  </script>
</body>
</html>
"""


def write_grid_wada(grid_html, colors):
    """Build grid-wada.html from the minimal 24x24 Grid.html layout."""
    silver_hex = next((c["hex"] for c in colors if c["name"] == "Neutral Gray"), "#b4b6a8")

    table_chunks = re.findall(r"<table[^>]*>[\s\S]*?</table>", grid_html)
    if len(table_chunks) < 4:
        raise RuntimeError(f"expected 4 tables, found {len(table_chunks)}")

    rebuilt_tables = [
        replace_backgrounds(chunk, colors, i) for i, chunk in enumerate(table_chunks[:4])
    ]
    tables_html = "\n  ".join(rebuilt_tables)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wada Sanzo 24×24 grids</title>
  <style>
    body {{ padding: 16px; font-family: system-ui, sans-serif; }}
    .tables-side {{
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }}
    .tables-side table {{ flex-shrink: 0; }}
    table {{ border-collapse: collapse; }}
    td {{ width: 22px; height: 22px; border: 1px solid #ccc; }}
    .silver {{ background-color: {silver_hex}; }}
    .caption {{
      color: #555;
      font-size: 14px;
      max-width: 42em;
      margin: 0 0 12px;
    }}
    .caption a {{ color: #336; }}
  </style>
</head>
<body>
  <p class="caption">
    Same layouts as <a href="./24x24%20Grid.html">24×24 Grid</a>, recolored with
    <a href="https://www.wada-sanzo-colors.com/colors" target="_blank" rel="noopener noreferrer">Wada Sanzo</a>
    palettes · <a href="./wada-colors.html">all swatches</a>
  </p>
  <div class="tables-side">
  {tables_html}
  </div>
</body>
</html>
"""


def main():
    colors = fetch_wada_colors()
    if len(colors) < 100:
        raise SystemExit(f"expected ~171 colors, got {len(colors)}")

    data_dir = ROOT / "data"
    data_dir.mkdir(exist_ok=True)
    json_path = data_dir / "wada-colors.json"
    json_path.write_text(
        json.dumps(
            {
                "source": COLORS_URL,
                "count": len(colors),
                "colors": colors,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    (ROOT / "wada-colors.html").write_text(write_wada_colors_html(colors), encoding="utf-8")

    grid_html = GRID_SRC.read_text(encoding="utf-8")
    (ROOT / "grid-wada.html").write_text(write_grid_wada(grid_html, colors), encoding="utf-8")

    print(f"Wrote {len(colors)} colors to {json_path}")
    print("Wrote wada-colors.html and grid-wada.html")

    import subprocess
    import sys

    paint_script = ROOT / "scripts" / "build_paint_palette.py"
    if paint_script.exists():
        subprocess.run([sys.executable, str(paint_script)], check=True, cwd=str(ROOT))


if __name__ == "__main__":
    main()

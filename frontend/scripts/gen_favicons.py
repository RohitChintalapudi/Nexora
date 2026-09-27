"""Render the Nexora logo mark to favicon assets.

Geometry is lifted verbatim from frontend/public/favicon.svg so the raster
icons and the vector icon stay in lockstep.
"""
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.pardir, "public")

VB = 40.0          # svg viewBox
RADIUS = 8.0       # rounded-rect corner radius
STROKE = 3.5       # polyline stroke-width
NODES = [(11, 10), (11, 30), (20, 20), (29, 10), (29, 30)]
NODE_R = 3.5
PATH = [(11, 30), (11, 10), (29, 30), (29, 10)]

SS = 8  # supersample factor


def render(size: int) -> Image.Image:
    big = size * SS
    k = big / VB
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    d.rounded_rectangle([0, 0, big - 1, big - 1], radius=RADIUS * k, fill=(255, 255, 255, 255))

    black = (0, 0, 0, 255)
    w = max(1, round(STROKE * k))

    # Round caps and joins: thick segments plus a disc at every vertex.
    for (x0, y0), (x1, y1) in zip(PATH, PATH[1:]):
        d.line([x0 * k, y0 * k, x1 * k, y1 * k], fill=black, width=w)
    for x, y in PATH:
        r = w / 2
        cx, cy = x * k, y * k
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=black)

    for x, y in NODES:
        cx, cy = x * k, y * k
        r = NODE_R * k
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=black)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    targets = {
        "favicon.png": 512,
        "apple-touch-icon.png": 180,
    }
    for name, size in targets.items():
        path = os.path.join(OUT, name)
        render(size).save(path, "PNG", optimize=True)
        print(f"wrote {name} ({size}x{size}, {os.path.getsize(path)} bytes)")

    ico_path = os.path.join(OUT, "favicon.ico")
    render(256).save(
        ico_path,
        "ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    print(f"wrote favicon.ico ({os.path.getsize(ico_path)} bytes)")


if __name__ == "__main__":
    main()

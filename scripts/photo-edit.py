"""Portfolio photo cleanup (numpy + Pillow only).

remove_patch: hides an embroidered logo on dark fabric. The logo's silhouette
is found by brightness/saturation inside a box, closed and grown a little;
its pixels are filled by harmonic inpainting (each pixel = mean of its
neighbours, solved coarse-to-fine) so the fabric's shading flows through,
then grain as strong as the fabric's (measured on a nearby clean patch) is
added back so the fill doesn't look smeared.
"""
import numpy as np
from PIL import Image, ImageFilter, ImageOps


def grow(mask, r):
    m = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(m.filter(ImageFilter.MaxFilter(r * 2 + 1))) > 127


def shrink(mask, r):
    m = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(m.filter(ImageFilter.MinFilter(r * 2 + 1))) > 127


def fill_holes(mask):
    # Background = whatever the border can reach through unmasked pixels.
    h, w = mask.shape
    reach = np.zeros_like(mask)
    reach[0, :] = ~mask[0, :]; reach[-1, :] = ~mask[-1, :]; reach[:, 0] = ~mask[:, 0]; reach[:, -1] = ~mask[:, -1]
    while True:
        n = reach.copy()
        n[1:, :] |= reach[:-1, :]; n[:-1, :] |= reach[1:, :]; n[:, 1:] |= reach[:, :-1]; n[:, :-1] |= reach[:, 1:]
        n &= ~mask
        if (n == reach).all():
            return ~reach
        reach = n


def harmonic(img, mask, iters=400):
    """Fill masked pixels of an HxWx3 float image with a smooth membrane."""
    out = img.copy()
    # coarse guess first so the fine solve converges quickly
    h, w = mask.shape
    if min(h, w) > 64:
        sm = np.asarray(Image.fromarray(mask.astype(np.uint8) * 255).resize((w // 2, h // 2))) > 0
        si = np.stack([np.asarray(Image.fromarray(img[..., c].astype(np.float32)).resize((w // 2, h // 2), Image.BILINEAR)) for c in range(3)], -1)
        coarse = harmonic(si, sm, iters)
        up = np.stack([np.asarray(Image.fromarray(coarse[..., c].astype(np.float32)).resize((w, h), Image.BILINEAR)) for c in range(3)], -1)
        out[mask] = up[mask]
    for _ in range(iters):
        avg = (np.roll(out, 1, 0) + np.roll(out, -1, 0) + np.roll(out, 1, 1) + np.roll(out, -1, 1)) / 4
        out[mask] = avg[mask]
    return out


def remove_patch(im, box, grain_from, bright=70, sat=40, grow_px=22):
    x0, y0, x1, y1 = box
    a = np.asarray(im).astype(np.float32)
    region = a[y0:y1, x0:x1]
    mx, mn = region.max(-1), region.min(-1)
    logo = (mx > bright) | (mx - mn > sat)
    logo = shrink(grow(logo, 14), 14)        # close gaps between threads
    logo = fill_holes(logo)                  # include the logo's dark patches
    logo = grow(logo, grow_px)
    pad = 40
    big = np.zeros((y1 - y0 + 2 * pad, x1 - x0 + 2 * pad), bool)
    big[pad:-pad, pad:-pad] = logo
    Y0, X0 = y0 - pad, x0 - pad
    sub = a[Y0:Y0 + big.shape[0], X0:X0 + big.shape[1]].copy()
    filled = harmonic(sub, big)
    # fabric grain: high-pass of a clean patch, tiled over the fill
    gx, gy = grain_from
    clean = a[gy:gy + big.shape[0], gx:gx + big.shape[1]]
    blur = np.stack([np.asarray(Image.fromarray(clean[..., c].astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))).astype(np.float32) for c in range(3)], -1)
    # Only the grain's strength comes from the fabric; copying the patch
    # itself would also copy its folds. Fine noise of the same strength reads
    # as fleece without bringing any structure along.
    sd = (clean - blur).std()
    rng = np.random.default_rng(7)
    noise = rng.normal(0, 1, big.shape).astype(np.float32)
    noise = np.asarray(Image.fromarray(((noise * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
    noise = (noise - noise.mean()) / (noise.std() + 1e-6) * sd
    grain = noise[..., None]
    soft = np.asarray(Image.fromarray(big.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(9))).astype(np.float32)[..., None] / 255
    result = sub * (1 - soft) + (filled + grain) * soft
    a[Y0:Y0 + big.shape[0], X0:X0 + big.shape[1]] = result
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


if __name__ == '__main__':
    import sys
    src, out = sys.argv[1], sys.argv[2]
    box = tuple(int(v) for v in sys.argv[3].split(','))
    grain = tuple(int(v) for v in sys.argv[4].split(','))
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    remove_patch(im, box, grain).save(out, quality=95)


def _blur(x, r):
    """Blur a float array. Pillow can't Gaussian-blur float images, so wide
    blurs shrink and re-enlarge (smooth enough for a matte or a wall map) and
    narrow ones go through 16-bit-ish uint8 with the range restored."""
    h, w = x.shape
    im = Image.fromarray(x.astype(np.float32))
    if r >= 4:
        f = r / 2
        small = im.resize((max(1, int(w / f)), max(1, int(h / f))), Image.BOX)
        return np.asarray(small.resize((w, h), Image.BICUBIC)).astype(np.float32)
    lo, hi = float(x.min()), float(x.max())
    u = Image.fromarray(((x - lo) / max(hi - lo, 1e-6) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(u).astype(np.float32) / 255 * (hi - lo) + lo


def wall_matte(im, lo=22, hi=48):
    """Alpha matte (1 = subject) for a portrait against a plain light wall.

    Wall = light, nearly grey pixels connected to the image border. Its
    colour is then spread smoothly under the subject (normalized blur), so
    every pixel can be compared with "the wall right here", which handles
    vignetting and uneven light. Distance from that colour gives the soft
    edge, so dark hair against the light wall keeps its strands.
    """
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    L, sat = a.mean(-1), a.max(-1) - a.min(-1)
    cand = (L > 150) & (sat < 32)
    wall_m = ~fill_holes(~cand) & cand  # wall-like and reachable from the border
    k = max(h, w) / 40
    m = _blur(wall_m.astype(np.float32), k)
    wall = np.stack([_blur(a[..., c] * wall_m, k) for c in range(3)], -1) / np.maximum(m, 1e-3)[..., None]
    # far from any wall sample the estimate is noise; fall back to the mean wall
    mean = a[wall_m].mean(0)
    wt = np.clip(m / 0.05, 0, 1)[..., None]
    wall = wall * wt + mean * (1 - wt)
    d = np.sqrt(((a - wall) ** 2).sum(-1))
    alpha = np.clip((d - lo) / (hi - lo), 0, 1)
    # anything not reachable from the border through wall pixels (teeth,
    # glare on the glasses, light patches on clothes) is subject
    inner = ~grow(wall_m, 3)
    alpha[inner & (alpha < 1)] = np.maximum(alpha[inner & (alpha < 1)], np.where(grow(wall_m, 8)[inner & (alpha < 1)], alpha[inner & (alpha < 1)], 1))
    # Choke the edge ~1.5 px: the outermost ring still carries wall light
    # (it reads as a halo on a dark backdrop).
    alpha = np.minimum(alpha, _blur(shrink(alpha > 0.5, 2).astype(np.float32), 1.2))
    alpha = _blur(alpha, 1.4)  # soft, photographic edge rather than a cut-out
    return np.clip(alpha, 0, 1), wall


def backdrop(w, h, cx, cy, base=(40, 38, 40), glow=(130, 78, 170)):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - cx) / w) ** 2 + ((yy - cy) / h) ** 2)
    g = np.clip(1 - r / 0.55, 0, 1) ** 1.6
    out = np.zeros((h, w, 3), np.float32)
    for c in range(3):
        out[..., c] = base[c] + (glow[c] - base[c]) * g * 0.42
    # faint vignette + grain so the gradient doesn't band
    out *= (1 - 0.25 * np.clip(r - 0.35, 0, 1))[..., None]
    out += np.random.default_rng(3).normal(0, 1.4, out.shape)
    return out


def replace_wall(im, head_xy, **kw):
    alpha, wall = wall_matte(im)
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    bg = backdrop(w, h, *head_xy, **kw)
    al = alpha[..., None]
    # De-spill: on soft edges remove the wall's share of the colour before
    # compositing, or a light halo outlines the hair on the dark backdrop.
    fg = np.where(al > 0.02, (a - (1 - al) * wall) / np.maximum(al, 0.35), a)
    fg = np.clip(fg, 0, 255)
    out = fg * al + bg * (1 - al)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), alpha


def grade(im, contrast=1.06, warmth=4, sat=1.04, sharpen=True):
    a = np.asarray(im).astype(np.float32)
    a = (a - 128) * contrast + 128
    a[..., 0] += warmth; a[..., 2] -= warmth * 0.6
    grey = a.mean(-1, keepdims=True)
    a = grey + (a - grey) * sat
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    return out.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2)) if sharpen else out


def restyle_wall(im, top=(150, 96, 225), bottom=(255, 150, 175), dots=True):
    """Recolour the wall instead of cutting the subject out.

    Each wall pixel keeps its own brightness (relative to the local wall
    colour) and takes its hue from a brand gradient; edge pixels blend by the
    matte, so hair and shoulders keep the original, natural transition. An
    optional dot grid (the site's background pattern) sits on the wall only.
    """
    alpha, wall = wall_matte(im)
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip((0.75 * yy / h + 0.25 * xx / w), 0, 1)[..., None]
    grad = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    shade = (a.mean(-1) / np.maximum(wall.mean(-1), 1))[..., None]
    tinted = grad * np.clip(shade, 0, 1.3)
    if dots:
        step = max(w, h) / 70
        dx = (xx % step) - step / 2; dy = (yy % step) - step / 2
        dot = np.clip(1.6 - np.sqrt(dx * dx + dy * dy) / (step * 0.06), 0, 1)[..., None]
        tinted = tinted + (255 - tinted) * dot * 0.22
    # soft light falloff toward the corners
    r = np.sqrt(((xx - w / 2) / w) ** 2 + ((yy - h * 0.35) / h) ** 2)[..., None]
    tinted *= 1 - 0.28 * np.clip(r - 0.25, 0, 1)
    al = alpha[..., None]
    out = a * al + tinted * (1 - al)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def slim(im, cx, y0, y1, amount=0.07):
    """Subtle horizontal slimming below the chin.

    Rows above y0 (head, neck) are untouched; between y0 and y1 the squeeze
    eases in, below y1 the body is narrowed by `amount` around column cx.
    Run before restyle_wall so the wall is recoloured after the warp.
    """
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.clip((yy - y0) / (y1 - y0), 0, 1)
    t = t * t * (3 - 2 * t)
    s = 1 - amount * t
    sx = np.clip(cx + (xx - cx) / s, 0, w - 1.001)
    x0 = np.floor(sx).astype(int); f = (sx - x0)[..., None]
    rows = yy.astype(int)
    out = a[rows, x0] * (1 - f) + a[rows, x0 + 1] * f
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))

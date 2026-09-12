'use strict';

/**
 * Procedural app/tray icon: a Super Earth yellow rounded square with a black
 * stratagem arrow. Generated rather than shipped as a binary so the repo stays
 * text-only and every icon size is rendered crisply instead of scaled.
 *
 * Returns BGRA (the byte order both Electron's nativeImage.createFromBitmap and
 * the Windows ICO format expect).
 */

const YELLOW = { r: 0xff, g: 0xd2, b: 0x00 };
const INK = { r: 0x0d, g: 0x0d, b: 0x0d };

function drawIconBGRA(size) {
  const buf = Buffer.alloc(size * size * 4); // zero-filled == fully transparent

  const radius = size * 0.22;
  const inset = size * 0.02;

  const put = (x, y, color, alpha) => {
    if (alpha <= 0) return;
    const i = (y * size + x) * 4;
    const a = Math.min(1, alpha);
    const existing = buf[i + 3] / 255;
    const outA = a + existing * (1 - a);
    if (outA <= 0) return;
    // Source-over, per channel.
    buf[i]     = Math.round((color.b * a + buf[i]     * existing * (1 - a)) / outA);
    buf[i + 1] = Math.round((color.g * a + buf[i + 1] * existing * (1 - a)) / outA);
    buf[i + 2] = Math.round((color.r * a + buf[i + 2] * existing * (1 - a)) / outA);
    buf[i + 3] = Math.round(outA * 255);
  };

  // Signed distance to a rounded rectangle; negative inside. Used for cheap
  // analytic antialiasing at every size.
  const roundedRectSDF = (px, py) => {
    const halfW = size / 2 - inset;
    const halfH = size / 2 - inset;
    const cx = px - size / 2;
    const cy = py - size / 2;
    const qx = Math.abs(cx) - (halfW - radius);
    const qy = Math.abs(cy) - (halfH - radius);
    const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    return outside + Math.min(Math.max(qx, qy), 0) - radius;
  };

  // Arrow geometry, in 0..1 units of the icon box.
  const headTop = 0.20, headBottom = 0.52;
  const headLeft = 0.18, headRight = 0.82;
  const stemLeft = 0.39, stemRight = 0.61, stemBottom = 0.82;

  const insideArrow = (ux, uy) => {
    if (uy >= headTop && uy <= headBottom) {
      // Triangle: width shrinks to a point at the top.
      const t = (uy - headTop) / (headBottom - headTop);
      const halfSpan = ((headRight - headLeft) / 2) * t;
      return Math.abs(ux - 0.5) <= halfSpan;
    }
    if (uy > headBottom && uy <= stemBottom) {
      return ux >= stemLeft && ux <= stemRight;
    }
    return false;
  };

  // 3x3 supersample for the arrow edges; the plate uses its SDF directly.
  const SS = 3;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = roundedRectSDF(x + 0.5, y + 0.5);
      const plateAlpha = Math.min(1, Math.max(0, 0.5 - d));
      if (plateAlpha <= 0) continue;

      put(x, y, YELLOW, plateAlpha);

      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const ux = (x + (sx + 0.5) / SS) / size;
          const uy = (y + (sy + 0.5) / SS) / size;
          if (insideArrow(ux, uy)) hits++;
        }
      }

      if (hits) put(x, y, INK, (hits / (SS * SS)) * plateAlpha);
    }
  }

  return buf;
}

module.exports = { drawIconBGRA };

// Rasterize only a single existing letter when fonts/layout change. The tie
// follows real ink, including curved edges and the font's side bearings.
const glyphMetrics = new Map();
let canvas = null;

export function findGlyphAttachment({ data, width, height }, end) {
  let top = height, bottom = -1, left = width, right = -1;
  const isInk = (x, y) => data[(y * width + x) * 4 + 3] >= 40;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isInk(x, y)) { top = Math.min(top, y); bottom = y; left = Math.min(left, x); right = Math.max(right, x); }
    }
  }
  if (bottom < 0) return null;
  const target = Math.round(top + (bottom - top) * 0.26);
  const edgeWidth = Math.max(1, (right - left) * 0.14);
  for (let distance = 0; distance <= bottom - top; distance += 1) {
    for (const y of distance ? [target + distance, target - distance] : [target]) {
      if (y < top || y > bottom) continue;
      for (let index = 0; index < width; index += 1) {
        const x = end === 'right' ? width - 1 - index : index;
        const atEnd = end === 'right' ? x >= right - edgeWidth : x <= left + edgeWidth;
        if (atEnd && isInk(x, y)) return { x: x + 0.5, y: y + 0.5 };
      }
    }
  }
  return null;
}

export function clearGlyphAttachmentCache() { glyphMetrics.clear(); }

export function fitGlyphAttachment(glyph, end) {
  const pin = glyph?.querySelector('[data-rope-pin]');
  if (!pin) return;
  const style = window.getComputedStyle(glyph);
  const size = parseFloat(style.fontSize);
  if (!size) return; // Geometry unavailable: navigation remains native.
  const character = style.textTransform === 'lowercase' ? glyph.textContent.toLowerCase() : glyph.textContent;
  const font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
  const lineHeight = parseFloat(style.lineHeight) || size * 1.33;
  const key = [font, lineHeight, character, end].join('|');
  let point = glyphMetrics.get(key);
  if (point === undefined) {
    try {
      if (!canvas) canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.font = font;
      const metrics = context.measureText(character);
      const ascent = metrics.fontBoundingBoxAscent || size * 0.94;
      const descent = metrics.fontBoundingBoxDescent || size * 0.24;
      const baseline = glyph.querySelector('[data-rope-baseline]')?.offsetTop || (lineHeight - ascent - descent) / 2 + ascent;
      const padding = 3, scale = 2;
      canvas.width = Math.ceil((Math.max(metrics.width, metrics.actualBoundingBoxRight || 0) + padding * 2) * scale);
      canvas.height = Math.ceil((lineHeight + padding * 2) * scale);
      context.scale(scale, scale);
      context.font = font;
      context.fillStyle = '#fff';
      context.fillText(character, padding, baseline + padding);
      const found = findGlyphAttachment(context.getImageData(0, 0, canvas.width, canvas.height), end);
      point = found ? { x: found.x / scale - padding, y: found.y / scale - padding } : null;
      if (glyphMetrics.size > 40) glyphMetrics.clear();
      glyphMetrics.set(key, point);
    } catch { return; }
  }
  if (!point) return;
  pin.style.left = point.x + 'px';
  pin.style.top = point.y + 'px';
  pin.dataset.ropeInk = 'true';
}

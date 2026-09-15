import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generateFaviconPNG(size = 64) {
  const width = size;
  const height = size;
  const scale = size / 40;

  // Create RGBA buffer
  const rawData = Buffer.alloc((width * 4 + 1) * height);

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const rowOffset = y * (width * 4 + 1);
    const pixelOffset = rowOffset + 1 + x * 4;

    // Alpha blending
    const srcA = a / 255;
    const dstA = rawData[pixelOffset + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);

    if (outA > 0) {
      const outR = Math.round((r * srcA + rawData[pixelOffset] * dstA * (1 - srcA)) / outA);
      const outG = Math.round((g * srcA + rawData[pixelOffset + 1] * dstA * (1 - srcA)) / outA);
      const outB = Math.round((b * srcA + rawData[pixelOffset + 2] * dstA * (1 - srcA)) / outA);

      rawData[pixelOffset] = outR;
      rawData[pixelOffset + 1] = outG;
      rawData[pixelOffset + 2] = outB;
      rawData[pixelOffset + 3] = Math.round(outA * 255);
    }
  }

  // Draw white rounded rectangle
  const radius = 8 * scale;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Check rounded corners
      let inside = true;
      let alpha = 255;

      const corners = [
        { cx: radius, cy: radius },
        { cx: width - radius, cy: radius },
        { cx: radius, cy: height - radius },
        { cx: width - radius, cy: height - radius },
      ];

      for (const corner of corners) {
        if (
          (corner.cx === radius && x < radius && corner.cy === radius && y < radius) ||
          (corner.cx === width - radius && x > width - radius && corner.cy === radius && y < radius) ||
          (corner.cx === radius && x < radius && corner.cy === height - radius && y > height - radius) ||
          (corner.cx === width - radius && x > width - radius && corner.cy === height - radius && y > height - radius)
        ) {
          const dx = x - corner.cx;
          const dy = y - corner.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) {
            inside = false;
          } else if (dist > radius - 1) {
            alpha = Math.round((radius - dist) * 255);
          }
        }
      }

      if (inside) {
        setPixel(x, y, 255, 255, 255, alpha);
      }
    }
  }

  function drawThickLine(x0, y0, x1, y1, thickness, r, g, b, a) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(len * 2);
    const halfThick = thickness / 2;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x0 + dx * t;
      const py = y0 + dy * t;

      for (let oy = -Math.ceil(halfThick + 1); oy <= Math.ceil(halfThick + 1); oy++) {
        for (let ox = -Math.ceil(halfThick + 1); ox <= Math.ceil(halfThick + 1); ox++) {
          const dist = Math.sqrt(ox * ox + oy * oy);
          if (dist <= halfThick) {
            setPixel(Math.round(px + ox), Math.round(py + oy), r, g, b, a);
          } else if (dist <= halfThick + 1) {
            const edgeAlpha = Math.round((halfThick + 1 - dist) * a);
            setPixel(Math.round(px + ox), Math.round(py + oy), r, g, b, edgeAlpha);
          }
        }
      }
    }
  }

  function drawFilledCircle(cx, cy, rad, r, g, b, a) {
    for (let y = Math.floor(cy - rad - 1); y <= Math.ceil(cy + rad + 1); y++) {
      for (let x = Math.floor(cx - rad - 1); x <= Math.ceil(cx + rad + 1); x++) {
        const dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (dist <= rad) {
          setPixel(x, y, r, g, b, a);
        } else if (dist <= rad + 1) {
          const edgeAlpha = Math.round((rad + 1 - dist) * a);
          setPixel(x, y, r, g, b, edgeAlpha);
        }
      }
    }
  }

  // Draw N letter
  const p1 = { x: 11 * scale, y: 30 * scale };
  const p2 = { x: 11 * scale, y: 10 * scale };
  const p3 = { x: 29 * scale, y: 30 * scale };
  const p4 = { x: 29 * scale, y: 10 * scale };
  const pCenter = { x: 20 * scale, y: 20 * scale };

  const strokeWidth = 3.5 * scale;
  const nodeRadius = 3.5 * scale;

  // Left vertical
  drawThickLine(p1.x, p1.y, p2.x, p2.y, strokeWidth, 0, 0, 0, 255);
  // Diagonal
  drawThickLine(p2.x, p2.y, p3.x, p3.y, strokeWidth, 0, 0, 0, 255);
  // Right vertical
  drawThickLine(p3.x, p3.y, p4.x, p4.y, strokeWidth, 0, 0, 0, 255);

  // Nodes
  drawFilledCircle(p1.x, p1.y, nodeRadius, 0, 0, 0, 255);
  drawFilledCircle(p2.x, p2.y, nodeRadius, 0, 0, 0, 255);
  drawFilledCircle(pCenter.x, pCenter.y, 3.2 * scale, 0, 0, 0, 255);
  drawFilledCircle(p3.x, p3.y, nodeRadius, 0, 0, 0, 255);
  drawFilledCircle(p4.x, p4.y, nodeRadius, 0, 0, 0, 255);

  // Encode PNG
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = generateFaviconPNG(64);
const outputPath = path.resolve('public/favicon.png');
fs.writeFileSync(outputPath, pngBuffer);
console.log('favicon.png successfully generated at', outputPath);

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(len + 12);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, len + 8));
  chunk.writeUInt32BE(crc, len + 8);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const bytesPerRow = width * 4 + 1;
  const rawData = Buffer.alloc(bytesPerRow * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(cx, cy);
  const cornerRadius = isMaskable ? 0 : maxRadius * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * bytesPerRow;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Dark emerald / slate background: #0b1120 to #064e3b
      const t = (x + y) / (width + height);
      let r = Math.round(11 * (1 - t) + 6 * t);
      let g = Math.round(17 * (1 - t) + 78 * t);
      let b = Math.round(32 * (1 - t) + 59 * t);
      let a = 255;

      // Rounded rectangle mask (unless maskable)
      if (!isMaskable) {
        let inside = true;
        const dx = Math.max(Math.abs(x - cx) - (cx - cornerRadius), 0);
        const dy = Math.max(Math.abs(y - cy) - (cy - cornerRadius), 0);
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inside = false;
        }
        if (!inside) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      if (a > 0) {
        // Draw Fuel Pump Motif
        // Scale coordinate to [0, 1] relative to center
        const scale = isMaskable ? 0.7 : 0.85;
        const nx = (x - cx) / (cx * scale);
        const ny = (y - cy) / (cy * scale);

        // Pump Cabinet: [-0.4, 0.2] in X, [-0.5, 0.5] in Y
        if (nx >= -0.4 && nx <= 0.2 && ny >= -0.5 && ny <= 0.45) {
          // Inner cabinet
          r = 15; g = 23; b = 42;

          // Cabinet Border
          if (nx <= -0.36 || nx >= 0.16 || ny <= -0.46 || ny >= 0.41) {
            r = 16; g = 185; b = 129; // Emerald #10b981
          }

          // Screen: [-0.3, 0.1], [-0.35, -0.05]
          if (nx >= -0.32 && nx <= 0.12 && ny >= -0.35 && ny <= -0.08) {
            r = 6; g = 78; b = 59; // Dark emerald
            // Screen border
            if (nx <= -0.30 || nx >= 0.10 || ny <= -0.33 || ny >= -0.10) {
              r = 52; g = 211; b = 153;
            }
          }
        }

        // Pump Base: [-0.48, 0.28], [0.42, 0.52]
        if (nx >= -0.48 && nx <= 0.28 && ny >= 0.42 && ny <= 0.52) {
          r = 4; g = 120; b = 87;
        }

        // Fuel Hose on the right: nx around 0.2 to 0.45, ny from -0.2 to 0.4
        const hoseDist = Math.abs(Math.sqrt(Math.pow(nx - 0.2, 2) + Math.pow(ny - 0.1, 2)) - 0.25);
        if (nx >= 0.2 && hoseDist < 0.05 && ny >= -0.25 && ny <= 0.4) {
          r = 52; g = 211; b = 153;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Header
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // no interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate all standard PWA icons
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(outDir, 'favicon.ico'), generatePNG(64, 64, false));

console.log('All PWA PNG icons generated in /public!');

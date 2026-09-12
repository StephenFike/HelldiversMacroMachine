'use strict';

/**
 * Writes build/icon.ico from the procedural icon in src/main/icon.js.
 * Uses uncompressed 32-bit DIB entries so no PNG encoder is needed.
 */

const fs = require('fs');
const path = require('path');
const { drawIconBGRA } = require('../src/main/icon');

const SIZES = [16, 24, 32, 48, 64, 128, 256];

function buildDibEntry(size) {
  const bgra = drawIconBGRA(size);

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0);          // biSize
  header.writeInt32LE(size, 4);         // biWidth
  header.writeInt32LE(size * 2, 8);     // biHeight — XOR bitmap + AND mask
  header.writeUInt16LE(1, 12);          // biPlanes
  header.writeUInt16LE(32, 14);         // biBitCount
  header.writeUInt32LE(0, 16);          // biCompression = BI_RGB

  // XOR bitmap, bottom-up.
  const xor = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    const src = (size - 1 - y) * size * 4;
    bgra.copy(xor, y * size * 4, src, src + size * 4);
  }

  // AND mask: 1bpp, rows padded to 4 bytes. Left at zero (fully opaque) because
  // the 32-bit alpha channel carries the real transparency.
  const maskStride = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskStride * size);

  header.writeUInt32LE(xor.length + mask.length, 20); // biSizeImage

  return Buffer.concat([header, xor, mask]);
}

function buildIco(sizes) {
  const images = sizes.map(buildDibEntry);

  const dir = Buffer.alloc(6 + 16 * sizes.length);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(sizes.length, 4);

  let offset = dir.length;
  sizes.forEach((size, i) => {
    const at = 6 + i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, at);     // width (0 means 256)
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1); // height
    dir.writeUInt8(0, at + 2);                      // palette colours
    dir.writeUInt8(0, at + 3);                      // reserved
    dir.writeUInt16LE(1, at + 4);                   // colour planes
    dir.writeUInt16LE(32, at + 6);                  // bits per pixel
    dir.writeUInt32LE(images[i].length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += images[i].length;
  });

  return Buffer.concat([dir, ...images]);
}

const outDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, 'icon.ico');
fs.writeFileSync(outFile, buildIco(SIZES));

console.log(`Wrote ${outFile} (${SIZES.join(', ')} px)`);

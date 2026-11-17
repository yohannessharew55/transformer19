import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple pure-JS PNG generator
function createPng(width, height, pixelFn) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header & Chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 1);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Draw Transformer19 Circular Monogram App Icon
function drawIconPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.44;
  const innerRadius = w * 0.41;

  // Background gradient: sleek dark carbon #0c101a to #121927
  const normY = y / h;
  const bgR = Math.round(11 + normY * 7);
  const bgG = Math.round(15 + normY * 10);
  const bgB = Math.round(23 + normY * 16);

  // Outer ring: Golden Amber #f59e0b & Sky Cyan #0082ff transition
  if (dist <= radius && dist >= innerRadius) {
    // Elegant dual-tone ring
    const angle = Math.atan2(dy, dx);
    if (angle > -1.5 && angle < 1.5) {
      // Golden Amber
      return [245, 158, 11, 255];
    } else {
      // Vibrant Cyan
      return [0, 130, 255, 255];
    }
  }

  // Inside the circle: dark metallic cockpit core
  if (dist < innerRadius) {
    // Subtle glow in center
    const glow = Math.max(0, 1 - dist / innerRadius);
    const r = Math.round(18 + glow * 25);
    const g = Math.round(25 + glow * 35);
    const b = Math.round(38 + glow * 55);

    // Render "T19" letter shapes using simple geometric distance checks
    // Scale coordinates to -1..1 relative to innerRadius
    const nx = dx / (innerRadius * 0.7);
    const ny = dy / (innerRadius * 0.7);

    // Let's check if inside 'T' (left)
    // T: horizontal bar [-0.75..-0.25, -0.45..-0.3], vertical stem [-0.55..-0.45, -0.3..0.45]
    const inTBar = (nx >= -0.75 && nx <= -0.15 && ny >= -0.45 && ny <= -0.30);
    const inTStem = (nx >= -0.50 && nx <= -0.40 && ny >= -0.30 && ny <= 0.45);
    const inT = inTBar || inTStem;

    // '1': vertical bar [0.0..0.12, -0.45..0.45], serif [-0.1..0.0, -0.45..-0.3]
    const in1Stem = (nx >= -0.02 && nx <= 0.10 && ny >= -0.45 && ny <= 0.45);
    const in1Serif = (nx >= -0.12 && nx <= -0.02 && ny >= -0.45 && ny <= -0.30);
    const in1 = in1Stem || in1Serif;

    // '9': top loop [0.25..0.65, -0.45..0.0], right stem [0.53..0.65, -0.45..0.45], bottom hook [0.25..0.65, 0.35..0.45]
    const in9Top = (nx >= 0.25 && nx <= 0.65 && ny >= -0.45 && ny <= -0.32);
    const in9Mid = (nx >= 0.25 && nx <= 0.65 && ny >= -0.12 && ny <= 0.0);
    const in9Left = (nx >= 0.25 && nx <= 0.37 && ny >= -0.45 && ny <= 0.0);
    const in9Right = (nx >= 0.53 && nx <= 0.65 && ny >= -0.45 && ny <= 0.45);
    const in9Bottom = (nx >= 0.25 && nx <= 0.65 && ny >= 0.33 && ny <= 0.45);
    const in9 = in9Top || in9Mid || in9Left || in9Right || in9Bottom;

    if (inT || in1 || in9) {
      // Crisp glowing white/gold lettermark
      return [255, 255, 255, 255];
    }

    return [r, g, b, 255];
  }

  // Outside circle: dark container background
  return [bgR, bgG, bgB, 255];
}

console.log('Generating App Icons for iOS & Web...');

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Apple Touch Icon (180x180)
const appleIcon = createPng(180, 180, drawIconPixel);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ Created public/apple-touch-icon.png (180x180)');

// 2. Icon 192 (192x192)
const icon192 = createPng(192, 192, drawIconPixel);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), icon192);
console.log('✓ Created public/icon-192.png (192x192)');

// 3. Icon 512 (512x512)
const icon512 = createPng(512, 512, drawIconPixel);
fs.writeFileSync(path.join(outDir, 'icon-512.png'), icon512);
console.log('✓ Created public/icon-512.png (512x512)');

// Also copy to ios Assets if present
const iosAssetsDir = path.resolve('ios/App/App/Assets.xcassets/AppIcon.appiconset');
if (fs.existsSync(iosAssetsDir)) {
  fs.writeFileSync(path.join(iosAssetsDir, 'AppIcon-512@2x.png'), icon512);
  console.log('✓ Copied to iOS Assets.xcassets/AppIcon.appiconset');
}

console.log('App icons generated successfully!');

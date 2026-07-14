// Minimal pure-Node PNG encoder (no native deps) that draws a simple
// radial-gradient circle-on-circle "moon over sky" mark and writes the
// PWA icon set. No canvas/sharp available in this environment, so we
// build PNG chunks by hand: this is small enough to keep dependency-free.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function drawIcon(size, { maskableSafe = false } = {}) {
  const px = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const bgOuter = [11, 18, 32]; // deep night navy
  const bgInner = [30, 42, 74]; // soft indigo glow center
  const moon = [244, 214, 160]; // warm moon gold
  const moonR = size * (maskableSafe ? 0.19 : 0.24);
  const moonCx = cx + size * 0.06;
  const moonCy = cy - size * 0.06;
  const maxR = (Math.SQRT2 * size) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const dxBg = x - cx, dyBg = y - cy;
      const rBg = Math.sqrt(dxBg * dxBg + dyBg * dyBg) / maxR;
      const t = Math.min(1, rBg);
      let r = lerp(bgInner[0], bgOuter[0], t);
      let g = lerp(bgInner[1], bgOuter[1], t);
      let b = lerp(bgInner[2], bgOuter[2], t);

      const dxM = x - moonCx, dyM = y - moonCy;
      const distM = Math.sqrt(dxM * dxM + dyM * dyM);
      if (distM < moonR) {
        const edge = Math.min(1, (moonR - distM) / (size * 0.01));
        r = lerp(r, moon[0], edge);
        g = lerp(g, moon[1], edge);
        b = lerp(b, moon[2], edge);
        // simple crescent: carve a shadow circle offset toward upper-right
        const shadowCx = moonCx + moonR * 0.55;
        const shadowCy = moonCy - moonR * 0.35;
        const dxS = x - shadowCx, dyS = y - shadowCy;
        if (Math.sqrt(dxS * dxS + dyS * dyS) < moonR * 0.92) {
          r = lerp(bgInner[0], bgOuter[0], t);
          g = lerp(bgInner[1], bgOuter[1], t);
          b = lerp(bgInner[2], bgOuter[2], t);
        }
      }

      px[i] = r | 0;
      px[i + 1] = g | 0;
      px[i + 2] = b | 0;
      px[i + 3] = 255;
    }
  }

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    px.subarray(y * stride, y * stride + stride).forEach((v, i) => {
      raw[y * (stride + 1) + 1 + i] = v;
    });
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const idat = deflateSync(raw);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', drawIcon(192));
writeFileSync('public/icons/icon-512.png', drawIcon(512));
writeFileSync('public/icons/icon-maskable-512.png', drawIcon(512, { maskableSafe: true }));
writeFileSync('public/icons/apple-touch-icon.png', drawIcon(180));
console.log('Icons generated in public/icons/');

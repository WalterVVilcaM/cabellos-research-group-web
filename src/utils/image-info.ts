/**
 * Tipo real y tamaño en píxeles de una imagen, leídos de sus primeros bytes (JPEG, PNG o WebP).
 * No se confía en la extensión ni en el tipo que declara el navegador. No decodifica la imagen.
 */
export interface ImageInfo {
  mime: 'image/jpeg' | 'image/png' | 'image/webp';
  ext: 'jpg' | 'png' | 'webp';
  width: number;
  height: number;
}

const ascii = (b: Uint8Array, start: number, len: number) => String.fromCharCode(...b.subarray(start, start + len));

function png(b: Uint8Array, v: DataView): ImageInfo | null {
  if (b.length < 24 || b[0] !== 0x89 || ascii(b, 1, 3) !== 'PNG' || ascii(b, 12, 4) !== 'IHDR') return null;
  return { mime: 'image/png', ext: 'png', width: v.getUint32(16), height: v.getUint32(20) };
}

function webp(b: Uint8Array, v: DataView): ImageInfo | null {
  if (b.length < 30 || ascii(b, 0, 4) !== 'RIFF' || ascii(b, 8, 4) !== 'WEBP') return null;
  const chunk = ascii(b, 12, 4);
  const base = { mime: 'image/webp' as const, ext: 'webp' as const };
  if (chunk === 'VP8X') {
    // Ancho y alto menos uno, 24 bits little-endian.
    const w = 1 + (b[24]! | (b[25]! << 8) | (b[26]! << 16));
    const h = 1 + (b[27]! | (b[28]! << 8) | (b[29]! << 16));
    return { ...base, width: w, height: h };
  }
  if (chunk === 'VP8 ') {
    // Fotograma clave: firma 9d 01 2a y luego 14 bits de ancho y alto.
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    return { ...base, width: v.getUint16(26, true) & 0x3fff, height: v.getUint16(28, true) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    if (b[20] !== 0x2f) return null;
    const bits = v.getUint32(21, true);
    return { ...base, width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function jpeg(b: Uint8Array, v: DataView): ImageInfo | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1]!;
    if (marker === 0xff) {
      i++;
      continue;
    }
    const len = v.getUint16(i + 2);
    // SOF0–SOF15 salvo DHT (c4), JPG (c8) y DAC (cc): ahí vienen alto y ancho.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { mime: 'image/jpeg', ext: 'jpg', height: v.getUint16(i + 5), width: v.getUint16(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

/** Lee lo necesario del archivo (los JPEG pueden traer metadatos largos antes del tamaño). */
export async function imageInfo(file: Blob): Promise<ImageInfo | null> {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const info = png(bytes, view) ?? webp(bytes, view) ?? jpeg(bytes, view);
  if (!info || info.width < 1 || info.height < 1) return null;
  return info;
}

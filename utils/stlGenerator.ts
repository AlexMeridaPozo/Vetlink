/**
 * stlGenerator.ts
 * Genera un archivo STL binario 3D a partir de una matriz QR.
 * El resultado es una placa con los módulos oscuros como cubos elevados.
 * Sin dependencias externas.
 */

interface Vec3 { x: number; y: number; z: number }

/**
 * Opciones de configuración para la placa STL.
 */
export interface STLOptions {
  /** Tamaño de cada módulo QR en mm (default: 2) */
  moduleSize?: number;
  /** Altura del relieve de los módulos oscuros en mm (default: 1.5) */
  moduleHeight?: number;
  /** Grosor de la placa base en mm (default: 1.5) */
  baseHeight?: number;
  /** Margen alrededor del QR en mm (default: 4) */
  margin?: number;
}

/** Escribe un float32 little-endian en el buffer en el offset dado */
function writeFloat(buf: DataView, offset: number, value: number): number {
  buf.setFloat32(offset, value, true);
  return offset + 4;
}

/** Escribe un triángulo STL (normal + 3 vértices + 2 bytes atributo) */
function writeTriangle(
  buf: DataView,
  offset: number,
  normal: Vec3,
  v0: Vec3,
  v1: Vec3,
  v2: Vec3,
): number {
  offset = writeFloat(buf, offset, normal.x);
  offset = writeFloat(buf, offset, normal.y);
  offset = writeFloat(buf, offset, normal.z);
  for (const v of [v0, v1, v2]) {
    offset = writeFloat(buf, offset, v.x);
    offset = writeFloat(buf, offset, v.y);
    offset = writeFloat(buf, offset, v.z);
  }
  buf.setUint16(offset, 0, true); // attribute byte count
  return offset + 2;
}

/**
 * Genera un ArrayBuffer con el contenido del archivo STL binario.
 * @param matrix Matriz QR (true = módulo oscuro)
 * @param options Opciones de dimensiones
 */
export function generateSTL(matrix: boolean[][], options: STLOptions = {}): ArrayBuffer {
  const mSize = options.moduleSize ?? 2;
  const mHeight = options.moduleHeight ?? 1.5;
  const baseH = options.baseHeight ?? 1.5;
  const margin = options.margin ?? 4;

  const qrSize = matrix.length;
  const totalXY = qrSize * mSize + margin * 2;

  // ── Contar triángulos ─────────────────────────────────────────────────────
  // Base: 2 triángulos (tapa superior e inferior, o bien el piso)
  // Por módulo oscuro: top(2) + 4 lados(8) = 10 triángulos
  // Paredes de la placa (4 lados × 2 triángulos = 8)
  // Tapa de la placa base: 2 triángulos
  // Fondo: 2 triángulos

  let darkCount = 0;
  for (const row of matrix) for (const cell of row) if (cell) darkCount++;

  const triCount =
    2 +        // fondo de la placa
    8 +        // 4 paredes de la placa
    2 +        // tapa de la placa (alrededor de los módulos, aprox)
    darkCount * 10; // módulos oscuros

  // STL binary: 80 header + 4 uint32 count + triCount * 50 bytes
  const bufSize = 80 + 4 + triCount * 50;
  const buf = new ArrayBuffer(bufSize);
  const dv = new DataView(buf);

  // Header ASCII (80 bytes)
  const header = 'VetLink QR Tag - generado con qrGenerator.ts';
  for (let i = 0; i < 80; i++) dv.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);

  // Cantidad de triángulos
  dv.setUint32(80, triCount, true);

  let offset = 84;

  const z0 = 0;
  const z1 = baseH;
  const z2 = baseH + mHeight;

  // ── Placa base ─────────────────────────────────────────────────────────────

  // Fondo (z=0)
  offset = writeTriangle(dv, offset, { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: z0 }, { x: totalXY, y: 0, z: z0 }, { x: totalXY, y: totalXY, z: z0 });
  offset = writeTriangle(dv, offset, { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: z0 }, { x: totalXY, y: totalXY, z: z0 }, { x: 0, y: totalXY, z: z0 });

  // Pared delantera (y=0)
  offset = writeTriangle(dv, offset, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: z0 }, { x: totalXY, y: 0, z: z0 }, { x: totalXY, y: 0, z: z1 });
  offset = writeTriangle(dv, offset, { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: z0 }, { x: totalXY, y: 0, z: z1 }, { x: 0, y: 0, z: z1 });

  // Pared trasera (y=totalXY)
  offset = writeTriangle(dv, offset, { x: 0, y: 1, z: 0 },
    { x: 0, y: totalXY, z: z0 }, { x: totalXY, y: totalXY, z: z1 }, { x: totalXY, y: totalXY, z: z0 });
  offset = writeTriangle(dv, offset, { x: 0, y: 1, z: 0 },
    { x: 0, y: totalXY, z: z0 }, { x: 0, y: totalXY, z: z1 }, { x: totalXY, y: totalXY, z: z1 });

  // Pared izquierda (x=0)
  offset = writeTriangle(dv, offset, { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: z0 }, { x: 0, y: totalXY, z: z0 }, { x: 0, y: totalXY, z: z1 });
  offset = writeTriangle(dv, offset, { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: z0 }, { x: 0, y: totalXY, z: z1 }, { x: 0, y: 0, z: z1 });

  // Pared derecha (x=totalXY)
  offset = writeTriangle(dv, offset, { x: 1, y: 0, z: 0 },
    { x: totalXY, y: 0, z: z0 }, { x: totalXY, y: totalXY, z: z1 }, { x: totalXY, y: totalXY, z: z0 });
  offset = writeTriangle(dv, offset, { x: 1, y: 0, z: 0 },
    { x: totalXY, y: 0, z: z0 }, { x: totalXY, y: 0, z: z1 }, { x: totalXY, y: totalXY, z: z1 });

  // Tapa base (z=z1): cubrimos todo — los módulos oscuros taparán encima
  offset = writeTriangle(dv, offset, { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: z1 }, { x: totalXY, y: totalXY, z: z1 }, { x: totalXY, y: 0, z: z1 });
  offset = writeTriangle(dv, offset, { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: z1 }, { x: 0, y: totalXY, z: z1 }, { x: totalXY, y: totalXY, z: z1 });

  // ── Módulos oscuros (cubos) ────────────────────────────────────────────────

  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (!matrix[row][col]) continue;

      const x0 = margin + col * mSize;
      const x1 = x0 + mSize;
      const y0 = margin + row * mSize;
      const y1 = y0 + mSize;

      // Cara superior
      offset = writeTriangle(dv, offset, { x: 0, y: 0, z: 1 },
        { x: x0, y: y0, z: z2 }, { x: x1, y: y0, z: z2 }, { x: x1, y: y1, z: z2 });
      offset = writeTriangle(dv, offset, { x: 0, y: 0, z: 1 },
        { x: x0, y: y0, z: z2 }, { x: x1, y: y1, z: z2 }, { x: x0, y: y1, z: z2 });

      // Cara delantera
      offset = writeTriangle(dv, offset, { x: 0, y: -1, z: 0 },
        { x: x0, y: y0, z: z1 }, { x: x1, y: y0, z: z1 }, { x: x1, y: y0, z: z2 });
      offset = writeTriangle(dv, offset, { x: 0, y: -1, z: 0 },
        { x: x0, y: y0, z: z1 }, { x: x1, y: y0, z: z2 }, { x: x0, y: y0, z: z2 });

      // Cara trasera
      offset = writeTriangle(dv, offset, { x: 0, y: 1, z: 0 },
        { x: x0, y: y1, z: z1 }, { x: x1, y: y1, z: z2 }, { x: x1, y: y1, z: z1 });
      offset = writeTriangle(dv, offset, { x: 0, y: 1, z: 0 },
        { x: x0, y: y1, z: z1 }, { x: x0, y: y1, z: z2 }, { x: x1, y: y1, z: z2 });

      // Cara izquierda
      offset = writeTriangle(dv, offset, { x: -1, y: 0, z: 0 },
        { x: x0, y: y0, z: z1 }, { x: x0, y: y0, z: z2 }, { x: x0, y: y1, z: z2 });
      offset = writeTriangle(dv, offset, { x: -1, y: 0, z: 0 },
        { x: x0, y: y0, z: z1 }, { x: x0, y: y1, z: z2 }, { x: x0, y: y1, z: z1 });

      // Cara derecha
      offset = writeTriangle(dv, offset, { x: 1, y: 0, z: 0 },
        { x: x1, y: y0, z: z1 }, { x: x1, y: y1, z: z2 }, { x: x1, y: y0, z: z2 });
      offset = writeTriangle(dv, offset, { x: 1, y: 0, z: 0 },
        { x: x1, y: y0, z: z1 }, { x: x1, y: y1, z: z1 }, { x: x1, y: y1, z: z2 });
    }
  }

  return buf;
}

/**
 * Convierte un ArrayBuffer en una cadena Base64 (para guardar como archivo).
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // En React Native no hay btoa disponible en todos los entornos,
  // usamos la versión manual
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const uint8 = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < uint8.length; i += 3) {
    const b0 = uint8[i], b1 = uint8[i + 1] ?? 0, b2 = uint8[i + 2] ?? 0;
    result += chars[b0 >> 2];
    result += chars[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < uint8.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < uint8.length ? chars[b2 & 63] : '=';
  }
  return result;
}

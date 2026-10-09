/**
 * qrGenerator.ts
 * Generador de QR puro en TypeScript — sin dependencias externas.
 * Implementa QR versiones 1-10, nivel ECC "M", modo Byte (UTF-8 / ASCII).
 * Devuelve una matriz booleana: true = módulo oscuro (negro), false = claro (blanco).
 */

// ── Tablas de Reed-Solomon (GF 256, polinomio 0x11D) ──────────────────────────

const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function buildGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255];
}

function rsGeneratorPoly(degree: number): number[] {
  let g = [1];
  for (let i = 0; i < degree; i++) {
    const factor = [1, GF_EXP[i]];
    const newG: number[] = new Array(g.length + factor.length - 1).fill(0);
    for (let j = 0; j < g.length; j++)
      for (let k = 0; k < factor.length; k++)
        newG[j + k] ^= gfMul(g[j], factor[k]);
    g = newG;
  }
  return g;
}

function rsEncode(data: number[], ecCount: number): number[] {
  const gen = rsGeneratorPoly(ecCount);
  const msg = [...data, ...new Array(ecCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) {
      msg[i + j] ^= gfMul(gen[j], coef);
    }
  }
  return msg.slice(data.length);
}

// ── Capacidades por versión (modo Byte, ECC M) ────────────────────────────────
// [versión]: [capacidadBytes, bloques, ecPorBloque, dataBloques]
// Simplificado: sólo las versiones que necesitamos (1–10)
const VERSION_CAPS: { [v: number]: { cap: number; ecTotal: number; blocks: { dc: number; ec: number }[] } } = {
  1:  { cap: 16,  ecTotal: 10, blocks: [{ dc: 16,  ec: 10 }] },
  2:  { cap: 28,  ecTotal: 16, blocks: [{ dc: 28,  ec: 16 }] },
  3:  { cap: 44,  ecTotal: 26, blocks: [{ dc: 44,  ec: 26 }] },
  4:  { cap: 64,  ecTotal: 18, blocks: [{ dc: 32,  ec: 18 }, { dc: 32, ec: 18 }] },
  5:  { cap: 86,  ecTotal: 24, blocks: [{ dc: 43,  ec: 24 }, { dc: 43, ec: 24 }] },
  6:  { cap: 108, ecTotal: 16, blocks: [{ dc: 27,  ec: 16 }, { dc: 27, ec: 16 }, { dc: 27, ec: 16 }, { dc: 27, ec: 16 }] },
  7:  { cap: 124, ecTotal: 18, blocks: [{ dc: 31,  ec: 18 }, { dc: 31, ec: 18 }, { dc: 31, ec: 18 }, { dc: 31, ec: 18 }] },
  8:  { cap: 154, ecTotal: 22, blocks: [{ dc: 38,  ec: 22 }, { dc: 38, ec: 22 }, { dc: 38, ec: 22 }, { dc: 38, ec: 22 }] },
  9:  { cap: 182, ecTotal: 22, blocks: [{ dc: 36,  ec: 22 }, { dc: 36, ec: 22 }, { dc: 36, ec: 22 }, { dc: 36, ec: 22 }, { dc: 36, ec: 22 }] },
  10: { cap: 216, ecTotal: 26, blocks: [{ dc: 43,  ec: 26 }, { dc: 43, ec: 26 }, { dc: 43, ec: 26 }, { dc: 43, ec: 26 }, { dc: 43, ec: 26 }] },
};

// Número de módulos de alineación por versión (posiciones centrales)
const ALIGN_POSITIONS: { [v: number]: number[] } = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
};

// ── Clase QR ──────────────────────────────────────────────────────────────────

export class QRCode {
  private version: number;
  private size: number;
  private modules: (boolean | null)[][];
  private isFunction: boolean[][];

  constructor(private text: string) {
    const bytes = this.encodeText(text);
    this.version = this.selectVersion(bytes.length);
    this.size = this.version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(null));
    this.isFunction = Array.from({ length: this.size }, () => new Array(this.size).fill(false));

    this.drawFunctionPatterns();
    const codewords = this.buildCodewords(bytes);
    this.drawCodewords(codewords);
    this.applyBestMask();
  }

  /** Devuelve la matriz boolean[fila][col]: true=negro, false=blanco */
  getMatrix(): boolean[][] {
    return this.modules.map(row => row.map(v => v === true));
  }

  /** Tamaño en módulos (sin quiet zone) */
  getSize(): number {
    return this.size;
  }

  private encodeText(text: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 128) {
        bytes.push(code);
      } else {
        // UTF-8 multi-byte
        const encoded = encodeURIComponent(text[i]).replace(/%/g, '');
        for (let j = 0; j < encoded.length; j += 2)
          bytes.push(parseInt(encoded.slice(j, j + 2), 16));
      }
    }
    return bytes;
  }

  private selectVersion(byteLen: number): number {
    for (let v = 1; v <= 10; v++) {
      if (VERSION_CAPS[v] && byteLen <= VERSION_CAPS[v].cap) return v;
    }
    throw new Error(`Texto demasiado largo para QR v10 (máx ~216 bytes). Longitud: ${byteLen}`);
  }

  // ── Patrones de función ───────────────────────────────────────────────────

  private setModule(r: number, c: number, dark: boolean) {
    this.modules[r][c] = dark;
    this.isFunction[r][c] = true;
  }

  private drawFunctionPatterns() {
    // Finder patterns + separadores
    for (const [r, c] of [[0, 0], [0, this.size - 7], [this.size - 7, 0]] as [number, number][]) {
      this.drawFinderPattern(r, c);
    }
    // Timing patterns
    for (let i = 8; i < this.size - 8; i++) {
      this.setModule(6, i, i % 2 === 0);
      this.setModule(i, 6, i % 2 === 0);
    }
    // Dark module
    this.setModule(this.size - 8, 8, true);
    // Alignment patterns
    const pos = ALIGN_POSITIONS[this.version] ?? [];
    for (const r of pos) {
      for (const c of pos) {
        if (!this.isFunction[r][c]) this.drawAlignmentPattern(r, c);
      }
    }
    // Format info (marcadores, se sobreescribe al aplicar máscara)
    this.drawFormatBits(0);
    // Version info (v >= 7)
    if (this.version >= 7) this.drawVersionBits();
  }

  private drawFinderPattern(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r, col = left + c;
        if (row < 0 || row >= this.size || col < 0 || col >= this.size) continue;
        const dark =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        this.setModule(row, col, dark);
      }
    }
  }

  private drawAlignmentPattern(cr: number, cc: number) {
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const dark = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        this.setModule(cr + r, cc + c, dark);
      }
    }
  }

  private drawFormatBits(mask: number) {
    // ECC level M = 0b00
    const data = (0b00 << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;

    // Lado izquierdo / arriba
    const positions = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    for (let i = 0; i < 15; i++) {
      const dark = ((bits >> (14 - i)) & 1) === 1;
      const [r, c] = positions[i];
      this.modules[r][c] = dark;
      this.isFunction[r][c] = true;
      // Copia
      if (i < 8) {
        this.modules[this.size - 1 - i][8] = dark;
        this.isFunction[this.size - 1 - i][8] = true;
      } else {
        this.modules[8][this.size - 15 + i] = dark;
        this.isFunction[8][this.size - 15 + i] = true;
      }
    }
  }

  private drawVersionBits() {
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >> i) & 1) === 1;
      const r = Math.floor(i / 3), c = i % 3 + this.size - 11;
      this.setModule(r, c, dark);
      this.setModule(c, r, dark);
    }
  }

  // ── Construcción de codewords ─────────────────────────────────────────────

  private buildCodewords(bytes: number[]): number[] {
    const info = VERSION_CAPS[this.version];
    const totalCap = info.blocks.reduce((s, b) => s + b.dc, 0);

    // Segmento modo Byte
    const bits: number[] = [];
    const pushBits = (val: number, len: number) => {
      for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
    };

    pushBits(0b0100, 4); // modo byte
    pushBits(bytes.length, 8); // longitud (v1-9: 8 bits)
    for (const b of bytes) pushBits(b, 8);
    pushBits(0b0000, 4); // terminador

    while (bits.length % 8 !== 0) bits.push(0);

    // Convertir a bytes
    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8)
      data.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

    // Padding
    const pads = [0xEC, 0x11];
    while (data.length < totalCap) data.push(pads[data.length % 2]);

    // Interleaving por bloques
    const dcBlocks: number[][] = [];
    const ecBlocks: number[][] = [];
    let offset = 0;
    for (const blk of info.blocks) {
      const dc = data.slice(offset, offset + blk.dc);
      dcBlocks.push(dc);
      ecBlocks.push(rsEncode(dc, blk.ec));
      offset += blk.dc;
    }

    const result: number[] = [];
    const maxDc = Math.max(...dcBlocks.map(b => b.length));
    for (let i = 0; i < maxDc; i++)
      for (const b of dcBlocks) if (i < b.length) result.push(b[i]);
    const maxEc = Math.max(...ecBlocks.map(b => b.length));
    for (let i = 0; i < maxEc; i++)
      for (const b of ecBlocks) if (i < b.length) result.push(b[i]);

    return result;
  }

  private drawCodewords(codewords: number[]) {
    let idx = 0;
    // Recorrer de derecha a izquierda en columnas de a 2
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // saltear timing
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const upward = ((right + 1) & 2) === 0;
          const row = upward ? this.size - 1 - vert : vert;
          const col = right - j;
          if (!this.isFunction[row][col] && idx < codewords.length * 8) {
            this.modules[row][col] = ((codewords[Math.floor(idx / 8)] >> (7 - (idx % 8))) & 1) === 1;
            idx++;
          }
        }
      }
    }
  }

  // ── Máscara ───────────────────────────────────────────────────────────────

  private applyBestMask() {
    let bestMask = 0, bestPenalty = Infinity;
    for (let m = 0; m < 8; m++) {
      this.applyMask(m);
      this.drawFormatBits(m);
      const p = this.calcPenalty();
      if (p < bestPenalty) { bestPenalty = p; bestMask = m; }
      this.applyMask(m); // revertir
    }
    this.applyMask(bestMask);
    this.drawFormatBits(bestMask);
  }

  private applyMask(mask: number) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.isFunction[r][c]) continue;
        let invert = false;
        switch (mask) {
          case 0: invert = (r + c) % 2 === 0; break;
          case 1: invert = r % 2 === 0; break;
          case 2: invert = c % 3 === 0; break;
          case 3: invert = (r + c) % 3 === 0; break;
          case 4: invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; break;
          case 5: invert = r * c % 2 + r * c % 3 === 0; break;
          case 6: invert = (r * c % 2 + r * c % 3) % 2 === 0; break;
          case 7: invert = ((r + c) % 2 + r * c % 3) % 2 === 0; break;
        }
        if (invert) this.modules[r][c] = !this.modules[r][c];
      }
    }
  }

  private calcPenalty(): number {
    let p = 0;
    const s = this.size;
    const m = this.modules;

    // Regla 1: runs de 5+ del mismo color
    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s - 4; c++) {
        const color = m[r][c];
        let run = 1;
        while (c + run < s && m[r][c + run] === color) run++;
        if (run >= 5) p += run - 2;
      }
    }
    for (let c = 0; c < s; c++) {
      for (let r = 0; r < s - 4; r++) {
        const color = m[r][c];
        let run = 1;
        while (r + run < s && m[r + run][c] === color) run++;
        if (run >= 5) p += run - 2;
      }
    }

    // Regla 2: bloques 2x2
    for (let r = 0; r < s - 1; r++)
      for (let c = 0; c < s - 1; c++)
        if (m[r][c] === m[r + 1][c] && m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c + 1])
          p += 3;

    // Regla 3: patrones finder-like
    const pat1 = [true, false, true, true, true, false, true, false, false, false, false];
    const pat2 = [...pat1].reverse();
    for (let r = 0; r < s; r++) {
      for (let c = 0; c <= s - 11; c++) {
        if (pat1.every((v, i) => m[r][c + i] === v) || pat2.every((v, i) => m[r][c + i] === v)) p += 40;
        if (pat1.every((v, i) => m[r + i]?.[c] === v) || pat2.every((v, i) => m[r + i]?.[c] === v)) p += 40;
      }
    }

    // Regla 4: proporción de módulos oscuros
    const total = s * s;
    const dark = m.flat().filter(Boolean).length;
    const pct = (dark / total) * 100;
    p += Math.abs(Math.round(pct / 5) * 5 - 50) * 2;

    return p;
  }
}

/**
 * Genera la matriz QR para el texto dado.
 * @returns matriz boolean[][] (true = negro)
 */
export function generateQRMatrix(text: string): boolean[][] {
  return new QRCode(text).getMatrix();
}

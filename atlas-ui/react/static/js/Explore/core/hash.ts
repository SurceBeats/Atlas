// atlas-ui/react/static/js/Explore/core/hash.ts
//
// Small, fast, platform-independent integer hashing. Everything spatial in /explore
// is derived from these functions, so they must stay bit-exact forever: changing one
// of them moves every star in every galaxy.

export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return fmix(h);
}

export function fmix(h: number): number {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// Combines a hash with an integer that may exceed 32 bits (system indices reach 1e11).
export function mix(h: number, value: number): number {
  const lo = value % 0x100000000 >>> 0;
  const hi = Math.floor(value / 0x100000000) >>> 0;
  h = fmix((h ^ Math.imul(lo, 0x9e3779b1)) >>> 0);
  h = fmix((h ^ Math.imul(hi + 0x632be5ab, 0x85ebca77)) >>> 0);
  return h;
}

export function mix3(h: number, a: number, b: number, c: number): number {
  return mix(mix(mix(h, a), b), c);
}

export function rand01(h: number): number {
  return h / 0x100000000;
}

// Approximately standard normal (Irwin-Hall with 4 terms), deterministic from a hash.
export function gauss(h: number): number {
  let s = 0;
  for (let i = 0; i < 4; i++) {
    h = fmix(h + 0x6d2b79f5 * (i + 1));
    s += rand01(h);
  }
  return (s - 2) * Math.sqrt(3);
}

export class SeededRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 1;
  }

  next(): number {
    this.state = fmix((this.state + 0x9e3779b9) >>> 0);
    return rand01(this.state);
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  gauss(): number {
    return gauss((this.next() * 0x100000000) >>> 0);
  }

  pick<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
}

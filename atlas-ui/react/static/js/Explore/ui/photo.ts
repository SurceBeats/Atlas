// atlas-ui/react/static/js/Explore/ui/photo.ts
//
// Photos: the frame on screen (as the explorer draws it, without the ship or the HUD)
// stamped in the look of the ship's instruments. Bottom left, where it was taken: the
// ATLAS3 wordmark, the place, the galaxy and its coordinates, the date. Bottom right, a
// QR code with the Stargate link to fly there. Saved as a PNG at the screen's resolution.

import QRCode from "qrcode";
import { readUniverseConfig } from "./universe.ts";

export interface PhotoPlace {
  title: string; // the deepest place in view: moon, planet, system or galaxy
  kind: string; // what it is ("Planet", "Star system"…)
  lines: string[]; // the places around it, outermost last (galaxy · coordinates)
  url: string | null; // Stargate link, or none (remote universes have no gates)
}

const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';
const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const CYAN = "103,232,249";

// The Core Continuum is the same universe everywhere: a photo taken on a local copy points
// its QR code at the public Atlas, which anyone can open. Other universes keep their host
const CORE_CONTINUUM_SEED = "1.618033988749895";
const PUBLIC_ATLAS = "https://the-atlas.koyeb.app";

export function photoOrigin(): string {
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  const config = readUniverseConfig();
  const core = config && !config.remote && String(config.seed_str) === CORE_CONTINUUM_SEED && new Date(config.cosmic_origin_time * 1000).getUTCFullYear() === 1986;
  return local && core ? PUBLIC_ATLAS : window.location.origin;
}

// Canvas text with tracking that works in every browser (ctx.letterSpacing does not yet)
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: "left" | "right" = "left") {
  const chars = [...text];
  const width = chars.reduce((sum, c) => sum + ctx.measureText(c).width, 0) + tracking * (chars.length - 1);
  let at = align === "right" ? x - width : x;
  ctx.textAlign = "left";
  for (const c of chars) {
    ctx.fillText(c, at, y);
    at += ctx.measureText(c).width + tracking;
  }
  return width;
}

function corners(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, arm: number, line: number) {
  ctx.strokeStyle = `rgba(${CYAN},0.6)`;
  ctx.lineWidth = line;
  ctx.beginPath();
  for (const [cx, cy, dx, dy] of [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]) {
    ctx.moveTo(cx, cy + dy * arm);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * arm, cy);
  }
  ctx.stroke();
}

async function qrCanvas(url: string, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, { width: size, margin: 1, errorCorrectionLevel: "M", color: { dark: "#02040a", light: "#ffffff" } });
  return canvas;
}

export async function composePhoto(frame: HTMLCanvasElement, place: PhotoPlace, when = new Date()): Promise<Blob> {
  const W = frame.width;
  const H = frame.height;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(frame, 0, 0);

  // One unit: an 800th of the short side, so the stamp reads the same on a phone
  const u = Math.min(W, H) / 800;
  const margin = Math.round(34 * u);
  ctx.textBaseline = "alphabetic";

  // A faint shade along the bottom, so the stamp reads over bright skies
  const shade = ctx.createLinearGradient(0, H, 0, H - 260 * u);
  shade.addColorStop(0, "rgba(0,0,0,0.5)");
  shade.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, H - 260 * u, W, 260 * u);

  // ---- bottom left: where ----------------------------------------------------------
  let y = H - margin;
  ctx.font = `${Math.round(11 * u)}px ${MONO}`;
  // Readable over bright nebulae and stars too
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 6 * u;
  ctx.fillStyle = "rgba(203,213,225,0.8)";
  const date = when.toISOString().slice(0, 16).replace("T", " · ");
  spaced(ctx, `${date} UTC`.toUpperCase(), margin, y, 2.6 * u);
  y -= 22 * u;
  ctx.fillStyle = `rgba(${CYAN},0.78)`;
  for (const line of place.lines) {
    spaced(ctx, line.toUpperCase(), margin, y, 2.6 * u);
    y -= 19 * u;
  }
  y -= 6 * u;
  ctx.font = `500 ${Math.round(24 * u)}px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10 * u;
  ctx.fillText(place.title, margin, y);
  ctx.shadowBlur = 0;
  y -= 30 * u;
  ctx.font = `${Math.round(10.5 * u)}px ${MONO}`;
  ctx.fillStyle = `rgba(${CYAN},0.85)`;
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 6 * u;
  spaced(ctx, place.kind.toUpperCase(), margin, y, 3.4 * u);
  y -= 30 * u;
  // The wordmark, its 3 lit
  ctx.font = `700 ${Math.round(22 * u)}px ${SANS}`;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  const atlas = spaced(ctx, "ATLAS", margin, y, 11 * u);
  ctx.fillStyle = "#67e8f9";
  ctx.shadowColor = "rgba(34,211,238,0.9)";
  ctx.shadowBlur = 14 * u;
  ctx.fillText("3", margin + atlas + 11 * u, y);
  ctx.shadowBlur = 0;

  // ---- bottom right: the gate --------------------------------------------------------
  if (place.url) {
    const size = Math.round(Math.max(96, 150 * u));
    const pad = Math.round(10 * u);
    const caption = Math.round(26 * u);
    const w = size + pad * 2;
    const h = size + pad * 2 + caption;
    const x = W - margin - w;
    const top = H - margin - h;
    ctx.fillStyle = "rgba(2,4,10,0.72)";
    ctx.beginPath();
    ctx.roundRect(x, top, w, h, 10 * u);
    ctx.fill();
    ctx.strokeStyle = `rgba(${CYAN},0.25)`;
    ctx.lineWidth = Math.max(1, u);
    ctx.stroke();
    corners(ctx, x - 6 * u, top - 6 * u, w + 12 * u, h + 12 * u, 12 * u, Math.max(1, 1.2 * u));
    const qr = await qrCanvas(place.url, size);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + pad, top + pad, size, size, 6 * u);
    ctx.clip();
    ctx.drawImage(qr, x + pad, top + pad, size, size);
    ctx.restore();
    ctx.font = `${Math.round(9.5 * u)}px ${MONO}`;
    ctx.fillStyle = `rgba(${CYAN},0.8)`;
    const label = "SCAN TO FLY HERE";
    ctx.textBaseline = "middle";
    const width = [...label].reduce((sum, c) => sum + ctx.measureText(c).width, 0) + 2.4 * u * (label.length - 1);
    spaced(ctx, label, x + (w - width) / 2, top + pad + size + caption / 2 + pad / 2, 2.4 * u);
    ctx.textBaseline = "alphabetic";
  }

  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The photo could not be encoded"))), "image/png"));
}

// Saved as a download; on phones that can share files, through the share sheet (so it
// can go straight to the camera roll)
export async function savePhoto(blob: Blob, name: string) {
  const file = new File([blob], name, { type: "image/png" });
  const touch = window.matchMedia?.("(pointer: coarse)").matches;
  if (touch && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "The Atlas" });
      return;
    } catch {
      // Dismissed, or not allowed here: fall back to a download
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

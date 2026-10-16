// atlas-ui/react/static/js/Explore/engine/ShipView.ts
//
// The ship seen from the chase camera, in a sober, engineered style with aircraft-style
// navigation lights: red to port, green to starboard, white strobes. Two craft:
//
//   saucer        a disc: panelled gunmetal hull, smoked canopy, landing pods and a
//                 ventral drive ring
//   interceptor   a delta wing: a long pointed fuselage, a smoked canopy, canted twin
//                 fins and two engines whose nozzles (all the chase camera sees of them)
//                 glow and stream exhaust under thrust; it banks harder than the saucer
//
// It lives in its own small scene drawn on top of everything else, so it looks the same
// whether the universe around it is measured in light years, AU or planet radii. The
// key light comes from the nearest star (or the galactic core), so it has a lit side
// and a dark one. It banks into turns, dips its nose under thrust and shakes in warp.

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type ShipKind = "saucer" | "interceptor";
export const SHIP_KINDS: ShipKind[] = ["saucer", "interceptor"];

// One craft: its meshes, its lights, how its drive shows, and how it handles
interface ShipModel {
  group: THREE.Group;
  port: THREE.Mesh;
  starboard: THREE.Mesh;
  strobes: THREE.Mesh[];
  drive: (t: number, thrust: number, warp: number) => void;
  disposables: Array<{ dispose: () => void }>;
  bank: number; // roll per rad/s of turn
  maxBank: number;
  scale: number;
}

export interface ShipMotion {
  yawRate: number; // rad/s the view is turning
  pitchRate: number;
  thrust: number; // 0..1
  // Flying by hand: sliding sideways (-1 left .. 1 right) and climbing (-1 .. 1)
  strafe?: number;
  climb?: number;
  warp: number; // 0..1
  visible: boolean;
  // Direction towards the main light, in camera space (camera looks down -z)
  light?: THREE.Vector3;
  // Lowest point the ship may reach, as a fraction of the view height from the top
  // (the top of the console), so the cockpit UI never covers it
  floor?: number;
}

const BASE_SCALE = 0.42;
const DEPTH = 8;

// Hull profile (radius, height): sharp outer edge, stepped upper hull, flat belly
const PROFILE: Array<[number, number]> = [
  [0, -0.12],
  [0.3, -0.12],
  [0.34, -0.1],
  [0.7, -0.075],
  [0.94, -0.025],
  [1.0, -0.004],
  [1.0, 0.004],
  [0.94, 0.03],
  [0.72, 0.075],
  [0.7, 0.088],
  [0.46, 0.115],
  [0.42, 0.13],
  [0, 0.13],
];

// The ship's name, etched small into the inner deck next to the canopy, facing the
// chase camera: polished metal on brushed metal, seen by how it catches the light
// rather than by colour. The lathe puts u = 0 (and 1) on the side nearest the camera,
// so the word is drawn across that seam, once at each end of the texture. The inner
// deck runs from the step (v = 0.75) to the canopy (v ≈ 0.83), canvas rows h·(1 − v)
const LETTERING = "SPACEX";

function paintLettering(c: CanvasRenderingContext2D, r: CanvasRenderingContext2D, w: number, h: number) {
  const y = h * (1 - 0.79);
  const size = h * 0.036;
  // Near the canopy one texel spans about three times more hull along the profile
  // than around it: widen the letters by as much to keep them square
  const stretch = 3;
  const tracking = size * 0.7;
  const draw = (ctx: CanvasRenderingContext2D, fill: string) => {
    ctx.save();
    ctx.font = `700 ${size}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = fill;
    const widths = LETTERING.split("").map((ch) => ctx.measureText(ch).width * stretch + tracking);
    const total = widths.reduce((a, b) => a + b, 0) - tracking;
    for (const centre of [0, w]) {
      let x = centre - total / 2;
      LETTERING.split("").forEach((ch, i) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(stretch, 1);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        x += widths[i];
      });
    }
    ctx.restore();
  };
  // A faint lift in tone, and much smoother than the plates around it: the letters
  // show up in the reflections, not as paint
  draw(c, "rgba(196,204,214,0.42)");
  draw(r, "rgba(20,20,20,0.85)");
}

// Hull skin: panel seams (radial and concentric), slight tonal variation and wear.
// The lathe maps u around the hull and v along the profile, from the belly up.
function hullTextures(): { map: THREE.Texture; roughness: THREE.Texture } {
  // Drawn in 1024 × 256 coordinates on a canvas twice as fine, so the small lettering
  // stays crisp
  const w = 1024;
  const h = 256;
  const RESOLUTION = 2;
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * RESOLUTION;
    canvas.height = h * RESOLUTION;
    return canvas;
  };
  const colorCanvas = make();
  const roughCanvas = make();
  const c = colorCanvas.getContext("2d")!;
  const r = roughCanvas.getContext("2d")!;
  c.scale(RESOLUTION, RESOLUTION);
  r.scale(RESOLUTION, RESOLUTION);
  let seed = 1337;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  c.fillStyle = "#5d636c";
  c.fillRect(0, 0, w, h);
  r.fillStyle = "#6a6a6a";
  r.fillRect(0, 0, w, h);

  // Concentric rings of panels, each ring split into plates of slightly different tone
  const rings = [0, 34, 70, 118, 150, 190, 222, 256];
  for (let i = 0; i < rings.length - 1; i++) {
    const plates = 12 + i * 6;
    for (let p = 0; p < plates; p++) {
      const x0 = (p / plates) * w;
      const tone = 84 + Math.floor(rand() * 18);
      c.fillStyle = `rgb(${tone},${tone + 4},${tone + 10})`;
      c.fillRect(x0, rings[i], w / plates, rings[i + 1] - rings[i]);
      const rough = 90 + Math.floor(rand() * 50);
      r.fillStyle = `rgb(${rough},${rough},${rough})`;
      r.fillRect(x0, rings[i], w / plates, rings[i + 1] - rings[i]);
    }
  }
  // Seams
  c.strokeStyle = "rgba(20,22,26,0.9)";
  r.strokeStyle = "rgba(220,220,220,1)";
  for (const ctx of [c, r]) {
    ctx.lineWidth = 2;
    for (const y of rings) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }
  for (let i = 0; i < rings.length - 1; i++) {
    const plates = 12 + i * 6;
    for (let p = 0; p < plates; p++) {
      const x = (p / plates) * w;
      for (const ctx of [c, r]) {
        ctx.beginPath();
        ctx.moveTo(x, rings[i]);
        ctx.lineTo(x, rings[i + 1]);
        ctx.stroke();
      }
    }
  }
  // Fine streaks of wear, a little darker and rougher
  for (let i = 0; i < 1400; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 4 + rand() * 30;
    c.fillStyle = `rgba(30,32,36,${0.04 + rand() * 0.08})`;
    c.fillRect(x, y, len, 1);
    r.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.1})`;
    r.fillRect(x, y, len, 1);
  }

  paintLettering(c, r, w, h);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.anisotropy = 4;
  return { map, roughness };
}

// Plate seams for the interceptor, mapped across its planform (x, z)
function plateTextures(): { map: THREE.Texture; roughness: THREE.Texture } {
  const size = 512;
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    return canvas;
  };
  const colorCanvas = make();
  const roughCanvas = make();
  const c = colorCanvas.getContext("2d")!;
  const r = roughCanvas.getContext("2d")!;
  let seed = 4242;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cell = size / 8;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const tone = 86 + Math.floor(rand() * 16);
      c.fillStyle = `rgb(${tone},${tone + 4},${tone + 10})`;
      c.fillRect(x * cell, y * cell, cell, cell);
      const rough = 80 + Math.floor(rand() * 50);
      r.fillStyle = `rgb(${rough},${rough},${rough})`;
      r.fillRect(x * cell, y * cell, cell, cell);
    }
  c.strokeStyle = "rgba(20,22,26,0.85)";
  r.strokeStyle = "rgba(220,220,220,1)";
  for (const ctx of [c, r]) {
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, size);
      ctx.moveTo(0, i * cell);
      ctx.lineTo(size, i * cell);
      ctx.stroke();
    }
  }
  for (let i = 0; i < 500; i++) {
    c.fillStyle = `rgba(30,32,36,${0.05 + rand() * 0.08})`;
    c.fillRect(rand() * size, rand() * size, 1, 3 + rand() * 18);
  }
  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  const roughness = new THREE.CanvasTexture(roughCanvas);
  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
  return { map, roughness };
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.3, "rgba(255,255,255,0.3)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Navigation lights on a craft
function lamps(group: THREE.Group, disposables: Array<{ dispose: () => void }>, port: THREE.Vector3, starboard: THREE.Vector3, strobes: THREE.Vector3[]) {
  const geometry = new THREE.SphereGeometry(0.022, 10, 8);
  disposables.push(geometry);
  const make = (color: number, at: THREE.Vector3) => {
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(at);
    group.add(mesh);
    disposables.push(material);
    return mesh;
  };
  return { port: make(0xff2a1a, port), starboard: make(0x1aff5a, starboard), strobes: strobes.map((at) => make(0xffffff, at)) };
}

function buildSaucer(): ShipModel {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const { map, roughness } = hullTextures();
  const geometry = new THREE.LatheGeometry(
    PROFILE.map(([r, y]) => new THREE.Vector2(r, y)),
    128
  );
  const material = new THREE.MeshStandardMaterial({ map, roughnessMap: roughness, color: 0xffffff, metalness: 0.85, roughness: 0.55, envMapIntensity: 1 });
  group.add(new THREE.Mesh(geometry, material));

  // Recessed dark band along the edge
  const bandGeometry = new THREE.TorusGeometry(0.97, 0.012, 8, 128);
  const bandMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1d22, metalness: 0.6, roughness: 0.6 });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.012;
  group.add(band);
  disposables.push(map, roughness, geometry, material, bandGeometry, bandMaterial);

  // Low smoked-glass canopy: reflects the surroundings, shows nothing inside
  const canopyGeometry = new THREE.SphereGeometry(0.4, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const canopyMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0b1118, metalness: 0.2, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2 });
  const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy.scale.y = 0.42;
  canopy.position.y = 0.128;
  group.add(canopy);
  // Thin frame where the canopy meets the hull
  const frameGeometry = new THREE.TorusGeometry(0.4, 0.008, 8, 96);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2e35, metalness: 0.8, roughness: 0.4 });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.rotation.x = Math.PI / 2;
  frame.position.y = 0.13;
  group.add(frame);
  disposables.push(canopyGeometry, canopyMaterial, frameGeometry, frameMaterial);

  // Three landing pods
  const podGeometry = new THREE.SphereGeometry(0.075, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const podMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.85, roughness: 0.45 });
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const pod = new THREE.Mesh(podGeometry, podMaterial);
    pod.position.set(Math.cos(angle) * 0.56, -0.088, Math.sin(angle) * 0.56);
    group.add(pod);
  }

  // Drive ring under the belly and its glow
  const driveGeometry = new THREE.TorusGeometry(0.22, 0.016, 10, 64);
  const driveMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const ring = new THREE.Mesh(driveGeometry, driveMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.122;
  group.add(ring);
  const glowMap = glowTexture();
  const glowMaterial = new THREE.SpriteMaterial({ map: glowMap, color: 0x9fd8ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const glow = new THREE.Sprite(glowMaterial);
  glow.position.y = -0.16;
  group.add(glow);
  disposables.push(podGeometry, podMaterial, driveGeometry, driveMaterial, glowMap, glowMaterial);

  const lights = lamps(group, disposables, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(1, 0, 0), [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.14, 0.05), new THREE.Vector3(0, -0.13, 0)]);
  return {
    group,
    ...lights,
    disposables,
    bank: 0.3,
    maxBank: 0.45,
    scale: 1,
    drive: (t, thrust, warp) => {
      const level = 0.15 + 0.85 * thrust + 0.04 * Math.sin(t * 7);
      driveMaterial.color.setRGB(0.35 * level, 0.8 * level, 1.2 * level);
      glow.scale.setScalar(0.4 + 1.1 * thrust + 0.5 * warp);
      glowMaterial.opacity = 0.15 + 0.6 * thrust;
    },
  };
}

// The interceptor, nose away from the camera (-z), engines towards it (+z)
function buildInterceptor(): ShipModel {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const { map, roughness } = plateTextures();
  const metal = new THREE.MeshStandardMaterial({ map, roughnessMap: roughness, color: 0xffffff, metalness: 0.85, roughness: 0.5, envMapIntensity: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1e23, metalness: 0.7, roughness: 0.55 });
  disposables.push(map, roughness, metal, dark);

  // Delta wing: a thin slab with bevelled edges, swept back from just behind the nose
  const planform = new THREE.Shape();
  planform.moveTo(0, -0.62);
  planform.lineTo(0.8, 0.52);
  planform.lineTo(0.8, 0.64);
  planform.lineTo(0.3, 0.7);
  planform.lineTo(-0.3, 0.7);
  planform.lineTo(-0.8, 0.64);
  planform.lineTo(-0.8, 0.52);
  planform.closePath();
  const wingGeometry = new THREE.ExtrudeGeometry(planform, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.018, bevelSegments: 2 });
  wingGeometry.rotateX(Math.PI / 2);
  wingGeometry.translate(0, 0.0175, 0);
  // Plates mapped across the planform
  const uv = wingGeometry.getAttribute("uv") as THREE.BufferAttribute;
  const pos = wingGeometry.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) * 1.6, pos.getZ(i) * 1.6);
  const wing = new THREE.Mesh(wingGeometry, metal);
  group.add(wing);
  disposables.push(wingGeometry);

  // "PLD" on both wings (in honour of PLD Space), read from the chase camera: polished
  // metal on the plates, seen by how it catches the light like the saucer's lettering
  const decalCanvas = document.createElement("canvas");
  decalCanvas.width = 512;
  decalCanvas.height = 160;
  const dc = decalCanvas.getContext("2d")!;
  dc.font = `800 118px "Helvetica Neue", Arial, sans-serif`;
  dc.textAlign = "center";
  dc.textBaseline = "middle";
  dc.fillStyle = "#ffffff";
  const letters = "PLD".split("");
  const spacing = 150;
  letters.forEach((ch, i) => dc.fillText(ch, 256 + (i - 1) * spacing, 84));
  const decalMap = new THREE.CanvasTexture(decalCanvas);
  decalMap.colorSpace = THREE.SRGBColorSpace;
  decalMap.anisotropy = 4;
  // (seen almost edge-on from the chase camera: brighter and less metallic than the
  // plates around it, so it stays legible in shadow too)
  const decalMaterial = new THREE.MeshStandardMaterial({ map: decalMap, color: 0xe8edf2, emissive: 0x2a3038, emissiveMap: decalMap, transparent: true, metalness: 0.4, roughness: 0.35, envMapIntensity: 1.2, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  const decalGeometry = new THREE.PlaneGeometry(0.4, 0.15);
  decalGeometry.rotateX(-Math.PI / 2);
  disposables.push(decalMap, decalMaterial, decalGeometry);
  for (const side of [-1, 1]) {
    const decal = new THREE.Mesh(decalGeometry, decalMaterial);
    decal.position.set(side * 0.5, 0.0365, 0.42);
    group.add(decal);
  }

  // Fuselage: a long body of revolution, flattened, with a sharp nose
  const body = [
    [0, -1.18],
    [0.045, -1.06],
    [0.1, -0.8],
    [0.14, -0.45],
    [0.155, -0.05],
    [0.15, 0.45],
    [0.13, 0.72],
    [0.1, 0.8],
    [0, 0.8],
  ].map(([r, z]) => new THREE.Vector2(r, z));
  const bodyGeometry = new THREE.LatheGeometry(body, 48);
  bodyGeometry.rotateX(Math.PI / 2);
  bodyGeometry.scale(1, 0.62, 1);
  const fuselage = new THREE.Mesh(bodyGeometry, metal);
  group.add(fuselage);
  disposables.push(bodyGeometry);

  // Smoked canopy, long and low, forward on the spine
  const canopyGeometry = new THREE.SphereGeometry(0.1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const canopyMaterial = new THREE.MeshPhysicalMaterial({ color: 0x0b1118, metalness: 0.2, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2 });
  const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
  canopy.scale.set(0.95, 0.75, 3.4);
  canopy.position.set(0, 0.07, -0.42);
  group.add(canopy);
  disposables.push(canopyGeometry, canopyMaterial);

  // Dark intakes along the wing roots
  const intakeGeometry = new THREE.BoxGeometry(0.07, 0.05, 0.32);
  for (const side of [-1, 1]) {
    const intake = new THREE.Mesh(intakeGeometry, dark);
    intake.position.set(side * 0.2, 0.035, -0.05);
    group.add(intake);
  }
  disposables.push(intakeGeometry);

  // Twin fins, canted outwards
  const fin = new THREE.Shape();
  fin.moveTo(0, 0);
  fin.lineTo(0.3, 0);
  fin.lineTo(0.3, 0.06);
  fin.lineTo(0.08, 0.24);
  fin.closePath();
  const finGeometry = new THREE.ExtrudeGeometry(fin, { depth: 0.014, bevelEnabled: false });
  finGeometry.rotateY(-Math.PI / 2);
  disposables.push(finGeometry);
  for (const side of [-1, 1]) {
    const mesh = new THREE.Mesh(finGeometry, metal);
    mesh.position.set(side * 0.24, 0.03, 0.4);
    mesh.rotation.z = -side * 0.35;
    group.add(mesh);
  }

  // Engines: nacelles, nozzles facing the camera, a hot disc inside each, a glow and an
  // exhaust plume that stretches with thrust
  const nacelleGeometry = new THREE.CylinderGeometry(0.08, 0.095, 0.7, 32);
  nacelleGeometry.rotateX(Math.PI / 2);
  const nozzleGeometry = new THREE.CylinderGeometry(0.1, 0.085, 0.09, 32, 1, true);
  nozzleGeometry.rotateX(Math.PI / 2);
  const coreGeometry = new THREE.CircleGeometry(0.078, 32);
  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const glowMap = glowTexture();
  const glowMaterial = new THREE.SpriteMaterial({ map: glowMap, color: 0x8fd0ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  // The plume: a cone, brightest at the nozzle and fading along its length
  const plumeGeometry = new THREE.ConeGeometry(0.07, 1, 24, 1, true);
  plumeGeometry.rotateX(-Math.PI / 2);
  plumeGeometry.translate(0, 0, 0.5);
  const plumeMaterial = new THREE.ShaderMaterial({
    uniforms: { uLevel: { value: 0 }, uTime: { value: 0 } },
    vertexShader: "varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform float uLevel; uniform float uTime; varying vec3 vPos;
      void main() {
        float along = clamp(vPos.z, 0.0, 1.0);
        float flicker = 0.85 + 0.15 * sin(uTime * 40.0 + along * 30.0);
        vec3 color = mix(vec3(0.75, 0.92, 1.0), vec3(0.15, 0.4, 1.0), along) * pow(1.0 - along, 1.6) * uLevel * flicker;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  disposables.push(nacelleGeometry, nozzleGeometry, coreGeometry, coreMaterial, glowMap, glowMaterial, plumeGeometry, plumeMaterial);
  const glows: THREE.Sprite[] = [];
  const plumes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const x = side * 0.24;
    const nacelle = new THREE.Mesh(nacelleGeometry, metal);
    nacelle.position.set(x, 0.015, 0.42);
    group.add(nacelle);
    const nozzle = new THREE.Mesh(nozzleGeometry, dark);
    nozzle.position.set(x, 0.015, 0.8);
    group.add(nozzle);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(x, 0.015, 0.8);
    group.add(core);
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.set(x, 0.015, 0.86);
    group.add(glow);
    glows.push(glow);
    const plume = new THREE.Mesh(plumeGeometry, plumeMaterial);
    plume.position.set(x, 0.015, 0.83);
    group.add(plume);
    plumes.push(plume);
  }

  const lights = lamps(group, disposables, new THREE.Vector3(-0.81, 0, 0.58), new THREE.Vector3(0.81, 0, 0.58), [new THREE.Vector3(0, 0.07, 0.7), new THREE.Vector3(0, -0.06, 0.1)]);
  return {
    group,
    ...lights,
    disposables,
    bank: 0.5,
    maxBank: 0.75,
    scale: 0.95,
    drive: (t, thrust, warp) => {
      const level = 0.25 + 0.75 * thrust + 0.05 * Math.sin(t * 9) + 0.4 * warp;
      coreMaterial.color.setRGB(0.55 * level, 0.85 * level, 1.3 * level);
      for (const glow of glows) glow.scale.setScalar(0.22 + 0.45 * thrust + 0.35 * warp);
      glowMaterial.opacity = 0.35 + 0.55 * Math.min(1, thrust + warp);
      plumeMaterial.uniforms.uLevel.value = 0.25 + 1.4 * thrust + 1.2 * warp;
      plumeMaterial.uniforms.uTime.value = t;
      for (const plume of plumes) plume.scale.set(1, 1, 0.25 + 1.6 * thrust + 2.2 * warp);
    },
  };
}

const BUILDERS: Record<ShipKind, () => ShipModel> = { saucer: buildSaucer, interceptor: buildInterceptor };

export class ShipView {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private ship = new THREE.Group();
  private model: ShipModel | null = null;
  private kind: ShipKind | null = null;
  private key: THREE.DirectionalLight;
  private disposables: Array<{ dispose: () => void }> = [];
  private time = 0;
  private roll = 0;
  private pitch = 0;
  private thrust = 0;
  private baseY = -0.77;
  private lightDirection = new THREE.Vector3(-0.5, 0.6, 0.6).normalize();
  // 0 hidden .. 1 in place; it drops out of view instead of popping
  private presence = 0;

  constructor(renderer: THREE.WebGLRenderer, kind: ShipKind = "saucer") {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environment = environment;
    this.scene.environmentIntensity = 0.35;
    this.disposables.push(environment);

    // Starlight, a faint fill from the galaxy around, and a cool rim to keep the
    // silhouette readable on the night side
    this.key = new THREE.DirectionalLight(0xfff4e6, 2.6);
    const fill = new THREE.HemisphereLight(0x9fb4d8, 0x0c0e14, 0.25);
    const rim = new THREE.DirectionalLight(0x8fb8ff, 0.5);
    rim.position.set(0.5, 0.4, -3);
    this.scene.add(this.key, this.key.target, fill, rim);

    this.scene.add(this.ship);
    this.setKind(kind);
  }

  // Swap the craft in place
  setKind(kind: ShipKind) {
    if (kind === this.kind || !BUILDERS[kind]) return;
    if (this.model) {
      this.ship.remove(this.model.group);
      this.model.disposables.forEach((d) => d.dispose());
    }
    this.kind = kind;
    this.model = BUILDERS[kind]();
    this.ship.add(this.model.group);
  }

  get visible() {
    return this.presence > 0.005;
  }

  update(dt: number, aspect: number, motion: ShipMotion) {
    const model = this.model!;
    this.time += dt;
    const t = this.time;
    const ease = (current: number, target: number, rate: number) => current + (target - current) * Math.min(1, dt * rate);

    this.presence = ease(this.presence, motion.visible ? 1 : 0, 3);
    this.thrust = ease(this.thrust, motion.thrust, 2.5);
    // Bank into turns and into sideways slides; lift / dip with the view and when climbing
    const strafeBank = -(motion.strafe ?? 0) * model.maxBank * 0.85;
    this.roll = ease(this.roll, THREE.MathUtils.clamp(motion.yawRate * model.bank + strafeBank, -model.maxBank, model.maxBank), 3);
    this.pitch = ease(this.pitch, THREE.MathUtils.clamp(-motion.pitchRate * 0.2 - (motion.climb ?? 0) * 0.22, -0.3, 0.3), 3);

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    // Key light from the star: eased so it does not snap when the frame changes
    if (motion.light && motion.light.lengthSq() > 0) this.lightDirection.lerp(motion.light.clone().normalize(), Math.min(1, dt * 2)).normalize();
    this.key.position.copy(this.lightDirection).multiplyScalar(10).add(this.ship.position);
    this.key.target.position.copy(this.ship.position);

    // Low in the frame, slightly from above so the canopy reads, and above the console
    const halfHeight = DEPTH * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const floorY = halfHeight * (1 - 2 * (motion.floor ?? 1)); // view units at DEPTH
    const shipHalf = 0.22 * BASE_SCALE * 2.4; // half the on-screen height, with a margin
    this.baseY = ease(this.baseY, Math.max(-halfHeight * 0.36, floorY + shipHalf), 4);
    const shake = motion.warp * 0.012;
    const drop = (1 - this.presence) * halfHeight * 1.2;
    this.ship.position.set(
      (Math.random() - 0.5) * shake,
      this.baseY + Math.sin(t * 0.8) * 0.012 - drop + (Math.random() - 0.5) * shake,
      -DEPTH - this.thrust * 1.2
    );
    this.ship.scale.setScalar(BASE_SCALE * model.scale);
    this.ship.rotation.set(0.3 + this.thrust * 0.1 + this.pitch, 0, this.roll + Math.sin(t * 0.6) * 0.008);

    // Steady nav lights, double-flash strobes once a second
    const cycle = t % 1.2;
    const flash = cycle < 0.05 || (cycle > 0.15 && cycle < 0.2) ? 1 : 0;
    for (const strobe of model.strobes) (strobe.material as THREE.MeshBasicMaterial).color.setScalar(0.08 + 2.5 * flash);
    (model.port.material as THREE.MeshBasicMaterial).color.setRGB(2.2, 0.15, 0.08);
    (model.starboard.material as THREE.MeshBasicMaterial).color.setRGB(0.1, 2.0, 0.35);

    model.drive(t, this.thrust, motion.warp);
  }

  dispose() {
    this.model?.disposables.forEach((d) => d.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.scene.clear();
  }
}

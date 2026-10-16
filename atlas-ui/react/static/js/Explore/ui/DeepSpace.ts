// atlas-ui/react/static/js/Explore/ui/DeepSpace.ts
//
// The space behind the front door: the ship adrift between the stars.
//   - a nebula, a slow turbulence of gas lit cyan and violet, with dark dust lanes
//   - a spiral galaxy far ahead, turning
//   - stars streaming towards the camera; at speed each one draws its own streak
// The view leans after the pointer, as if looking round from the cockpit. Hovering the
// dive button eases the ship forward; accelerate() is the dive itself, ramping up to the
// jump into hyperspace.

import * as THREE from "three";

const STAR_COUNT = 2200;
const FIELD_DEPTH = 60;
const FIELD_SPREAD = 26;

const BACKDROP_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BACKDROP_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  uniform float uZoom;
  uniform vec2 uLook;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // A spiral galaxy: two logarithmic arms of stars and dust round a bright core
  vec3 galaxy(vec2 p) {
    float r = length(p);
    float a = atan(p.y, p.x) - uTime * 0.03;
    float arms = pow(0.5 + 0.5 * cos(2.0 * (a - log(max(r, 1e-3)) * 2.6)), 3.0);
    float disk = exp(-r * 5.5);
    float grain = 0.6 + 0.4 * noise(p * 60.0);
    vec3 col = vec3(0.55, 0.7, 1.0) * arms * disk * grain * 1.1;
    col += vec3(1.0, 0.82, 0.6) * exp(-r * r * 160.0) * 1.4;
    return col;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 q = p / uZoom + uLook;
    // Nebula: warped turbulence, two lights (cyan, violet) and dark dust
    vec2 w = vec2(fbm(q * 1.4 + uTime * 0.012), fbm(q * 1.4 + vec2(5.2, 1.3) - uTime * 0.01));
    float gas = fbm(q * 1.8 + w * 1.6);
    float glow = smoothstep(0.42, 0.85, gas);
    vec3 col = mix(vec3(0.004, 0.01, 0.025), vec3(0.03, 0.17, 0.26), glow);
    col = mix(col, vec3(0.24, 0.08, 0.32), smoothstep(0.55, 0.9, fbm(q * 2.6 - w + 3.0)) * 0.7);
    float dust = smoothstep(0.45, 0.7, fbm(q * 3.4 + w * 2.0 + 8.0));
    col *= 1.0 - dust * 0.7;
    // Faint background stars, fixed to the sky
    vec2 cell = floor(q * 260.0);
    float star = step(0.9975, hash(cell)) * (0.4 + 0.6 * hash(cell + 3.0));
    col += vec3(0.8, 0.88, 1.0) * star * 0.5;
    // The galaxy, far ahead and a little off centre (above the title on a tall screen)
    vec2 spot = uAspect >= 1.0 ? vec2(0.28, 0.12) : vec2(0.06, 0.3);
    vec2 g = (q - spot) * mat2(0.94, -0.34, 0.34, 0.94) * vec2(1.0, 2.2);
    col += galaxy(g * 1.6) * 0.9;
    // A vignette that tightens as the ship speeds up
    float r = length(p);
    col *= 1.0 - smoothstep(0.35, 1.0, r) * (0.55 + 0.35 * uSpeed);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class DeepSpace {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(70, 1, 0.05, 200);
  private backdrop: THREE.ShaderMaterial;
  private stars: Float32Array; // x, y, z per star
  private brightness: Float32Array;
  private points: THREE.Points;
  private streaks: THREE.LineSegments;
  private frame = 0;
  private last = performance.now();
  private start = performance.now();
  private speed = 1.2;
  private anticipation = 0;
  private dive: { start: number; seconds: number } | null = null;
  private look = new THREE.Vector2();
  private lookTarget = new THREE.Vector2();
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.autoClear = false;
    this.renderer.domElement.style.display = "block";
    container.appendChild(this.renderer.domElement);

    this.backdrop = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uAspect: { value: 1 }, uZoom: { value: 1 }, uLook: { value: new THREE.Vector2() }, uSpeed: { value: 0 } },
      vertexShader: BACKDROP_VERTEX,
      fragmentShader: BACKDROP_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.backdrop);
    backdrop.frustumCulled = false;
    backdrop.renderOrder = -1;
    this.scene.add(backdrop);

    // Stars: a head point each, and a streak behind it (two vertices per star)
    this.stars = new Float32Array(STAR_COUNT * 3);
    this.brightness = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) this.respawn(i, -Math.random() * FIELD_DEPTH);
    const heads = new THREE.BufferGeometry();
    heads.setAttribute("position", new THREE.BufferAttribute(new Float32Array(STAR_COUNT * 3), 3));
    heads.setAttribute("color", new THREE.BufferAttribute(new Float32Array(STAR_COUNT * 3), 3));
    this.points = new THREE.Points(
      heads,
      new THREE.PointsMaterial({ size: 0.11, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, map: starSprite() })
    );
    this.points.frustumCulled = false;
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(new Float32Array(STAR_COUNT * 6), 3));
    lines.setAttribute("color", new THREE.BufferAttribute(new Float32Array(STAR_COUNT * 6), 3));
    this.streaks = new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.streaks.frustumCulled = false;
    this.scene.add(this.points, this.streaks);

    window.addEventListener("pointermove", this.onPointer);
    window.addEventListener("resize", this.resize);
    this.resize();
    this.frame = requestAnimationFrame(this.render);
  }

  // Leaning towards the dive button: the ship eases forward
  setAnticipation(amount: number) {
    this.anticipation = amount;
  }

  // The dive: full throttle for `seconds`
  accelerate(seconds: number) {
    this.dive = { start: performance.now(), seconds };
  }

  private respawn(i: number, z: number) {
    // Not straight down the axis: the centre stays clear for the destination
    let x = 0;
    let y = 0;
    do {
      x = (Math.random() * 2 - 1) * FIELD_SPREAD;
      y = (Math.random() * 2 - 1) * FIELD_SPREAD;
    } while (x * x + y * y < 1.2);
    this.stars[i * 3] = x;
    this.stars[i * 3 + 1] = y;
    this.stars[i * 3 + 2] = z;
    this.brightness[i] = 0.35 + Math.random() * 0.65;
  }

  private onPointer = (e: PointerEvent) => {
    this.lookTarget.set((e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1, (e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1);
  };

  private resize = () => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.backdrop.uniforms.uAspect.value = width / height;
  };

  private render = (now: number) => {
    this.frame = requestAnimationFrame(this.render);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const time = (now - this.start) / 1000;

    // Speed: drifting, a nudge on hover, then the dive's exponential surge
    let target = 1.2 + this.anticipation * 2.2;
    let surge = 0;
    if (this.dive) {
      // (the frame's timestamp may be a little older than the click)
      surge = THREE.MathUtils.clamp((now - this.dive.start) / 1000 / this.dive.seconds, 0, 1);
      target = 3.4 + Math.pow(surge, 2.2) * 150;
    }
    this.speed += (target - this.speed) * Math.min(1, dt * (this.dive ? 6 : 2));
    const fast = THREE.MathUtils.clamp((this.speed - 1.2) / 60, 0, 1);

    // Look round after the pointer, a little
    this.look.lerp(this.lookTarget, Math.min(1, dt * 1.6));
    this.camera.rotation.set(-this.look.y * 0.06, -this.look.x * 0.09, 0);
    this.camera.fov = 70 + 34 * surge * surge;
    this.camera.updateProjectionMatrix();

    const u = this.backdrop.uniforms;
    u.uTime.value = time;
    u.uZoom.value = 1 + 0.25 * surge * surge + time * 0.004;
    u.uLook.value.set(this.look.x * 0.05, -this.look.y * 0.035);
    u.uSpeed.value = fast;

    // Stars stream past; at speed each draws a streak, brighter towards the head
    const heads = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const headColors = this.points.geometry.getAttribute("color") as THREE.BufferAttribute;
    const lines = this.streaks.geometry.getAttribute("position") as THREE.BufferAttribute;
    const lineColors = this.streaks.geometry.getAttribute("color") as THREE.BufferAttribute;
    const tail = 0.02 + this.speed * 0.09;
    for (let i = 0; i < STAR_COUNT; i++) {
      let z = this.stars[i * 3 + 2] + this.speed * dt;
      if (z > -0.2) {
        this.respawn(i, -FIELD_DEPTH);
        z = -FIELD_DEPTH;
      }
      this.stars[i * 3 + 2] = z;
      const x = this.stars[i * 3];
      const y = this.stars[i * 3 + 1];
      // Fade in from the far end, so stars do not pop into existence
      const b = this.brightness[i] * THREE.MathUtils.smoothstep(-z, FIELD_DEPTH, FIELD_DEPTH * 0.6);
      heads.setXYZ(i, x, y, z);
      headColors.setXYZ(i, b * 0.85, b * 0.92, b);
      lines.setXYZ(i * 2, x, y, z);
      lines.setXYZ(i * 2 + 1, x, y, z - tail);
      const s = b * fast;
      lineColors.setXYZ(i * 2, s * 0.7, s * 0.85, s);
      lineColors.setXYZ(i * 2 + 1, 0, 0, 0);
    }
    heads.needsUpdate = true;
    headColors.needsUpdate = true;
    lines.needsUpdate = true;
    lineColors.needsUpdate = true;

    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("pointermove", this.onPointer);
    window.removeEventListener("resize", this.resize);
    this.points.geometry.dispose();
    (this.points.material as THREE.PointsMaterial).map?.dispose();
    (this.points.material as THREE.Material).dispose();
    this.streaks.geometry.dispose();
    (this.streaks.material as THREE.Material).dispose();
    this.backdrop.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// A soft round star
function starSprite() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(220,235,255,0.6)");
  gradient.addColorStop(1, "rgba(200,220,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

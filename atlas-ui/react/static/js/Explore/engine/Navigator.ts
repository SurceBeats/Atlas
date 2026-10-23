// atlas-ui/react/static/js/Explore/engine/Navigator.ts
//
// Orbit-around-a-focus camera that works across 15 orders of magnitude. Distances are
// zoomed in log space, positions are kept in float64 (plain JS numbers) and the
// rendering camera itself always sits at the origin (see Engine), so precision never
// depends on how far from the galactic center we are.

import * as THREE from "three";

interface Flight {
  from: THREE.Vector3;
  to: THREE.Vector3;
  fromLogDistance: number;
  toLogDistance: number;
  arc: number;
  start: number;
  duration: number;
  fromYaw: number;
  toYaw: number;
  fromPitch: number;
  toPitch: number;
  // Nose-first flights move the camera itself along a straight line: it turns towards
  // the destination in place, cruises facing it, and settles into the final view
  // `departScale` / `arriveScale`: the sizes of what is being left and approached; the
  // speed scales with the distance to them so both ends of the trip get their share
  cruise: { fromCamera: THREE.Vector3; headYaw: number; headPitch: number; departScale: number; arriveScale: number } | null;
  track?: () => THREE.Vector3 | null;
  onArrive?: () => void;
}

const smoothstep = (a: number, b: number, t: number) => {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

// An angle into (-π, π]: the orbit may go round over the poles indefinitely
function wrapAngle(a: number) {
  const w = a % (2 * Math.PI);
  return w > Math.PI ? w - 2 * Math.PI : w <= -Math.PI ? w + 2 * Math.PI : w;
}

// Yaw / pitch of the orbit offset that makes the camera look along `look`
function anglesFor(look: THREE.Vector3): { yaw: number; pitch: number } {
  const n = look.clone().normalize().negate();
  return { yaw: Math.atan2(n.x, n.z), pitch: THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(n.y, -1, 1)), -1.55, 1.55) };
}

// Distance travelled along a cruise of length `length` at progress s (0..1). Progress
// is linear in asinh(x / depart) - asinh((length - x) / arrive): logarithmic near both
// ends, so a star system approached from 800 ly away still takes a while to close in
// on the last few thousand AU instead of flashing past in one frame. The arrival
// weighs more than the departure: that is where there is something to see.
function cruiseTravel(length: number, depart: number, arrive: number, s: number) {
  const w = (x: number) => 0.3 * Math.asinh(x / depart) - Math.asinh((length - x) / arrive);
  const target = THREE.MathUtils.lerp(w(0), w(length), s);
  let lo = 0;
  let hi = length;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (w(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

const unwrapNear = (angle: number, reference: number) => {
  while (angle - reference > Math.PI) angle -= Math.PI * 2;
  while (angle - reference < -Math.PI) angle += Math.PI * 2;
  return angle;
};

export interface NavigatorListeners {
  onClick?: (x: number, y: number) => void;
  // Double click or double tap, at the same spot
  onDoubleClick?: (x: number, y: number) => void;
  onHover?: (x: number, y: number) => void;
  onUserMove?: () => void;
  // World-space direction of the ray under a screen point (enables zoom-to-cursor)
  rayAt?: (x: number, y: number) => THREE.Vector3;
}

// Manual flight: top speed (per second, in units of the current zoom distance), seconds
// to reach it from rest, and seconds to coast to a stop
const MANUAL_TOP_SPEED = 3.6;
const ACCELERATION_SECONDS = 5;
// (short: in a space this big, a long glide overshoots wherever you were aiming for)
const COAST_SECONDS = 0.8;
// Turning with the keys (rad/s at full turn)
const TURN_RATE = 1.1;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class Navigator {
  focus = new THREE.Vector3();
  distance = 1;
  yaw = 0.6;
  pitch = 0.5;
  minDistance = 1e-9;
  maxDistance = 1e9;

  // When set, the focus tracks a moving object (e.g. an orbiting planet)
  follow: (() => THREE.Vector3 | null) | null = null;
  autoRotate = 0;

  private targetLogDistance = 0;
  private yawVelocity = 0;
  private pitchVelocity = 0;
  private flight: Flight | null = null;
  private keys = new Set<string>();
  private pointers = new Map<number, { x: number; y: number }>();
  private downAt: { x: number; y: number; time: number; button: number } | null = null;
  private lastTap: { x: number; y: number; time: number } | null = null;
  private lastPinch = 0;
  private dom: HTMLElement | null = null;
  private listeners: NavigatorListeners;
  private tmp = new THREE.Vector3();
  private disposers: Array<() => void> = [];

  constructor(listeners: NavigatorListeners = {}) {
    this.listeners = listeners;
    this.targetLogDistance = Math.log(this.distance);
  }

  get isFlying() {
    return this.flight !== null;
  }

  private lastInputAt = performance.now();

  private touched() {
    this.lastInputAt = performance.now();
    this.listeners.onUserMove?.();
  }

  // Nothing is moving the camera: no input for a while, no flight, no inertia
  get isIdle() {
    if (this.flight || this.keys.size > 0 || this.pointers.size > 0 || this.speedFraction > 0 || Math.abs(this.turnRate) > 1e-4) return false;
    if (Math.abs(this.yawVelocity) + Math.abs(this.pitchVelocity) > 1e-4) return false;
    if (Math.abs(Math.log(this.distance) - this.targetLogDistance) > 1e-3) return false;
    return performance.now() - this.lastInputAt > 2500;
  }

  // Flying by hand with the keyboard (W S forward / back, A D turn, Q E slide, R F up / down)
  get isThrusting() {
    for (const key of ["w", "a", "s", "d", "q", "e", "r", "f", "arrowup", "arrowdown", "arrowleft", "arrowright"]) if (this.keys.has(key)) return true;
    // Still coasting after the keys were let go
    return this.speedFraction > 0.02;
  }

  // 0..1 progress of the current flight (1 when idle)
  get flightProgress() {
    if (!this.flight) return 1;
    return Math.min(1, (performance.now() - this.flight.start) / this.flight.duration);
  }

  // How hard the ship is "jumping": long trips (big zoom-out arc) streak the stars
  get warpIntensity() {
    const f = this.flight;
    if (!f || f.arc < 1.5) return 0;
    return Math.sin(Math.PI * this.flightProgress) * Math.min(1, (f.arc - 1.5) / 3);
  }

  attach(dom: HTMLElement) {
    this.dom = dom;
    const on = <K extends keyof HTMLElementEventMap>(target: HTMLElement | Window, type: K, handler: (e: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions) => {
      target.addEventListener(type, handler as EventListener, options);
      this.disposers.push(() => target.removeEventListener(type, handler as EventListener));
    };

    on(dom, "contextmenu", (e) => e.preventDefault());
    on(dom, "pointerdown", (e) => this.beginPointer(e));
    on(dom, "pointermove", (e) => {
      const previous = this.pointers.get(e.pointerId);
      if (!previous) {
        this.listeners.onHover?.(e.clientX, e.clientY);
        return;
      }
      const dx = e.clientX - previous.x;
      const dy = e.clientY - previous.y;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.pointers.size === 2) {
        const pinch = this.pinchDistance();
        if (this.lastPinch > 0) this.zoomBy(this.lastPinch / pinch);
        this.lastPinch = pinch;
        this.pan(dx / 2, dy / 2);
        return;
      }

      const panning = this.downAt?.button === 2 || e.shiftKey;
      if (panning) this.pan(dx, dy);
      else this.rotate(dx, dy);
    });
    const release = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.lastPinch = 0;
      const down = this.downAt;
      if (down && this.pointers.size === 0) {
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        // Fingers wobble more than a mouse
        const slop = e.pointerType === "touch" ? 12 : 6;
        if (moved < slop && performance.now() - down.time < 600 && down.button === 0) {
          this.listeners.onClick?.(e.clientX, e.clientY);
          // A second tap close in time and place is a double tap. Detected here rather than
          // with the browser's dblclick, which touch screens (iOS above all) do not send
          const now = performance.now();
          const previous = this.lastTap;
          const near = e.pointerType === "touch" ? 32 : 8;
          if (previous && now - previous.time < 350 && Math.hypot(e.clientX - previous.x, e.clientY - previous.y) < near) {
            this.lastTap = null;
            this.listeners.onDoubleClick?.(e.clientX, e.clientY);
          } else this.lastTap = { x: e.clientX, y: e.clientY, time: now };
        }
        this.downAt = null;
      }
    };
    on(dom, "pointerup", release);
    on(dom, "pointercancel", release);
    // The canvas lost the pointer without an up (the browser took the gesture over, the
    // page changed under the finger…): forget it, or a later single finger would pinch
    // against a ghost
    on(dom, "lostpointercapture", (e) => this.forgetPointer(e.pointerId));
    on(window as any, "blur", () => this.forgetPointer(null));
    const onHidden = () => document.hidden && this.forgetPointer(null);
    document.addEventListener("visibilitychange", onHidden);
    this.disposers.push(() => document.removeEventListener("visibilitychange", onHidden));
    on(
      dom,
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
        const factor = Math.exp(delta * 0.0012);
        // Zoom towards the cursor: the point under it (at focus depth) stays put
        const ray = this.listeners.rayAt?.(e.clientX, e.clientY);
        if (ray && !this.follow) {
          const camera = this.cameraPosition(new THREE.Vector3());
          const anchor = camera.addScaledVector(ray, this.distance);
          const clamped = Math.exp(THREE.MathUtils.clamp(this.targetLogDistance + Math.log(factor), Math.log(this.minDistance), Math.log(this.maxDistance)) - this.targetLogDistance);
          this.focus.lerp(anchor, 1 - clamped);
        }
        this.zoomBy(factor);
      },
      { passive: false }
    );
    on(window as any, "keydown", (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      this.keys.add(e.key.toLowerCase());
      this.lastInputAt = performance.now();
    });
    on(window as any, "keyup", (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase()));
    on(window as any, "blur", () => this.keys.clear());
  }

  // Labels and panels sit above the canvas. A right-drag that starts on one of them still
  // pans (the canvas captures the pointer from then on), and the browser menu never
  // opens over the universe; it still does on links, text fields and selectable text
  attachOverlay(root: HTMLElement) {
    const native = (target: EventTarget | null) => target instanceof Element && !!target.closest("a, input, textarea, select, .select-text");
    const onMenu = (e: MouseEvent) => {
      if (!native(e.target)) e.preventDefault();
    };
    const onDown = (e: PointerEvent) => {
      if (e.target === this.dom || e.button !== 2 || native(e.target)) return;
      this.beginPointer(e);
    };
    root.addEventListener("contextmenu", onMenu);
    root.addEventListener("pointerdown", onDown, { capture: true });
    this.disposers.push(() => {
      root.removeEventListener("contextmenu", onMenu);
      root.removeEventListener("pointerdown", onDown, { capture: true });
    });
  }

  // A pointer that will send nothing more (null: all of them), without it counting as a click
  private forgetPointer(id: number | null) {
    if (id === null) this.pointers.clear();
    else this.pointers.delete(id);
    if (this.pointers.size < 2) this.lastPinch = 0;
    if (this.pointers.size === 0) this.downAt = null;
  }

  private beginPointer(e: PointerEvent) {
    const dom = this.dom;
    if (!dom) return;
    this.lastInputAt = performance.now();
    // The first finger of a touch is the only one on the screen: anything still tracked
    // from an earlier gesture is a ghost whose up never arrived
    if (e.pointerType === "touch" && e.isPrimary) this.forgetPointer(null);
    try {
      dom.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already gone */
    }
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.downAt = { x: e.clientX, y: e.clientY, time: performance.now(), button: e.button };
    if (this.pointers.size === 2) this.lastPinch = this.pinchDistance();
  }

  dispose() {
    this.disposers.forEach((d) => d());
    this.disposers = [];
  }

  private pinchDistance() {
    const [a, b] = Array.from(this.pointers.values());
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  }

  private cancelFlight() {
    if (this.flight) {
      this.flight = null;
      this.targetLogDistance = Math.log(this.distance);
    }
  }

  rotate(dx: number, dy: number) {
    this.cancelFlight();
    // Upside down past a pole the screen's left and right are the orbit's the other way
    // round: dragging right still turns the scene right
    this.yawVelocity = -dx * 0.0045 * (Math.cos(this.pitch) < 0 ? -1 : 1);
    this.pitchVelocity = dy * 0.0045;
    this.yaw += this.yawVelocity;
    this.pitch = wrapAngle(this.pitch + this.pitchVelocity);
    this.touched();
  }

  pan(dx: number, dy: number) {
    this.cancelFlight();
    this.follow = null;
    const height = this.dom?.clientHeight || 800;
    const scale = (this.distance * 1.15) / height;
    const { right, up } = this.basis();
    this.focus.addScaledVector(right, -dx * scale);
    this.focus.addScaledVector(up, dy * scale);
    this.touched();
  }

  zoomBy(factor: number) {
    this.cancelFlight();
    this.targetLogDistance = THREE.MathUtils.clamp(this.targetLogDistance + Math.log(factor), Math.log(this.minDistance), Math.log(this.maxDistance));
    this.touched();
  }

  setDistance(distance: number) {
    this.distance = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
    this.targetLogDistance = Math.log(this.distance);
  }

  // Re-expresses the navigator in another frame (galaxy ly <-> system AU) without any
  // visible change: newFocus = (focus - origin) * scale.
  rebase(origin: THREE.Vector3, scale: number) {
    this.focus.sub(origin).multiplyScalar(scale);
    this.distance *= scale;
    this.targetLogDistance = Math.log(this.distance);
    if (this.flight) {
      const f = this.flight;
      f.from.sub(origin).multiplyScalar(scale);
      f.to.sub(origin).multiplyScalar(scale);
      f.fromLogDistance += Math.log(scale);
      f.toLogDistance += Math.log(scale);
      if (f.cruise) {
        f.cruise.fromCamera.sub(origin).multiplyScalar(scale);
        f.cruise.departScale *= scale;
        f.cruise.arriveScale *= scale;
      }
    }
  }

  // Where the camera will be when the current flight lands (frame units)
  private flightEndCamera(f: Flight, out: THREE.Vector3): THREE.Vector3 {
    const cp = Math.cos(f.toPitch);
    return out.set(cp * Math.sin(f.toYaw), Math.sin(f.toPitch), cp * Math.cos(f.toYaw)).multiplyScalar(Math.exp(f.toLogDistance)).add(f.to);
  }

  // Straight-line distance the camera still has to cover (0 when not flying)
  get flightRemaining() {
    const f = this.flight;
    if (!f) return 0;
    return this.flightEndCamera(f, new THREE.Vector3()).distanceTo(this.cameraPosition(new THREE.Vector3()));
  }

  // `track` lets the destination move during the flight (orbiting planets)
  flyTo(target: THREE.Vector3, distance: number, options: { duration?: number; yaw?: number; pitch?: number; track?: () => THREE.Vector3 | null; onArrive?: () => void } = {}) {
    const travel = this.focus.distanceTo(target);
    const fromLog = Math.log(this.distance);
    const toLog = Math.log(THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance));
    // Long trips zoom out mid-flight so the destination is visible on the way
    const arc = Math.max(0, Math.log(travel / Math.max(this.distance, distance, 1e-12)) * 0.75);
    let duration = options.duration ?? THREE.MathUtils.clamp(1.2 + 0.18 * Math.abs(toLog - fromLog) + 0.25 * arc, 1.2, 6);
    let toYaw = unwrapNear(options.yaw ?? this.yaw, this.yaw);
    let toPitch = options.pitch ?? this.pitch;

    // Flying somewhere (rather than just backing out to a wider view) is done nose
    // first. Backing out keeps the classic orbit-camera move
    let cruise: Flight["cruise"] = null;
    const fromCamera = this.cameraPosition(new THREE.Vector3());
    if (travel > 0.5 * Math.exp(toLog)) {
      const toward = anglesFor(this.tmp.subVectors(target, fromCamera));
      const endYaw = unwrapNear(options.yaw ?? toward.yaw, this.yaw);
      const endPitch = options.pitch ?? toward.pitch;
      const cp = Math.cos(endPitch);
      const endCamera = new THREE.Vector3(cp * Math.sin(endYaw), Math.sin(endPitch), cp * Math.cos(endYaw)).multiplyScalar(Math.exp(toLog)).add(target);
      const heading = endCamera.clone().sub(fromCamera);
      if (heading.lengthSq() > 0) {
        const head = anglesFor(heading);
        const headYaw = unwrapNear(head.yaw, this.yaw);
        cruise = { fromCamera, headYaw, headPitch: head.pitch, departScale: Math.max(this.distance, 1e-12), arriveScale: Math.max(Math.exp(toLog), 1e-12) };
        toYaw = unwrapNear(endYaw, headYaw);
        toPitch = endPitch;
        // Time to swing round before setting off
        const turn = Math.hypot(headYaw - this.yaw, head.pitch - this.pitch);
        // ...and to cross every order of magnitude between here and there
        const scales = Math.log(1 + heading.length() / cruise.arriveScale);
        if (options.duration === undefined) duration = Math.max(1.8 + 0.5 * turn, THREE.MathUtils.clamp(2 + 0.2 * scales, 2, 7));
      }
    }

    this.flight = {
      from: this.focus.clone(),
      to: target.clone(),
      fromLogDistance: fromLog,
      toLogDistance: toLog,
      arc,
      start: performance.now(),
      duration: duration * 1000,
      fromYaw: this.yaw,
      toYaw,
      fromPitch: this.pitch,
      toPitch,
      cruise,
      track: options.track,
      onArrive: options.onArrive,
    };
  }

  offsetDirection(out: THREE.Vector3): THREE.Vector3 {
    const cp = Math.cos(this.pitch);
    return out.set(cp * Math.sin(this.yaw), Math.sin(this.pitch), cp * Math.cos(this.yaw));
  }

  // Camera position in frame coordinates (float64)
  cameraPosition(out: THREE.Vector3): THREE.Vector3 {
    return this.offsetDirection(out).multiplyScalar(this.distance).add(this.focus);
  }

  // The camera's axes. Its top is the orbit's own, d(offset)/d(pitch): upright for pitches
  // within ±90° (the same basis as looking along -offset with Y up), upside down past a
  // pole, with no jump on the way over it
  basis(): { right: THREE.Vector3; up: THREE.Vector3; back: THREE.Vector3 } {
    const back = this.offsetDirection(new THREE.Vector3());
    const sp = Math.sin(this.pitch);
    const up = new THREE.Vector3(-sp * Math.sin(this.yaw), Math.cos(this.pitch), -sp * Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3().crossVectors(up, back).normalize();
    return { right, up, back };
  }

  orientation(out: THREE.Quaternion): THREE.Quaternion {
    const { right, up, back } = this.basis();
    return out.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, back));
  }

  update(dt: number) {
    const now = performance.now();

    if (this.flight) {
      const f = this.flight;
      const tracked = f.track?.();
      if (tracked) f.to.copy(tracked);
      const t = Math.min(1, (now - f.start) / f.duration);
      if (f.cruise) {
        const c = f.cruise;
        // Turn towards the destination, cruise, then turn into the final view
        const turnIn = smoothstep(0, 0.3, t);
        const turnOut = smoothstep(0.72, 1, t);
        this.yaw = THREE.MathUtils.lerp(THREE.MathUtils.lerp(f.fromYaw, c.headYaw, turnIn), f.toYaw, turnOut);
        this.pitch = THREE.MathUtils.lerp(THREE.MathUtils.lerp(f.fromPitch, c.headPitch, turnIn), f.toPitch, turnOut);
        // Set off once mostly turned
        const s = easeInOut(THREE.MathUtils.clamp((t - 0.12) / 0.88, 0, 1));
        const camera = this.flightEndCamera(f, this.tmp);
        const length = camera.distanceTo(c.fromCamera);
        const along = length > 0 ? cruiseTravel(length, c.departScale, c.arriveScale, s) / length : 1;
        camera.lerpVectors(c.fromCamera, camera, along);
        this.distance = Math.exp(THREE.MathUtils.lerp(f.fromLogDistance, f.toLogDistance, s));
        const offset = this.offsetDirection(new THREE.Vector3());
        this.focus.copy(camera).addScaledVector(offset, -this.distance);
      } else {
        const s = easeInOut(t);
        this.focus.lerpVectors(f.from, f.to, s);
        this.distance = Math.exp(THREE.MathUtils.lerp(f.fromLogDistance, f.toLogDistance, s) + f.arc * Math.sin(Math.PI * s));
        this.yaw = THREE.MathUtils.lerp(f.fromYaw, f.toYaw, s);
        this.pitch = THREE.MathUtils.lerp(f.fromPitch, f.toPitch, s);
      }
      if (t >= 1) {
        this.flight = null;
        this.targetLogDistance = Math.log(this.distance);
        f.onArrive?.();
      }
    } else {
      // Exponential smoothing of the zoom (in log space)
      const logD = Math.log(this.distance);
      const next = logD + (this.targetLogDistance - logD) * Math.min(1, dt * 10);
      this.distance = Math.exp(next);

      if (this.pointers.size === 0) {
        this.yaw += this.yawVelocity;
        this.pitch = wrapAngle(this.pitch + this.pitchVelocity);
        this.yawVelocity *= Math.pow(0.02, dt);
        this.pitchVelocity *= Math.pow(0.02, dt);
      }
      this.yaw += this.autoRotate * dt;

      if (this.follow) {
        const target = this.follow();
        if (target) this.focus.copy(target);
      }
    }

    this.applyKeys(dt);
  }

  // Flying by hand (W S / ↑ ↓ thrust, A D / ← → turn, Q E slide, R F climb). The ship has a velocity of its own, in
  // space (not tied to the camera): the engines steer it towards the direction held at
  // a steady rate, so it takes ~5 s to reach full speed; changing course first kills the
  // motion it had, and letting go (or reversing) fires the brakes, stopping it in
  // ~2.5 s. Velocity is kept in zoom distances per second, so it means the same between
  // stars as between planets
  private velocity = new THREE.Vector3();
  // Strafe (-1 left .. 1 right) and climb (-1 .. 1) as the ship feels them, for its banking
  strafe = 0;
  climb = 0;
  private speedFraction = 0;

  // How hard the ship is flying (0..1 of full speed), for its drive glow and the sound
  get throttleLevel() {
    return this.speedFraction;
  }

  private turnRate = 0; // rad/s, eased so turns start and end softly

  private applyKeys(dt: number) {
    const held = (...names: string[]) => names.some((n) => this.keys.has(n));
    // Left / right turn the ship (the view turns with it, and the ship banks into it)
    const turn = (held("a", "arrowleft") ? 1 : 0) - (held("d", "arrowright") ? 1 : 0);
    this.turnRate += (turn * TURN_RATE - this.turnRate) * Math.min(1, dt * 5);
    if (Math.abs(this.turnRate) > 1e-4) {
      this.yaw += this.turnRate * dt;
      if (turn !== 0) {
        this.cancelFlight();
        this.touched();
      }
    }

    // The ship's axes, from the view (the screen's directions, so they hold upside down too)
    const forward = this.offsetDirection(new THREE.Vector3()).negate();
    const { right, up } = this.basis();
    const want = new THREE.Vector3()
      // Q / E slide sideways
      .addScaledVector(right, (held("e") ? 1 : 0) - (held("q") ? 1 : 0))
      .addScaledVector(up, (held("r") ? 1 : 0) - (held("f") ? 1 : 0))
      .addScaledVector(forward, (held("w", "arrowup") ? 1 : 0) - (held("s", "arrowdown") ? 1 : 0));
    const thrusting = want.lengthSq() > 0;
    const top = MANUAL_TOP_SPEED * (held("shift") ? 2.5 : 1);

    if (thrusting) {
      this.cancelFlight();
      this.follow = null;
      this.touched();
    } else if (this.flight || this.follow) {
      // A flight or a tracked target took over: no drifting
      this.velocity.set(0, 0, 0);
    }

    // Steer the velocity towards the one wanted: engines forward, brakes when letting go
    // or turning against the motion
    const desired = thrusting ? want.normalize().multiplyScalar(top) : new THREE.Vector3();
    const delta = desired.clone().sub(this.velocity);
    const opposing = !thrusting || this.velocity.dot(desired) < 0;
    const rate = (opposing ? MANUAL_TOP_SPEED / COAST_SECONDS : MANUAL_TOP_SPEED / ACCELERATION_SECONDS) * (held("shift") ? 2.5 : 1);
    const step = Math.min(delta.length(), rate * dt);
    if (step > 0) this.velocity.addScaledVector(delta.normalize(), step);

    // What the ship feels, in its own frame, for the banking and the drive
    this.speedFraction = Math.min(1, this.velocity.length() / MANUAL_TOP_SPEED);
    const k = Math.min(1, dt * 4);
    this.strafe += (this.velocity.dot(right) / MANUAL_TOP_SPEED - this.strafe) * k;
    this.climb += (this.velocity.y / MANUAL_TOP_SPEED - this.climb) * k;

    if (this.velocity.lengthSq() > 1e-12) this.focus.addScaledVector(this.velocity, this.distance * dt);
  }
}

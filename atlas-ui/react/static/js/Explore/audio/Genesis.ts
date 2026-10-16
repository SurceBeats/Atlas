// atlas-ui/react/static/js/Explore/audio/Genesis.ts
//
// The score for the birth of a universe (onboarding, see Explore/ui/Creation), synthesised
// with WebAudio like the ship's sounds (no samples), but scored like a film:
//
//   the torus        a low A that breathes, an organ chord swelling slowly behind it,
//                    air running round the ring from one side to the other, and the
//                    clock of the cycles: a tick that quickens as entropy piles up. Now
//                    and then a quantum rings like glass
//   saturation       a riser climbing two octaves, air drawn in, the clock into a roll
//   the slow motion  everything sags in pitch like a tape slowing, a reversed swell is
//                    sucked into the vertex, and then silence, just before the impact
//   the Big Bang     a sub drop to 20 Hz, a driven punch, a broadband crack, a low brass
//                    "braam", debris flying out left and right, a long shimmering tail
//   two universes    two voices born on one note part ways: ours rises to the right, the
//                    mirror sinks, darkens and fades to the left
//   inflation …      a swelling whoosh, the roar of the plasma cooling with the universe,
//                    cut dead at recombination by a bright major chord (light breaks
//                    free); wind in the dark ages, stars igniting as scattered chimes, the
//                    full chord opening over the galaxies, a bell, and a fade
//
// Everything runs through a limiter so the impact never clips.

const VOLUME = 0.55;

interface Voice {
  at?: number;
  type?: OscillatorType;
  freq: number;
  to?: number;
  glide?: number;
  attack: number;
  hold?: number;
  release: number;
  gain: number;
  // Exponential attack (a swell from nothing) instead of linear
  swell?: boolean;
  detune?: number;
  lowpass?: [number, number?];
  distort?: boolean;
  pan?: number;
  panTo?: number;
  send?: number;
}

interface Hiss {
  at?: number;
  filter: BiquadFilterType;
  from: number;
  to?: number;
  q?: number;
  attack: number;
  hold?: number;
  release: number;
  gain: number;
  swell?: boolean;
  pan?: number;
  panTo?: number;
  send?: number;
}

// A held layer: its sources, the gain that fades it, and the oscillators that sag with the
// slow motion
interface Layer {
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
  tones: OscillatorNode[];
}

export type GenesisCue = "prelude" | "saturation" | "signature" | "bang" | "twins" | "inflation" | "nuclei" | "recombination" | "dark" | "stars" | "galaxies" | "created";

export class Genesis {
  private ctx: AudioContext;
  private out: GainNode;
  // The continuous layers and the clock: ducked to silence before the impact
  private bed: GainNode;
  private reverb: GainNode;
  private noise: AudioBuffer;
  private timer = 0;
  private probe: () => number = () => 0;
  private collapsing = false;
  private silenceAt = Infinity;
  private banged = false;
  private nextTick = 0;
  private drone: (Layer & { filter: BiquadFilterNode; air: BiquadFilterNode; spin: OscillatorNode }) | null = null;
  private organ: Layer | null = null;
  private plasma: (Layer & { filter: BiquadFilterNode }) | null = null;
  private wind: Layer | null = null;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 8;
    limiter.ratio.value = 8;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.3;
    limiter.connect(ctx.destination);
    this.out = ctx.createGain();
    this.out.gain.value = VOLUME;
    this.out.connect(limiter);
    this.bed = ctx.createGain();
    this.bed.connect(this.out);

    const length = Math.floor(ctx.sampleRate * 3);
    this.noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    // A cathedral: six seconds of decaying noise, darker as it fades, each side its own
    const convolver = ctx.createConvolver();
    const seconds = 6;
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const tail = impulse.getChannelData(channel);
      let smooth = 0;
      for (let i = 0; i < tail.length; i++) {
        const t = i / tail.length;
        smooth += (Math.random() * 2 - 1 - smooth) * (0.7 - 0.6 * t);
        tail[i] = smooth * Math.pow(1 - t, 2.6);
      }
    }
    convolver.buffer = impulse;
    this.reverb = ctx.createGain();
    this.reverb.gain.value = 0.7;
    this.reverb.connect(convolver).connect(this.out);
  }

  // ---- voices ---------------------------------------------------------------------

  private get now() {
    return this.ctx.currentTime;
  }

  private envelope(at: number, o: { attack: number; hold?: number; release: number; gain: number; swell?: boolean }) {
    const env = this.ctx.createGain();
    const peak = at + o.attack;
    if (o.swell) {
      env.gain.setValueAtTime(1e-4, at);
      env.gain.exponentialRampToValueAtTime(o.gain, peak);
    } else {
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(o.gain, peak);
    }
    env.gain.setValueAtTime(o.gain, peak + (o.hold ?? 0));
    env.gain.exponentialRampToValueAtTime(1e-4, peak + (o.hold ?? 0) + o.release);
    return env;
  }

  // Out through an optional panner (which may travel) and a send to the reverb
  private route(node: AudioNode, at: number, length: number, o: { pan?: number; panTo?: number; send?: number }, dest: AudioNode) {
    let tail = node;
    if (o.pan !== undefined) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(o.pan, at);
      if (o.panTo !== undefined) panner.pan.linearRampToValueAtTime(o.panTo, at + length);
      tail = node.connect(panner);
    }
    tail.connect(dest);
    if (o.send) {
      const send = this.ctx.createGain();
      send.gain.value = o.send;
      tail.connect(send).connect(this.reverb);
    }
  }

  private voice(v: Voice, dest: AudioNode = this.out) {
    const ctx = this.ctx;
    const at = v.at ?? this.now;
    const length = v.attack + (v.hold ?? 0) + v.release;
    const osc = ctx.createOscillator();
    osc.type = v.type ?? "sine";
    osc.frequency.setValueAtTime(v.freq, at);
    if (v.to) osc.frequency.exponentialRampToValueAtTime(v.to, at + (v.glide ?? length));
    if (v.detune) osc.detune.value = v.detune;
    let node: AudioNode = osc;
    if (v.distort) {
      const shaper = ctx.createWaveShaper();
      shaper.curve = this.drive();
      node = node.connect(shaper);
    }
    if (v.lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(v.lowpass[0], at);
      if (v.lowpass[1]) filter.frequency.exponentialRampToValueAtTime(v.lowpass[1], at + length);
      node = node.connect(filter);
    }
    const env = this.envelope(at, v);
    node.connect(env);
    this.route(env, at, length, v, dest);
    osc.start(at);
    osc.stop(at + length + 0.1);
    osc.onended = () => env.disconnect();
  }

  private noiseSource() {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    source.loopStart = Math.random() * 2;
    return source;
  }

  private hiss(h: Hiss, dest: AudioNode = this.out) {
    const at = h.at ?? this.now;
    const length = h.attack + (h.hold ?? 0) + h.release;
    const source = this.noiseSource();
    const filter = this.ctx.createBiquadFilter();
    filter.type = h.filter;
    filter.Q.value = h.q ?? 0.8;
    filter.frequency.setValueAtTime(h.from, at);
    if (h.to) filter.frequency.exponentialRampToValueAtTime(h.to, at + length);
    const env = this.envelope(at, h);
    source.connect(filter).connect(env);
    this.route(env, at, length, h, dest);
    source.start(at);
    source.stop(at + length + 0.1);
    source.onended = () => env.disconnect();
  }

  // A soft saturation curve, for the punch
  private drive() {
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(3.2 * ((i / (curve.length - 1)) * 2 - 1));
    return curve;
  }

  // A held layer fading in over `rise` seconds, with a send to the reverb
  private layer(at: number, rise: number, send: number): Layer {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(1, at + rise);
    gain.connect(this.bed);
    const wet = this.ctx.createGain();
    wet.gain.value = send;
    gain.connect(wet).connect(this.reverb);
    return { gain, sources: [], tones: [] };
  }

  private fade(layer: Layer | null, at: number, seconds: number) {
    if (!layer) return;
    layer.gain.gain.cancelScheduledValues(at);
    layer.gain.gain.setTargetAtTime(0, at, seconds / 4);
    for (const source of layer.sources) source.stop(at + seconds + 0.2);
  }

  private oscillator(layer: Layer, type: OscillatorType, freq: number, detune = 0) {
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    layer.sources.push(osc);
    layer.tones.push(osc);
    return osc;
  }

  // ---- the torus -------------------------------------------------------------------

  // The torus appears: `entropy` is read as it fills (0 to 1)
  start(entropy: () => number) {
    const ctx = this.ctx;
    const t = this.now;
    this.probe = entropy;

    // Out of silence: a dark swell of air and a sub that rises with it
    this.hiss({ at: t, filter: "lowpass", from: 180, to: 1400, attack: 1.8, release: 2.6, gain: 0.06, swell: true, send: 0.7 });
    this.voice({ at: t, freq: 27.5, to: 55, glide: 1.8, attack: 1.8, release: 2.2, gain: 0.2, swell: true });

    // The drone: a low A, sawtooth through a breathing filter, a sub an octave below
    const drone = this.layer(t, 3, 0.45);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;
    filter.Q.value = 3;
    filter.connect(drone.gain);
    for (const [type, freq, detune, gain] of [
      ["sawtooth", 55, -7, 0.08],
      ["sawtooth", 55, 7, 0.08],
      ["sawtooth", 110, 4, 0.035],
      ["sine", 27.5, 0, 0.16],
    ] as const) {
      const level = ctx.createGain();
      level.gain.value = gain;
      this.oscillator(drone, type, freq, detune).connect(level).connect(filter);
    }
    const breath = ctx.createOscillator();
    breath.frequency.value = 0.09;
    const breadth = ctx.createGain();
    breadth.gain.value = 70;
    breath.connect(breadth).connect(filter.frequency);
    drone.sources.push(breath);

    // Air running round the ring, from one side to the other
    const air = ctx.createBiquadFilter();
    air.type = "bandpass";
    air.frequency.value = 500;
    air.Q.value = 3;
    const airLevel = ctx.createGain();
    airLevel.gain.value = 0.05;
    const panner = ctx.createStereoPanner();
    const spin = ctx.createOscillator();
    spin.frequency.value = 0.25;
    const swing = ctx.createGain();
    swing.gain.value = 0.85;
    spin.connect(swing).connect(panner.pan);
    const rush = this.noiseSource();
    rush.connect(air).connect(airLevel).connect(panner).connect(drone.gain);
    drone.sources.push(rush, spin);

    // The organ: an open A minor chord with a ninth, swelling slowly, gently trembling
    const organ = this.layer(t + 0.8, 5, 0.85);
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1500;
    const tremble = ctx.createGain();
    tremble.connect(tone).connect(organ.gain);
    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 0.21;
    const depth = ctx.createGain();
    depth.gain.value = 0.15;
    tremolo.connect(depth).connect(tremble.gain);
    organ.sources.push(tremolo);
    [110, 164.81, 220, 261.63, 329.63, 493.88].forEach((freq, i) => {
      for (const [type, detune] of [
        ["sine", -5],
        ["triangle", 5],
      ] as const) {
        const level = ctx.createGain();
        level.gain.value = 0.016 / (1 + i * 0.18);
        this.oscillator(organ, type, freq, detune).connect(level).connect(tremble);
      }
    });

    for (const source of [...drone.sources, ...organ.sources]) source.start(t);
    this.drone = { ...drone, filter, air, spin };
    this.organ = organ;
    this.nextTick = t + 1.2;
    this.timer = window.setInterval(this.tick, 40);
  }

  private tick = () => {
    if (this.banged) return;
    const now = this.now;
    const e = Math.min(Math.max(this.probe(), 0), 1);
    const d = this.drone;
    if (d) {
      // The filter opens, the air quickens and climbs as entropy piles up
      d.filter.frequency.setTargetAtTime(180 + 620 * e * e, now, 0.3);
      d.air.frequency.setTargetAtTime(500 + 2400 * e * e, now, 0.3);
      d.spin.frequency.setTargetAtTime(0.25 + 2.4 * e * e, now, 0.3);
    }
    // The clock of the cycles: slow at first, quickening with the entropy, into a roll
    // as the torus collapses, and stopping dead before the impact
    while (this.nextTick < now + 0.12 && this.nextTick < this.silenceAt) {
      const at = Math.max(this.nextTick, now);
      this.clockTick(at, e);
      this.nextTick = at + (this.collapsing ? Math.min(0.45, Math.max(0.045, (this.silenceAt - at) * 0.2)) : 1.25 - 0.85 * e * e);
    }
    // Now and then a quantum rings
    if (!this.collapsing && Math.random() < 0.012 + 0.03 * e) this.glass(now + 0.05);
  };

  private clockTick(at: number, e: number) {
    // (in the roll the beats crowd together: each one lighter)
    this.voice({ at, freq: 64, to: 38, glide: 0.2, attack: 0.004, release: this.collapsing ? 0.12 : 0.3, gain: this.collapsing ? 0.07 : 0.12 + 0.08 * e }, this.bed);
    this.hiss({ at, filter: "highpass", from: 3800, attack: 0.001, release: 0.045, gain: 0.04 + 0.03 * e, pan: Math.random() * 0.5 - 0.25, send: 0.35 }, this.bed);
  }

  private glass(at: number) {
    const notes = [880, 1046.5, 1318.51, 1567.98, 1760, 2093];
    const freq = notes[Math.floor(Math.random() * notes.length)];
    const pan = Math.random() * 1.6 - 0.8;
    this.voice({ at, freq, attack: 0.004, release: 2.6, gain: 0.014, pan, send: 0.9 }, this.bed);
    this.voice({ at, freq: freq * 2.01, attack: 0.004, release: 1.2, gain: 0.005, pan, send: 0.9 }, this.bed);
  }

  // ---- the collapse and the Big Bang --------------------------------------------------

  // The torus saturates: the Big Bang comes in `untilBang` seconds
  collapse(untilBang: number) {
    if (this.collapsing) return;
    const t = this.now;
    const bang = t + untilBang;
    this.collapsing = true;
    this.silenceAt = bang - 0.4;
    const rise = this.silenceAt - t;

    // A riser two octaves up, opening as it climbs, cut at the silence
    [110, 164.81, 220, 329.63].forEach((freq, i) => {
      this.voice({ at: t, type: "sawtooth", freq, to: freq * 4, glide: rise, attack: rise, release: 0.04, gain: 0.022, swell: true, lowpass: [500, 7000], detune: (i - 1.5) * 6, send: 0.3 });
    });
    // Air drawn into the vertex
    this.hiss({ at: t, filter: "highpass", from: 300, to: 9000, attack: rise, release: 0.04, gain: 0.055, swell: true, send: 0.3 });
    // The slow motion: a reversed swell sucked back in, and everything sagging in pitch
    // like a tape slowing down
    const slow = bang - 1.35;
    this.hiss({ at: slow, filter: "bandpass", from: 700, to: 4200, q: 1.1, attack: this.silenceAt - slow, release: 0.03, gain: 0.1, swell: true, send: 0.6 });
    for (const layer of [this.drone, this.organ])
      for (const osc of layer?.tones ?? []) {
        osc.detune.setValueAtTime(osc.detune.value, slow);
        osc.detune.linearRampToValueAtTime(osc.detune.value - 900, this.silenceAt);
      }
    // The torus gives way to the riser, and then nothing, for a breath
    this.bed.gain.setValueAtTime(1, t);
    this.bed.gain.linearRampToValueAtTime(0.55, this.silenceAt - 0.06);
    this.bed.gain.linearRampToValueAtTime(0, this.silenceAt);
  }

  bang() {
    if (this.banged) return;
    this.banged = true;
    window.clearInterval(this.timer);
    const t = this.now;
    this.fade(this.drone, t, 0.2);
    this.fade(this.organ, t, 0.2);
    this.bed.gain.cancelScheduledValues(t);
    this.bed.gain.setValueAtTime(0, t);
    this.bed.gain.linearRampToValueAtTime(1, t + 0.4);

    // The sub, dropping out of hearing
    this.voice({ at: t, freq: 62, to: 21, glide: 3.5, attack: 0.004, hold: 0.1, release: 5, gain: 0.55 });
    this.voice({ at: t, freq: 41, to: 20, glide: 4, attack: 0.01, release: 5.5, gain: 0.3, send: 0.2 });
    // The punch and the crack
    this.voice({ at: t, type: "triangle", freq: 150, to: 36, glide: 0.5, attack: 0.002, release: 1.4, gain: 0.3, distort: true });
    this.hiss({ at: t, filter: "lowpass", from: 12000, to: 240, q: 0.7, attack: 0.001, release: 2.4, gain: 0.42, send: 1 });
    // The braam: low brass, bright at the blow, darkening as it holds
    for (const [freq, detune] of [
      [32.7, -6],
      [32.7, 6],
      [65.41, 0],
      [98, -4],
      [130.81, 4],
      [196, 0],
    ] as const) {
      this.voice({ at: t + 0.01, type: "sawtooth", freq, detune, attack: 0.06, hold: 0.7, release: 3.6, gain: 0.05, lowpass: [1600, 150], send: 0.6 });
    }
    // Debris flying apart, left and right
    this.hiss({ at: t, filter: "bandpass", from: 2800, to: 170, q: 0.9, attack: 0.01, release: 2.8, gain: 0.1, pan: -0.2, panTo: -0.95, send: 0.5 });
    this.hiss({ at: t + 0.05, filter: "bandpass", from: 2400, to: 160, q: 0.9, attack: 0.01, release: 2.9, gain: 0.1, pan: 0.2, panTo: 0.95, send: 0.5 });
    // A long, high shimmer in the tail
    for (const freq of [1760, 2637, 3520]) this.voice({ at: t + 0.05, freq, attack: 0.5, release: 6, gain: 0.011, send: 1 });
  }

  // ---- after ------------------------------------------------------------------------

  cue(cue: GenesisCue) {
    const t = this.now;
    switch (cue) {
      case "signature":
        // The floor gives way
        this.voice({ at: t, freq: 82, to: 30, glide: 1, attack: 0.05, release: 1.3, gain: 0.16, send: 0.3 });
        break;
      case "twins":
        // One note, two voices parting: ours rises to the right, the mirror sinks,
        // darkens and fades to the left
        this.voice({ at: t, type: "sawtooth", freq: 220, to: 440, glide: 2.6, attack: 0.4, hold: 0.8, release: 2.8, gain: 0.045, lowpass: [900, 2600], pan: 0, panTo: 0.55, send: 0.7 });
        this.voice({ at: t, type: "sawtooth", freq: 220, to: 110, glide: 2.6, attack: 0.4, release: 1.6, gain: 0.045, lowpass: [900, 260], pan: 0, panTo: -0.85, send: 0.7 });
        this.voice({ at: t, freq: 92, to: 46, attack: 0.02, release: 1.1, gain: 0.18 });
        break;
      case "inflation": {
        // Space swelling, then the roar of the plasma
        this.hiss({ at: t, filter: "bandpass", from: 150, to: 7000, q: 0.6, attack: 0.7, release: 1, gain: 0.14, swell: true, send: 0.6 });
        this.voice({ at: t, freq: 48, to: 96, attack: 0.7, release: 1.5, gain: 0.15, swell: true });
        const plasma = this.layer(t + 0.5, 1.2, 0.4);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 3200;
        filter.Q.value = 0.5;
        const level = this.ctx.createGain();
        level.gain.value = 0.07;
        const roar = this.noiseSource();
        roar.connect(filter).connect(level).connect(plasma.gain);
        const rumble = this.ctx.createOscillator();
        rumble.frequency.value = 41;
        const rumbleLevel = this.ctx.createGain();
        rumbleLevel.gain.value = 0.06;
        rumble.connect(rumbleLevel).connect(plasma.gain);
        plasma.sources.push(roar, rumble);
        roar.start(t + 0.5);
        rumble.start(t + 0.5);
        this.plasma = { ...plasma, filter };
        break;
      }
      case "nuclei":
        // The plasma cools and dims
        this.plasma?.filter.frequency.setTargetAtTime(900, t, 0.8);
        this.plasma?.gain.gain.setTargetAtTime(0.7, t, 0.8);
        break;
      case "recombination":
        // Light breaks free: the roar cut dead, a bright chord in its place
        this.fade(this.plasma, t, 0.12);
        this.plasma = null;
        for (const freq of [440, 554.37, 659.25, 880, 1108.73]) this.voice({ at: t + 0.04, freq, attack: 0.03, release: 4.5, gain: 0.03, send: 0.9 });
        this.hiss({ at: t + 0.04, filter: "highpass", from: 6000, attack: 0.02, release: 2.2, gain: 0.025, send: 0.8 });
        break;
      case "dark": {
        // Wind through the dark ages
        const wind = this.layer(t, 1.5, 0.5);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 340;
        filter.Q.value = 0.7;
        const level = this.ctx.createGain();
        level.gain.value = 0.035;
        const panner = this.ctx.createStereoPanner();
        const drift = this.ctx.createOscillator();
        drift.frequency.value = 0.15;
        const swing = this.ctx.createGain();
        swing.gain.value = 0.6;
        drift.connect(swing).connect(panner.pan);
        const air = this.noiseSource();
        air.connect(filter).connect(level).connect(panner).connect(wind.gain);
        wind.sources.push(air, drift);
        air.start(t);
        drift.start(t);
        this.wind = wind;
        break;
      }
      case "stars": {
        // Stars igniting one after another, all across the sky, over a warm chord
        const notes = [880, 987.77, 1108.73, 1318.51, 1479.98, 1760, 2217.46];
        for (let i = 0; i < 20; i++) {
          const at = t + Math.pow(i / 20, 0.75) * 3.4 + Math.random() * 0.12;
          this.voice({ at, freq: notes[Math.floor(Math.random() * notes.length)], attack: 0.004, release: 1.8, gain: 0.018 + Math.random() * 0.016, pan: Math.random() * 1.8 - 0.9, send: 0.85 });
        }
        for (const freq of [110, 164.81, 277.18]) this.voice({ at: t, type: "triangle", freq, attack: 2, hold: 1.5, release: 4, gain: 0.022, lowpass: [800], send: 0.6 });
        break;
      }
      case "galaxies":
        // The full chord opens: A major with a ninth
        this.fade(this.wind, t, 3);
        this.wind = null;
        for (const freq of [55, 110, 164.81, 220, 277.18, 329.63, 493.88])
          this.voice({ at: t, type: "sawtooth", freq, detune: (Math.random() - 0.5) * 12, attack: 1.6, hold: 1.2, release: 4, gain: 0.02, lowpass: [400, 1800], send: 0.7 });
        break;
      case "created":
        // A bell, and the fade with the picture
        for (const [freq, gain] of [
          [659.25, 0.035],
          [880, 0.03],
          [1318.51, 0.02],
        ] as const)
          this.voice({ at: t, freq, attack: 0.008, release: 5, gain, send: 1 });
        this.voice({ at: t, freq: 55, attack: 0.05, release: 4, gain: 0.12 });
        this.out.gain.setTargetAtTime(0, t + 1.2, 0.6);
        break;
    }
  }

  // Silence, at once (the universe could not be created, or the page is leaving)
  stop() {
    window.clearInterval(this.timer);
    this.banged = true;
    const t = this.now;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(0, t, 0.08);
    for (const layer of [this.drone, this.organ, this.plasma, this.wind]) this.fade(layer, t, 0.3);
  }
}

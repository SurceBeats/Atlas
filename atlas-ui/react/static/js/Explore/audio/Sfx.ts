// atlas-ui/react/static/js/Explore/audio/Sfx.ts
//
// The ship's sounds, synthesised with WebAudio (no samples): filtered noise for air and
// engines, soft sines for chimes, and a generated reverb to put them in a big, quiet
// space. Kept low under the soundtrack: they are there to be felt more than heard.
//
//   - drive: a continuous hum and rush that follow the speed and the warp
//   - select / deselect: glass ticks when a star, planet or moon is picked
//   - depart / approach: a whoosh as the ship sets off somewhere
//   - arrive / orbit: a low chord on entering a system, a chime on reaching orbit
//   - hyperjump: charge (rising), punch (entering hyperspace), release (dropping out)
//
// It shares the soundtrack's AudioContext (see Music), which the dive click unlocks.

const VOLUME = 0.5;

export type SelectKind = "star" | "planet" | "moon" | "poi";

class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private driveNodes: { rumble: GainNode; rumbleFilter: BiquadFilterNode; rush: GainNode; rushFilter: BiquadFilterNode; tone: GainNode; toneOsc: OscillatorNode } | null = null;
  private lastDrive = { level: -1, warp: -1 };
  private enabled = true;

  attach(ctx: AudioContext | null) {
    if (!ctx || this.ctx) return;
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.enabled ? VOLUME : 0;
    this.master.connect(ctx.destination);

    // White noise, looped by every noise voice
    const length = Math.floor(ctx.sampleRate * 2);
    this.noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

    // Reverb: a convolver with a generated tail (decaying noise, darker as it fades)
    const convolver = ctx.createConvolver();
    const seconds = 3.2;
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const out = impulse.getChannelData(channel);
      let smooth = 0;
      for (let i = 0; i < out.length; i++) {
        const t = i / out.length;
        smooth += (Math.random() * 2 - 1 - smooth) * (0.6 - 0.45 * t);
        out[i] = smooth * Math.pow(1 - t, 3.2);
      }
    }
    convolver.buffer = impulse;
    this.reverb = ctx.createGain();
    this.reverb.gain.value = 0.6;
    this.reverb.connect(convolver).connect(this.master);

    this.buildDrive();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(enabled ? VOLUME : 0, now + 0.4);
  }

  // ---- voices ---------------------------------------------------------------------

  // Sounds may be scheduled while the context is still resuming from the unlocking click
  private get live() {
    return !!this.ctx && !!this.master && this.enabled && this.ctx.state !== "closed";
  }

  private noiseSource() {
    const source = this.ctx!.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    source.loopStart = Math.random();
    return source;
  }

  // A sine (or other) voice with an attack/decay envelope and an optional glide
  private tone(freq: number, o: { at?: number; type?: OscillatorType; attack?: number; decay?: number; gain?: number; glideTo?: number; glide?: number; send?: number; detune?: number }) {
    const ctx = this.ctx!;
    const at = o.at ?? ctx.currentTime;
    const attack = o.attack ?? 0.005;
    const decay = o.decay ?? 0.3;
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(freq, at);
    if (o.detune) osc.detune.value = o.detune;
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, at + (o.glide ?? attack + decay));
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(o.gain ?? 0.1, at + attack);
    env.gain.exponentialRampToValueAtTime(1e-4, at + attack + decay);
    osc.connect(env);
    env.connect(this.master!);
    if (o.send) {
      const send = ctx.createGain();
      send.gain.value = o.send;
      env.connect(send).connect(this.reverb!);
    }
    osc.start(at);
    osc.stop(at + attack + decay + 0.05);
    osc.onended = () => env.disconnect();
  }

  // Filtered noise with a sweeping filter: whooshes, rushes, bursts
  private sweep(o: { at?: number; filter?: BiquadFilterType; from: number; to: number; q?: number; attack: number; decay: number; gain: number; send?: number }) {
    const ctx = this.ctx!;
    const at = o.at ?? ctx.currentTime;
    const source = this.noiseSource();
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter ?? "bandpass";
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.from, at);
    filter.frequency.exponentialRampToValueAtTime(o.to, at + o.attack + o.decay);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(o.gain, at + o.attack);
    env.gain.exponentialRampToValueAtTime(1e-4, at + o.attack + o.decay);
    source.connect(filter).connect(env).connect(this.master!);
    if (o.send) {
      const send = ctx.createGain();
      send.gain.value = o.send;
      env.connect(send).connect(this.reverb!);
    }
    source.start(at);
    source.stop(at + o.attack + o.decay + 0.05);
    source.onended = () => env.disconnect();
  }

  // ---- the continuous drive --------------------------------------------------------

  private buildDrive() {
    const ctx = this.ctx!;
    const rumbleSource = this.noiseSource();
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 140;
    rumbleFilter.Q.value = 0.7;
    const rumble = ctx.createGain();
    rumble.gain.value = 0;
    rumbleSource.connect(rumbleFilter).connect(rumble).connect(this.master!);

    const rushSource = this.noiseSource();
    const rushFilter = ctx.createBiquadFilter();
    rushFilter.type = "bandpass";
    rushFilter.frequency.value = 700;
    rushFilter.Q.value = 0.6;
    const rush = ctx.createGain();
    rush.gain.value = 0;
    rushSource.connect(rushFilter).connect(rush).connect(this.master!);

    const toneOsc = ctx.createOscillator();
    toneOsc.type = "sine";
    toneOsc.frequency.value = 52;
    const tone = ctx.createGain();
    tone.gain.value = 0;
    toneOsc.connect(tone).connect(this.master!);

    rumbleSource.start();
    rushSource.start();
    toneOsc.start();
    this.driveNodes = { rumble, rumbleFilter, rush, rushFilter, tone, toneOsc };
  }

  // Every frame: `level` 0..1 how hard the ship is flying, `warp` 0..1 the jump drive
  drive(level: number, warp: number) {
    const d = this.driveNodes;
    if (!d || !this.ctx) return;
    if (Math.abs(level - this.lastDrive.level) < 0.01 && Math.abs(warp - this.lastDrive.warp) < 0.01) return;
    this.lastDrive = { level, warp };
    const now = this.ctx.currentTime;
    const k = 0.12;
    d.rumble.gain.setTargetAtTime(0.06 * level + 0.14 * warp, now, k);
    d.rumbleFilter.frequency.setTargetAtTime(120 + 260 * level + 500 * warp, now, k);
    d.rush.gain.setTargetAtTime(0.018 * level + 0.06 * warp, now, k);
    d.rushFilter.frequency.setTargetAtTime(500 + 900 * level + 2600 * warp, now, k);
    d.tone.gain.setTargetAtTime(0.025 * warp + 0.01 * level, now, k);
    d.toneOsc.frequency.setTargetAtTime(48 + 14 * level + 40 * warp, now, k);
  }

  // ---- events ---------------------------------------------------------------------

  select(kind: SelectKind = "star") {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    if (kind === "planet") {
      this.tone(880, { at: t, decay: 0.7, gain: 0.05, send: 0.5 });
      this.tone(1318.5, { at: t + 0.07, decay: 0.8, gain: 0.04, send: 0.5 });
    } else if (kind === "moon") {
      this.tone(1046.5, { at: t, decay: 0.5, gain: 0.04, send: 0.5 });
      this.tone(1568, { at: t + 0.06, decay: 0.6, gain: 0.03, send: 0.5 });
    } else {
      // A glass tick
      this.tone(1320, { at: t, decay: 0.18, gain: 0.05, send: 0.35 });
      this.tone(1980, { at: t, decay: 0.12, gain: 0.02, send: 0.35 });
    }
  }

  // A photo: a soft shutter, two short clicks of filtered noise and a faint glass tone
  shutter() {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    this.sweep({ at: t, filter: "highpass", from: 2600, to: 1800, q: 0.7, attack: 0.002, decay: 0.05, gain: 0.09 });
    this.sweep({ at: t + 0.075, filter: "highpass", from: 2200, to: 1500, q: 0.7, attack: 0.002, decay: 0.07, gain: 0.07, send: 0.2 });
    this.tone(1760, { at: t + 0.075, decay: 0.35, gain: 0.015, send: 0.4 });
  }

  deselect() {
    if (!this.live) return;
    this.tone(700, { decay: 0.12, gain: 0.03, glideTo: 520, send: 0.2 });
  }

  // Setting off for somewhere: a rising whoosh over a low swell
  depart(strength = 1) {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    this.sweep({ at: t, from: 260, to: 2400, q: 1.1, attack: 0.45, decay: 1.3, gain: 0.11 * strength, send: 0.3 });
    this.tone(62, { at: t, attack: 0.4, decay: 1.4, gain: 0.08 * strength, glideTo: 96 });
  }

  // Closing in on a planet or a moon: a softer, shorter whoosh
  approach() {
    if (!this.live) return;
    this.sweep({ from: 380, to: 1500, q: 1.3, attack: 0.3, decay: 1.0, gain: 0.07, send: 0.3 });
  }

  // Dropping into a star system: a low, open chord that blooms in the reverb
  arrive() {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    for (const [f, g] of [
      [110, 0.04],
      [164.8, 0.03],
      [220, 0.025],
      [329.6, 0.012],
    ] as const) {
      this.tone(f, { at: t, attack: 0.35, decay: 2.4, gain: g, send: 0.7, detune: (Math.random() - 0.5) * 8 });
    }
  }

  // In orbit: a slow two-note chime
  orbit() {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    this.tone(659.3, { at: t, attack: 0.02, decay: 1.6, gain: 0.04, send: 0.7 });
    this.tone(987.8, { at: t + 0.12, attack: 0.02, decay: 1.8, gain: 0.03, send: 0.7 });
  }

  // The jump drive spinning up over `seconds`
  hyperCharge(seconds = 1.1) {
    if (!this.live) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    // A rising tone with a tremolo that quickens
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(70, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + seconds);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5, t);
    lfo.frequency.exponentialRampToValueAtTime(28, t + seconds);
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.03;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.05, t + seconds * 0.9);
    env.gain.linearRampToValueAtTime(0, t + seconds + 0.08);
    lfo.connect(lfoDepth).connect(env.gain);
    osc.connect(env).connect(this.master!);
    const send = ctx.createGain();
    send.gain.value = 0.3;
    env.connect(send).connect(this.reverb!);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + seconds + 0.1);
    lfo.stop(t + seconds + 0.1);
    osc.onended = () => env.disconnect();
    // Air being drawn in
    this.sweep({ at: t, filter: "highpass", from: 400, to: 5200, q: 0.8, attack: seconds * 0.95, decay: 0.15, gain: 0.05, send: 0.2 });
  }

  // Into hyperspace: a deep punch and a burst that falls away
  hyperEnter(at?: number) {
    if (!this.live) return;
    const t = at ?? this.ctx!.currentTime;
    this.tone(150, { at: t, attack: 0.008, decay: 1.3, gain: 0.32, glideTo: 30, glide: 1.0 });
    this.tone(75, { at: t, attack: 0.01, decay: 1.6, gain: 0.12, glideTo: 28, glide: 1.4, send: 0.3 });
    this.sweep({ at: t, filter: "lowpass", from: 5000, to: 160, q: 0.9, attack: 0.01, decay: 1.1, gain: 0.16, send: 0.5 });
    this.tone(2637, { at: t + 0.02, attack: 0.005, decay: 0.9, gain: 0.012, send: 0.8 });
  }

  // Out of hyperspace: the rush falls, a soft thud and a shimmer
  hyperExit() {
    if (!this.live) return;
    const t = this.ctx!.currentTime;
    this.sweep({ at: t, from: 3200, to: 260, q: 1.0, attack: 0.04, decay: 1.4, gain: 0.1, send: 0.5 });
    this.tone(210, { at: t, attack: 0.01, decay: 0.9, gain: 0.08, glideTo: 90 });
    this.tone(1318.5, { at: t + 0.05, attack: 0.02, decay: 1.4, gain: 0.018, send: 0.8 });
    this.tone(1975.5, { at: t + 0.12, attack: 0.02, decay: 1.4, gain: 0.012, send: 0.8 });
  }

  // The front door: the drive charges for `seconds`, then punches into hyperspace
  dive(seconds = 1.0) {
    if (!this.live) return;
    this.hyperCharge(seconds);
    this.sweep({ from: 200, to: 3000, q: 0.9, attack: seconds, decay: 0.2, gain: 0.06, send: 0.3 });
    this.hyperEnter(this.ctx!.currentTime + seconds);
  }
}

export const sfx = new Sfx();

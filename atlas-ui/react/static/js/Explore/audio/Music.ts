// atlas-ui/react/static/js/Explore/audio/Music.ts
//
// The soundtrack. Browsers only let audio start from a user gesture, so the track is
// fetched and decoded up front (the AudioContext may exist suspended) and `start()` is
// called from the click that dives into the universe.
//
// It loops seamlessly: OVERLAP seconds before the end a new pass starts underneath,
// fading in while the old one plays out, scheduled on the audio clock.

const OVERLAP = 5;
const FIRST_FADE = 1.2;
const MUTED_KEY = "atlas-music-muted";
const VOLUME = 0.7;

export class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffer: Promise<AudioBuffer | null>;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private started = false;
  muted: boolean;

  constructor(url: string) {
    this.muted = readMuted();
    const AudioCtor: typeof AudioContext | undefined = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioCtor) {
      this.buffer = Promise.resolve(null);
      return;
    }
    this.ctx = new AudioCtor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : VOLUME;
    this.master.connect(this.ctx.destination);
    const ctx = this.ctx;
    this.buffer = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null);
  }

  // Shared with the ship's sound effects (see Sfx)
  get context(): AudioContext | null {
    return this.ctx;
  }

  // Call from a click/tap handler
  start() {
    if (!this.ctx || this.started) return;
    this.started = true;
    this.ctx.resume();
    this.buffer.then((buffer) => {
      if (buffer && this.ctx) this.play(buffer, this.ctx.currentTime + 0.02, FIRST_FADE);
    });
  }

  private play(buffer: AudioBuffer, at: number, fade: number) {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(1, at + fade);
    source.connect(gain).connect(this.master!);
    source.start(at);
    source.onended = () => gain.disconnect();
    // The next pass, OVERLAP seconds before this one ends. Created a little ahead of
    // time so a busy main thread cannot make it late
    const next = at + Math.max(1, buffer.duration - OVERLAP);
    const wake = Math.max(0, (next - ctx.currentTime - 2) * 1000);
    this.timer = setTimeout(() => this.play(buffer, next, OVERLAP), wake);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(muted ? 0 : VOLUME, now + 0.6);
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer);
    this.ctx?.close();
  }
}

function readMuted() {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

// atlas-ui/react/static/js/Explore/audio/Music.ts
//
// The soundtrack: four pieces, in an order shuffled on every visit (so it starts with any
// of them) and again each time all four have played, never the same piece twice in a row.
// Browsers only let audio start from a user gesture, so the first piece is fetched and
// decoded up front (the AudioContext may exist suspended) and `start()` is called from the
// click that dives into the universe.
//
// One flows into the next: OVERLAP seconds before a piece ends the next starts underneath,
// fading in while the other plays out, scheduled on the audio clock. Only the piece
// playing and the one after it are kept decoded (decoded audio is large: tens of MB per
// piece); the next is fetched and decoded once the fade into the current one is over.

const OVERLAP = 5;
const FIRST_FADE = 1.2;
const MUTED_KEY = "atlas-music-muted";
const VOLUME = 0.7;

// The order of the pieces: shuffled, played through, shuffled again; a new round never
// opens with the piece that closed the last one
export class Playlist {
  private order: string[] = [];
  private last: string | null = null;

  constructor(private readonly tracks: string[], private readonly random: () => number = Math.random) {}

  next(): string | null {
    if (this.tracks.length === 0) return null;
    if (this.order.length === 0) {
      const round = [...this.tracks];
      for (let i = round.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [round[i], round[j]] = [round[j], round[i]];
      }
      if (round.length > 1 && round[0] === this.last) [round[0], round[1]] = [round[1], round[0]];
      this.order = round;
    }
    this.last = this.order.shift()!;
    return this.last;
  }
}

export class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private playlist: Playlist;
  // The next piece, decoded ahead (or being decoded)
  private upcoming: Promise<AudioBuffer | null> | null = null;
  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private started = false;
  private disposed = false;
  muted: boolean;

  constructor(tracks: string[]) {
    this.muted = readMuted();
    this.playlist = new Playlist(tracks);
    const AudioCtor: typeof AudioContext | undefined = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    this.ctx = new AudioCtor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : VOLUME;
    this.master.connect(this.ctx.destination);
    // The first piece, ready by the time the pilot dives in
    this.prepare();
  }

  // Shared with the ship's sound effects (see Sfx)
  get context(): AudioContext | null {
    return this.ctx;
  }

  // Fetches and decodes the next piece of the playlist. A piece that will not decode is
  // skipped (one try per piece, so a browser without the codec ends up silent, not looping)
  private prepare() {
    if (this.upcoming || !this.ctx) return;
    const ctx = this.ctx;
    const attempt = (left: number): Promise<AudioBuffer | null> => {
      const url = this.playlist.next();
      if (!url || left <= 0 || this.disposed) return Promise.resolve(null);
      return fetch(url)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`))))
        .then((data) => ctx.decodeAudioData(data))
        .catch(() => attempt(left - 1));
    };
    this.upcoming = attempt(4);
  }

  // The next piece, as soon as it is decoded
  private takeUpcoming(): Promise<AudioBuffer | null> {
    this.prepare();
    const next = this.upcoming!;
    this.upcoming = null;
    return next;
  }

  private later(seconds: number, f: () => void) {
    this.timers.push(setTimeout(f, Math.max(0, seconds * 1000)));
  }

  // Call from a click/tap handler
  start() {
    if (!this.ctx || this.started) return;
    this.started = true;
    this.ctx.resume();
    this.takeUpcoming().then((buffer) => {
      if (buffer && this.ctx && !this.disposed) this.play(buffer, this.ctx.currentTime + 0.02, FIRST_FADE);
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
    // The piece after this one, decoded once the one before has faded out (so no more
    // than two are ever in memory)
    this.later(at - ctx.currentTime + OVERLAP + 1, () => this.prepare());
    // It starts OVERLAP seconds before this one ends. Asked for a little ahead of time
    // so a busy main thread cannot make it late
    const next = at + Math.max(1, buffer.duration - OVERLAP);
    this.later(next - ctx.currentTime - 2, () => {
      this.takeUpcoming().then((following) => {
        if (!following || this.disposed) return;
        // (late, if it was still decoding: right away then)
        this.play(following, Math.max(next, ctx.currentTime + 0.05), OVERLAP);
      });
    });
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
    this.disposed = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
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

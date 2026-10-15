// Carousel sounds: card change + card hover. ponytail: module-level on/off, no mixer; add one if the sound design grows.
// Web Audio: samples are fetched + decoded once up front, so playback is instant (a fresh `new Audio()` per play
// fetched the file every time and was blocked until a gesture). Browsers keep the context suspended until the
// first user gesture, so the first pointerdown/keydown/touchend unlocks it.
let on = false; // default OFF (the navbar toggle starts OFF too)

const FLIP = "/audio/paper.m4a";
const HOVER = "/audio/hover.m4a";

const ctx = typeof window === "undefined" ? null : new AudioContext();
const bufs = new Map<string, AudioBuffer>();

if (ctx) {
  for (const src of [FLIP, HOVER]) {
    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((b) => ctx.decodeAudioData(b))
      .then((buf) => bufs.set(src, buf))
      .catch(() => {});
  }
  const unlock = () => {
    ctx.resume().then(() => {
      if (ctx.state === "running") for (const e of EVENTS) removeEventListener(e, unlock, true);
    });
  };
  const EVENTS = ["pointerdown", "keydown", "touchend"];
  for (const e of EVENTS) addEventListener(e, unlock, true);
}

export function setAudio(v: boolean) {
  on = v;
}

function play(src: string) {
  const buf = bufs.get(src);
  if (!on || !ctx || !buf || ctx.state !== "running") return; // not unlocked / not decoded yet: stay silent
  const s = ctx.createBufferSource(); // one source per play, so quick successive plays overlap
  s.buffer = buf;
  s.connect(ctx.destination);
  s.start();
}

export const playFlip = () => play(FLIP);
export const playHover = () => play(HOVER);

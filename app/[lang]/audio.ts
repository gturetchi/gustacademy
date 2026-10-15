// Carousel sounds: card change + card hover. ponytail: one sample, module-level on/off; add preloading / a mixer if the sound design grows.
let on = true; // default ON

export function setAudio(v: boolean) {
  on = v;
}

// fresh element per call so quick successive plays overlap; play() may reject before a user gesture
const play = (src: string) => on && new Audio(src).play().catch(() => {});

export const playFlip = () => play("/audio/paper.m4a");
export const playHover = () => play("/audio/hover.m4a");

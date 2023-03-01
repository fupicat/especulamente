const audioContext = new AudioContext();

export const audioOff = localStorage.getItem("audio-off") === "true";

export async function loadSample(url: string) {
  if (audioOff) return null;
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return await audioContext.decodeAudioData(buffer);
}

export function playSample(sample: AudioBuffer | null) {
  if (sample === null) return;
  const source = audioContext.createBufferSource();
  source.buffer = sample;
  source.connect(audioContext.destination);
  source.start(0);
}

export function loadLoop(
  url: string,
  options: { loop?: boolean; volume?: number } = {}
) {
  if (audioOff) return null;
  const audio = new Audio(url);
  audio.loop = options.loop || false;
  audio.volume = options.volume || 1;
  return audio;
}

export function playLoop(loop: HTMLAudioElement | null) {
  if (loop === null) return;
  loop.play();
}

export function pauseLoop(loop: HTMLAudioElement | null) {
  if (loop === null) return;
  loop.pause();
}

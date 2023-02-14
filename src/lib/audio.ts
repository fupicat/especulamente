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

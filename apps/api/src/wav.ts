import { AppError } from './errors.js';
export const MAX_AUDIO_BYTES = 1_920_044;
export interface PcmAudio { bytes: Uint8Array; samples: Int16Array; duration: number; }
const SAMPLE_RATE = 16000;

function encodePcm(samples: Int16Array): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const tag = (offset: number, value: string) => [...value].forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
  tag(0, 'RIFF'); view.setUint32(4, bytes.length - 8, true); tag(8, 'WAVE'); tag(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true); view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); tag(36, 'data'); view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, sample, true));
  return bytes;
}

// Cut only near silence relative to this recording's speech level. A fixed
// absolute threshold classified softly spoken words as pauses and cut their context.
// At most 12 sequential subrequests; never discard samples or force a language.
export function transcriptionSegments(bytes: Uint8Array): Uint8Array[] {
  const { samples } = readWav(bytes);
  const frame = 320, minimum = 4 * SAMPLE_RATE, quietMinimum = 0.30 * SAMPLE_RATE;
  const energies: number[] = [];
  for (let offset = 0; offset < samples.length; offset += frame) {
    const end = Math.min(offset + frame, samples.length);
    let energy = 0;
    for (let index = offset; index < end; index++) energy += (samples[index] / 32768) ** 2;
    energies.push(Math.sqrt(energy / (end - offset)));
  }
  const levels = [...energies].sort((a, b) => a - b);
  const quietThreshold = Math.min(0.008, levels[Math.floor(levels.length * 0.95)] * 0.02);
  const boundaries = [0];
  let quietStart: number | undefined;
  const considerPause = (quietEnd: number) => {
    if (quietStart === undefined || quietStart === 0 || quietEnd - quietStart < quietMinimum || boundaries.length >= 12) return;
    const middle = Math.floor((quietStart + quietEnd) / 2);
    if (middle - boundaries[boundaries.length - 1] >= minimum && samples.length - middle >= minimum) boundaries.push(middle);
  };
  for (let offset = 0; offset < samples.length; offset += frame) {
    if (energies[offset / frame] < quietThreshold) quietStart ??= offset;
    else { considerPause(offset); quietStart = undefined; }
  }
  // A trailing quiet run cannot separate two speech spans.
  boundaries.push(samples.length);
  return boundaries.length === 2 ? [bytes] : boundaries.slice(1).map((end, index) => encodePcm(samples.subarray(boundaries[index], end)));
}
// Only the format normalized by our recorder is accepted. Never truncate an upload.
export function readWav(bytes: Uint8Array): PcmAudio {
  const invalid = () => new AppError('invalid_input', 'Use a mono 16 kHz PCM16 WAV recording of up to 60 seconds.');
  if (bytes.length < 44 || bytes.length > MAX_AUDIO_BYTES) throw invalid();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (start: number) => String.fromCharCode(...bytes.subarray(start, start + 4));
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE' || view.getUint32(4, true) + 8 !== bytes.length) throw invalid();
  let format = false, data: Uint8Array | undefined;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = view.getUint32(offset + 4, true), next = offset + 8 + size;
    if (next > bytes.length) throw invalid();
    if (tag(offset) === 'fmt ') {
      if (format || size < 16 || view.getUint16(offset + 8, true) !== 1 || view.getUint16(offset + 10, true) !== 1 || view.getUint32(offset + 12, true) !== 16000 || view.getUint32(offset + 16, true) !== 32000 || view.getUint16(offset + 20, true) !== 2 || view.getUint16(offset + 22, true) !== 16) throw invalid();
      format = true;
    }
    if (tag(offset) === 'data') {
      if (data) throw invalid();
      data = bytes.subarray(offset + 8, next);
    }
    offset = next + (size % 2);
    if (offset > bytes.length) throw invalid();
  }
  if (!format || !data || data.length < 320 || data.length % 2 || data.length > 1_920_000) throw invalid();
  const samples = new Int16Array(data.length / 2);
  const pcm = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let energy = 0;
  for (let i = 0; i < samples.length; i++) { samples[i] = pcm.getInt16(i * 2, true); energy += (samples[i] / 32768) ** 2; }
  // Only reject near digital silence here. Absolute speech-volume thresholds
  // reject intelligible quiet recordings; recognition remains the provider's job.
  if (Math.sqrt(energy / samples.length) < 0.00003) throw new AppError('no_speech', 'No speech detected. Try speaking closer to your microphone.', 422);
  return { bytes, samples, duration: samples.length / 16000 };
}

import { AppError } from './errors.js';
export const MAX_AUDIO_BYTES = 1_920_044;
export interface PcmAudio { bytes: Uint8Array; samples: Int16Array; duration: number; }
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
  if (Math.sqrt(energy / samples.length) < 0.001) throw new AppError('no_speech', 'No speech detected. Try speaking closer to your microphone.', 422);
  return { bytes, samples, duration: samples.length / 16000 };
}

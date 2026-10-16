import { AppError } from './errors.js';

const HOUR_MS = 60 * 60 * 1000;

// Best effort only: memory is private to this process and is lost on restart.
// All visitors share this allowance. No IP addresses, audio or text are retained.
export function createRecordingLimit(now: () => number = Date.now) {
  let count = 0;
  let resetAt = 0;
  return () => {
    const time = now();
    if (time >= resetAt) {
      count = 0;
      resetAt = time + HOUR_MS;
    }
    if (count >= 20) throw new AppError('recording_limit', 'The shared 20-recording hourly allowance has been used. Your existing text is still available.', 429, Math.max(1, Math.ceil((resetAt - time) / 1000)));
    // Reserve synchronously before awaiting the provider, including failed provider attempts.
    count++;
  };
}

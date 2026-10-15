import type { FailureCode } from '@saylor/contracts';
export class AppError extends Error {
  constructor(public code: FailureCode, message: string, public status: 400 | 403 | 413 | 422 | 429 | 500 | 502 | 503 | 504 = 400, public retryAfter?: number, public rateLimits: Record<string, string> = {}) { super(message); }
}

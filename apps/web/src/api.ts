import type { Failure, ProcessRequest, ProcessResult, Transcription } from '@saylor/contracts';
export class ApiError extends Error {
  constructor(public detail: Failure['error']) { super(detail.message); }
}
async function request<T>(path: string, body: Blob | string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', headers: { 'Content-Type': typeof body === 'string' ? 'application/json' : 'audio/wav' }, body, signal: AbortSignal.any([AbortSignal.timeout(65_000), ...(signal ? [signal] : [])]) }); }
  catch (error) { if (signal?.aborted) throw error; if (error instanceof Error && error.name === 'TimeoutError') throw new ApiError({ code: 'timeout', message: 'The local request took too long. Please try again.' }); throw new ApiError({ code: 'unavailable', message: 'Cannot reach the local service. Check that SayLor is running and try again.' }); }
  let data: unknown;
  try { data = await response.json(); } catch { throw new ApiError({ code: 'unavailable', message: 'The local service returned an unreadable response. Please try again.' }); }
  if (!response.ok) throw new ApiError((data as Failure).error);
  return data as T;
}
export const transcribe = (wav: Blob, signal?: AbortSignal) => request<Transcription>('transcribe', wav, signal);
export const processText = (input: ProcessRequest, signal?: AbortSignal) => request<ProcessResult>('process', JSON.stringify(input), signal);

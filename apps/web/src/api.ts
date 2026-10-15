import type { Failure, ProcessRequest, ProcessResult, Transcription } from '@saylor/contracts';
export class ApiError extends Error {
  constructor(public detail: Failure['error']) { super(detail.message); }
}
async function request<T>(path: string, body: Blob | string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/${path}`, { method: 'POST', headers: { 'Content-Type': typeof body === 'string' ? 'application/json' : 'audio/wav' }, body, signal: AbortSignal.any([AbortSignal.timeout(65_000), ...(signal ? [signal] : [])]) }); }
  catch (error) { if (signal?.aborted) throw error; throw new ApiError({ code: 'unavailable', message: 'Cannot reach the local service. Check that SayLor is running and try again.' }); }
  const data = await response.json();
  if (!response.ok) throw new ApiError((data as Failure).error);
  return data as T;
}
export const transcribe = (wav: Blob, signal?: AbortSignal) => request<Transcription>('transcribe', wav, signal);
export const processText = (input: ProcessRequest, signal?: AbortSignal) => request<ProcessResult>('process', JSON.stringify(input), signal);

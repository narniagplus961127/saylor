export type OutputChoice = 'original' | 'en' | 'zh' | 'ms';
export interface Transcription { transcript: string; }
export interface ProcessRequest { transcript: string; output: OutputChoice; }
export interface ProcessResult { result: string; }
export type FailureCode = 'invalid_input' | 'no_speech' | 'quota' | 'recording_limit' | 'unavailable' | 'timeout' | 'configuration' | 'forbidden';
export interface Failure { error: { code: FailureCode; message: string; retryAfter?: number; }; }

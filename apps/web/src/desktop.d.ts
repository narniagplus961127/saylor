export {};
declare global {
  interface Window {
    saylorDesktop?: {
      onCommand(callback: (command: { kind: 'start' | 'stop' | 'cancel'; id: string }) => void): () => void;
      updateStage(stage: string): void;
      complete(id: string, text: string): Promise<{ ok: boolean; message: string }>;
      cancel(): void;
    };
  }
}

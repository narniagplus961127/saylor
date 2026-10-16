const { randomUUID } = require('node:crypto');

function createDictationController(io) {
  let session = null;
  let stage = 'idle';
  let autoPaste = true;
  const clear = () => { session = null; io.active(false); };
  return {
    setAutoPaste(value) { autoPaste = Boolean(value); if (!autoPaste && session) session.autoPaste = false; },
    updateStage(value) {
      stage = value;
      if (value === 'error' || value === 'idle') clear();
    },
    cancel() {
      const id = session?.id;
      clear();
      if (id) io.send({ kind: 'cancel', id });
    },
    async toggle() {
      if (session) {
        if (stage === 'recording') { stage = 'transcribing'; io.send({ kind: 'stop', id: session.id }); }
        return;
      }
      if (!['idle', 'ready', 'error'].includes(stage)) return;
      const current = { id: randomUUID(), target: null, autoPaste, expiresAt: Date.now() + 180_000 };
      session = current;
      io.active(true);
      try {
        const target = await io.capture();
        if (session !== current) return;
        current.target = io.isOwnTarget(target) ? null : target;
        stage = 'permission';
        io.show();
        io.send({ kind: 'start', id: current.id });
      } catch {
        if (session === current) { clear(); io.notify('Cannot identify the active window. Open SayLor to record and copy manually.'); }
      }
    },
    async complete(id, text) {
      const current = session;
      if (!current || current.id !== id || Date.now() > current.expiresAt || typeof text !== 'string' || !text.trim() || text.length > 50_000) {
        if (current?.id === id) clear();
        return { ok: false, message: 'Automatic paste was cancelled. Review and copy the result.' };
      }
      if (current.pasting) return { ok: false, message: 'Paste is already in progress.' };
      current.pasting = true;
      try {
        if (!current.autoPaste || !current.target) return { ok: false, message: 'Ready to review and copy.' };
        await io.focus(current.target);
        if (session !== current || !current.autoPaste) return { ok: false, message: 'Automatic paste was cancelled. Review and copy the result.' };
        io.writeClipboard(text);
        await io.paste(current.target);
        io.hide();
        return { ok: true, message: 'Pasted into your original app. The result is also on your clipboard.' };
      } catch {
        io.notify('Automatic paste was unavailable or focus changed. Your result is available in SayLor for manual copy.');
        return { ok: false, message: 'Automatic paste was unavailable or focus changed. Review and copy the result.' };
      } finally {
        if (session === current) clear();
      }
    }
  };
}

module.exports = { createDictationController };

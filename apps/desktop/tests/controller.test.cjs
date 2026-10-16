const test = require('node:test');
const assert = require('node:assert/strict');
const { createDictationController } = require('../controller.cjs');

function fixture(overrides = {}) {
  const events = [];
  const io = {
    capture: async () => ({ handle: '1234', pid: 99 }), isOwnTarget: () => false,
    send: value => events.push(value), show() {}, hide: () => events.push('hide'), active() {}, notify() {},
    focus: async () => events.push('focus'), paste: async () => events.push('paste'), writeClipboard: value => events.push(value), ...overrides
  };
  return { events, controller: createDictationController(io) };
}
test('shortcut captures a target, toggles Stop, pastes once and ignores stale completions', async () => {
  const { controller, events } = fixture();
  await controller.toggle();
  const id = events[0].id;
  assert.equal(events[0].kind, 'start');
  controller.updateStage('recording'); await controller.toggle();
  assert.deepEqual(events[1], { kind: 'stop', id });
  const result = await controller.complete(id, 'Non-sensitive result.');
  assert.equal(result.ok, true);
  assert.deepEqual(events.slice(2), ['focus', 'Non-sensitive result.', 'paste', 'hide']);
  assert.equal((await controller.complete(id, 'Duplicate')).ok, false);
  assert.equal(events.filter(e => e === 'paste').length, 1);
});
test('focus changes prevent clipboard writes and insertion; paste failures preserve a manual-copy result', async () => {
  const failedFocus = fixture({ focus: async () => { throw Error('focus changed'); } });
  await failedFocus.controller.toggle();
  assert.equal((await failedFocus.controller.complete(failedFocus.events[0].id, 'Result')).ok, false);
  assert.equal(failedFocus.events.includes('Result'), false);
  const failedPaste = fixture({ paste: async () => { throw Error('Windows denied'); } });
  await failedPaste.controller.toggle();
  assert.equal((await failedPaste.controller.complete(failedPaste.events[0].id, 'Result')).ok, false);
  assert.ok(failedPaste.events.includes('Result')); assert.equal(failedPaste.events.includes('hide'), false);
});

test('disabling automatic paste while focus is pending takes effect before clipboard or insertion', async () => {
  const f = fixture({ focus: async () => f.controller.setAutoPaste(false) });
  await f.controller.toggle();
  const id = f.events[0].id;
  assert.equal((await f.controller.complete('unrelated-session', 'Stale result')).ok, false);
  assert.equal((await f.controller.complete(id, 'Result')).ok, false);
  assert.equal(f.events.includes('Result'), false);
  assert.equal(f.events.includes('paste'), false);
});
test('cancellation during capture/focus, errors and disabled automatic paste never inject text', async () => {
  let releaseCapture;
  const capture = fixture({ capture: () => new Promise(resolve => { releaseCapture = resolve; }) });
  const pending = capture.controller.toggle(); capture.controller.cancel(); releaseCapture({ handle: '1', pid: 2 }); await pending;
  assert.equal(capture.events.some(e => e.kind === 'start'), false);
  let releaseFocus;
  const focus = fixture({ focus: () => new Promise(resolve => { releaseFocus = resolve; }) });
  await focus.controller.toggle(); const completion = focus.controller.complete(focus.events[0].id, 'Result'); focus.controller.cancel(); releaseFocus(); await completion;
  assert.equal(focus.events.includes('Result'), false);
  for (const mode of ['error', 'disabled']) {
    const f = fixture(); if (mode === 'disabled') f.controller.setAutoPaste(false);
    await f.controller.toggle(); const id = f.events[0].id;
    assert.equal(typeof id, 'string');
    if (mode === 'error') f.controller.updateStage('error');
    await f.controller.complete(id, 'Result'); assert.equal(f.events.includes('paste'), false);
  }
});

# Windows desktop map

## Notes

Implementation is complete on `codex/windows-desktop`; owner reported successful hands-on testing on 2026-10-16. Portable app: `apps/desktop/dist/releases/SayLor-win32-x64/SayLor.exe`; archive: `apps/desktop/dist/SayLor-Windows-x64.zip`. Instructions: [desktop guide](../../docs/desktop.md). The owner authorized publishing and merging the desktop work and visitor README update on 2026-10-16. Native mobile apps and PWAs are removed from the roadmap. No new account or paid service is needed.

Verification on 2026-10-16: complete `pnpm check` passed 46 checks (5 tool, 5 desktop, 36 browser/API), typecheck, build and credential scanning. One subsequent desktop safety test brings the independently passing desktop suite to 6 (47 checks combined). Desktop smoke passes with synthetic microphone, the real sandboxed Electron renderer, restricted local protocol, controlled Hono API, translation, copy, native target capture, shortcut registration/IPC, cancellation and close-to-tray cancellation of manual capture. Real native Ctrl+V succeeded into a separate test-owned text box; earlier attempts with a different foreground window were blocked rather than injected. Packaged startup, camera denial, absent test hooks and execution of the unpacked native helper pass without local servers or live Groq requests. Desktop artifact credential scanning passes. Changed text files use CRLF.

Implementation starts on `codex/windows-desktop` from merged main `cd2dacd`. Production remains unchanged. Existing Windows .NET Framework C# compiler is available; Rust is not on PATH. Electron 44.8.0 and @electron/packager 20.3.0 are current npm versions checked 2026-10-16.

## Decisions-so-far

- [01: Windows desktop MVP](issues/01-windows-desktop.md) resolved after the owner reported "done tested, works fine" on 2026-10-16. This is owner-reported acceptance; no detailed test matrix or recordings were provided.

- Owner chose tray, global shortcut and automatic paste. See [spec](spec.md).
- Current product scope is web and Windows desktop; the owner cancelled native mobile app plans and authorized publication/PR merge.
- Bundle trusted local UI, reuse hosted API through a narrow proxy, and use a native Windows helper for target validation/focus/Ctrl+V. No provider key in desktop artifacts.
- Formal quality gate is deferred for personal practice; earlier failed evaluation remains historical evidence.
- Fixed packaging to unpack the native helper as a directory, verified by executing the packaged helper. Disabling automatic paste also disables an in-flight session before insertion. Closing the window cancels manual and shortcut capture.

## Fog

- Owner reports desktop testing successful. Compatibility across other Windows apps and elevated targets remains unmeasured; retain manual-copy fallback. Formal speech-quality acceptance remains deferred.
- Distribution is unsigned and portable; no paid signing or automatic updater.

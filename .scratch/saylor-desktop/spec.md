# SayLor Windows desktop MVP

Status: resolved
Authorized: owner selected "Tray + global shortcut + automatic paste" on 2026-10-16. Free personal practice project; no PWA. Formal speech-quality acceptance is deferred by the owner, not marked passed.

## Behavior

- Windows x64 portable desktop app, tray presence, single instance and explicit Quit. Closing its window cancels active work and hides to tray.
- Ctrl+Alt+Space starts dictation from the current app; pressing it again stops. Existing 60-second cap and Cancel remain. A shortcut conflict must be reported rather than silently disabling the feature.
- Remember the foreground window before showing SayLor. After successful processing, paste the selected output into that original window only if it is still active or SayLor is active. A different active app, invalid target, held modifier, expired session, cancellation, provider failure or Windows insertion restriction must prevent automatic insertion. Retain results for manual copy.
- Automatic paste writes the processed result to the clipboard; it does not press Enter or submit messages. Manual recording in the SayLor window uses review/copy. Tray checkbox can disable automatic paste.
- Bundle the existing React UI locally. Use a narrow local protocol handler to proxy only existing API operations to https://qw-saylor.vercel.app/. Keep Groq credentials on Vercel. Internet is required; shared server allowance and provider quotas still apply.
- Sandbox renderer, isolate context, disable Node integration, block external navigation/new windows and deny camera/display capture. Ask for audio-only microphone permission. Native paste target stays in the main process; renderer cannot choose a handle or execute arbitrary commands.
- No recording/transcript history, auto-start, auto-updater, paid signing, account system or elevation. Package a portable unsigned Windows folder/zip. Native mobile apps and PWAs are not planned. Non-Windows desktop support is outside the current scope.

## Verification

Test session identity, stale completion/cancel, changed target, API allowlist/size/errors, IPC origin/frame restrictions, clipboard/paste failures and existing browser regressions using controlled providers. Compile the native Windows helper and package the app. Verify packaged startup without local API servers. Actual microphone/global shortcut/paste in another Windows application needs a manual owner check if native UI automation is unavailable. Never claim that check passed from mocks.

Implementation evidence (2026-10-16): controlled desktop workflow and native paste into a separate test-owned window pass, as do all existing web/API checks and packaged startup. The native helper is unpacked and runs from the packaged resources. Test hooks and API overrides are disabled in packaged builds. Closing the window cancels manual as well as shortcut capture; disabling automatic paste applies to the active session. Owner subsequently reported "done tested, works fine" on 2026-10-16; accepted for personal use on that owner-reported evidence, without a supplied detailed test matrix. See [map](map.md) for check counts and artifacts.

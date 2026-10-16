# SayLor for Windows

The first desktop version is a portable Windows x64 app. It uses the existing hosted SayLor API and requires internet access. No API key belongs in the desktop folder. The web app continues to work separately.

## Open and use

Extract the complete `SayLor-Windows-x64.zip`, then open `SayLor.exe` inside `SayLor-win32-x64`. Keep the accompanying files together. This personal build is unsigned; it has no installer, automatic updater or startup registration.

1. Choose your output language in SayLor. The choice is remembered.
2. Put the cursor in the text field of your destination app.
3. Press **Ctrl+Alt+Space**, allow microphone access if asked, and speak.
4. Press **Ctrl+Alt+Space** again to stop. Recording also stops at 60 seconds.
5. After successful processing, SayLor pastes into the original app and hides. It replaces your clipboard with the result, without pressing Enter or sending a message.

**Escape** cancels shortcut dictation. Cancel or closing the SayLor window cancels pending work; closing hides the window to the tray. Right-click its tray icon to reopen it, disable automatic paste, or **Quit SayLor**.

If you switch to another app while processing, Windows refuses insertion, or the original window closes, use the retained result and **Copy result**. Elevated apps may refuse paste. Recording with the window's Start recording button always uses manual copy. Language changes after recording translate immediately but do not automatically paste again.

Audio and text go through the hosted API to Groq. Recordings and transcripts have no saved history. Closing to the tray retains useful text in the current session; quitting clears it. Only the output preference is stored. Existing server limits apply: 20 recording submissions total per hour per running server instance, with separate allowances across instances and resets on restarts. Text processing and provider quotas remain separate. There is no new paid service or desktop account.

## First hands-on check

Open an empty Notepad document. Choose English in SayLor, return to Notepad, then use the shortcut to dictate a non-sensitive sentence. Confirm that the result pastes once into Notepad without Enter. Repeat with Chinese speech and English output. Check Escape cancellation and switching to another app before processing finishes: neither should insert a result. Use an ordinary, non-elevated target first.

Automated checks use synthetic audio and controlled provider responses. They do not establish real microphone quality or compatibility with every Windows app. The owner has deferred formal speech-quality acceptance for this practice project; earlier failed evaluations remain recorded.

## Build and verify from source

Use Windows x64, Node 24 and the pinned pnpm version. The build uses the C# compiler included with Windows .NET Framework. From the repository root:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd --filter @saylor/desktop runtime:install
pnpm.cmd check
pnpm.cmd test:desktop:smoke
pnpm.cmd desktop:build
pnpm.cmd check:secrets --desktop
```

The Electron runtime installation downloads the pinned official runtime. The desktop build bundles only explicitly selected runtime files and the compiled web UI; it does not copy `.env`, evaluation recordings or the checkout. Output is `apps/desktop/dist/releases/SayLor-win32-x64`. `pnpm.cmd desktop:dev` builds the UI/native helper and starts a development window. No local API server is needed: desktop requests use the hosted API unless running the dedicated controlled test.

`pnpm.cmd check` includes desktop controller/proxy checks and all existing browser/API checks. The Windows smoke test exercises the real Electron sandbox, local protocol, controlled API, synthetic microphone, translation, clipboard, native target capture, shortcut registration/IPC, cancellation and tray behavior. Its native paste attempt is restricted to a new test-owned window: it reports separately if Windows foreground rules prevent that check. It never injects fixture text into an existing user app.

`pnpm.cmd test:desktop:package` verifies the packaged app starts with no local servers or test overrides. It does not send recordings or consume provider quota. No deployment or repository merge is part of these commands.

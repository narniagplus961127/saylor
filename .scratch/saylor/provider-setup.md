# Groq account checks required for ticket 01

Status: Local key verified; Free plan and speech/chat ZDR user-confirmed. Eligibility and full quality verification remain pending.
Date: 2026-10-15

Initial check: the user had an account but no configured local key/settings. During this implementation session the user added GROQ_API_KEY to a local environment file and confirmed the Free plan, billing/auto-recharge disabled, and speech/chat ZDR enabled. Read-only authentication returned HTTP 200 and listed the candidate models. Non-sensitive developer screening subsequently ran; see the provider verification report. The steps below are retained as setup reference, not an outstanding request to recreate the key.

## Account actions

1. Sign in to [Groq Console](https://console.groq.com/). Keep the organization on its free plan; do not enable billing, auto-recharge, or a paid trial.
2. Inspect the organization's [limits](https://console.groq.com/settings/limits). Record the effective model quotas for speech transcription and text processing. The exact dashboard location can vary; use the console's settings navigation if the direct page is unavailable.
3. Follow [Groq's data controls documentation](https://console.groq.com/docs/your-data) to enable zero data retention for both speech transcription and chat completions. Confirm the actual settings in your organization and note any exceptions. Do not opt into training or submit sensitive content through feedback/support.
4. Create a dedicated key on the [API keys page](https://console.groq.com/keys). Keep it local; do not paste it into chat, a ticket, terminal command arguments, or the public repository.

## Store the key locally on Windows

The workspace ignores local environment files. To create one without echoing the key, run this in PowerShell from the SayLor project directory. It writes only GROQ_API_KEY and refuses to overwrite an existing environment file.

```powershell
if (Test-Path -LiteralPath '.env') { throw 'An environment file already exists; preserve it and add the key using a local editor.' }
$saylorKeySecret = Read-Host 'Groq API key' -AsSecureString
$saylorKeyCredential = [System.Net.NetworkCredential]::new('', $saylorKeySecret)
try {
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) '.env'), 'GROQ_API_KEY=' + $saylorKeyCredential.Password + [Environment]::NewLine)
} finally {
    $saylorKeyCredential = $null
    $saylorKeySecret.Dispose()
}
```

The file contains a plaintext credential, so it must remain local and ignored. The agent can later read it for authorized inference without printing it. No key value belongs in a confirmation message.

## Eligibility is a separate gate

The current services agreement contains a consumer-use limitation. A personal developer app may differ from direct consumer use, but account creation or a working API does not itself settle this. Record authoritative clarification before treating the provider as accepted.

If the public documentation does not establish eligibility, the question for Groq support is: “I am developing a noncommercial application that I alone will use for dictation and translation. Does this developer use qualify under your Services Agreement's consumer-use restriction, including on the Free plan?” No support message has been sent by the agent.

## What happens next

The key is already stored locally and authenticated. Do not recreate it or share it. Free plan and privacy settings are user-confirmed; actual multilingual audio quality, eligibility clarification, and any missing effective quota evidence still need verification before ticket 01 can pass. Tickets 02–06 remain gated until then.

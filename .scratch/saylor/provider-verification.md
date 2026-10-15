# SayLor provider prerequisite review

Verified 2026-10-15, Asia/Kuala_Lumpur. The public-document review below was completed without account access or API samples. Later account confirmation and non-sensitive developer screening are recorded in the follow-up section; do not read the initial unverified-account statements as the latest state.

## Recommendation: NOT PASSED / evidence incomplete

**Latest outcome:** preliminary selection PASSED for implementation after the user's eligibility waiver and additional public-audio screening below. The original recommendation and review are retained as historical evidence; final release acceptance is still pending.

Groq is a plausible $0 candidate. Published capacity and controls look suitable, but personal developer eligibility, actual account state, and measured multilingual quality remain unverified. Ticket 01 must remain incomplete.

## Eligibility and training

The [Services Agreement](https://console.groq.com/docs/legal/services-agreement), modified June 22, 2026, covers persons/entities using developer/business services, but expressly excludes consumer use. Section 3.1 permits APIs in Customer Applications. An individual developer building SayLor plausibly fits, but personal productivity versus excluded consumer use is not explicitly clarified. This is uncertainty, not proven prohibition or permission. Obtain an applicable Groq clarification; a working API key does not establish eligibility. Do not contact support without user authorization.

Section 4.2 prohibits using inputs/outputs for training/fine-tuning absent explicit customer permission/instruction. Processing to provide the service, comply with law, ensure reliability, or confirm AUP compliance remains allowed. Separate model terms apply. No-training is not no-retention.

## Retention

[Your Data](https://console.groq.com/docs/your-data) says all customers can enable ZDR globally or per feature; no paid-tier restriction is stated. Chat completions, responses, audio transcription/translation/speech are ZDR eligible. Free therefore appears included in the all-customers wording, but actual account availability/enablement is unverified.

Default inference content is not routinely retained. Reliability/abuse logs may contain inputs/outputs for up to 30 days or longer where legally required. ZDR opts out of reliability/abuse content retention and disables persistence-dependent features. Usage metadata is always retained and described as excluding inputs/outputs. Retained customer data is in U.S. GCP buckets. Do not promise metadata disappears or lawful-retention obligations cease.

Need actual-account evidence of Free plan, inference ZDR, no optional training/sharing consent, and no persistence features. Capture only redacted settings evidence, never credentials.

## Published free limits

[Rate Limits](https://console.groq.com/docs/rate-limits):

| Model | RPM | RPD | TPM | TPD | Audio seconds/hour | Audio seconds/day |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| whisper-large-v3 / turbo | 20 | 2,000 | — | — | 7,200 | 28,800 |
| openai/gpt-oss-120b / 20b | 30 | 1,000 | 8,000 | 200,000 | — | — |

These are organization-wide summaries, not actual-account verification. Console Limits is authoritative; exceptions exist. Estimated 30 × 20s is 600 audio seconds/day, about 2.1% of published daily capacity; one full repeat doubles it to 1,200. Illustratively 30 text calls × 1,000 combined tokens is 30,000/day; actual prompt/output/reasoning usage and regeneration must be measured. Bursts can hit shorter limits. Exceeding limits yields 429; retain manual retries and honor retry guidance.

[Billing FAQs](https://console.groq.com/docs/billing-faqs) says Developer upgrade requires payment details and starts usage billing. Stay Free, never activate upgrade/trial/payment, and do not confuse paid spend caps with $0 protection. Model-card prices are not evidence of Free-request charges. Existing organization billing status is unknown.

## Stable candidates and compatibility

[Models](https://console.groq.com/docs/models) lists whisper-large-v3/turbo and openai/gpt-oss-120b/20b as Production. They remain provisional research candidates. Llama 3.1/3.3 now display Enterprise / Contact Sales; old free assumptions are unsafe. Qwen3.8-27B is Preview, unsuitable for stable-model selection.

[Speech docs](https://console.groq.com/docs/speech-to-text): Free upload max 25 MB. Supports flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm; only first track used; minimum input 0.01s, minimum billed duration 10s. JSON/verbose JSON/text supported, optional language hint, internal 16kHz mono downsampling. Browser WebM is plausible pending a live compatibility test. Audio translations output English only, and turbo does not support audio translation. Use transcription followed by text generation for all targets, especially Chinese/Malay. No mixed-language accuracy promise follows from these capabilities.

[Whisper upstream tokenizer](https://raw.githubusercontent.com/openai/whisper/main/whisper/tokenizer.py) includes English en, Chinese zh with Mandarin alias, and Malay ms. This confirms language vocabulary, not code-switch preservation or accent fidelity.

[Chat Completions](https://console.groq.com/docs/text-chat) accepts role-separated text messages for single-turn generation, mechanically suitable for cleanup/translation. Disable tools/search; keep dictated content outside instruction roles. [GPT-OSS model card](https://console.groq.com/docs/model/openai/gpt-oss-120b) describes multilingual use but cannot prove SayLor target translation fidelity.

## Concrete blockers

1. Clarify personal productivity developer eligibility under the consumer-use exclusion.
2. Verify actual Free organization billing state, quotas, model access, ZDR and no-sharing/training settings without accessing/exposing secrets.
3. After privacy/eligibility checks, run preliminary non-sensitive English, Mandarin, Malay, mixed-language and three-target translation samples. Measure both stages; test names, numbers, dates, negation, self-corrections, invented content, and spoken override attempts.
4. Later perform the separate 20-recording acceptance/latency gate. Published performance is not observed quality.

No provider is accepted, and Gemini comparison was unnecessary for this decision.

## Implementation-session follow-up

### Account and authentication

- The user added GROQ_API_KEY to the local environment file. Its name was retained; its value was never printed or copied into project documentation.
- The user explicitly confirmed Free plan, billing/auto-recharge disabled, and zero data retention enabled for speech transcription and chat completions. This is user-confirmed account evidence, not independent console inspection or proof of every optional data-sharing setting.
- A read-only model-list request returned HTTP 200 with 11 listed models, including whisper-large-v3-turbo, whisper-large-v3, openai/gpt-oss-120b, and openai/gpt-oss-20b.
- Observed response headers reported a speech request limit of 2,000 and text limits of 1,000 requests and 8,000 tokens. Header values are snapshots; they do not prove every effective account quota, particularly audio-seconds limits or paid status.
- No billing settings, external accounts, repository rules, or merge settings were changed. Local credentials and raw evaluation artifacts are ignored by Git.

### Non-sensitive developer screening

Screened only fixed synthetic material using whisper-large-v3-turbo and openai/gpt-oss-120b. One audio request plus eleven text requests completed with HTTP 200, consuming 3,330 reported text tokens. There were no automatic retries or paid fallbacks. The three follow-up requests were intentional prompt-tuning experiments after observed failures.

| Case | Observation |
| --- | --- |
| Synthetic English audio, 10.543 seconds | Transcription preserved Thursday/Friday correction, 3 p.m., 42 ringgit, and negation; request took 537 ms. Audio was generated with the installed Microsoft Zira voice, not recorded from the user. |
| English cleanup | Removed filler and replaced Thursday with Friday while preserving 3 p.m. and 42 ringgit. |
| Mandarin cleanup, initial | Failed: kept both the superseded three o'clock and corrected four o'clock, and retained a filler. |
| Malay cleanup, initial | Failed: kept both three o'clock and the corrected four o'clock. |
| Mixed-language text | Preserved the Chinese/English/Malay language switches in the supplied text. This did not test mixed-language audio recognition. |
| English, Simplified Chinese, Malay translation | Returned coherent candidate translations of fixed synthetic text. This is screening, not user/native-speaker acceptance or a comprehensive semantic benchmark. |
| Quoted override instruction | Kept the quotation as content rather than outputting the instructed replacement. One successful case is not comprehensive injection protection. |
| Explicit correction rule, follow-up | On the same known Mandarin/Malay failures, replaced the superseded time with four o'clock. Malay output began with lowercase text, a minor formatting issue. Mixed-language preservation remained intact on its repeated case. |

The revised instruction explicitly described correction as replacement and included Chinese, Malay, and English examples. Success on those same examples is prompt tuning, not independent evidence of generalized accuracy. Treat that distinction as material when choosing the final processing contract.

Initial text requests took 510–7,674 ms; correction follow-ups took 660–828 ms. One Chinese translation alone exceeded the five-second target. The 537 ms synthetic audio call is not Stop-to-final-result browser timing and does not establish performance on typical 20-second user clips.

### Remaining gate

Ticket 01 is **needs-info**, not resolved:

1. Personal-use eligibility under the consumer-use wording still lacks authoritative clarification. The experiments were non-sensitive developer evaluation, not acceptance of the intended personal production use.
2. The system's only installed synthesis voice is English. Mandarin, Malay, and mixed-language **audio** have not been screened; text-only success cannot replace that evidence. Obtain short non-sensitive representative audio samples and compare expected meanings before accepting the provider.
3. Effective audio-seconds quotas and any optional training/sharing settings not covered by the user's confirmation need documented account evidence if relied upon.
4. The final 20-recording quality and latency gate remains a separate later ticket. No application code has been implemented, and no branch has been pushed or merged.

The local integration branch is codex/saylor-integration. The user's implement-spec invocation authorizes execution subject to prerequisites, so another general implementation approval is not needed once this gate actually passes. No authorization can substitute for missing provider evidence.

## Later user steering and public-audio decision

The user explicitly canceled the support inquiry and waived eligibility verification, directing the agent to assume private use is acceptable. This supersedes the implementation blocker without becoming a claim of provider confirmation. Only an account-question category had been selected in the support widget; the substantive eligibility question was not sent.

The user authorized public audio sourcing. Google FLEURS CC BY 4.0 supplied a 7.56-second Mandarin sample, a 7.74-second Malay sample, and a 6.54-second English sample with dataset reference transcripts. Sources, attribution, hashes, and expected meanings are in the separate public audio source record. A 22.34-second clip joins the three with short gaps; it is artificial sequential switching, not natural trilingual conversation.

- Mandarin Turbo transcription matched the reference meaning and Amazon River name (503 ms).
- Malay Turbo retained the meaning but used Indonesian spelling and language metadata (322 ms); metadata is not a reliable language ground truth.
- Unsegmented joined Turbo garbled Amazon River as Yama-Shin (384 ms). Large V3 translated all three segments into Chinese and changed meanings (595 ms). Neither raw whole-clip result passes the mixed-language requirement.
- Cleanup alone did not repair the name reliably.
- An automatic pause detector (20 ms RMS frames, threshold 0.008, quiet interval at least 0.30 s, minimum segment length 4 s) split the joined clip into three spans. Turbo transcribed each in its original language, recovered the Chinese proper noun, and preserved the Malay reference spelling. Requests took 533, 301, and 348 ms. These are screening settings to validate, not universal acoustic constants or full browser latency.

Proceed with Turbo plus bounded pause segmentation and explicit-rule GPT-OSS 120B processing. Runtime quota handling must stop at free limits. Audio byte/duration validation must match the verified PCM WAV format. The final 20-recording evaluation, natural within-sentence switching, user accents, and full Stop-to-result latency remain unproven. Ticket 01 is resolved as a preliminary implementation gate; ticket 06 must not be closed without its separate evidence.

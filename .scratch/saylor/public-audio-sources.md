# Licensed public speech screening samples

Retrieved 2026-10-15. Source: Google, FLEURS dataset, validation split, revision 70bb2e84b976b7e960aa89f1c648e09c59f894dd. Dataset card: https://huggingface.co/datasets/google/fleurs
License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/
Attribution: Google / FLEURS dataset and its speech contributors. Files downloaded unchanged from Hugging Face dataset viewer cached audio assets. Raw row metadata is saved beside each clip. Individual speakers are not named in these rows. Voices are public dataset recordings, not user confidential material.

All downloaded clips: mono 16,000 Hz, WAV format code 3 (32-bit IEEE float). A concatenation needs to preserve or intentionally convert this encoding; Python wave may reject format code 3. Durations derive from num_samples / 16,000. No listening-based verification or provider calls have been performed by the sample-finding agent; expected transcripts are dataset annotations. Public recording scripts can be imperfect/outdated factual assertions: fidelity means preserving what was spoken, not endorsing its factual claim.

## Mandarin

File: fleurs-mandarin-validation-2.wav (483,898 bytes), 7.56 seconds.
Config cmn_hans_cn, validation row 2, utterance id 1581.
Metadata API: https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=0&length=3
Expected source text: 亚马逊河也是地球上最宽的河流，有些河段的宽度可达6英里。
Expected meaning (agent translation): The Amazon is also the widest river on Earth; some sections can be six miles wide.
Check: Amazon, widest river, six miles; no conversion to kilometres without preserving equivalence.

## Malay

File: fleurs-ms-my-validation-0.wav (495,418 bytes), 7.74 seconds.
Config ms_my, validation row 0, utterance id 1654.
Metadata API: https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=0&length=3
Expected source text: Saya tidak tahu kalau anda sedar, tetapi kebanyakan barang dari Amerika Tengah tiba di negara ini bebas cukai.
Expected meaning (agent translation): I do not know whether you are aware, but most goods from Central America enter this country duty-free.
Check: uncertainty introductory phrase, most goods (not all), Central America (not South America), duty-free.

## English (for sequential multilingual construction)

File: fleurs-english-validation-0.wav (418,618 bytes), 6.54 seconds.
Config en_us, validation row 0, utterance id 1548.
Metadata API: https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=0&length=3
Expected source text: When you call someone who is thousands of miles away, you are using a satellite.
Expected meaning: The script claims calling someone thousands of miles away uses a satellite. Preserve its claim rather than correcting or expanding it.

## Evaluation caveats

These provide only short public read-speech screening inputs. A three-clip concatenation would be an artificial sequential language-switch test involving different speakers and unrelated sentences, not natural English/Mandarin/Malay code switching by one speaker. Label any concatenation accordingly, retain attribution, and record conversion/concatenation as a modification. It cannot replace the real 20-recording acceptance set or validate the user's accent/self-corrections.

The parent reports the user chose to waive contacting Groq support and assume private personal use is acceptable. Record that as the user's assumption, not evidence of an authoritative provider interpretation. This file does not accept a provider or report any inference quality result.

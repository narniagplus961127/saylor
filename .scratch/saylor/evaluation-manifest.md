# SayLor public recording evaluation manifest

Prepared: 2026-10-15 (Asia/Kuala_Lumpur). Frozen reference preparation record. Subsequent inference results are recorded separately in [the acceptance report](acceptance-report.md). Machine-readable references: [evaluation-manifest.json](evaluation-manifest.json).

## Attribution and provenance

Source: [Google FLEURS](https://huggingface.co/datasets/google/fleurs), validation split, dataset revision 70bb2e84b976b7e960aa89f1c648e09c59f894dd, speech by dataset contributors. License: [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). This manifest reproduces supplied annotations with attribution. Expected English meanings and critical checks are agent-authored evaluation aids, not additional source annotations. Files were downloaded individually, unchanged from the dataset viewer cached audio assets; no full dataset was downloaded.

Local audio lives under `.scratch/saylor/private/evaluation/`. Do not commit audio or generated result payloads by default. Source metadata, candidate selection and machine-readable `manifest.json` are alongside the audio. Public stable row links below regenerate expiring cached download URLs; signed asset URLs are deliberately omitted here.

## Evaluation protocol and limits

Freeze these references before provider evaluation; do not modify a reference to make a model output pass. Score the original transcription against the supplied source text, then score final text against intended meaning and the critical checks. A provider-recognized transcription must not become its own ground truth. Ignore cosmetic punctuation/script differences that preserve meaning. Source scripts can contain awkward or factually questionable wording: do not reward invented factual repairs.

Suggested output modes distribute five clips to each of the four choices. Translations should be judged for semantic equivalence by a competent speaker, not exact-string equality. Recording transcripts are public annotations and have not been independently verified by listening; flag audible annotation disagreements separately rather than silently replacing expected answers.

This is a **20-recording public read-speech baseline**, not a claim that ticket 06 acceptance is covered or passed. It contains 7 English, 7 Mandarin and 6 Malay clips with distinct utterance IDs and no reuse of the three preliminary screening clips. It covers difficult names, quantities, a year, negation and meaning. It does **not** cover natural self-corrections, dictated formatting, spoken override attempts, the user's accent, or natural within-sentence English/Mandarin/Malay code switching. Those require additional held-out controls/real recordings. A concatenated multilingual clip, if added later, must be labeled artificial sequential multi-speaker language switching and cannot replace natural code-switch coverage.

Most clips are shorter than the target daily 20-second recording; a short-clip latency result must not be described as measured 20-second stop-to-result performance. The target is not satisfied by padding silence. These files cannot by themselves establish the full agreed 18/20 usability plus zero-critical-error gate across all required behaviors.

All clips are mono, 16,000 Hz, 32-bit IEEE float WAV (format code 3). Convert intentionally if a consumer requires PCM16, preserve these originals, record conversion, and hash the evaluated bytes separately. Dataset duration is num_samples / 16,000. No synthetic controls are included, avoiding an unsupported claim that read-speech validates correction or instruction handling.

## Clips

### 01 — en_us, 4.14 seconds

File: `01-fleurs-en_us-validation-3.wav` (265018 bytes). Utterance ID: 1578. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=3&length=1).

Suggested output: **Keep original languages**.

Expected source transcript: Then, Lakkha Singh took the lead in singing the bhajans.

Expected meaning: Lakkha Singh then led the singing of bhajans.

Critical checks: Preserve Lakkha Singh and bhajans; do not invent an event location.

Original SHA-256: `7172CC6E8A7B006A8175C57DF13BB69DB0C6249DC09D7B015C98722D5AF9734C`.

### 02 — en_us, 9.32 seconds

File: `02-fleurs-en_us-validation-8.wav` (596538 bytes). Utterance ID: 1559. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=8&length=1).

Suggested output: **Simplified Chinese**.

Expected source transcript: Pronunciation is relatively easy in Italian since most words are pronounced exactly how they are written

Expected meaning: Italian pronunciation is relatively easy because most words sound as written.

Critical checks: Preserve relatively and most; not all words.

Original SHA-256: `97C91F17D0FAC2F617510489C1F149371234A16990C1E0B8945EA91611A74C4C`.

### 03 — en_us, 7.54 seconds

File: `03-fleurs-en_us-validation-13.wav` (482618 bytes). Utterance ID: 1598. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=13&length=1).

Suggested output: **Malay**.

Expected source transcript: Although three people were inside the house when the car impacted it, none of them were hurt.

Expected meaning: Three people were inside the house when the car hit it; none were injured.

Critical checks: Preserve three people and none hurt; retain negation.

Original SHA-256: `431D013D01D25CBF8D42587F4A14DF57D09DBE9CBC2AF4EA91BA93F9BD290EC4`.

### 04 — en_us, 12.58 seconds

File: `04-fleurs-en_us-validation-16.wav` (805178 bytes). Utterance ID: 1605. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=16&length=1).

Suggested output: **Keep original languages**.

Expected source transcript: Due to the long distance from the continent mammals were unable to make the journey making the giant tortoise the primary grazing animal in the Galapagos.

Expected meaning: Distance from the continent prevented mammals reaching the Galapagos, leaving giant tortoises as primary grazers.

Critical checks: Preserve Galapagos, mammals unable to arrive, primary grazing animal.

Original SHA-256: `7753BF7C6F613D6D6776B777088B9F7DA9DB21C77A88373EFC6F66840245F621`.

### 05 — en_us, 8.52 seconds

File: `05-fleurs-en_us-validation-17.wav` (545338 bytes). Utterance ID: 1593. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=17&length=1).

Suggested output: **Simplified Chinese**.

Expected source transcript: Eventually, wooden wheels were replaced by iron wheels. In 1767, the first full-iron rails were introduced.

Expected meaning: Iron wheels replaced wooden wheels; the first all-iron rails appeared in 1767.

Critical checks: Preserve 1767 and wooden-to-iron replacement direction.

Original SHA-256: `952145E2808BF8EA6354EC0EA656652A0EEFF61438A466FA4F0F3568F89C23A3`.

### 06 — en_us, 8.16 seconds

File: `06-fleurs-en_us-validation-20.wav` (522298 bytes). Utterance ID: 1573. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=20&length=1).

Suggested output: **Malay**.

Expected source transcript: A satellite phone is not generally a replacement for a mobile phone, as you have to be outdoors with clear line of sight to the satellite to make a phone call.

Expected meaning: Satellite phones generally do not replace mobile phones and require outdoor clear satellite line of sight.

Critical checks: Preserve not generally a replacement and outdoors line of sight.

Original SHA-256: `2AC60147B9EE1C8A5809D4D7A750D310A442B23D66941060B5CB901DB595D3AC`.

### 07 — en_us, 13.74 seconds

File: `07-fleurs-en_us-validation-24.wav` (879418 bytes). Utterance ID: 1526. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=en_us&split=validation&offset=24&length=1).

Suggested output: **Simplified Chinese**.

Expected source transcript: If you visit the Arctic or Antarctic areas in the winter you will experience the polar night, which means that the sun doesn't rise above the horizon.

Expected meaning: Winter visits to Arctic or Antarctic regions encounter polar night, with the sun not rising above the horizon.

Critical checks: Preserve Arctic or Antarctic, winter, and sun does not rise.

Original SHA-256: `73F1A48841BCD997014DFE7750077F37833E8DFD86D4C9752EF962FA8C9B2539`.

### 08 — cmn_hans_cn, 9.66 seconds

File: `08-fleurs-cmn_hans_cn-validation-3.wav` (618298 bytes). Utterance ID: 1648. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=3&length=1).

Suggested output: **Keep original languages**.

Expected source transcript: 迦南没有大森林，所以木材非常昂贵。

Expected meaning: Canaan had no large forests, so timber was very expensive.

Critical checks: Preserve Canaan, absence of large forests, and causal expensive timber.

Original SHA-256: `28502266DFA1C0C5202D1488015B29CA0D26FAFBF3540CAE61F112508CAF1DED`.

### 09 — cmn_hans_cn, 11.46 seconds

File: `09-fleurs-cmn_hans_cn-validation-8.wav` (733498 bytes). Utterance ID: 1523. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=8&length=1).

Suggested output: **English**.

Expected source transcript: 最后结果是一分险胜，比分为 21 比 20，结束了全黑队连胜 15 场的局面。

Expected meaning: A narrow one-point 21-to-20 win ended the All Blacks' 15-match winning streak.

Critical checks: Preserve 21 to 20, one-point win, All Blacks, and 15 consecutive wins ended.

Original SHA-256: `602F0FC4A334F4927B221B836F1735A09888F017956D02E1AAF97526A10CC964`.

### 10 — cmn_hans_cn, 13.92 seconds

File: `10-fleurs-cmn_hans_cn-validation-10.wav` (890938 bytes). Utterance ID: 1640. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=10&length=1).

Suggested output: **English**.

Expected source transcript: 在冰雪覆盖的路面上，摩擦力很小，你不能像在光洁的柏油路上一样开车。

Expected meaning: Ice- and snow-covered roads have little friction; driving cannot be the same as on smooth asphalt.

Critical checks: Preserve low friction and cannot drive the same way.

Original SHA-256: `9517FCAF0F74EAA21083438B52C5A36EFDEF0C2C6473BE21C1315AF153E19D56`.

### 11 — cmn_hans_cn, 16.76 seconds

File: `11-fleurs-cmn_hans_cn-validation-13.wav` (1072698 bytes). Utterance ID: 1574. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=13&length=1).

Suggested output: **Malay**.

Expected source transcript: 冬天可能会比看上去显得更冷：温度很少低于零度，但当风和湿度结合在一起，会让人感觉比温度计显示的温度要冷。

Expected meaning: Winter can feel colder than it looks: temperatures rarely drop below zero, but wind and humidity make it feel colder than a thermometer indicates.

Critical checks: Preserve rarely below zero (not above), wind plus humidity, and felt versus measured temperature.

Original SHA-256: `FE22B151C99D372079C285A3BBC6D03FB96403B64ACE676DD38A4FBDC79597A0`.

### 12 — cmn_hans_cn, 16.98 seconds

File: `12-fleurs-cmn_hans_cn-validation-14.wav` (1086778 bytes). Utterance ID: 1591. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=14&length=1).

Suggested output: **Keep original languages**.

Expected source transcript: 前众议院议长纽特·金里奇、德克萨斯州州长里克·佩里和女国会议员米歇尔·巴赫曼最终分别名列第四、第五和第六。

Expected meaning: Newt Gingrich, Rick Perry, and Michele Bachmann ultimately placed fourth, fifth, and sixth respectively.

Critical checks: Preserve all three names and respective fourth/fifth/sixth mapping.

Original SHA-256: `AD1367EBD6738C6D700FD3A04214CCA76FE41C32D5E001F02431F0628B1B3E77`.

### 13 — cmn_hans_cn, 12.3 seconds

File: `13-fleurs-cmn_hans_cn-validation-15.wav` (787258 bytes). Utterance ID: 1606. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=15&length=1).

Suggested output: **Malay**.

Expected source transcript: 葡萄牙人毁灭了这座城并进行了重建，还将其命名为卡萨布兰卡 (Casa Branca) ，直到 1755 年地震后才遗弃了它。

Expected meaning: The Portuguese destroyed and rebuilt the city, called it Casa Branca, and abandoned it only after the 1755 earthquake.

Critical checks: Preserve Portuguese, Casa Branca, 1755, and not abandoned until after earthquake.

Original SHA-256: `C1DC01111FAF8F4FE8B48CAE44E6A3E86844E58DA6A4816913C7E631F8F4C26C`.

### 14 — cmn_hans_cn, 22.84 seconds

File: `14-fleurs-cmn_hans_cn-validation-16.wav` (1461818 bytes). Utterance ID: 1525. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=cmn_hans_cn&split=validation&offset=16&length=1).

Suggested output: **English**.

Expected source transcript: 在宽阔的林荫大道、玻璃外墙的建筑和现代化的购物中心之间，散布着传统的红瓦屋顶、18 世纪的市场以及古老的清真寺和教堂，不过这座城市比传统的土耳其更有地中海欧洲的氛围。

Expected meaning: Traditional red-tile roofs, eighteenth-century markets, old mosques and churches sit among boulevards, glass-fronted buildings and modern malls; the city feels more Mediterranean European than traditionally Turkish.

Critical checks: Preserve eighteenth century, architecture contrast, Mediterranean Europe versus traditional Turkey.

Original SHA-256: `95FFFBB41AFEFF404F87501A98F7DE81B8D0D97B6094F718CBDD581CDADC1B76`.

### 15 — ms_my, 9.84 seconds

File: `15-fleurs-ms_my-validation-5.wav` (629818 bytes). Utterance ID: 1634. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=5&length=1).

Suggested output: **Keep original languages**.

Expected source transcript: Jepun mengandungi hampir 7,000 pulau (yang terbesar ialah Honshu), yang menjadikan Jepun sebagai pulau yang ke-7 terbesar di dunia!

Expected meaning: The script says Japan has almost 7,000 islands, Honshu the largest, and calls Japan the seventh largest island in the world.

Critical checks: Preserve almost 7,000, Honshu and seventh; do not silently repair the source's factual wording.

Original SHA-256: `C7EBF7EE5FF0D51138842C95F494585D8665A9D9B5D34E446C2CD5DD99A498E8`.

### 16 — ms_my, 11.4 seconds

File: `16-fleurs-ms_my-validation-7.wav` (729658 bytes). Utterance ID: 1563. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=7&length=1).

Suggested output: **English**.

Expected source transcript: Para penyelidik mencadangkan, walaupun itu ekor dinosaur yang muda, sampel berkenaan menunjukkan bulu dewasa dan bukan bulu halus anak ayam.

Expected meaning: Researchers say that although it was a young dinosaur's tail, the sample shows adult feathers rather than chick down.

Critical checks: Preserve young dinosaur versus adult feathers and not chick down.

Original SHA-256: `12AD3AEB15D90141A9931EABF4B0F3C656B20C02B9582FBA8E1F937AC04FF915`.

### 17 — ms_my, 12.66 seconds

File: `17-fleurs-ms_my-validation-8.wav` (810298 bytes). Utterance ID: 1544. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=8&length=1).

Suggested output: **Simplified Chinese**.

Expected source transcript: Serangga adalah haiwan pertama dibawa ke udara. Keupayaan mereka untuk terbang membantu mereka mengelak musuh dengan mudah dan mencari makanan dan rakan dengan lebih cekap.

Expected meaning: Insects were the first animals to take to the air; flight helps them evade enemies and find food and mates more efficiently.

Critical checks: Preserve first animals, evading enemies, food and mates.

Original SHA-256: `CAE334BE30E9736E09289DCFC4F5800D88C45CA0BAB0F568CAB7C78A794AE138`.

### 18 — ms_my, 9.78 seconds

File: `18-fleurs-ms_my-validation-9.wav` (625978 bytes). Utterance ID: 1538. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=9&length=1).

Suggested output: **Malay**.

Expected source transcript: Regangan antara Point Marion dan Fairmont memberikan keadaan pemanduan paling mencabar di Buffalo-Pittsburgh Highway, yang kerap melalui kawasan kayu terpencil.

Expected meaning: The stretch between Point Marion and Fairmont is the most challenging part of Buffalo-Pittsburgh Highway and often passes remote wooded areas.

Critical checks: Preserve Point Marion, Fairmont and Buffalo-Pittsburgh Highway; retain most challenging.

Original SHA-256: `C0224473BEFB809F01EA9B00F17D6FDA2CB61F732296592D71BAB91A729DDB95`.

### 19 — ms_my, 12.6 seconds

File: `19-fleurs-ms_my-validation-15.wav` (806458 bytes). Utterance ID: 1565. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=15&length=1).

Suggested output: **Simplified Chinese**.

Expected source transcript: Matlamat utama sains adalah untuk mengetahui cara dunia berfungsi melalui kaedah saintifik. Kaedah ini sebenarnya membimbing kebanyakan penyelidikan saintifik.

Expected meaning: Science's main goal is understanding how the world works through the scientific method, which guides most scientific research.

Critical checks: Preserve main goal, scientific method and most research.

Original SHA-256: `7EE378DAF268D78492FE587BC53A517DECA6D9496C37C00319606FC113E02475`.

### 20 — ms_my, 9.48 seconds

File: `20-fleurs-ms_my-validation-20.wav` (606778 bytes). Utterance ID: 1609. [Official dataset row](https://datasets-server.huggingface.co/rows?dataset=google%2Ffleurs&config=ms_my&split=validation&offset=20&length=1).

Suggested output: **English**.

Expected source transcript: Robin Uthappa mendapat skor innings tertinggi, 70 larian dengan hanya 41 bola dengan memukul 11 empat dan 2 enam.

Expected meaning: Robin Uthappa scored the innings high of 70 runs from just 41 balls, hitting 11 fours and two sixes.

Critical checks: Preserve Robin Uthappa and 70 runs/41 balls/11 fours/2 sixes; no number reassignment.

Original SHA-256: `EC2A181EF942517912F09C7AE06144F02F549384553B80EAE99DBE7C64FBE070`.

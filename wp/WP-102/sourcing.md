# WP-102 sourcing record

Builder: WP-102 (toolchain sourcing). Date of all observations: 2026-10-22. Outputs: `toolchain/manifest.json` (117 items, 37 component names), `toolchain/unavailable.json` (25 entries), this file, `wp/WP-102/spec-changes.md`. Every number below was read from the source named next to it; the scripts that did the reading are in `wp/WP-102/scripts/` (rerun order: `s01`..`s07`, then `s09-assemble.mjs`).

## How to read this

- **Digests.** `sha256` is vendor-published wherever the vendor publishes one (Node `SHASUMS256.txt`, OSV-Scanner `SHA256SUMS`, theseus-rs `<asset>.sha256`, Adoptium API `package.checksum`, firebase-tools' `expectedChecksumSHA256`, GitHub asset `digest` for PostgREST and Supabase Auth). Where a vendor publishes nothing usable (Playwright CDN, npm registry (sha512/sha1 only), MySQL (MD5 only), data repos) I streamed the file through SHA-256 myself. Every self-hash was cross-checked against whatever weaker digest the vendor does publish (npm sha512 `dist.integrity`, MySQL `.md5`, Google Cloud Storage ETag/`x-goog-hash` md5 for Chrome for Testing and OSV) and all matched; a mismatch aborts the script. Where the vendor publishes SHA-256, PostgREST/Supabase Auth/firebase jars were also re-hashed from the bytes and matched.
- **Independent re-check after assembly** (`scripts/verify-sample.sh`, plain `curl | sha256sum`, no Node): Firefox win64, MySQL linux-x64 minimal, Temurin JRE musl x64, Public Suffix List, libphonenumber metadata, axe-core, osv-scanner linux musl x64: all seven `OK` (hash and byte count equal the manifest). This is a sample of 7 of 117, not every item.
- **`size`** = bytes of the download (HEAD `Content-Length` or API `size`, and equal to the bytes received whenever I downloaded).
- **Downloads.** About 4.7 GB of distinct files were downloaded and hashed (plus repeats of the 300 MB OSV set and a few probes: about 5.2 GB total, under the 6 GB cap), each streamed and deleted. The sum of `size` over all manifest items is 8.06 GB, but a host fetches only its own platform's items.
- **`unpackTo`** is a path under `<cache.dir>/toolchain/<manifest sha256>/`. Archive items unpack there (the archives' own top-level directory is kept: e.g. `node/node-v24.22.1-linux-x64/`); single-file items (OSV-Scanner binary, jars, data files) are stored at exactly that path. Several PostgreSQL majors and MySQL series coexist through `postgresql/<major>`, `mysql/<series>`.
- **Platform mapping.** musl entries reuse the glibc file only where I checked that the binary is statically linked (ELF without PT_INTERP/PT_DYNAMIC, `scripts/binkind.mjs`): OSV-Scanner, PostgREST, Supabase Auth. Node (unofficial-builds) and PostgreSQL (theseus-rs) and Temurin (alpine-linux) have real musl builds. Browsers and MySQL have none (see `unavailable.json`).
- **Version choices.** Node 24.22.1 (Active LTS "Krypton", the newest LTS line in `nodejs.org/dist/index.json`); PostgreSQL 15, 16, 17, 18 at their newest theseus-rs build (14 omitted: its community end-of-life is November 2026 per the PostgreSQL versioning policy; that date is from memory, not fetched, and theseus-rs does publish 14.24.1 if the orchestrator wants it); MySQL 9.7.4 (LTS per its release notes; 8.4.13 has no macOS x86_64 archive); Temurin JRE 21.0.12.1+1 (firebase-tools refuses Java < 21, and Temurin 25 has no windows-aarch64 JRE); Playwright 1.64.1 with its own browser pins (Chrome for Testing 156.0.8078.4, Firefox 157.0 rev 1555, WebKit 27.2 rev 2370); everything else newest stable at fetch time. Items published within days of today (firebase-tools 15.34.1 on 2026-10-21, theseus-rs builds on 2026-10-18, Node 24.22.1 on 2026-10-20) have had little time in the wild; the orchestrator may prefer to pin one release back.

## Per item

Each block: how the URL, sha256 and size were obtained (per platform group), the licence field, then the full table.

### axe-core@4.14.0

- **any** — registry.npmjs.org/axe-core/4.14.0: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-9WTZxEjsZ7b13...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "MPL-2.0"

Licence field: `MPL-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 706680 (0.7 MB) | `2277b0a3ef47af9b52497faa3e71598e86e0a0e5e6eb295207a5657ede4709af` | https://registry.npmjs.org/axe-core/-/axe-core-4.14.0.tgz |

### chromium@156.0.8078.4

- **windows-x64** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform windows-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 c0533017d8cb3ad5fb4d869b26fe452f) matched the downloaded bytes
- **windows-arm64** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform win64 (calculatePlatform() returns win64 for every win32 host, so Windows on ARM runs the x64 build under emulation; UNPROVEN on ARM hardware); sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 c0533017d8cb3ad5fb4d869b26fe452f) matched the downloaded bytes
- **macos-arm64** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform macos-arm64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 d8024114f84cdfae741ed234fa6db7ad) matched the downloaded bytes
- **macos-x64** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform macos-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 0b836798da83a49e41d440868842ff13) matched the downloaded bytes
- **linux-x64-gnu** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform linux-x64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 0fa29e288f17c72aec5abd27a2a30771) matched the downloaded bytes
- **linux-arm64-gnu** — Playwright 1.64.1 pin: browsers.json revision 1248 (Chrome for Testing 156.0.8078.4, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths); path from DOWNLOAD_PATHS for host platform linux-arm64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length; the Google Cloud Storage ETag (md5 944bc435068c79b84970c5b3c27c6ec9) matched the downloaded bytes

Licence field: `BSD-3-Clause`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 207073013 (197.5 MB) | `220021ecfdad08c116fc71a153e65e3861ba841c531afc4f7acc7bd5d44b41db` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/win64/chrome-win64.zip |
| windows-arm64 | 207073013 (197.5 MB) | `220021ecfdad08c116fc71a153e65e3861ba841c531afc4f7acc7bd5d44b41db` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/win64/chrome-win64.zip |
| macos-arm64 | 194831853 (185.8 MB) | `987d2f8499c87d21676f78178550cfcbfb1bb53786821e2cff46c5a7e99b58be` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/mac-arm64/chrome-mac-arm64.zip |
| macos-x64 | 205332100 (195.8 MB) | `4e75da96830224185ddddc80012ad3732d6a29a4f92bac728c84c8e8ebd66c34` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/mac-x64/chrome-mac-x64.zip |
| linux-x64-gnu | 200345244 (191.1 MB) | `43fd31766c7533a02dda2ded5ad50c2f861cd5400be7509c0abad71129f79d79` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/linux64/chrome-linux64.zip |
| linux-arm64-gnu | 199750508 (190.5 MB) | `910a12fff6170202195f72ef3d353801c7063d301ab80b1f51b77d791fda60ce` | https://storage.googleapis.com/chrome-for-testing-public/156.0.8078.4/linux-arm64/chrome-linux-arm64.zip |

### eol-dates@dcb545accc27

- **any** — endoflife.date source repository (the data the endoflife.date site and API are built from; products/*.md front matter holds the eol dates), commit dcb545accc2754785f2e2cdb200caa75db51fbf0 of master, via GitHub's archive endpoint; sha256 and size from a full download. The API (endoflife.date/api/v1/products/full) could not be reached from this machine (curl and Node: connection timeout, three attempts), so the repository archive is used; repository licence MIT (GitHub licence API)

Licence field: `MIT`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 681175 (0.6 MB) | `ba1ab885a2dd68ffad601239cbf2b24330910166f76cca57d5ad893e3437d510` | https://codeload.github.com/endoflife-date/endoflife.date/tar.gz/dcb545accc2754785f2e2cdb200caa75db51fbf0 |

### firebase@13.1.0

- **any** — registry.npmjs.org/firebase/13.1.0: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-II/6P63vYzWdS...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 8553623 (8.2 MB) | `2d393dbaced417e66d73481f0ac9597c34b1000b8afa10a814295d5b3434df74` | https://registry.npmjs.org/firebase/-/firebase-13.1.0.tgz |

### firebase-emulators@1.22.0

- **any** — Cloud Firestore emulator jar. url, expectedSize and expectedChecksumSHA256 are the vendor's own table in firebase-tools@15.34.1 lib/emulator/downloadableEmulatorInfo.json (the CLI verifies exactly these values); the jar was also downloaded in full and its SHA-256 and size matched the table. Proprietary Google binary: see licence concerns

Licence field: `LicenseRef-Firebase-Terms-of-Service`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 136707194 (130.4 MB) | `9b6498b7f62714d67f48f59b3818883cd682dbcd46b9f59511de81c97bb5166c` | https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar |

### firebase-emulators-database@4.11.2

- **any** — Realtime Database emulator jar. url, expectedSize and expectedChecksumSHA256 are the vendor's own table in firebase-tools@15.34.1 lib/emulator/downloadableEmulatorInfo.json (the CLI verifies exactly these values); the jar was also downloaded in full and its SHA-256 and size matched the table. Proprietary Google binary: see licence concerns

Licence field: `LicenseRef-Firebase-Terms-of-Service`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 34495935 (32.9 MB) | `b70d99344caf17c98b6f910fa8f6edf32a7c016cb1035e8915f70d38901eb97f` | https://storage.googleapis.com/firebase-preview-drop/emulator/firebase-database-emulator-v4.11.2.jar |

### firebase-emulators-storage-rules@1.1.3

- **any** — Cloud Storage rules runtime jar. url, expectedSize and expectedChecksumSHA256 are the vendor's own table in firebase-tools@15.34.1 lib/emulator/downloadableEmulatorInfo.json (the CLI verifies exactly these values); the jar was also downloaded in full and its SHA-256 and size matched the table. Proprietary Google binary: see licence concerns

Licence field: `LicenseRef-Firebase-Terms-of-Service`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 52892936 (50.4 MB) | `0cd52db6f6271d62078f805220706377c849220b73bd68aa27078d977df9c900` | https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-storage-rules-runtime-v1.1.3.jar |

### firebase-rules-unit-testing@6.0.0

- **any** — registry.npmjs.org/@firebase/rules-unit-testing/6.0.0: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-BsBqAoClN55cj...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 28375 (0.0 MB) | `9f566a1fdbe12034c5f7313afb92a6d8ea040b8aaf4459e294b2b938c1702f56` | https://registry.npmjs.org/@firebase/rules-unit-testing/-/rules-unit-testing-6.0.0.tgz |

### firebase-tools@15.34.1

- **any** — registry.npmjs.org/firebase-tools/15.34.1: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-guAlrL5NpupsD...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "MIT"

Licence field: `MIT`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 1328195 (1.3 MB) | `1a106a3a99d2d5d7a998c764b753e92cb577b1bf548b624dcfd4ea8a537509fa` | https://registry.npmjs.org/firebase-tools/-/firebase-tools-15.34.1.tgz |

### firefox@157.0

- **windows-x64** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform windows-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **windows-arm64** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform win64 (calculatePlatform() returns win64 for every win32 host, so Windows on ARM runs the x64 build under emulation; UNPROVEN on ARM hardware); sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **macos-arm64** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform macos-arm64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **macos-x64** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform macos-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **linux-x64-gnu** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform linux-x64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **linux-arm64-gnu** — Playwright 1.64.1 pin: browsers.json revision 1555; path from DOWNLOAD_PATHS for host platform linux-arm64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length

Licence field: `MPL-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 129834277 (123.8 MB) | `410e14bca6099c089c2092df67803320aab70433a754aae356c4c2e990cf6b77` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-win64.zip |
| windows-arm64 | 129834277 (123.8 MB) | `410e14bca6099c089c2092df67803320aab70433a754aae356c4c2e990cf6b77` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-win64.zip |
| macos-arm64 | 110873383 (105.7 MB) | `72eb32289f368789786d16d252e8e4fef7b62ae721d57f82d3d6d9221d3fd2af` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-mac-arm64.zip |
| macos-x64 | 118829566 (113.3 MB) | `ae2c6e477d4c5f59e76be39ca0db6c003e9bcf9bb9b3c4e13cf545275d6be388` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-mac.zip |
| linux-x64-gnu | 116377639 (111.0 MB) | `564f74fa3c46cb83c6252145cf1569c95236c8c404d6a5a80cc736cf32265f0c` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-ubuntu-24.04.zip |
| linux-arm64-gnu | 107640796 (102.7 MB) | `fe2e1fd49048866e9b9249d1b9394b4989f58f589a35b19edcbce8aab1501f8c` | https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-ubuntu-24.04-arm64.zip |

### hunspell-ar-aff@67032ee95763

- **any** — LibreOffice/dictionaries repository (official LibreOffice dictionaries), commit 67032ee957631908098a72edf48dc81cac27e369, file ar/ar.aff (Ayaspell Arabic); sha256 and size from a full download; licence from ar/README_ar.txt (see sourcing.md)

Licence field: `GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 86949 (0.1 MB) | `cec30b8621001e49618feb05aec1984c5fcfbf7d2ec309901d5cbf66585217a3` | https://raw.githubusercontent.com/LibreOffice/dictionaries/67032ee957631908098a72edf48dc81cac27e369/ar/ar.aff |

### hunspell-ar-dic@67032ee95763

- **any** — LibreOffice/dictionaries repository (official LibreOffice dictionaries), commit 67032ee957631908098a72edf48dc81cac27e369, file ar/ar.dic (Ayaspell Arabic); sha256 and size from a full download; licence from ar/README_ar.txt (see sourcing.md)

Licence field: `GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 7217161 (6.9 MB) | `2a3e5367f61c1583734db9d66734f5603e6be5c2d227cf5c5cd7e4ca586e34fe` | https://raw.githubusercontent.com/LibreOffice/dictionaries/67032ee957631908098a72edf48dc81cac27e369/ar/ar.dic |

### hunspell-dictionaries@8cfea406b505

- **any** — wooorm/dictionaries (Hunspell dictionaries repackaged from LibreOffice/OpenOffice extensions), commit 8cfea406b505e4d7df52d5a19bce525df98c54ab (last commit of the repo, 2024-09-09), via GitHub's archive endpoint; sha256 and size from a full download. The archive holds dictionaries/<locale>/index.aff|index.dic for cs, da, de, en, es, fr, it, ko, nb, nl, pl, pt, ro, ru, sv, tr (D-010 locales) plus ~70 more; each dictionary directory has its own license file. Licence field = MIT (the repo) AND the union of the SPDX licences that the npm packages dictionary-<locale> declare for the 16 D-010 locales: {"cs":"GPL-2.0","da":"(GPL-2.0 OR LGPL-2.1 OR MPL-1.1)","de":"(GPL-2.0 OR GPL-3.0)","en":"(MIT AND BSD)","es":"(GPL-3.0 OR LGPL-3.0 OR MPL-1.1)","fr":"MPL-2.0","it":"GPL-3.0","ko":"(GPL-2.0 OR LGPL-2.1 OR MPL-1.1)","nb":"GPL-2.0","nl":"(BSD-3-Clause OR CC-BY-3.0)","pl":"(GPL-3.0 OR LGPL-3.0 OR MPL-2.0)","pt":"(LGPL-3.0 OR MPL-2.0)","ro":"(GPL-2.0 OR LGPL-2.1 OR MPL-1.1)","ru":"BSD-3-Clause","sv":"LGPL-3.0","tr":"MIT"}

Licence field: `MIT AND (BSD-3-Clause OR CC-BY-3.0) AND (BSD-3-Clause) AND (GPL-2.0 OR GPL-3.0) AND (GPL-2.0 OR LGPL-2.1 OR MPL-1.1) AND (GPL-2.0) AND (GPL-3.0 OR LGPL-3.0 OR MPL-1.1) AND (GPL-3.0 OR LGPL-3.0 OR MPL-2.0) AND (GPL-3.0) AND (LGPL-3.0 OR MPL-2.0) AND (LGPL-3.0) AND (MIT AND BSD) AND (MIT) AND (MPL-2.0)`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 54341879 (51.8 MB) | `1ce550ad1d03e03a11b16c81ee5edc31cf5792578dbe5926a403bf0ffba0a443` | https://codeload.github.com/wooorm/dictionaries/tar.gz/8cfea406b505e4d7df52d5a19bce525df98c54ab |

### jre@21.0.12.1+1

- **windows-x64** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, windows/x64, updated 2026-08-21); url, sha256 and size are the API's package.link / package.checksum / package.size
- **windows-arm64** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, windows/aarch64, updated 2026-08-25); url, sha256 and size are the API's package.link / package.checksum / package.size
- **macos-arm64** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, mac/aarch64, updated 2026-08-19); url, sha256 and size are the API's package.link / package.checksum / package.size
- **macos-x64** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, mac/x64, updated 2026-08-19); url, sha256 and size are the API's package.link / package.checksum / package.size
- **linux-x64-gnu** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, linux/x64, updated 2026-08-19); url, sha256 and size are the API's package.link / package.checksum / package.size
- **linux-arm64-gnu** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, linux/aarch64, updated 2026-08-21); url, sha256 and size are the API's package.link / package.checksum / package.size
- **linux-x64-musl** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, alpine-linux/x64, updated 2026-08-19); url, sha256 and size are the API's package.link / package.checksum / package.size
- **linux-arm64-musl** — api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin jdk-21.0.12.1+1, alpine-linux/aarch64, updated 2026-08-19); url, sha256 and size are the API's package.link / package.checksum / package.size

Licence field: `GPL-2.0-only WITH Classpath-exception-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 48999141 (46.7 MB) | `d35f31e712f0fcf6ac5a093edc90204fbff22f720ba3950bd09d331d5e621636` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_x64_windows_hotspot_21.0.12.1_1.zip |
| windows-arm64 | 40078274 (38.2 MB) | `e82cc17e0bf89a25b0b0ed106d072f2ea420587d0a6870534b71b1dce3ae28c3` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_aarch64_windows_hotspot_21.0.12.1_1.zip |
| macos-arm64 | 48144965 (45.9 MB) | `dec50fc6f9fcd4fe3ae8cabf5a5fa68f6afc48841f7698e468e9aa5d54beed84` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_aarch64_mac_hotspot_21.0.12.1_1.tar.gz |
| macos-x64 | 42131876 (40.2 MB) | `6717ec641fd9ce0bb209ca083ee23b42202ac68cb6fcc5753496e0e4a0f41989` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_x64_mac_hotspot_21.0.12.1_1.tar.gz |
| linux-x64-gnu | 52059408 (49.6 MB) | `2413149700df0f7d440500a84a8f764c535f21e5a5e87d38328b64eec2c5b500` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_x64_linux_hotspot_21.0.12.1_1.tar.gz |
| linux-arm64-gnu | 51149460 (48.8 MB) | `14be1f35ebdbd1f6e8d57eb911a3ffb74d6d9aa255abc5daf2b1302002cf2cf2` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_aarch64_linux_hotspot_21.0.12.1_1.tar.gz |
| linux-x64-musl | 52226750 (49.8 MB) | `7bc7c2f9ba5ffea5f727e14581964bd54294b8edc2be9a79ea6393f8d0799200` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_x64_alpine-linux_hotspot_21.0.12.1_1.tar.gz |
| linux-arm64-musl | 51189819 (48.8 MB) | `98e15ae359e1f87160ee4c0abb43336513e41712d439fd4a805a5474af32b2c7` | https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jre_aarch64_alpine-linux_hotspot_21.0.12.1_1.tar.gz |

### libphonenumber-metadata@9.0.41

- **any** — google/libphonenumber release v9.0.41 (2026-10-08), resources/PhoneNumberMetadata.xml at that tag; sha256 and size from a full download; Apache-2.0 (GitHub licence API)

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 979442 (0.9 MB) | `9d3b07b53c7e8a437ddc316249620b51d4090987026f9e8ffb9743aab4e4d5a6` | https://raw.githubusercontent.com/google/libphonenumber/v9.0.41/resources/PhoneNumberMetadata.xml |

### lighthouse@13.5.0

- **any** — registry.npmjs.org/lighthouse/13.5.0: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-w/yYIwg7mP9pC...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 3595753 (3.4 MB) | `4be86876145663e10e8bb3178ebe27b2613a1debd4c04b4e0ec92a0487a4e6e2` | https://registry.npmjs.org/lighthouse/-/lighthouse-13.5.0.tgz |

### mysql@9.7.4

- **windows-x64** — dev.mysql.com / cdn.mysql.com MySQL Community Server 9.7.4 (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's mysql-9.7.4-winx64.zip.md5 (e05aaa40639d8548e0f68b7a70685a3b) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length)
- **macos-arm64** — dev.mysql.com / cdn.mysql.com MySQL Community Server 9.7.4 (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's mysql-9.7.4-macos15-arm64.tar.gz.md5 (221b1e720d1852c5f1f7367957b50574) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length)
- **macos-x64** — dev.mysql.com / cdn.mysql.com MySQL Community Server 9.7.4 (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's mysql-9.7.4-macos15-x86_64.tar.gz.md5 (9e4d8881ac40b564f8aa7dbd3ec88a05) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length); the macOS x86_64 archive exists on the CDN but x86_64 is not in Oracle's supported-platforms matrix for macOS (arm64 only)
- **linux-x64-gnu** — dev.mysql.com / cdn.mysql.com MySQL Community Server 9.7.4 (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's mysql-9.7.4-linux-glibc2.28-x86_64-minimal.tar.xz.md5 (99d1c13647e779549b804ce4dff6e88b) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length); Oracle's "minimal" Linux generic archive (no debug or test binaries) is used for x86-64 because the full archive is 987 MB, and Oracle publishes no aarch64 minimal archive (HEAD 404), so aarch64 uses the full archive; archive listing read: the minimal archive holds bin/mysqld, mysql, mysqldump, mysqladmin, mysqlbinlog, mysql_tzinfo_to_sql, share/ and lib/plugin/, i.e. a complete server
- **linux-arm64-gnu** — dev.mysql.com / cdn.mysql.com MySQL Community Server 9.7.4 (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's mysql-9.7.4-linux-glibc2.28-aarch64.tar.xz.md5 (6c1ede742c21d4a4a74cc96b66a543e5) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length)

Licence field: `GPL-2.0-only WITH Universal-FOSS-exception-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 344052123 (328.1 MB) | `641bdaf01004927194c561b956f14f915a3166c9b0f9b1b5464ae63152bf4b96` | https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-winx64.zip |
| macos-arm64 | 174454473 (166.4 MB) | `abf378ff27753325c908d687a3060f025c58b6530eda53ff4a0c6fc5ff3d7716` | https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-macos15-arm64.tar.gz |
| macos-x64 | 181509239 (173.1 MB) | `4d5e110fe4e8fc87d6a4c30355096914be2606687cb5818a353190764302c26a` | https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-macos15-x86_64.tar.gz |
| linux-x64-gnu | 83229976 (79.4 MB) | `1b022d85e2901e85d6f4df5482a03b036b5b2cf55ad786c9a788f805c6687665` | https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-linux-glibc2.28-x86_64-minimal.tar.xz |
| linux-arm64-gnu | 977757720 (932.5 MB) | `bd1035e35a1b2c39a9f5dd0447b2ad62a6acf809ac1a6fcaf854297b99b8ebfc` | https://cdn.mysql.com/Downloads/MySQL-9.7/mysql-9.7.4-linux-glibc2.28-aarch64.tar.xz |

### node@24.22.1

- **windows-x64** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-win-x64.zip`; size = HEAD Content-Length
- **windows-arm64** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-win-arm64.zip`; size = HEAD Content-Length
- **macos-arm64** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-darwin-arm64.tar.gz`; size = HEAD Content-Length
- **macos-x64** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-darwin-x64.tar.gz`; size = HEAD Content-Length
- **linux-x64-gnu** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-linux-x64.tar.xz`; size = HEAD Content-Length
- **linux-arm64-gnu** — official release v24.22.1 (Krypton LTS, released 2026-10-20); sha256 from https://nodejs.org/dist/v24.22.1/SHASUMS256.txt line `node-v24.22.1-linux-arm64.tar.xz`; size = HEAD Content-Length
- **linux-x64-musl** — Node.js project's unofficial-builds host (not an OpenJS-signed release; the host is run by the Node.js build team); sha256 from https://unofficial-builds.nodejs.org/download/release/v24.22.1/SHASUMS256.txt line `node-v24.22.1-linux-x64-musl.tar.xz`; size = HEAD Content-Length
- **linux-arm64-musl** — Node.js project's unofficial-builds host (not an OpenJS-signed release; the host is run by the Node.js build team); sha256 from https://unofficial-builds.nodejs.org/download/release/v24.22.1/SHASUMS256.txt line `node-v24.22.1-linux-arm64-musl.tar.xz`; size = HEAD Content-Length

Licence field: `MIT`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 37748064 (36.0 MB) | `d2046d28c2c3dcd211ac5145c0bf30e2047ef9dfb306693c8c6e2eccd8b95fa5` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-win-x64.zip |
| windows-arm64 | 33786263 (32.2 MB) | `a0c807319fede24c4a0d8f84564c82a619bd313b16b10c007c383c2609e99171` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-win-arm64.zip |
| macos-arm64 | 53062778 (50.6 MB) | `89c682593d76cd44233fa53b1563264e7de9cbb189cad169135c5b4fadfbc0a7` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-darwin-arm64.tar.gz |
| macos-x64 | 54382566 (51.9 MB) | `d132557e7ee2b85af08b0c8c34338e65c6430f2238d01f727728ef42dc83b035` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-darwin-x64.tar.gz |
| linux-x64-gnu | 32026916 (30.5 MB) | `6c172a9ab6718f7b801fb5a7bd486af2ee5e32758086a04b84fcce2aa77095e6` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-x64.tar.xz |
| linux-arm64-gnu | 30978868 (29.5 MB) | `dbabf7a1cbf947e6059ffad2c27b80041db97dea1e553b62afdee7f13fca336e` | https://nodejs.org/dist/v24.22.1/node-v24.22.1-linux-arm64.tar.xz |
| linux-x64-musl | 33396200 (31.8 MB) | `c9c0685740bbb89e836ff81af64d8582db53916cdf09131db482d1dc20f59c70` | https://unofficial-builds.nodejs.org/download/release/v24.22.1/node-v24.22.1-linux-x64-musl.tar.xz |
| linux-arm64-musl | 32850816 (31.3 MB) | `1938774185b35e42f0b064f0998dd7a32fa912bba5bfa8422779df9be5c21c29` | https://unofficial-builds.nodejs.org/download/release/v24.22.1/node-v24.22.1-linux-arm64-musl.tar.xz |

### osv-db@2026-10-21T22Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/npm/all.zip (OSV per-ecosystem export for npm, shipgate ecosystem `npm`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 218817334 (208.7 MB) | `f0c07d2096bf85fc717329ae4ae58043f7da90965121ffbab6a88e8ef54ffb28` | https://osv-vulnerabilities.storage.googleapis.com/npm/all.zip |

### osv-db-crates-io@2026-10-21T17Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/crates.io/all.zip (OSV per-ecosystem export for crates.io, shipgate ecosystem `cargo`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 3633663 (3.5 MB) | `60262add3e1393fb139beb70b13d32e35833c9d68c658565b22fc3ae02242c9d` | https://osv-vulnerabilities.storage.googleapis.com/crates.io/all.zip |

### osv-db-go@2026-10-21T16Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/Go/all.zip (OSV per-ecosystem export for Go, shipgate ecosystem `go`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 12559363 (12.0 MB) | `7af3889a67e7463549966562ea57ec8af9769313c34410b46c357100e8674f6d` | https://osv-vulnerabilities.storage.googleapis.com/Go/all.zip |

### osv-db-maven@2026-10-21T16Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/Maven/all.zip (OSV per-ecosystem export for Maven, shipgate ecosystem `maven`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 10427762 (9.9 MB) | `6ea8061c927d6b935d234f72a8c26779949e6491135fb633662ca374a6bf5922` | https://osv-vulnerabilities.storage.googleapis.com/Maven/all.zip |

### osv-db-nuget@2026-10-21T12Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/NuGet/all.zip (OSV per-ecosystem export for NuGet, shipgate ecosystem `nuget`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 2676989 (2.6 MB) | `3ee198b4ca72eaf3bf4ef039f5e6e55f195fd385bb82bf2ccb3b6dbc53955e62` | https://osv-vulnerabilities.storage.googleapis.com/NuGet/all.zip |

### osv-db-packagist@2026-10-21T18Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/Packagist/all.zip (OSV per-ecosystem export for Packagist, shipgate ecosystem `composer`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 10988996 (10.5 MB) | `19a2cbfbf91b3564bb1fb227591f39e233c4caef76f16e7e45c6a9898fa4f4bc` | https://osv-vulnerabilities.storage.googleapis.com/Packagist/all.zip |

### osv-db-pypi@2026-10-22T01Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/PyPI/all.zip (OSV per-ecosystem export for PyPI, shipgate ecosystem `pypi`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 36772517 (35.1 MB) | `2bee3e8b490b2a9050fb714f0fad9e60ec4a2700ac465badd8d2900fbfc32a2e` | https://osv-vulnerabilities.storage.googleapis.com/PyPI/all.zip |

### osv-db-rubygems@2026-10-21T22Z

- **any** — https://osv-vulnerabilities.storage.googleapis.com/RubyGems/all.zip (OSV per-ecosystem export for RubyGems, shipgate ecosystem `rubygems`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that `fetch` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required

Licence field: `CC-BY-4.0 AND CC0-1.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 5195856 (5.0 MB) | `085e7b1e7ee4e4c742a210da5086dd93e8ff3ccf83462e1da3d97b41f3ae2807` | https://osv-vulnerabilities.storage.googleapis.com/RubyGems/all.zip |

### osv-scanner@2.7.0

- **windows-x64** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_windows_amd64.exe`, equal to the GitHub asset digest; size from the GitHub asset record
- **windows-arm64** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_windows_arm64.exe`, equal to the GitHub asset digest; size from the GitHub asset record
- **macos-arm64** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_darwin_arm64`, equal to the GitHub asset digest; size from the GitHub asset record
- **macos-x64** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_darwin_amd64`, equal to the GitHub asset digest; size from the GitHub asset record
- **linux-x64-gnu** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_linux_amd64`, equal to the GitHub asset digest; size from the GitHub asset record
- **linux-arm64-gnu** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_linux_arm64`, equal to the GitHub asset digest; size from the GitHub asset record
- **linux-x64-musl** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_linux_amd64`, equal to the GitHub asset digest; size from the GitHub asset record; no separate musl asset exists: the linux binary is the same file as the glibc entry, and its ELF headers have no PT_INTERP and no PT_DYNAMIC (statically linked Go binary, checked with scripts/binkind.mjs on the downloaded bytes), so it runs on musl
- **linux-arm64-musl** — github.com/google/osv-scanner release v2.7.0 (2026-10-12); sha256 from the release's osv-scanner_SHA256SUMS line `osv-scanner_linux_arm64`, equal to the GitHub asset digest; size from the GitHub asset record; no separate musl asset exists: the linux binary is the same file as the glibc entry, and its ELF headers have no PT_INTERP and no PT_DYNAMIC (statically linked Go binary, checked with scripts/binkind.mjs on the downloaded bytes), so it runs on musl

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 58999296 (56.3 MB) | `9964ed64ec9a387391eb4cc006ad5c531154821aef29b793e02c448de4686438` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_windows_amd64.exe |
| windows-arm64 | 54355456 (51.8 MB) | `3e630381c1f1fd3c9c4d447e6ff2ef6c737083371722773db8337eead0f97962` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_windows_arm64.exe |
| macos-arm64 | 55336530 (52.8 MB) | `d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_darwin_arm64 |
| macos-x64 | 58881680 (56.2 MB) | `e82c5df7ab0a42dff29a1cd0660711447b56b4c0483ff66ad8634df10fd81a45` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_darwin_amd64 |
| linux-x64-gnu | 57725088 (55.1 MB) | `160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_linux_amd64 |
| linux-arm64-gnu | 53870752 (51.4 MB) | `4061ef4c021ed3c47f203b818f337e351336cc5cd67c0274fc36bd1dfc728dd7` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_linux_arm64 |
| linux-x64-musl | 57725088 (55.1 MB) | `160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_linux_amd64 |
| linux-arm64-musl | 53870752 (51.4 MB) | `4061ef4c021ed3c47f203b818f337e351336cc5cd67c0274fc36bd1dfc728dd7` | https://github.com/google/osv-scanner/releases/download/v2.7.0/osv-scanner_linux_arm64 |

### playwright@1.64.1

- **any** — registry.npmjs.org/playwright/1.64.1: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-HCrVhHr5QQuwY...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 905535 (0.9 MB) | `36ba838d2d55c44fafcff89f919b5d7bc829209318076578ee2bc7cb5687fd57` | https://registry.npmjs.org/playwright/-/playwright-1.64.1.tgz |

### playwright-core@1.64.1

- **any** — registry.npmjs.org/playwright-core/1.64.1: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-BC4s8y6SEVA6Q...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 3172161 (3.0 MB) | `3af03703c967c95037454f2283f709d53ce804a4776d4219d319f5bbcc2a0185` | https://registry.npmjs.org/playwright-core/-/playwright-core-1.64.1.tgz |

### postgresql@18.6.1

- **windows-x64** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-x86_64-pc-windows-msvc.zip; sha256 from the release's postgresql-18.6.1-x86_64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **windows-arm64** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-aarch64-pc-windows-msvc.zip; sha256 from the release's postgresql-18.6.1-aarch64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **macos-arm64** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-aarch64-apple-darwin.tar.gz; sha256 from the release's postgresql-18.6.1-aarch64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **macos-x64** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-x86_64-apple-darwin.tar.gz; sha256 from the release's postgresql-18.6.1-x86_64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **linux-x64-gnu** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-x86_64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-18.6.1-x86_64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-gnu** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-aarch64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-18.6.1-aarch64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **linux-x64-musl** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-x86_64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-18.6.1-x86_64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-musl** — github.com/theseus-rs/postgresql-binaries release 18.6.1 (2026-10-18), asset postgresql-18.6.1-aarch64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-18.6.1-aarch64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json

Licence field: `PostgreSQL`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 48730935 (46.5 MB) | `d82142f3a9a49be8467f0e87f5a079f627515539f94a070fe1463208fa8eb3c6` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-x86_64-pc-windows-msvc.zip |
| windows-arm64 | 47459809 (45.3 MB) | `601da1e9f156520cde83b867189997cade9b728b28eec8ecfecb478eaf36dd96` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-aarch64-pc-windows-msvc.zip |
| macos-arm64 | 88814625 (84.7 MB) | `89e91cc80650a43d22c018b95ca356a0c9e15838a1182fed2880bfb5d7d9c9a6` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-aarch64-apple-darwin.tar.gz |
| macos-x64 | 92085423 (87.8 MB) | `4229812543e19c91864ebdf5d8f78883c5816d51d4cc5d065298260c1f64d37e` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-x86_64-apple-darwin.tar.gz |
| linux-x64-gnu | 40484450 (38.6 MB) | `e84b02dd8d0ce5879fb697330a789231c8b8f8d958dae3ad4d90fecc710b1315` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-x86_64-unknown-linux-gnu.tar.gz |
| linux-arm64-gnu | 39898635 (38.1 MB) | `1ab47fa2f06ff70454309ad02e5d89c46488300d43977231481fd6b160b9d556` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-aarch64-unknown-linux-gnu.tar.gz |
| linux-x64-musl | 103329897 (98.5 MB) | `80287b4596d427cf8456eb946c44b1607b3d2f0a0ad48ffe26dde0068bee5ff3` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-x86_64-unknown-linux-musl.tar.gz |
| linux-arm64-musl | 101544928 (96.8 MB) | `d33d7d3249d7cf7ae72f35aaa20e46d30bdc1c17f4d102b2b3a39d618848ea8b` | https://github.com/theseus-rs/postgresql-binaries/releases/download/18.6.1/postgresql-18.6.1-aarch64-unknown-linux-musl.tar.gz |

### postgresql@17.11.1

- **windows-x64** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-x86_64-pc-windows-msvc.zip; sha256 from the release's postgresql-17.11.1-x86_64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 48 extension/*.control files listed in the asset's manifest.json
- **windows-arm64** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-aarch64-pc-windows-msvc.zip; sha256 from the release's postgresql-17.11.1-aarch64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 48 extension/*.control files listed in the asset's manifest.json
- **macos-arm64** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-aarch64-apple-darwin.tar.gz; sha256 from the release's postgresql-17.11.1-aarch64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **macos-x64** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-x86_64-apple-darwin.tar.gz; sha256 from the release's postgresql-17.11.1-x86_64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **linux-x64-gnu** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-x86_64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-17.11.1-x86_64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-gnu** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-aarch64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-17.11.1-aarch64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **linux-x64-musl** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-x86_64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-17.11.1-x86_64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-musl** — github.com/theseus-rs/postgresql-binaries release 17.11.1 (2026-10-18), asset postgresql-17.11.1-aarch64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-17.11.1-aarch64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 49 extension/*.control files listed in the asset's manifest.json

Licence field: `PostgreSQL`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 48338921 (46.1 MB) | `4dee656719d4182055219765c29c9e692993d14ba0d1b4344dd24a8ff7296782` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-x86_64-pc-windows-msvc.zip |
| windows-arm64 | 47086991 (44.9 MB) | `4a252e79c54af01640cc1d5b5c83416f2491a9569536c03efee2b88233c88b4f` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-aarch64-pc-windows-msvc.zip |
| macos-arm64 | 90030572 (85.9 MB) | `f4b2ff0587d80b6f22bf09ec2d133a3c2949b6423318d3fed0f4ddddddf2f004` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-aarch64-apple-darwin.tar.gz |
| macos-x64 | 93265621 (88.9 MB) | `edb44b25cf8bffec60fa300fbe100fa4238bf2cab4f4bd98d4b7255c61780df3` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-x86_64-apple-darwin.tar.gz |
| linux-x64-gnu | 40073705 (38.2 MB) | `aa8e2e97574bd789119ac01f1dddcd7a038c84e5c308d7b753018618258f0fbd` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-x86_64-unknown-linux-gnu.tar.gz |
| linux-arm64-gnu | 39478345 (37.6 MB) | `edaab3230a014680ebedd836824962628f66ceabd94c36ba3f953bf9e04dc166` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-aarch64-unknown-linux-gnu.tar.gz |
| linux-x64-musl | 104515597 (99.7 MB) | `f554c6a5d232da640ba256ea1a26b8f7dd38621295998268aad3be79e7a60fd0` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-x86_64-unknown-linux-musl.tar.gz |
| linux-arm64-musl | 102748471 (98.0 MB) | `1791b7126eafafa519996fcca88f5c4066e659879d73fe7bcceacb994de02776` | https://github.com/theseus-rs/postgresql-binaries/releases/download/17.11.1/postgresql-17.11.1-aarch64-unknown-linux-musl.tar.gz |

### postgresql@16.15.1

- **windows-x64** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-x86_64-pc-windows-msvc.zip; sha256 from the release's postgresql-16.15.1-x86_64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **windows-arm64** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-aarch64-pc-windows-msvc.zip; sha256 from the release's postgresql-16.15.1-aarch64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 50 extension/*.control files listed in the asset's manifest.json
- **macos-arm64** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-aarch64-apple-darwin.tar.gz; sha256 from the release's postgresql-16.15.1-aarch64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **macos-x64** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-x86_64-apple-darwin.tar.gz; sha256 from the release's postgresql-16.15.1-x86_64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-x64-gnu** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-x86_64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-16.15.1-x86_64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-gnu** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-aarch64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-16.15.1-aarch64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-x64-musl** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-x86_64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-16.15.1-x86_64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-musl** — github.com/theseus-rs/postgresql-binaries release 16.15.1 (2026-10-18), asset postgresql-16.15.1-aarch64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-16.15.1-aarch64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json

Licence field: `PostgreSQL`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 47681857 (45.5 MB) | `1b56bcc86b33f6fd741f22ed670b9ed3d7a4feb25b45ae4ec012c442e15a7cb5` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-x86_64-pc-windows-msvc.zip |
| windows-arm64 | 46461143 (44.3 MB) | `19fa9a76ae5e382f5541a0b73bfc57e501c61fd9af3b31938e2e8cc3f5e28405` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-aarch64-pc-windows-msvc.zip |
| macos-arm64 | 88866917 (84.8 MB) | `0a70b8a3bbb991b5671dc7678ba9a8cf1a389f2fc595ac4834fb1e29e757b89e` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-aarch64-apple-darwin.tar.gz |
| macos-x64 | 92056174 (87.8 MB) | `1b10aa67f9c111dd288f96d800c995dc424ab1e474fb8dd60ea6d05edb055f4c` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-x86_64-apple-darwin.tar.gz |
| linux-x64-gnu | 39375696 (37.6 MB) | `0c42e7c05f0cb596b82ac07990c96fc261ec2e8106055d557c76442d712dbf74` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-x86_64-unknown-linux-gnu.tar.gz |
| linux-arm64-gnu | 38807312 (37.0 MB) | `0a6fdf1639ac702fc8a97cd9e4ffeeea6281cf5c9f614beec3e4687525556bd8` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-aarch64-unknown-linux-gnu.tar.gz |
| linux-x64-musl | 103287216 (98.5 MB) | `48d00d5ba39e2ef757db9dbaad53f3e87f05636d4ee345fa68bdf618e28778e4` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-x86_64-unknown-linux-musl.tar.gz |
| linux-arm64-musl | 101510530 (96.8 MB) | `1d417dd2985bbdf24bde03be6868373c86b2792595ec463e060c3296c88608c4` | https://github.com/theseus-rs/postgresql-binaries/releases/download/16.15.1/postgresql-16.15.1-aarch64-unknown-linux-musl.tar.gz |

### postgresql@15.19.1

- **windows-x64** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-x86_64-pc-windows-msvc.zip; sha256 from the release's postgresql-15.19.1-x86_64-pc-windows-msvc.zip.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 80 extension/*.control files listed in the asset's manifest.json
- **macos-arm64** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-aarch64-apple-darwin.tar.gz; sha256 from the release's postgresql-15.19.1-aarch64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **macos-x64** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-x86_64-apple-darwin.tar.gz; sha256 from the release's postgresql-15.19.1-x86_64-apple-darwin.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-x64-gnu** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-x86_64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-15.19.1-x86_64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-gnu** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-aarch64-unknown-linux-gnu.tar.gz; sha256 from the release's postgresql-15.19.1-aarch64-unknown-linux-gnu.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-x64-musl** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-x86_64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-15.19.1-x86_64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json
- **linux-arm64-musl** — github.com/theseus-rs/postgresql-binaries release 15.19.1 (2026-10-18), asset postgresql-15.19.1-aarch64-unknown-linux-musl.tar.gz; sha256 from the release's postgresql-15.19.1-aarch64-unknown-linux-musl.tar.gz.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = 51 extension/*.control files listed in the asset's manifest.json

Licence field: `PostgreSQL`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 82243457 (78.4 MB) | `73509c7acab33b656efa19705f8fba3464f49818f39ec67311df0d4c8af6e507` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-x86_64-pc-windows-msvc.zip |
| macos-arm64 | 36884358 (35.2 MB) | `02214be6486ec1be214eae66664f384be218b0893d29a9c151408afe5646a8ab` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-aarch64-apple-darwin.tar.gz |
| macos-x64 | 37530474 (35.8 MB) | `4e8149811d40eb09fdbcef532d1fea177b2b267132a188450af0139969bc96f0` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-x86_64-apple-darwin.tar.gz |
| linux-x64-gnu | 38782356 (37.0 MB) | `f34ebfdbff9029f47011709fe8ef68d4a65ea5caadfd065e68a1161e2a021565` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-x86_64-unknown-linux-gnu.tar.gz |
| linux-arm64-gnu | 38246281 (36.5 MB) | `d38b8cfd65e02fd6f08b2368b2d607c70d0d0527b1ca12baeee780cc2a947b07` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-aarch64-unknown-linux-gnu.tar.gz |
| linux-x64-musl | 40427171 (38.6 MB) | `b0844ce1e1a6ad00222d586a5c3e8ba22fce8c32d6319f5948f7aaa67a1a08ff` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-x86_64-unknown-linux-musl.tar.gz |
| linux-arm64-musl | 40468715 (38.6 MB) | `6948dd84286157fbee74c6b4c6980a52a6716ab0461403d4735d96f094fb86ec` | https://github.com/theseus-rs/postgresql-binaries/releases/download/15.19.1/postgresql-15.19.1-aarch64-unknown-linux-musl.tar.gz |

### postgrest@16.5

- **windows-x64, macos-arm64, macos-x64** — github.com/PostgREST/postgrest release v16.5 (2026-10-20); the release publishes no checksum file, so sha256 and size are the GitHub asset record (digest sha256) AND were re-computed from a full download of the archive (equal)
- **linux-x64-gnu, linux-arm64-gnu, linux-x64-musl, linux-arm64-musl** — github.com/PostgREST/postgrest release v16.5 (2026-10-20); the release publishes no checksum file, so sha256 and size are the GitHub asset record (digest sha256) AND were re-computed from a full download of the archive (equal); the linux-static archive holds one ELF with no PT_INTERP and no PT_DYNAMIC (statically linked, checked with scripts/binkind.mjs), used for both glibc and musl

Licence field: `MIT`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 15077008 (14.4 MB) | `17f595b0d8dd37473d0231417dea07c5ac9f791282ff5b017fae51ff29e5de2f` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-windows-x86-64.zip |
| macos-arm64 | 9050912 (8.6 MB) | `d8095cb439de0a3151036df542139e7afca5cebb109ce7f1bae52b3a97e9846a` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-macos-aarch64.tar.xz |
| macos-x64 | 2707116 (2.6 MB) | `dd4d346cd65dba4863ae02686fd09d2e34bbb6889e05d8ff7f1ac42ba0939515` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-macos-x86-64.tar.xz |
| linux-x64-gnu | 4520424 (4.3 MB) | `5099e7ada38f9f6846cd87c14c5f158b7c165f1e9959665ad412e61f4dceba95` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-linux-static-x86-64.tar.xz |
| linux-arm64-gnu | 3997716 (3.8 MB) | `96d75a34c7c095d5f97b87f88042f898192724350861328db9e1509e696ea057` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-linux-static-aarch64.tar.xz |
| linux-x64-musl | 4520424 (4.3 MB) | `5099e7ada38f9f6846cd87c14c5f158b7c165f1e9959665ad412e61f4dceba95` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-linux-static-x86-64.tar.xz |
| linux-arm64-musl | 3997716 (3.8 MB) | `96d75a34c7c095d5f97b87f88042f898192724350861328db9e1509e696ea057` | https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-linux-static-aarch64.tar.xz |

### public-suffix-list@5dd321ffe020

- **any** — publicsuffix/list upstream repository (the source of publicsuffix.org/list/public_suffix_list.dat), commit 5dd321ffe02039e2431382a095cf80e27ff5eb94 (2026-10-20), immutable raw URL; sha256 and size from a full download. Licence: MPL-2.0 (GitHub licence API / repository LICENSE)

Licence field: `MPL-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 337921 (0.3 MB) | `9b4827a9e428a0192a9ea0a6b7804a4cc653d5f39a03456d3b17447b86d78de9` | https://raw.githubusercontent.com/publicsuffix/list/5dd321ffe02039e2431382a095cf80e27ff5eb94/public_suffix_list.dat |

### supabase-auth@2.197.0

- **macos-arm64** — github.com/supabase/auth release v2.197.0 (2026-09-09, newest non-prerelease); no checksum file is published, so sha256 and size are the GitHub asset record AND were re-computed from a full download (equal); the archive holds `auth` (and a `gotrue` copy), a Mach-O arm64 executable
- **linux-x64-gnu, linux-arm64-gnu, linux-x64-musl, linux-arm64-musl** — github.com/supabase/auth release v2.197.0 (2026-09-09, newest non-prerelease); no checksum file is published, so sha256 and size are the GitHub asset record AND were re-computed from a full download (equal); the archive holds `auth` (and a `gotrue` copy), a statically linked ELF (no PT_INTERP, no PT_DYNAMIC; scripts/binkind.mjs), so one archive serves glibc and musl

Licence field: `MIT`.

| platform | size | sha256 | url |
|---|---|---|---|
| macos-arm64 | 25472268 (24.3 MB) | `3fb7998e7061e2c14f3f9555b1d94d447358c965395728e0d81eac82e0e5868b` | https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-darwin-arm64.tar.gz |
| linux-x64-gnu | 9897464 (9.4 MB) | `b5c2991d1df760c9b099c1c2395a94bd1c2f83ed58901934921997179dc9f7ea` | https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-amd64.tar.xz |
| linux-arm64-gnu | 8444496 (8.1 MB) | `a9da2e668137cb280c830d900df4081b3fdd42a289469485634426a7587f9f76` | https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-arm64.tar.xz |
| linux-x64-musl | 9897464 (9.4 MB) | `b5c2991d1df760c9b099c1c2395a94bd1c2f83ed58901934921997179dc9f7ea` | https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-amd64.tar.xz |
| linux-arm64-musl | 8444496 (8.1 MB) | `a9da2e668137cb280c830d900df4081b3fdd42a289469485634426a7587f9f76` | https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-arm64.tar.xz |

### supabase-schema-ddl@6abbd33892a9

- **any** — supabase/postgres repository, commit 6abbd33892a90715692c88c98d12d6d91e6f7d83 of develop (2026-10-21), GitHub archive endpoint; sha256 and size from a full download. The archive's migrations/db/init-scripts/ holds 00000000000000-initial-schema.sql (roles, schemas, publication), 00000000000001-auth-schema.sql, 00000000000002-storage-schema.sql, 00000000000003-post-setup.sql (listed through the GitHub contents API). This is the UPSTREAM reference for the 04 § 4.4 schema-prep DDL, not shipgate's own DDL: see spec-changes.md. Licence: PostgreSQL (GitHub licence API)

Licence field: `PostgreSQL`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 1408158 (1.3 MB) | `23b54e27e16e544750dcd3f996aef7c82c7620427ec922397c30538f61dddcd3` | https://codeload.github.com/supabase/postgres/tar.gz/6abbd33892a90715692c88c98d12d6d91e6f7d83 |

### tree-sitter-wasms@0.1.13

- **any** — registry.npmjs.org/tree-sitter-wasms/0.1.13: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-wT+cR6DwaIz80...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Unlicense"; the tarball's out/ holds prebuilt tree-sitter-<lang>.wasm for bash, c, c_sharp, cpp, css, dart, elisp, elixir, elm, embedded_template, go, html, java, javascript, json, kotlin, lua, objc, ocaml, php, python, ql, rescript, ruby, rust, scala, solidity, swift, systemrdl, tlaplus, toml, tsx, typescript, vue, yaml, zig (tar listing read); of the 02 § 4 template grammars it covers vue and embedded_template only

Licence field: `Unlicense AND LicenseRef-bundled-grammars-unaudited`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 4535492 (4.3 MB) | `66a54a9bbb2685e8f61b458cef1474db54e72979ee2de168e8b602b562350dd0` | https://registry.npmjs.org/tree-sitter-wasms/-/tree-sitter-wasms-0.1.13.tgz |

### web-vitals@6.2.3

- **any** — registry.npmjs.org/web-vitals/6.2.3: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (sha512-Dmy+vdO1UPMqX...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: "Apache-2.0"

Licence field: `Apache-2.0`.

| platform | size | sha256 | url |
|---|---|---|---|
| any | 256168 (0.2 MB) | `0345c05eceae57e921485b0696ab979ef559f3c3dda56abad6ad8145e399a262` | https://registry.npmjs.org/web-vitals/-/web-vitals-6.2.3.tgz |

### webkit@27.2

- **windows-x64** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform windows-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **windows-arm64** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform win64 (calculatePlatform() returns win64 for every win32 host, so Windows on ARM runs the x64 build under emulation; UNPROVEN on ARM hardware); sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **macos-arm64** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform macos-arm64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **macos-x64** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform macos-x64; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **linux-x64-gnu** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform linux-x64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length
- **linux-arm64-gnu** — Playwright 1.64.1 pin: browsers.json revision 2370; path from DOWNLOAD_PATHS for host platform linux-arm64-gnu; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length

Licence field: `BSD-2-Clause AND LGPL-2.0-or-later`.

| platform | size | sha256 | url |
|---|---|---|---|
| windows-x64 | 63138602 (60.2 MB) | `350cbf3b526414a83cd09c2481a4d134e67f4d52850093d703545dee6fdcb047` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-win64.zip |
| windows-arm64 | 63138602 (60.2 MB) | `350cbf3b526414a83cd09c2481a4d134e67f4d52850093d703545dee6fdcb047` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-win64.zip |
| macos-arm64 | 82182599 (78.4 MB) | `29be2be83e1a2d4c2ea9fad26ed57c77004991f191fa865cb7e612b097e34557` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-mac-15-arm64.zip |
| macos-x64 | 88587279 (84.5 MB) | `2b43c865db2c3a408736ff4a822f060570a6e3e52df7ed25d2ed5bc231be7e41` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-mac-15.zip |
| linux-x64-gnu | 108122739 (103.1 MB) | `63b31a5d68d908d9aee2e445b88edc4c1e1d1eba488f5bd7e35668f91315b968` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-ubuntu-24.04.zip |
| linux-arm64-gnu | 101803501 (97.1 MB) | `921cb41dac8589db376dbdf52991c3a9b9d85136db1bbce9358fbd834a649d87` | https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2370/webkit-ubuntu-24.04-arm64.zip |

## Not delivered as manifest items (`toolchain/unavailable.json`, 25 entries)

| component | platform | status | why / what would unblock |
|---|---|---|---|
| chromium, firefox, webkit | linux-x64-musl, linux-arm64-musl | absent | Playwright 1.64.1 has no musl/Alpine host platform (`calculatePlatform()` in its `coreBundle.js` falls back to the glibc ubuntu24.04 build). Unblock: none upstream. |
| mysql | windows-arm64, linux-x64-musl, linux-arm64-musl | absent | Oracle's supported-platforms page lists Windows x86_64 only and no musl distribution; no such archive on `cdn.mysql.com` (HEAD 404). |
| postgresql 15 | windows-arm64 | absent | theseus-rs added native Windows ARM64 for PostgreSQL 16-18 only (its 15.19.1 release notes). 16/17/18 have the item. |
| postgrest | windows-arm64 | absent | No Windows ARM64 asset in v16.5. The x64 build might run under Windows' x64 emulation: UNPROVEN, not listed as an item. |
| supabase-auth | windows-x64, windows-arm64, macos-x64 | absent | The six newest releases publish only linux amd64/arm64 and darwin-arm64 binaries. |
| hunspell-dictionaries | locale fi, ja, zh | absent | No Hunspell dictionary for these in wooorm/dictionaries or LibreOffice/dictionaries (Finnish: also a web search found none). |
| tree-sitter-svelte, -astro, -twig, -blade, -jinja2 | any | no prebuilt artifact | The npm grammar packages ship C sources, no wasm; no `tree-sitter-astro` package exists. A release-pipeline wasm build (tree-sitter CLI + emscripten/docker) would unblock; WP-103 decides maturity. |
| npm-deprecations, registry-publish-times | any | no bulk artifact | Per-package registry data; the only bulk dumps are impractical (ecosyste.ms packages dump: 63,693,845,834 bytes, CC-BY-SA-4.0, built 2026-02-05). See spec-changes.md. |
| **wordpress-vulnerabilities** | any | **BLOCKED** | Wordfence Intelligence v3 needs an API key from a wordfence.com account (v2 returns 410, v3 returns 401 "API key must be supplied using a Bearer token"); keys are per account and not shareable. Unblock: the Operator creates a Wordfence account/key and confirms the terms allow shipping a derived snapshot to customers. WPScan is commercial; Patchstack's database also needs an account (not fetched). |

## Licence review (spec 05 § 8: compiled-in = permissive; runtime-fetched from official sources, not redistributed)

Everything in the manifest is fetched at run time and never linked into the verifier, so copyleft licences below are acceptable under 05 § 8 as long as shipgate does not repackage the files (a mirror run by a customer, `SHIPGATE_MIRROR`, is theirs). Evidence is the licence text or GitHub licence API fetched on 2026-10-22.

| item | licence recorded | evidence | note |
|---|---|---|---|
| node | MIT | `nodejs/node` LICENSE opens "Node.js is licensed for use as follows" followed by the MIT text | fine |
| playwright, playwright-core, lighthouse, web-vitals, firebase, firebase-rules-unit-testing, osv-scanner, libphonenumber metadata | Apache-2.0 | npm registry `license` field / GitHub licence API | fine |
| axe-core | MPL-2.0 | npm + GitHub licence API | 05 § 8 already says unmodified with notice (file-level copyleft) |
| firebase-tools, postgrest, supabase-auth, eol-dates, tree-sitter-wasms wrapper | MIT / Unlicense | npm / GitHub licence API | the tree-sitter-wasms tarball bundles 36 grammar wasm files built from other upstream repos; their individual licences (mostly MIT in upstream) were **not audited**: recorded as `Unlicense AND LicenseRef-bundled-grammars-unaudited` |
| chromium | BSD-3-Clause | `chromium/chromium` GitHub licence API | the Chrome for Testing zip also contains third-party code under other licences (not enumerated) |
| firefox | MPL-2.0 | the Firefox `LICENSE` file says "see toolkit/content/license.html" (not opened); MPL-2.0 is Mozilla's published licence for the code | UNPROVEN beyond that pointer; the Playwright build is a patched Firefox |
| webkit | BSD-2-Clause AND LGPL-2.0-or-later | webkit.org/licensing-webkit: "portions licensed under the LGPL and BSD licenses" (text of LGPL 2 shown; the page does not name which BSD) | fetched, not linked |
| postgresql | PostgreSQL | `postgres/postgres` COPYRIGHT text; theseus-rs repo licence | the theseus-rs archives also bundle Python, OpenSSL, libxml2, ICU etc. (`runtime-dependencies.json` inside each archive, listed in the per-asset manifest); their licences are not covered by the single field |
| mysql | GPL-2.0-only WITH Universal-FOSS-exception-1.0 | Oracle's MySQL license manual (`mysql/mysql-server` LICENSE) is the licensing document; I recorded the Community edition's usual SPDX form from it | **copyleft but fine here**: fetched at run time, run as a separate process, never compiled in or redistributed by shipgate (05 § 8). The exact SPDX string is my reading of the manual, not copied from an SPDX field. |
| jre | GPL-2.0-only WITH Classpath-exception-2.0 | Temurin's published licence (the temurin21-binaries README did not state it in the part I could read) | **recorded from knowledge of Temurin's licence, not from a fetched statement: UNPROVEN**; fetched, run as a separate process |
| firebase-emulators, -database, -storage-rules | `LicenseRef-Firebase-Terms-of-Service` | no licence file accompanies the jars; the vendor distributes them only through firebase-tools under Google's terms | **non-permissive / proprietary Google binaries.** Runtime-fetched from Google's own bucket, never redistributed, so 05 § 8 holds, but the end user is the one bound by the Firebase terms. Operator should confirm. I did not read the terms text. |
| osv-db* | CC-BY-4.0 AND CC0-1.0 | osv.dev/data lists GitHub Advisory Database CC-BY 4.0, Go vulndb CC-BY 4.0, RustSec CC0 1.0, etc. | **attribution required** in the report / `THIRD_PARTY_NOTICES`; the Ubuntu feed (CC-BY-SA) is not in the ecosystems fetched |
| public-suffix-list | MPL-2.0 | GitHub licence API | fine |
| hunspell-dictionaries | `MIT AND` the per-locale expressions | the SPDX `license` of the npm package `dictionary-<locale>` for each of 16 locales: cs GPL-2.0; da (GPL-2.0 OR LGPL-2.1 OR MPL-1.1); de (GPL-2.0 OR GPL-3.0); en (MIT AND BSD); es (GPL-3.0 OR LGPL-3.0 OR MPL-1.1); fr MPL-2.0; it GPL-3.0; ko (GPL-2.0 OR LGPL-2.1 OR MPL-1.1); nb GPL-2.0; nl (BSD-3-Clause OR CC-BY-3.0); pl (GPL-3.0 OR LGPL-3.0 OR MPL-2.0); pt (LGPL-3.0 OR MPL-2.0); ro (GPL-2.0 OR LGPL-2.1 OR MPL-1.1); ru BSD-3-Clause; sv LGPL-3.0; tr MIT | **GPL-only dictionaries (cs, it, nb; de GPL-2/3)** are fetched data files read by the spell-checker, not linked code. The npm package licences describe the *latest npm release*, which I assumed equal to the licence of the wooorm commit I pinned (each dictionary directory has its own `license` file that I did not open). |
| hunspell-ar-aff, -dic | GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1 | `ar/COPYING.txt` in LibreOffice/dictionaries: "GPL 2.0/LGPL 2.1/MPL 1.1 tri-license"; `README_ar.txt` credits Ayaspell | fine |
| libphonenumber-metadata | Apache-2.0 | GitHub licence API | |
| supabase-schema-ddl | PostgreSQL | `supabase/postgres` GitHub licence API | upstream reference only |
| eol-dates | MIT | `endoflife-date/endoflife.date` GitHub licence API | |

### Licence facts WP-104 asked for (data that is not a manifest item)

- **GeoNames:** geonames.org/export says "cc-by licence (creative commons attribution license). You should give credit to GeoNames when using data or web services with a link or another reference to GeoNames. commercial usage is allowed 'as is'". The version of CC-BY is not stated on that page. Attribution required.
- **web-features:** npm `web-features@3.43.0` is Apache-2.0 and GitHub's licence API reports Apache-2.0 for `web-platform-dx/web-features`. Licence of the data it embeds (browser-compat-data etc.) not checked: UNPROVEN.
- **Hunspell:** see the table above.

## Compiled-in crates and parsers (recommendations; none is a manifest item)

All numbers from the crates.io API on 2026-10-22. None was compiled or audited with `cargo deny` here: **UNPROVEN** for transitive licences until the consuming WP runs `cargo deny check`.

- **lingua (I18-007):** `lingua` 1.8.0, Apache-2.0, 2.66 M downloads; models are compiled into the crate per language feature, so nothing to fetch. Pin `=1.8.0`; the report must print this version (I18-007).
- **libphonenumber (04 § 15 E.164):** two ways. Crate with bundled metadata: `phonenumber` 0.3.10+9.0.33 (Apache-2.0, 13.4 M downloads, tracks libphonenumber 9.0.33). Or parse the manifest item `libphonenumber-metadata` (9.0.41, refreshable) with `rlibphonenumber` 2.2.14 (Apache-2.0). Recommendation: the crate, unless refreshable metadata is wanted; then the data item is already in the manifest.
- **PDF parser (A11-026):** `lopdf` 0.46.0, MIT, 25.7 M downloads, published 2026-10-21; gives the document catalog, `/MarkInfo`, `/StructTreeRoot`, `/Lang`, `/ViewerPreferences`, Info dictionary and XMP metadata stream access that A11-026 needs (API not exercised here). Alternative: `pdf` 0.10.0 (MIT).
- **Root store (SEC-056):** `webpki-roots` 1.0.10 is licensed **CDLA-Permissive-2.0**, which is **not** in `deny.toml`'s allow list (MIT, Apache-2.0, BSD-2/3, ISC, Zlib, Unicode-3.0, PostgreSQL) and not in 05 § 8's list. `rustls-native-certs` (Apache-2.0 OR ISC OR MIT) reads the host store, which contradicts "bundled Mozilla root store". Needs an Operator decision (allow CDLA-Permissive-2.0, or vendor `curl.se/ca/cacert.pem`, MPL-2.0 data, 200,116 bytes today). See spec-changes.md.
- **Firebase rules parser (WP-701, DB-011):** no established crate. Found: `hidane-rules` 0.6.0 (MIT OR Apache-2.0, 143 downloads, published 2026-10-15, "Firestore Security Rules compiler and evaluator") and `tree-sitter-rules` 0.0.6 (MIT, 5,142 downloads, a tree-sitter grammar for Firebase rules). Recommendation: write the small recursive-descent parser DB-011 needs (match/allow/function, boolean folding) in WP-701 rather than depend on a week-old 143-download crate; use the tree-sitter grammar only as a syntax reference. Realtime Database rules are plain JSON (`serde_json`). I did not read either crate's source.
- **XMP / C2PA reader (WP-609, UX-020):** `c2pa` 0.91.4 (MIT OR Apache-2.0, 10.8 M downloads, official contentauth SDK, requires Rust 1.96) for C2PA manifests; XMP via `quick-xml` 0.42.0 (MIT) over the XMP packet, or the pure-Rust `xmpkit` 0.1.6 (MIT OR Apache-2.0, 15.5 k downloads, young). `xmp_toolkit` 1.12.1 wraps Adobe's C++ toolkit and needs a C++ build. `c2pa` has a large dependency tree: check it with `cargo deny` before adopting; if it fails, a minimal JUMBF/box scan for the `c2pa` label is the fallback.

## npm dependency closure (affects the manifest shape)

One tarball URL is not a runnable package. `npm install --package-lock-only --ignore-scripts` (exact version, empty project) resolves these closures: lighthouse@13.5.0: 114 packages; firebase-tools@15.34.1: 633; firebase-rules-unit-testing (@firebase/rules-unit-testing@6.0.0): 87; firebase@13.1.0: 86; playwright@1.64.1: 2 (with playwright-core); axe-core: 1; web-vitals: 1. 03 § 19 says npm packages are fetched "by exact version and integrity hash at fetch time", which implies a lockfile-driven install; see spec-changes.md.

## UNPROVEN / not checked

- Windows ARM64 browsers (Chromium, Firefox, WebKit) are the x64 Playwright builds run under Windows' x64 emulation, as Playwright itself does (`calculatePlatform()` returns `win64` for every Windows host); not run on ARM hardware.
- No archive was unpacked or executed (no run of any binary), apart from reading ELF/Mach-O/PE headers of the OSV-Scanner, PostgREST and Supabase Auth executables and listing the MySQL minimal and tree-sitter-wasms archives.
- macOS WebKit uses the `mac-15` build; Playwright picks `mac-14`/`mac-26` builds per host OS version, which the single `macos-*` platform id cannot express.
- Linux Firefox/WebKit use the Ubuntu 24.04 builds (Playwright's own fallback for unknown distributions, glibc >= 2.39); Playwright also has Ubuntu 22.04 and Debian builds.
- PostgreSQL archives' `extensions` lists are every `extension/*.control` file in the archive's own file manifest, including test modules in the PostgreSQL 15 Windows build (`test_ext1`.., `dummy_index_am`, `worker_spi`). Not filtered.
- Licence of the Temurin JRE and the exact SPDX strings for MySQL: see the licence table.
- Sample verification only (7 of 117 items independently re-hashed after assembly).

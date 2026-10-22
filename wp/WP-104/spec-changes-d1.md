# WP-104 part d1 — spec problems and proposals

Each item: the spec line, what was observed, the proposal. The data files use the proposal where the spec is silent; where the spec is explicit but awkward the file follows the spec and the proposal is optional.

## 1. `bool-labels.json` has no shape (04 § 15 *Default field formats*)
Spec: "`bool` → localized yes/no from the ruleset". No file name or shape is given anywhere (`grep bool-labels spec/**` finds nothing; only BUILD_MAP WP-104 says "bool labels per locale"; `xtask/tests/wp_104.rs` lists `bool-labels`).
Proposal (used): `rules/bool-labels.json` = `{ "<BCP 47 primary tag>": { "true": string, "false": string } }`, display forms (rendered, not matched, so not case-folded: `"Ja"`/`"Nein"`), looked up as 04 § 15 *Page locale* says. Add the file name and shape to 04 § 15 *Default field formats*.

## 2. `soft-404-phrases.json`: file name and shape are not stated (04 § 12 *Soft-404*, web-delivery RTE-004)
Spec speaks of "the ruleset list" / "the soft-404 phrases" and (web-delivery § 2) lists it among the per-locale lists, but never names the file; the test and BUILD_MAP use `soft-404-phrases`.
Proposal (used): `{ "<primary subtag>": [string] }`, entries NFKC + case-folded, matched whole-word (UAX #29) as 04 § 12 says. Name the file in 04 § 12 and in the `web-delivery.soft404Phrases` row of 03 § 3 (the policy key unions with it).

## 3. `attribution-phrases.json`: "substring" matching makes short phrases over-match (AEO-005)
Spec: phrases are matched "NFKC, case-folded, substring" and the examples are `according to`, `laut`, `selon`. A substring match of `laut` also hits `laute`, `lauten`, `lautet`; `selon` is fine, `segundo` (Portuguese) also means the ordinal "second", `secondo` likewise.
Used: the German/Italian/Portuguese/Romanian lists carry multi-word phrases (`laut einer`, `laut dem`, `segundo o estudo`, `potrivit unui`, …) instead of the bare word, with no entry relying on a trailing space. Proposal (optional): say whole-word for this file as for the other per-locale lists of the pack, then bare `laut` / `segundo` / `potrivit` could be added.

## 4. `placeholders.json` `phoneRanges` cannot express a range that is the same in every NANP area code (MET-011 `contact`)
Spec: `phoneRanges: [{ from, to }] (E.164)` and "NANP `555-0100`–`555-0199`". `from`/`to` are two concrete numbers, but the reserved NANP range is `+1 NXX 555 0100`–`0199` in *every* area code. Delivered: one `{from,to}` pair per NXX area code (N = 2-9, N11 excluded) = 792 pairs, which is correct but bulky.
Proposal (optional): allow `x` as a wildcard digit in `from`/`to` (`{ "from": "+1xxx5550100", "to": "+1xxx5550199" }`), or a string pattern form. Not needed for correctness.

## 5. `placeholders.json`: where a language-neutral fact lives
Spec: "`*` applies to every language … never counts as a locale's entry". Used: the `*` entry holds everything not tied to a language (lorem Latin, starter strings and favicon hashes, all `phoneRanges` — fictional ranges are tied to a country, not to the page language —, reserved domains, image hosts, the English names MET-011 names without a language qualifier). Each locale key holds `lorem`, `addresses`, `names` filler of that language; its other fields are empty arrays. State this convention in web-delivery § 2.

## 6. CJK word lists cannot be matched by UAX #29 word equality (stop-words, verbs, evergreen-words, generic-*, KW-002/003, SE-121)
Spec: stop words and verbs are "compared by equality with the NFKC, case-folded word" where words are UAX #29 words. UAX #29 (no dictionary) yields one word per Han ideograph and per Hiragana letter, so any multi-character `ja`/`zh` stop word or verb form (`じゃない`, `购买`) never equals a token; only single-character entries and Katakana runs and Hangul/Arabic tokens can match. This is a limit of the shared tokenisation, not of the data. The data files carry the real multi-character words (they cost nothing and become useful if the engine segments CJK with a dictionary). Proposal: either define CJK word segmentation for the keyword rules (e.g. ICU dictionary break iterator) or document that `ja`/`zh` lists only act through single-character entries.

## 7. Snowball stop-word lists do not cover every locale
Snowball publishes lists for da, nl, en, fi, fr, de, hu, it, no, pt, ru, es, sv. Used for those (Norwegian list → `nb`). `ar`, `cs`, `pl`, `ro`, `tr`, `ja`, `ko`, `zh` come from stopwords-iso (MIT). Recorded in `provenance-d1.json`. No spec change needed; the brief's wording "Snowball where it has the language, else stopwords-iso" is what was followed.

## 8. French drama numbers and other countries
`placeholders.json` `phoneRanges` has NANP (spec text), UK (Ofcom), Germany (Bundesnetzagentur) and Australia (ACMA). No primary source for France (ARCEP), Spain, Italy, Brazil, Japan etc. could be fetched, so none is invented. NOT DONE for those countries; unblock = a regulator page per country.

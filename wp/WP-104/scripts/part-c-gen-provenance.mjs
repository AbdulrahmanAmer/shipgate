// Usage: node wp/WP-104/scripts/part-c-gen-provenance.mjs <out wp/WP-104/provenance-c.json>
// WP-104 part c. Writes the provenance fragment for the files of part c (merged into rules/provenance.json by the orchestrator).
import fs from "node:fs";

const out = process.argv[2];
const D = "2026-10-22";
const AUTH = "LicenseRef-shipgate-authored";
const EURLEX = (celexList) => celexList.map((c) => `https://publications.europa.eu/resource/celex/${c}`);
const EURLEX_ATTR = "Statutory wording quoted from EUR-Lex (© European Union, https://eur-lex.europa.eu), reused under Commission Decision 2011/833/EU. ";
const NOTE_LOCALES = "Locales without an official translation (ar, ja, ko, nb, ru, tr, zh) are authored. ";

const e = (source, attribution) => ({ source, retrieved: D, licence: AUTH, ...(attribution ? { attribution } : {}) });
const P = {};

P["google-tags.json"] = e([
  "spec:spec/packs/privacy.md § 1 (google-tags.json shape)",
  "https://developers.google.com/tag-platform/security/guides/csp",
  "https://www.google.com/supported_domains",
  "https://developers.google.com/tag-platform/security/concepts/consent-mode",
  "https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference",
  "https://developers.google.com/tag-platform/tag-manager/server-side/send-data",
  "https://docs.cookiehub.com/advanced/consent-mode-v2-signals",
  "https://www.uniconsent.com/consent-data-validator",
], "UNPROVEN against Google: Google documents that `gcd` is always sent (consent-mode page) but publishes no letter table. The letters l m n p q r t u v come from two vendor documentations (CookieHub, UniConsent) that agree; see wp/WP-104/spec-changes-c.md item 1. Hosts: Google's CSP guide for the Google tag, with www.google.<TLD> expanded from Google's supported_domains list; `analytics.google.com` is narrowed from the guide's `*.google.com`. `www.google.com` is also used by non-tag Google services (e.g. reCAPTCHA). libraryPaths /gtag/js (server-side tagging guide) and /gtm.js (CSP guide); measurementPaths /g/collect, /pagead/, /ccm/ are the spec's own list, /mp/collect from the Measurement Protocol reference.");
P["us-opt-out-states.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-004",
  "https://www.law.cornell.edu/regulations/california/11-CCR-7025",
  "https://privacylawmap.com/blog/universal-opt-out-mechanism-compliance-guide",
], "The shape lists jurisdiction keys only. `us-ca-ccpa`: Cal. Code Regs. tit. 11 § 7025 (opt-out preference signals). `us-state-privacy`: the states listed by privacylawmap.com as requiring recognition of a universal opt-out mechanism (CO, CT, MT, TX, OR, DE, NE, NH, NJ, MN, MD) - a secondary source; the statutes themselves were not fetched.");
P["required-legal-pages.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-022 (shape and examples)",
  "spec:spec/packs/privacy.md § 2 PRV-006, PRV-017, PRV-028, PRV-032, PRV-033, PRV-034, PRV-037, PRV-042",
  "spec:BUILD_MAP.md WP-104 (required legal pages for kr-pipa, cn-pipl, br-lgpd, ca-pipeda, jp-appi, jp-sct)",
]);
P["consent-models.json"] = e([
  "spec:spec/packs/privacy.md § 1 (Validation: consent-models.json)",
  "spec:spec/packs/privacy.md § 1 (jurisdictions list)",
  "https://www.law.cornell.edu/regulations/california/11-CCR-7025",
], "Authored judgement: `opt-out` = the regime does not require consent before non-essential cookies (CCPA/CPRA and the state laws: opt-out of sale/share; Australia: no cookie-consent rule; sector regimes that do not govern cookies). Every privacy/ePrivacy regime and the national rules are `opt-in`. Counsel review recommended; see spec-changes-c.md item 6.");
P["market-signals.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-029 (shape and examples)",
  "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/adequacy-regulations/is-the-restricted-transfer-covered-by-adequacy-regulations",
], "EU-27 plus IS, LI, NO map to eu-gdpr (the member list is the one the ICO page prints). Currencies: euro and the non-euro EU/EEA currencies. `EU` and `.eu` are an addition (an exceptionally reserved ISO code); see spec-changes-c.md item 5.");
P["provider-id-by-country.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-030 (the requirements per country)",
  "https://www.legislation.gov.uk/uksi/2015/17/part/6/made",
  "https://wetten.overheid.nl/BWBR0005291/",
  "https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758",
], "GB: SI 2015/17 reg. 25 (part of the UK of registration, registered number, registered office on a website). NL: BW 3:15d(1) (identity, register + number, VAT number). ES: LSSI art. 10 (name, address, registry data, NIF). FR (LCEN art. 6-III) and IT (Codice civile art. 2250): taken from the spec; the Legifrance and Italian texts could not be fetched (403/not attempted).");
P["tcf-ad-vendors.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-036",
  "https://vendor-list.consensu.org/v3/vendor-list.json",
  "https://developers.google.com/publisher-tag/guides/content-security-policy",
  "https://developers.google.com/tag-platform/security/guides/csp",
], "IAB Global Vendor List v181 (lastUpdated 2026-10-15): vendor 755 = Google Advertising Products. Hosts are those Google's own guides name for AdSense / Ad Manager ad serving (pagead2.googlesyndication.com, securepubads.g.doubleclick.net, googleads.g.doubleclick.net). pagead2.googlesyndication.com is also contacted by Google Ads conversion tags.");
P["google-certified-cmps.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-036",
  "https://support.google.com/adsense/answer/13554116",
  "https://support.google.com/admanager/answer/9805023",
  "https://vendor-list.consensu.org/v3/vendor-list.json",
], "124 TCF CMP ids of the web-capable entries (platform Web / Web and app / Web and CTV / Web, app, and CTV) of Google's certified-CMP table (143 rows, list updated weekly). minTcfPolicyVersion 5 = tcfPolicyVersion of the live IAB GVL (TCF v2.3, mandatory for Google ad requests since 2026-03-01 per Google's Ad Manager TCF page).");
P["transfer-adequacy.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-038",
  "https://commission.europa.eu/law/law-topic/data-protection/international-dimension-data-protection/adequacy-decisions_en",
  "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/adequacy-regulations/is-the-restricted-transfer-covered-by-adequacy-regulations",
], "EU list as of 2026-10-22: AD AR BR CA FO GG IL IM JE JP KR NZ CH GB UY (Brazil: decision dated 2026-01-26; Canada: commercial organisations only; the European Patent Organisation is not a country; US is never listed, DPF is per host). UK list: EEA, AD AR FO GI GG IM IL JE NZ CH UY, KR, and CA and JP (both partial adequacy: PIPEDA organisations / APPI business operators only). UK has no Brazil regulation.");
P["regulated-product-regimes.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-040",
  "https://energy-efficient-products.ec.europa.eu/product-list_en",
  "https://publications.europa.eu/resource/celex/32011R1169",
  "https://www.law.cornell.edu/regulations/california/27-CCR-25602",
], "eu-energy-label: product groups of the EU product list tagged 'Energy Label' (19 groups). eu-food-info and us-ca-prop65 category terms are authored (Prop 65 has no category list; the terms are consumer-product groups commonly named in notices). All 20 locales are authored translations; every regex compiles in the Rust regex crate 1.13.1 and was tested on one positive and one negative sample per locale.");
P["digital-product-types.json"] = e([
  "spec:spec/packs/privacy.md § 2 PRV-025",
  "https://schema.org/version/latest/schemaorg-current-https.jsonld",
], "schema.org types verified present in the current vocabulary (SoftwareApplication, WebApplication, MobileApplication, VideoGame, DigitalDocument, EBook) in http and https form, and Product Types Ontology ids (http://www.productontology.org/id/<Wikipedia article>; the service has no https endpoint) of the matching English Wikipedia articles (the service answers for each id; it does not distinguish absent articles, so existence of the article is by knowledge).");
P["attribution-licences.json"] = e([
  "spec:spec/packs/programmatic.md § DAT-018",
  "https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json",
], "SPDX identifiers only, all verified present in SPDX License List 3.29.0 (2026-09-16). Licences chosen: every Creative Commons BY family id, ODbL, ODC-By, OGL (UK, Canada), Licence Ouverte (etalab-2.0), Datenlizenz Deutschland BY 2.0, NLOD, OGDL-Taiwan, and the permissive software licences MIT, BSD-2/3, Apache-2.0 and ISC (notice retention). Selection is authored.");

// ---- per-locale files
const L = (sources, attribution) => e(sources, attribution);
const WITH = "spec:spec/packs/privacy.md § 2 ";
P["withdrawal-labels.json"] = L([WITH + "PRV-021", ...EURLEX(["32023L2673"]), "https://www.gesetze-im-internet.de/bgb/__356a.html"], EURLEX_ATTR + "First entry of each EU language = the words of Directive (EU) 2023/2673 Art. 11a(1) in that language (de: also BGB § 356a(1)). Further entries are authored real-world variants. " + NOTE_LOCALES + "pt also lists the Brazilian 'arrependimento' / 'cancelar compra' (spec PRV-035).");
P["withdrawal-confirm-labels.json"] = L([WITH + "PRV-021", ...EURLEX(["32023L2673"]), "https://www.gesetze-im-internet.de/bgb/__356a.html"], EURLEX_ATTR + "First entry of each EU language = Art. 11a(3) wording (de: also BGB § 356a(3) 'Widerruf bestätigen'). Others authored. " + NOTE_LOCALES);
P["withdrawal-info-phrases.json"] = L([WITH + "PRV-039", ...EURLEX(["32011L0083"])], EURLEX_ATTR + "right / period / howTo / effects / modelForm = the wording of the Model instructions on withdrawal and the Model withdrawal form (Annex I(A), I(B) of Directive 2011/83/EU) in each EU language (each group checked verbatim by wp/WP-104/scripts/part-c-official-check.mjs); further entries are authored variants. " + NOTE_LOCALES + "The EU model has no counterpart in those languages; entries describe the equivalent notions.");
P["order-button-labels.json"] =L([WITH + "PRV-023", ...EURLEX(["32011L0083", "52021XC1229%2804%29"]), "https://lovdata.no/dokument/NL/lov/2014-06-20-27"], EURLEX_ATTR + "Art. 8(2) CRD wording in every EU language (de also BGB § 312j), the Commission's CRD Notice examples 'buy now / pay now / confirm purchase' in every EU language, nb from angrerettloven § 16(2). Remaining entries and ar, ja, ko, ru, tr, zh are authored; 'order now' and 'confirm' are deliberately absent (the Notice rates them less likely to comply).");
P["prior-price-phrases.json"] = L([WITH + "PRV-024", "https://publications.europa.eu/resource/celex/32019L2161"], "Authored from the prior-price rule inserted by Directive (EU) 2019/2161 (the lowest price applied during a period not shorter than 30 days prior to the price reduction; English text fetched); no phrase is quoted from an official translation. UNPROVEN wording for ar, ja, ko, ru, tr, zh, nb.");
P["review-verification-phrases.json"] = L([WITH + "PRV-024", "https://publications.europa.eu/resource/celex/32019L2161"], "Authored from the Omnibus Directive UCPD Annex I point 23b / Art. 7(6) review rules; no phrase quoted from an official translation.");
P["cancel-labels.json"] = L(["spec:spec/packs/testing.md § TST-010", "https://www.gesetze-im-internet.de/bgb/__312k.html"], "de: 'Verträge hier kündigen' is the wording of BGB § 312k(2) sentence 2; the other de entries and all other locales are authored (only Germany prescribes wording).");
P["vat-phrases.json"] = L([WITH + "PRV-026"], "Authored; no statute prescribes the phrases.");
P["shipping-cost-phrases.json"] = L([WITH + "PRV-026"], "Authored; no statute prescribes the phrases.");
P["renewal-terms-phrases.json"] = L([WITH + "PRV-027"], "Authored (ROSCA, California ARL and CRD prescribe content, not wording).");
P["sct-labels.json"] = L([WITH + "PRV-022 (jp-sct)", "https://www.jaro.or.jp/jaro30/pdf/1-6.pdf"], "ja labels follow the items of 特定商取引法 Art. 11 (販売価格・送料, 代金の支払時期及び方法, 引渡時期, 返品); the e-Gov text of the Act returned 403/maintenance, so the item names were confirmed from the JARO guide. All other locales are authored equivalents.");
P["privacy-notice-elements.json"] = L([WITH + "PRV-031, PRV-033, PRV-034, PRV-038", ...EURLEX(["32016R0679"]), "https://www.law.cornell.edu/regulations/california/11-CCR-7025"], EURLEX_ATTR + "gdpr groups for the 13 EU languages draw on the GDPR Art. 13/14/44-49 wording in that language (first entry where it exists, checked verbatim by wp/WP-104/scripts/part-c-official-check.mjs); ccpa, dpdp and app groups and all non-EU languages are authored from Cal. Civ. Code § 1798.130(a)(5), DPDP Rules 2025 notice content and Privacy Act 1988 APP 1.4.");
P["purpose-phrases.json"] = L([WITH + "PRV-031 (jp-appi)"], "Authored; no statute prescribes the phrases. ja is the primary use (APPI external-transmission notice).");
P["dsa-contact-phrases.json"] = L([WITH + "PRV-037", ...EURLEX(["32022R2065"])], EURLEX_ATTR + "'single point of contact' in each EU language is the wording of Regulation (EU) 2022/2065 Arts 11-12 (checked verbatim). " + NOTE_LOCALES);
P["dsa-terms-phrases.json"] = L([WITH + "PRV-037", ...EURLEX(["32022R2065"])], EURLEX_ATTR + "restrictions / content moderation / internal complaint-handling terms of Art. 14(1) in each EU language (checked verbatim); other entries and non-EU languages authored.");
P["report-content-labels.json"] = L([WITH + "PRV-037, PRV-042", ...EURLEX(["32022R2065"])], EURLEX_ATTR + "goodFaith = the 'bona fide belief ... accurate and complete' statement of Art. 16(2)(d) in each EU language (checked verbatim). `control` labels are authored (the DSA prescribes no button wording). Non-EU languages authored.");
P["sms-consent-phrases.json"] = L([WITH + "PRV-032", "https://www.law.cornell.edu/cfr/text/47/64.1200"], "en autodial and notCondition follow the disclosure of 47 CFR 64.1200(f)(9)(i); frequency / rates / opt-out are the CTIA-style conventions (authored). All other locales are authored translations.");
P["sms-markers.json"] = L([WITH + "PRV-032"], "Authored.");
P["transfer-mechanism-phrases.json"] = L([WITH + "PRV-038", ...EURLEX(["32016R0679"])], EURLEX_ATTR + "Chapter V terms (adequacy decision, standard data protection clauses, binding corporate rules, derogations) in each EU language (checked verbatim); 'data privacy framework' names and short forms are authored. " + NOTE_LOCALES);
P["marketing-consent-phrases.json"] = L([WITH + "PRV-041", ...EURLEX(["32016R0679"])], EURLEX_ATTR + "withdraw group includes the GDPR Art. 7(3)/13(2)(c) 'withdraw consent at any time' wording in each EU language (checked verbatim); purpose group and non-EU languages authored.");
P["marketing-signup-markers.json"] = L([WITH + "PRV-041"], "Authored.");
P["marketing-optin-labels.json"] = L([WITH + "PRV-008"], "Authored.");
P["dmca-phrases.json"] = L([WITH + "PRV-042", "https://www.govinfo.gov/content/pkg/PLAW-119publ12/html/PLAW-119publ12.htm"], "Authored from 17 U.S.C. § 512(c)(2)-(3) vocabulary (DMCA, designated agent, notice of infringement, counter-notice); translations authored.");
P["tida-phrases.json"] = L([WITH + "PRV-042", "https://www.govinfo.gov/content/pkg/PLAW-119publ12/html/PLAW-119publ12.htm"], "en follows TAKE IT DOWN Act § 3 (Pub. L. 119-12): 'notice and removal process', 'intimate visual depiction', 'published without the consent', 'not later than 48 hours' (statute text fetched). Translations authored.");
P["osa-terms-phrases.json"] = L([WITH + "PRV-042 (uk-osa)"], "Authored from the vocabulary of the Online Safety Act 2023 (illegal content, complaints procedures); the Act's text was not fetched.");
P["prop65-link-labels.json"] = L([WITH + "PRV-040", "https://www.law.cornell.edu/regulations/california/27-CCR-25602", "https://www.law.cornell.edu/regulations/california/27-CCR-25603"], "27 CCR § 25602(b)(1)(B): 'a clearly marked hyperlink using the word \"WARNING\" or the words \"CA WARNING\" or \"CALIFORNIA WARNING\"'. Translations of the word and of 'Proposition 65' are authored.");
P["unit-quantity-patterns.json"] = L([WITH + "PRV-026 (part unit; shape)"], "Authored. Units are SI plus lb and oz for en; decimal separators follow the locale (es, pt, ar accept both). Every regex compiles in the Rust regex crate 1.13.1 and was run over 2-4 samples per locale. Limitation: perRegex covers the price-first form (12,50 €/kg) only; see spec-changes-c.md item 3.");
P["country-of-origin-labels.json"] = L([WITH + "PRV-033"], "Authored; Consumer Protection (E-Commerce) Rules 2020 r. 6 requires the country of origin but prescribes no wording.");
P["add-to-cart-labels.json"] = L([WITH + "§ 1 (Product page)"], "Authored.");
P["a11y-statement-phrases.json"] = L([WITH + "PRV-017", ...EURLEX(["32018D1523"])], EURLEX_ATTR + "Compliance-status wording and the section headings of the model accessibility statement of Implementing Decision (EU) 2018/1523 in each EU language (checked verbatim); other entries and non-EU languages authored.");
P["terms-acceptance-phrases.json"] = L([WITH + "PRV-028"], "Authored.");
P["safety-info-labels.json"] = L([WITH + "PRV-025", "https://publications.europa.eu/resource/celex/32023R0988"], "Authored; the spec cites Regulation (EU) 2023/988 Art. 19, which requires the information but prescribes no link wording. 'general product safety' terms follow the Regulation's title.");

fs.writeFileSync(out, JSON.stringify(Object.fromEntries(Object.keys(P).sort().map((k) => [k, P[k]])), null, 2) + "\n");
console.log(`provenance entries: ${Object.keys(P).length}`);

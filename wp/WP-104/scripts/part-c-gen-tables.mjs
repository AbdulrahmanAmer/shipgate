// Usage: node wp/WP-104/scripts/part-c-gen-tables.mjs <rules dir>
// WP-104 part c. Writes the small non-locale tables whose EU/EEA member lists would otherwise be typed three times:
// market-signals.json, transfer-adequacy.json, provider-id-by-country.json, tcf-ad-vendors.json,
// digital-product-types.json, attribution-licences.json.
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: part-c-gen-tables.mjs <rules dir>");
const write = (name, obj) => fs.writeFileSync(path.join(dir, name), JSON.stringify(obj, null, 2) + "\n");

// EU-27 (Bulgaria is a member; euro area since 2026-01-01) + EEA-EFTA states.
const EU27 = ["AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE"];
const EEA = [...EU27, "IS", "LI", "NO"].sort();

// ---- market-signals.json (PRV-029)
const regions = {};
for (const c of EEA) regions[c] = ["eu-gdpr"];
regions.EU = ["eu-gdpr"];
Object.assign(regions, {
  GB: ["uk-gdpr"],
  BR: ["br-lgpd"],
  CA: ["ca-pipeda"],
  JP: ["jp-appi"],
  KR: ["kr-pipa"],
  CN: ["cn-pipl"],
  IN: ["in-dpdp"],
  AU: ["au-privacy"],
});
// Currencies of EU/EEA states (BGN is the retired Bulgarian lev, still seen on older price data).
const currencies = {};
for (const c of ["EUR", "BGN", "CZK", "DKK", "HUF", "PLN", "RON", "SEK", "ISK", "NOK"]) currencies[c] = ["eu-gdpr"];
Object.assign(currencies, {
  GBP: ["uk-gdpr"],
  BRL: ["br-lgpd"],
  CAD: ["ca-pipeda"],
  JPY: ["jp-appi"],
  KRW: ["kr-pipa"],
  CNY: ["cn-pipl"],
  INR: ["in-dpdp"],
  AUD: ["au-privacy"],
});
const tlds = {};
for (const c of EEA) tlds[c.toLowerCase()] = c;
Object.assign(tlds, { eu: "EU", uk: "GB", br: "BR", ca: "CA", jp: "JP", kr: "KR", cn: "CN", in: "IN", au: "AU" });
write("market-signals.json", {
  regions,
  currencies,
  tlds,
  commerce: {
    "eu-gdpr": ["eu-consumer"],
    "uk-gdpr": ["uk-consumer"],
    "br-lgpd": ["br-consumer"],
    "au-privacy": ["au-consumer"],
    "in-dpdp": ["in-ecommerce"],
    "ca-pipeda": ["ca-consumer"],
  },
});

// ---- transfer-adequacy.json (PRV-038)
// European Commission adequacy decisions in force 2026-10-22: AD AR BR CA(commercial) FO GG IL IM JP JE NZ KR CH GB UY.
// (US: DPF, certified entities only - never listed. European Patent Organisation is not a country.)
// UK adequacy regulations (ICO page, 2026-10-22): EEA, EU institutions, AD AR FO GI GG IM IL JE NZ CH UY, CA and JP (partial), KR.
const euAdequate = ["AD", "AR", "BR", "CA", "CH", "FO", "GB", "GG", "IL", "IM", "JE", "JP", "KR", "NZ", "UY"];
const ukAdequate = [...EEA, "AD", "AR", "CA", "CH", "FO", "GG", "GI", "IL", "IM", "JE", "JP", "KR", "NZ", "UY"].sort();
write("transfer-adequacy.json", {
  eu: { home: EEA, adequate: euAdequate },
  uk: { home: ["GB"], adequate: ukAdequate },
});

// ---- provider-id-by-country.json (PRV-030 part country)
write("provider-id-by-country.json", {
  GB: {
    requires: ["registerNumber", "registeredOffice", "registerCountry"],
    placeNames: {
      GB: ["England and Wales", "Scotland", "Northern Ireland", "Wales"],
      "GB-ENG": ["England and Wales"],
      "GB-WLS": ["Wales", "England and Wales"],
      "GB-SCT": ["Scotland"],
      "GB-NIR": ["Northern Ireland"],
    },
  },
  FR: { requires: ["registerNumber", "host", "publicationDirector"] },
  IT: { requires: ["registerNumber", "vatId"] },
  ES: { requires: ["vatId"] },
  NL: { requires: ["registerNumber", "vatId"] },
});

// ---- tcf-ad-vendors.json (PRV-036): Google Advertising Products = IAB GVL vendor 755.
const gvl = 755;
write(
  "tcf-ad-vendors.json",
  [
    "pagead2.googlesyndication.com",
    "securepubads.g.doubleclick.net",
    "googleads.g.doubleclick.net",
  ].map((host) => ({ host, gvlVendorId: gvl })),
);

// ---- digital-product-types.json (PRV-025): `additionalType` values, lower case (NFKC + case-folded comparison).
const digitalSchema = ["SoftwareApplication", "WebApplication", "MobileApplication", "VideoGame", "DigitalDocument", "EBook"];
const digitalPo = ["Software", "Application_software", "Mobile_app", "Web_application", "Software_as_a_service", "Video_game", "E-book", "Music_download"];
write("digital-product-types.json", [
  ...digitalSchema.flatMap((t) => [`https://schema.org/${t}`, `http://schema.org/${t}`]),
  ...digitalPo.map((t) => `http://www.productontology.org/id/${t}`),
].map((s) => s.toLowerCase()));

// ---- attribution-licences.json (DAT-018): SPDX ids (3.29.0) of licences that require attribution.
write("attribution-licences.json", [
  "CC-BY-1.0", "CC-BY-2.0", "CC-BY-2.5", "CC-BY-2.5-AU", "CC-BY-3.0", "CC-BY-3.0-AT", "CC-BY-3.0-AU", "CC-BY-3.0-DE", "CC-BY-3.0-IGO", "CC-BY-3.0-NL", "CC-BY-3.0-US", "CC-BY-4.0",
  "CC-BY-SA-1.0", "CC-BY-SA-2.0", "CC-BY-SA-2.0-UK", "CC-BY-SA-2.1-JP", "CC-BY-SA-2.5", "CC-BY-SA-3.0", "CC-BY-SA-3.0-AT", "CC-BY-SA-3.0-DE", "CC-BY-SA-3.0-IGO", "CC-BY-SA-4.0",
  "CC-BY-NC-1.0", "CC-BY-NC-2.0", "CC-BY-NC-2.5", "CC-BY-NC-3.0", "CC-BY-NC-3.0-DE", "CC-BY-NC-3.0-IGO", "CC-BY-NC-4.0",
  "CC-BY-NC-SA-1.0", "CC-BY-NC-SA-2.0", "CC-BY-NC-SA-2.0-DE", "CC-BY-NC-SA-2.0-FR", "CC-BY-NC-SA-2.0-UK", "CC-BY-NC-SA-2.5", "CC-BY-NC-SA-3.0", "CC-BY-NC-SA-3.0-DE", "CC-BY-NC-SA-3.0-IGO", "CC-BY-NC-SA-4.0",
  "CC-BY-NC-ND-1.0", "CC-BY-NC-ND-2.0", "CC-BY-NC-ND-2.5", "CC-BY-NC-ND-3.0", "CC-BY-NC-ND-3.0-DE", "CC-BY-NC-ND-3.0-IGO", "CC-BY-NC-ND-4.0",
  "CC-BY-ND-1.0", "CC-BY-ND-2.0", "CC-BY-ND-2.5", "CC-BY-ND-3.0", "CC-BY-ND-3.0-DE", "CC-BY-ND-4.0",
  "ODbL-1.0", "ODC-By-1.0",
  "OGL-UK-1.0", "OGL-UK-2.0", "OGL-UK-3.0", "OGL-Canada-2.0",
  "etalab-2.0", "DL-DE-BY-2.0", "NLOD-1.0", "NLOD-2.0", "OGDL-Taiwan-1.0",
  "MIT", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0", "ISC",
]);
console.log("tables written");

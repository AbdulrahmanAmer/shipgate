// Usage: node wp/WP-104/scripts/part-c-gen-unit-patterns.mjs <out rules/unit-quantity-patterns.json>
// WP-104 part c. Builds rules/unit-quantity-patterns.json (PRV-026 part `unit`) and self-tests every regex.
// Regexes are written in Rust `regex` syntax: named groups (?P<name>…), a leading (?i), Unicode classes; no lookaround.
// The self-test converts (?P<  to (?<  and (?i) to the `i` flag and runs the JS engine over sample strings.
import fs from "node:fs";

const out = process.argv[2];
if (!out) throw new Error("usage: part-c-gen-unit-patterns.mjs <out.json>");

const CUR = "(?:€|EUR|£|GBP|CHF|\\$|USD|R\\$|BRL|¥|JPY|円|CNY|元|₩|KRW|원|₺|TL|TRY|₽|RUB|руб\\.?|zł|PLN|Kč|CZK|kr\\.?|DKK|NOK|SEK|lei|RON|AED|SAR|ر\\.س|د\\.إ)";
const END = "(?:$|[^\\p{L}\\p{N}])";

// [symbol, dimension, factor] ; factor converts to kg, l, m, m².
const METRIC = [
  ["kg", "mass", 1], ["g", "mass", 0.001], ["mg", "mass", 0.000001],
  ["l", "volume", 1], ["ml", "volume", 0.001], ["cl", "volume", 0.01], ["dl", "volume", 0.1],
  ["m", "length", 1], ["cm", "length", 0.01], ["mm", "length", 0.001],
  ["m²", "area", 1], ["m2", "area", 1], ["cm²", "area", 0.0001], ["cm2", "area", 0.0001],
];
const words = (kg, g, l, ml, m, cm, extra = []) => [
  [kg, "mass", 1], [g, "mass", 0.001], [l, "volume", 1], [ml, "volume", 0.001], [m, "length", 1], [cm, "length", 0.01], ...extra,
];

// dec: decimal separator class; per: words that introduce the per-quantity ("/" is always allowed)
const L = {
  ar: { dec: "[.,٫]", per: ["لكل"], extra: [["كجم", "mass", 1], ["كغ", "mass", 1], ["جم", "mass", 0.001], ["غ", "mass", 0.001], ["لتر", "volume", 1], ["مل", "volume", 0.001], ["متر", "length", 1], ["سم", "length", 0.01]] },
  cs: { dec: ",", per: ["za", "na"], extra: words("kilogram", "gram", "litr", "mililitr", "metr", "centimetr") },
  da: { dec: ",", per: ["pr\\.", "pr", "per"], extra: words("kilogram", "gram", "liter", "milliliter", "meter", "centimeter") },
  de: { dec: ",", per: ["pro", "je"], extra: words("kilogramm", "gramm", "liter", "milliliter", "meter", "zentimeter", [["quadratmeter", "area", 1]]) },
  en: { dec: "\\.", per: ["per"], extra: [...words("kilogram", "gram", "litre", "millilitre", "metre", "centimetre", [["liter", "volume", 1], ["milliliter", "volume", 0.001], ["meter", "length", 1], ["lb", "mass", 0.45359237], ["oz", "mass", 0.028349523125]])] },
  es: { dec: "[.,]", per: ["por", "el", "al"], extra: words("kilogramo", "gramo", "litro", "mililitro", "metro", "centímetro") },
  fi: { dec: ",", per: ["per"], extra: words("kilogramma", "gramma", "litra", "millilitra", "metri", "senttimetri") },
  fr: { dec: ",", per: ["par", "le", "au"], extra: words("kilogramme", "gramme", "litre", "millilitre", "mètre", "centimètre") },
  it: { dec: ",", per: ["al", "per", "ogni"], extra: words("chilogrammo", "grammo", "litro", "millilitro", "metro", "centimetro") },
  ja: { dec: "\\.", per: ["あたり", "当たり"], extra: words("キログラム", "グラム", "リットル", "ミリリットル", "メートル", "センチメートル") },
  ko: { dec: "\\.", per: ["당"], extra: words("킬로그램", "그램", "리터", "밀리리터", "미터", "센티미터") },
  nb: { dec: ",", per: ["per", "pr\\.?"], extra: words("kilogram", "gram", "liter", "milliliter", "meter", "centimeter") },
  nl: { dec: ",", per: ["per", "p\\."], extra: words("kilogram", "gram", "liter", "milliliter", "meter", "centimeter") },
  pl: { dec: ",", per: ["za", "na"], extra: words("kilogram", "gram", "litr", "mililitr", "metr", "centymetr") },
  pt: { dec: "[.,]", per: ["por", "o", "ao"], extra: words("quilograma", "grama", "litro", "mililitro", "metro", "centímetro") },
  ro: { dec: ",", per: ["pe", "la"], extra: words("kilogram", "gram", "litru", "mililitru", "metru", "centimetru") },
  ru: { dec: ",", per: ["за", "на"], extra: [["кг", "mass", 1], ["г", "mass", 0.001], ["л", "volume", 1], ["мл", "volume", 0.001], ["м", "length", 1], ["см", "length", 0.01], ["мм", "length", 0.001], ...words("килограмм", "грамм", "литр", "миллилитр", "метр", "сантиметр")] },
  sv: { dec: ",", per: ["per", "för"], extra: words("kilogram", "gram", "liter", "milliliter", "meter", "centimeter") },
  tr: { dec: ",", per: ["başına"], extra: [["lt", "volume", 1], ...words("kilogram", "gram", "litre", "mililitre", "metre", "santimetre")] },
  zh: { dec: "\\.", per: ["每"], extra: [["公斤", "mass", 1], ["千克", "mass", 1], ["克", "mass", 0.001], ["升", "volume", 1], ["毫升", "volume", 0.001], ["米", "length", 1], ["厘米", "length", 0.01], ["毫米", "length", 0.001]] },
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function build(loc, cfg) {
  const seen = new Map();
  for (const [sym, dim, factor] of [...METRIC, ...cfg.extra]) {
    const key = sym.toLowerCase();
    if (!seen.has(key)) seen.set(key, { symbol: key, dimension: dim, factor });
  }
  const units = [...seen.values()];
  // longest symbol first so "ml" wins over "m" and "cm2" over "cm"
  const alt = units.map((u) => esc(u.symbol)).sort((a, b) => b.length - a.length).join("|");
  const num = `\\d+(?:${cfg.dec}\\d+)?`;
  const quantityRegex = `(?i)(?P<n>${num})\\s*(?P<unit>${alt})${END}`;
  const price = `(?P<price>(?:${CUR}\\s?)?\\d+(?:${cfg.dec}\\d{1,2})?(?:\\s?${CUR})?)`;
  const per = ["/", ...cfg.per].map((p) => (p === "/" ? "/" : p)).join("|");
  const perRegex = `(?i)${price}\\s*(?:${per})\\s*(?:(?P<n>${num})\\s*)?(?P<unit>${alt})${END}`;
  return { units, quantityRegex, perRegex };
}

const result = {};
for (const [loc, cfg] of Object.entries(L)) result[loc] = build(loc, cfg);

// ---- self-test (JS engine) ----
const toJs = (r) => ({ src: r.replace(/^\(\?i\)/, "").replace(/\(\?P</g, "(?<"), flags: "iu" });
const samples = {
  en: [["Olive oil 500 ml", "500", "ml"], ["Rice 1.5 kg", "1.5", "kg"], ["£3.50 per 100 ml", { price: "£3.50", n: "100", unit: "ml" }], ["£7.00/kg", { price: "£7.00", unit: "kg" }]],
  de: [["Olivenöl 0,5 l", "0,5", "l"], ["Kaffee 250 g", "250", "g"], ["9,98 € / 1 l", { price: "9,98 €", n: "1", unit: "l" }], ["12,50 € pro kg", { price: "12,50 €", unit: "kg" }]],
  fr: [["Huile 75 cl", "75", "cl"], ["12,50 € par kilogramme", { price: "12,50 €", unit: "kilogramme" }], ["3,20 €/100 g", { price: "3,20 €", n: "100", unit: "g" }]],
  es: [["Aceite 1 litro", "1", "litro"], ["4,50 € por kg", { price: "4,50 €", unit: "kg" }]],
  it: [["Pasta 500 g", "500", "g"], ["2,10 € al kg", { price: "2,10 €", unit: "kg" }]],
  pt: [["Azeite 0,75 l", "0,75", "l"], ["6,00 € por litro", { price: "6,00 €", unit: "litro" }]],
  nl: [["Melk 1 liter", "1", "liter"], ["1,19 € per liter", { price: "1,19 €", unit: "liter" }]],
  pl: [["Mleko 1 l", "1", "l"], ["5,99 zł za 1 kg", { price: "5,99 zł", n: "1", unit: "kg" }]],
  cs: [["Mléko 1 l", "1", "l"], ["29,90 Kč za kg", { price: "29,90 Kč", unit: "kg" }]],
  da: [["Mælk 1 l", "1", "l"], ["12,95 kr. pr. kg", { price: "12,95 kr.", unit: "kg" }]],
  fi: [["Maito 1 l", "1", "l"], ["2,10 € per litra", { price: "2,10 €", unit: "litra" }]],
  sv: [["Mjölk 1 l", "1", "l"], ["24,90 kr per kg", { price: "24,90 kr", unit: "kg" }]],
  ro: [["Lapte 1 l", "1", "l"], ["9,99 lei pe kg", { price: "9,99 lei", unit: "kg" }]],
  nb: [["Melk 1 l", "1", "l"], ["29,90 kr per kg", { price: "29,90 kr", unit: "kg" }]],
  ar: [["زيت 500 مل", "500", "مل"], ["12.50 AED لكل كجم", { price: "12.50 AED", unit: "كجم" }]],
  ja: [["オリーブオイル 500ml", "500", "ml"], ["250円/100g", { price: "250円", n: "100", unit: "g" }]],
  ko: [["올리브유 500ml", "500", "ml"], ["1200원/100g", { price: "1200원", n: "100", unit: "g" }]],
  ru: [["Молоко 1 л", "1", "л"], ["89,90 ₽ за кг", { price: "89,90 ₽", unit: "кг" }]],
  tr: [["Süt 1 lt", "1", "lt"], ["45,90 TL / kg", { price: "45,90 TL", unit: "kg" }]],
  zh: [["橄榄油 500毫升", "500", "毫升"], ["25元/100克", { price: "25元", n: "100", unit: "克" }]],
};
let bad = 0;
for (const [loc, list] of Object.entries(samples)) {
  const q = toJs(result[loc].quantityRegex);
  const p = toJs(result[loc].perRegex);
  const qr = new RegExp(q.src, q.flags);
  const pr = new RegExp(p.src, p.flags);
  for (const s of list) {
    if (typeof s[1] === "string") {
      const m = qr.exec(s[0]);
      if (!m || m.groups.n !== s[1] || m.groups.unit.toLowerCase() !== s[2]) { bad++; console.error("FAIL quantity", loc, s[0], m && m.groups); }
    } else {
      const m = pr.exec(s[0]);
      const w = s[1];
      if (!m || m.groups.price.trim() !== w.price || (w.n ?? undefined) !== (m.groups.n ?? undefined) || m.groups.unit.toLowerCase() !== w.unit) { bad++; console.error("FAIL per", loc, s[0], m && m.groups); }
    }
  }
}
if (bad) process.exit(1);
const testsOut = process.argv[3];
if (testsOut) {
  const tests = [];
  for (const [loc, list] of Object.entries(samples)) {
    for (const s of list) {
      if (typeof s[1] === "string") tests.push({ regex: result[loc].quantityRegex, text: s[0], match: true, groups: { n: s[1], unit: s[2] }, label: `${loc}/quantity` });
      else tests.push({ regex: result[loc].perRegex, text: s[0], match: true, groups: Object.fromEntries(Object.entries(s[1])), label: `${loc}/per` });
    }
  }
  fs.writeFileSync(testsOut, JSON.stringify(tests, null, 1));
}
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log("ok locales=" + Object.keys(result).length);

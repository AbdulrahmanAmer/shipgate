// WP-104 part d1: build rules/placeholders.json (MET-011; shape: web-delivery.md section 2 "Data file shapes").
// Usage: node build-placeholders.mjs <rulesDir>
// Inputs besides the tables below: data/favicons-frameworks.json and data/favicons-vite.json, the output of
// favicons-discover.mjs (SHA-256 of the framework starters' favicon / touch-icon files, fetched from their repositories).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const rulesDir = process.argv[2];
if (!rulesDir) throw new Error("usage: build-placeholders.mjs <rulesDir>");

// ---- favicons -------------------------------------------------------------------------------------------------
const rows = ["favicons-frameworks.json", "favicons-vite.json"].flatMap((f) => JSON.parse(fs.readFileSync(path.join(here, "data", f), "utf8")));
const EMPTY = crypto.createHash("sha256").update("").digest("hex");
// Not favicons / touch icons: starter logos referenced as page images, the CRA 512px manifest icon, the Docusaurus logo, Laravel (old/empty file).
const skipPath = /(\/next\.svg|\/vercel\.svg|logo512\.png|docusaurus\.png)$/;
const skipRepo = new Set(["laravel/laravel"]);
const favicons = new Map();
for (const r of rows) {
  if (skipRepo.has(r.repo) || skipPath.test(r.path)) continue;
  for (const v of r.versions) {
    if (v.sha256 === EMPTY) continue;
    const e = favicons.get(v.sha256) ?? { repo: r.repo, path: r.path, commit: v.commit };
    favicons.set(v.sha256, e);
  }
}
const faviconSources = [...favicons.values()].map((e) => `https://github.com/${e.repo}/blob/${e.commit}/${e.path}`).sort();
fs.writeFileSync(path.join(here, "data", "favicon-sources.json"), JSON.stringify(faviconSources, null, 1) + "\n");

// ---- fictional phone ranges (E.164) -----------------------------------------------------------------------------
const phoneRanges = [];
const range = (from, to) => phoneRanges.push({ from, to });
// NANP: 555-0100 .. 555-0199 in every area code NXX (N = 2-9; N11 service codes excluded). Source: MET-011 text (spec); NANPA primary page not fetched.
for (let n = 2; n <= 9; n++) {
  for (let xx = 0; xx <= 99; xx++) {
    if (xx === 11) continue;
    const area = `${n}${String(xx).padStart(2, "0")}`;
    range(`+1${area}5550100`, `+1${area}5550199`);
  }
}
// United Kingdom, Ofcom "Telephone numbers for use in TV and radio drama programmes" (1,000 numbers per block).
for (const a of ["113", "114", "115", "116", "117", "118", "121", "131", "141", "151", "161"]) range(`+44${a}4960000`, `+44${a}4960999`);
range("+442079460000", "+442079460999"); // London 020 7946 0000-0999
range("+441914980000", "+441914980999"); // Tyneside/Durham/Sunderland 0191 498 0000-0999
range("+442896496000", "+442896496999"); // Northern Ireland 028 9649 6000-6999
range("+442920180000", "+442920180999"); // Cardiff 029 2018 0000-0999
range("+441632960000", "+441632960999"); // no area 01632 960000-960999
range("+447700900000", "+447700900999"); // mobile 07700 900000-900999
range("+448081570000", "+448081570999"); // freephone 08081 570000-570999
range("+449098790000", "+449098790999"); // premium rate 0909 8790000-8790999
range("+443069990000", "+443069990999"); // UK-wide 03069 990000-990999
// Germany, Bundesnetzagentur "Rufnummern fuer Medienproduktionen (Drama Numbers)".
range("+493023125000", "+493023125999"); // Berlin
range("+496990009000", "+496990009999"); // Frankfurt am Main
range("+494066969000", "+494066969999"); // Hamburg
range("+492214710000", "+492214710999"); // Koeln
range("+498999998000", "+498999998999"); // Muenchen
for (const n of ["+4915228817386", "+4915228895456", "+4915254599371", "+491729925904", "+491729968532", "+491729973185", "+491729973186", "+491729980752", "+491749091317", "+491749464308"]) range(n, n);
range("+491713920000", "+491713920099");
range("+4917604069000", "+4917604069099");
// Australia, ACMA "Phone numbers for use in TV shows, films and creative works".
for (const a of ["2", "3", "7", "8"]) {
  range(`+61${a}55500000`, `+61${a}55509999`);
  range(`+61${a}70100000`, `+61${a}70109999`);
}
for (const m of ["006", "156", "157", "158", "159", "110", "313", "737"]) range(`+61491570${m}`, `+61491570${m}`);
for (const m of ["266", "491", "804"]) range(`+61491571${m}`, `+61491571${m}`);
for (const m of ["549", "665", "983"]) range(`+61491572${m}`, `+61491572${m}`);
for (const m of ["770", "087"]) range(`+61491573${m}`, `+61491573${m}`);
for (const m of ["118", "632"]) range(`+61491574${m}`, `+61491574${m}`);
for (const m of ["254", "789"]) range(`+61491575${m}`, `+61491575${m}`);
for (const m of ["398", "801"]) range(`+61491576${m}`, `+61491576${m}`);
for (const m of ["426", "644"]) range(`+61491577${m}`, `+61491577${m}`);
for (const m of ["957", "148", "888"]) range(`+61491578${m}`, `+61491578${m}`);
for (const m of ["212", "760", "455"]) range(`+61491579${m}`, `+61491579${m}`);
range("+611800160401", "+611800160401");
range("+611800975707", "+611800975711");
range("+611300975707", "+611300975711");
for (const r of phoneRanges) if (!/^\+\d{8,15}$/.test(r.from) || !/^\+\d{8,15}$/.test(r.to) || r.from > r.to) throw new Error(`bad range ${JSON.stringify(r)}`);

// ---- language-neutral entry -------------------------------------------------------------------------------------
const star = {
  lorem: ["lorem ipsum", "dolor sit amet", "consectetur adipiscing", "consectetur adipiscing elit", "sed do eiusmod", "ut labore et dolore magna", "ut enim ad minim veniam", "duis aute irure dolor"],
  // Verified in the fetched starter sources (titles, visible strings); see provenance-d1.json.
  starter: [
    "create next app", "generated by create next app", "to get started, edit the", "get started by editing",
    "vite + react", "vite + react + ts", "vite + vue", "vite + vue + ts", "vite + svelte", "vite + preact", "vite + lit", "vite + solid", "vite + qwik", "vite + js", "vite + ts",
    "edit src/app", "and save to test hmr", "edit src/app.js and save to reload", "learn react", "your questions, answered", "join the vite community",
    "welcome to astro", "to get started, open the", "welcome to nuxt", "welcome to sveltekit", "visit svelte.dev/docs/kit to read the documentation",
    "you did it!", "you’ve successfully created a project with", "you've successfully created a project with",
    "the install worked successfully! congratulations!",
    "welcome to wordpress. this is your first post. edit or delete it, then start writing!",
    "this is an example page. it's different from a blog post because it will stay in one place",
  ],
  faviconSha256: [...favicons.keys()].sort(),
  phoneRanges,
  addresses: ["123 main st", "123 main street", "1234 street name", "123 anywhere st", "123 anywhere street", "123 example street", "123 fake street"],
  domains: ["example.com", "example.org", "example.net", "*.example.com", "*.example.org", "*.example.net", "*.example", "*.test", "*.invalid", "*.localhost", "localhost"],
  names: ["john doe", "jane doe", "acme", "your company", "company name", "your name"], // MET-011 `contact` names them without a language qualifier
  imageHosts: ["placehold.co", "via.placeholder.com", "placeholder.com", "dummyimage.com", "picsum.photos", "source.unsplash.com", "loremflickr.com", "placekitten.com", "placehold.it", "placehold.jp", "placebear.com", "placeholder.pics", "baconmockup.com", "placeholders.dev", "unsplash.it"],
};

// ---- per-language entries ---------------------------------------------------------------------------------------
const L = (lorem, addresses, names) => ({ lorem, starter: [], faviconSha256: [], phoneRanges: [], addresses, domains: [], names, imageHosts: [] });
const perLocale = {
  ar: L(["هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة", "نص تجريبي", "نص عشوائي", "اكتب النص هنا", "هنا يوضع النص"], ["شارع المثال", "عنوان تجريبي"], ["فلان الفلاني", "فلان بن فلان"]),
  cs: L(["ukázkový text", "zde vložte text", "váš text zde", "zde napište text", "text zde"], ["ukázková ulice", "ulice příkladná", "ukázková 123"], ["jan novák", "jan novak"]),
  da: L(["eksempeltekst", "din tekst her", "skriv din tekst her", "tekst her", "indsæt tekst her"], ["eksempelvej", "eksempelgade", "eksempelvej 1"], ["jens jensen"]),
  de: L(["blindtext", "dies ist ein blindtext", "hier steht ihr text", "hier könnte ihr text stehen", "mustertext", "beispieltext", "text hier einfügen", "ihr text hier"], ["musterstraße", "musterstraße 1", "musterstraße 123", "musterstrasse", "musterweg 1", "beispielstraße 1", "musterstadt", "12345 musterstadt"], ["max mustermann", "erika mustermann", "musterfirma", "mustermann gmbh", "muster gmbh"]),
  en: L(["your text here", "enter your text here", "sample text", "placeholder text", "insert text here", "text goes here", "add your text here", "dummy text", "your content here", "this is a placeholder"], [], ["your company name", "your business name", "your company here"]),
  es: L(["texto de ejemplo", "escribe tu texto aquí", "aquí va tu texto", "tu texto aquí", "inserte su texto aquí", "texto de relleno"], ["calle falsa 123", "calle ejemplo 123", "calle ejemplo", "dirección de ejemplo", "tu dirección aquí"], ["juan pérez", "fulano de tal"]),
  fi: L(["esimerkkiteksti", "kirjoita tekstisi tähän", "tekstisi tähän", "lisää tekstisi tähän", "täyteteksti"], ["esimerkkikatu", "esimerkkikatu 1", "esimerkkitie 1"], ["matti meikäläinen", "maija meikäläinen", "teppo testaaja"]),
  fr: L(["votre texte ici", "texte à remplacer", "insérez votre texte ici", "ceci est un texte d'exemple", "texte d'exemple", "texte de remplissage"], ["123 rue exemple", "rue de l'exemple", "123 rue de l'exemple", "votre adresse ici"], ["jean dupont", "jean dupond"]),
  it: L(["testo di esempio", "inserisci qui il tuo testo", "il tuo testo qui", "testo segnaposto", "inserire qui il testo"], ["via esempio", "via degli esempi", "via dei esempi", "via esempio 1"], ["mario rossi"]),
  ja: L(["ここにテキストが入ります", "ここに文章が入ります", "ダミーテキスト", "サンプルテキスト", "テキストが入ります"], ["〇〇県〇〇市", "○○県○○市", "〇〇市〇〇町", "○○市○○町"], ["山田太郎", "山田花子", "山田 太郎", "山田 花子", "テスト太郎", "サンプル株式会社", "株式会社サンプル", "株式会社〇〇", "株式会社○○"]),
  ko: L(["여기에 텍스트를 입력하세요", "텍스트를 입력하세요", "샘플 텍스트", "더미 텍스트", "여기에 내용을 입력하세요"], ["예시로 123", "xx시 xx구"], ["홍길동", "김철수", "홍길순"]),
  nb: L(["eksempeltekst", "din tekst her", "skriv teksten din her", "tekst her", "sett inn tekst her"], ["eksempelveien", "eksempelveien 1", "eksempelgata 1", "eksempelgate 1"], ["ola nordmann", "kari nordmann"]),
  nl: L(["voorbeeldtekst", "hier komt uw tekst", "plaats hier uw tekst", "hier komt je tekst", "tekst hier"], ["voorbeeldstraat", "voorbeeldstraat 1", "voorbeeldstraat 123", "teststraat 1", "straatnaam 1"], ["jan jansen", "jan modaal"]),
  pl: L(["przykładowy tekst", "tutaj wpisz tekst", "twój tekst tutaj", "wstaw tekst tutaj", "tekst zastępczy"], ["ulica przykładowa", "ulica przykładowa 1", "ul. przykładowa", "ul. przykładowa 1"], ["jan kowalski", "anna kowalska", "jan nowak"]),
  pt: L(["texto de exemplo", "digite seu texto aqui", "insira seu texto aqui", "o seu texto aqui", "seu texto aqui", "texto de preenchimento"], ["rua exemplo 123", "rua do exemplo", "rua exemplo, 123", "avenida exemplo"], ["fulano de tal", "joão da silva", "maria da silva"]),
  ro: L(["text exemplu", "introduceți textul aici", "textul tău aici", "scrie textul aici", "text de umplutură", "introduceti textul aici"], ["strada exemplu", "strada exemplului", "strada exemplu 1", "str. exemplu nr. 1"], ["ion popescu", "ion ionescu"]),
  ru: L(["здесь будет ваш текст", "введите текст здесь", "пример текста", "рыба-текст", "рыба текст", "текст-заглушка", "здесь должен быть текст"], ["ул. примерная", "улица примерная", "ул. тестовая", "улица тестовая"], ["иван иванов", "иван петров", "иванов иван иванович", "вася пупкин", "василий пупкин"]),
  sv: L(["exempeltext", "här kommer din text", "skriv din text här", "din text här", "platshållartext"], ["exempelgatan", "exempelgatan 1", "exempelvägen 1"], ["anna andersson"]),
  tr: L(["buraya metninizi yazın", "örnek metin", "metninizi buraya yazın", "buraya yazınız", "doldurma metni"], ["örnek sokak", "örnek mahallesi", "örnek cadde", "örnek sk. no:1"], ["ahmet yılmaz", "ali veli"]),
  zh: L(["这里是文字", "此处输入文字", "请输入文字", "示例文本", "占位文本", "在此输入文字", "這裡輸入文字", "範例文字", "占位文字"], ["某某路1号", "某某省某某市", "某某市某某区", "示例路123号"], ["张三", "李四", "王五", "張三", "某某公司", "某某有限公司", "示例公司"]),
};

const fold = (s) => s.normalize("NFKC").toLowerCase().replaceAll("ß", "ss").replaceAll("ς", "σ").replaceAll("ſ", "s");
const foldAll = (e) => {
  const o = {};
  for (const [k, v] of Object.entries(e)) {
    if (["phoneRanges", "faviconSha256"].includes(k)) o[k] = v;
    else if (k === "domains" || k === "imageHosts") o[k] = [...new Set(v.map((x) => x.toLowerCase()))];
    else {
      const set = new Set();
      for (const x of v) {
        const f = fold(x);
        set.add(f);
        if (f.includes("'")) set.add(f.replaceAll("'", "’"));
      }
      o[k] = [...set];
    }
  }
  return o;
};
const out = { "*": foldAll(star) };
for (const k of Object.keys(perLocale).sort()) out[k] = foldAll(perLocale[k]);
fs.writeFileSync(path.join(rulesDir, "placeholders.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`placeholders.json: ${Object.keys(out).length} keys, ${favicons.size} favicon hashes, ${phoneRanges.length} phone ranges`);

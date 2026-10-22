// WP-104 part d1: independent presence / absence spot-check of rules/verbs.json (written by the part owner, not by the
// authors of the per-language modules). Usage: node verbs-check.mjs <rulesDir>
import fs from "node:fs";
import path from "node:path";

const v = JSON.parse(fs.readFileSync(path.join(process.argv[2], "verbs.json"), "utf8"));
const must = {
  en: "went gone going goes buys bought studies studied stopped running ran written wrote does did done is are was were been have has had can could will would shall should may might must".split(" "),
  de: "gegangen ging geht isst aß gegessen fährt fuhr gebracht brachte bin ist sind war waren gewesen habe hat hatte kann konnte muss musste will wollte soll sollte bestellen bestellt bestelle kaufen gekauft".split(" "),
  fr: "allons irai ferait eût pris prenons vont suis sommes étaient été ai avons avait fait faisons peut pouvons veut voulu achetez achète acheter commandez".split(" "),
  es: "fuiste tuvo pondré dijeron sé hizo hacemos puedo podemos quiere quiso estoy está estaban fue fueron soy compra comprar comprado compramos".split(" "),
  it: "andrò fatto avrebbe vanno dissi sono siamo era stato ho abbiamo può possiamo vuole fanno compra comprare comprato acquistate".split(" "),
  pt: "fui seremos pôs fizeram sou és somos estou está foram tem temos tinha pode podemos quer comprar compra comprado".split(" "),
  ro: "sunt suntem este era fost am avem avea poate putem vrea vrei face fac cumpăr cumperi cumpără cumpărat".split(" "),
  ru: "пошёл иду идёт сказал хочет может пойдём был была были есть купить покупаем купил делает сделал".split(" "),
  pl: "poszedłem idę mam chcę możemy był była jest są kupić kupuję kupił robi zrobił zrobić".split(" "),
  cs: "jdu půjdu chci můžeš byl byla je jsou koupit koupil kupuji dělá udělal udělat".split(" "),
  fi: "menen menin mennyt haluan olen oli ovat tekee teki tehnyt ostaa osti ostan ostamme".split(" "),
  tr: "gidiyorum gideceğim yaptım olacak verdi geldi alıyorum aldı almak yapıyor yapmak gitti".split(" "),
  ar: "ذهب يذهب كتبوا يكتبون اشترى كان يكون قال يقول فتح يفتح".split(" "),
  ja: "行く 行きます 行って 食べた 来ない する した します 買う 買った 買います".split(" "),
  ko: "갑니다 가요 갔어요 먹었습니다 하세요 합니다 했어요 있습니다 없습니다 구매하세요".split(" "),
  zh: "购买 联系 下载 说 看 来 去 買 說".split(" "),
  da: "gik gået går spiser spiste spist køber købte købt er var været har havde kan kunne skal skulle vil ville".split(" "),
  nb: "gikk gått går spiser spiste spist kjøper kjøpte kjøpt er var vært har hadde kan kunne skal skulle vil ville".split(" "),
  nl: "ging gegaan gaat eet at gegeten koopt kocht gekocht is was geweest heeft had kan kon moet moest wil wilde".split(" "),
  sv: "gick gått går äter åt ätit köper köpte köpt är var varit har hade kan kunde ska skulle vill ville".split(" "),
};
const mustNot = {
  en: ["goed", "runned", "stoped", "buyed", "studyed", "writed"],
  de: ["gegehen", "geverwaltet", "gebestellt", "gebracht", "ichging"].filter((x) => x !== "gebracht"),
  fr: ["alles", "prenonsz", "faisez"],
  es: ["hazió", "tení", "ponió", "andó"],
  it: ["vadiamo", "fatto2"],
  pt: ["fazeu", "poderam"],
  nl: ["gegaaan", "opgesturd"],
};
let bad = 0;
for (const [tag, words] of Object.entries(must)) {
  const set = new Set(v[tag]);
  const missing = words.filter((w) => !set.has(w.normalize("NFKC").toLowerCase().replaceAll("ß", "ss")));
  if (missing.length) {
    bad += missing.length;
    console.log(`${tag}: MISSING ${missing.join(" ")}`);
  }
}
for (const [tag, words] of Object.entries(mustNot)) {
  const set = new Set(v[tag]);
  const present = words.filter((w) => set.has(w));
  if (present.length) {
    bad += present.length;
    console.log(`${tag}: WRONG FORM PRESENT ${present.join(" ")}`);
  }
}
console.log(`verbs-check: ${bad} problem(s)`);
process.exit(bad ? 1 : 0);

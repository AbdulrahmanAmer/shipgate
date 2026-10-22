// Czech verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + explicit irregular tables.
const out = new Set();
const add = (arr) => { for (const f of arr) if (f) out.add(f); };
const ADJ = ["ý", "á", "é", "ého", "ou", "ému", "ém", "ým", "í", "ých", "ými"];
const GADJ = ["í", "ího", "ímu", "ím", "ích", "ími"];
const impOf = (x) => (Array.isArray(x) ? x : x ? [x, x + "te", x + "me"] : []);

// CS(inf, pres[], imp, past [m,f,n,pl-anim,pl-inan], pass [short, long] | null, opts)
function CS(inf, pres, imp, past, pass, o = {}) {
  add([inf, ...pres]);
  if (!o.perf) {
    const g = (o.g3 || [pres[pres.length - 1]]).flat();
    for (const x of g) { add([x + "c", x + "ce"]); add(GADJ.map((e) => x + "c" + e)); }
  }
  add(impOf(imp));
  add(past);
  if (pass) {
    const [S, L] = pass;
    add([S, S + "a", S + "o", S + "i", S + "y"]);
    add(ADJ.map((e) => L + e));
  }
}
const pastOf = (inf, long) => {
  let b = inf.slice(0, -1);
  if (!long) b = b.replace(/[áíý]$/, (c) => ({ "á": "a", "í": "i", "ý": "y" })[c]);
  const m = b + "l";
  return [m, m + "a", m + "o", m.slice(0, -1) + "li", m + "y"];
};
// -at: dělat
function A(inf, o = {}) {
  const s = inf.slice(0, -2);
  CS(inf, [s + "ám", s + "áš", s + "á", s + "áme", s + "áte", s + "ají"], [s + "ej", s + "ejte", s + "ejme"], o.past || pastOf(inf), o.pass === undefined ? [s + "án", s + "an"] : o.pass, o);
}
// -it / -et / -ět (class 4): mluvit, vidět, slyšet.  o.eji: 3pl -ějí as well
function I(inf, imp, pass, o = {}) {
  const s = inf.slice(0, -2);
  const pl = [s + "í"];
  if (o.eji) pl.push(s + (o.eji === true ? "ějí" : o.eji));
  CS(inf, [s + "ím", s + "íš", s + "í", s + "íme", s + "íte", ...pl], imp, o.past || pastOf(inf), pass, { g3: [pl[0]], ...o });
}
// -ovat: kupovat
function U(inf, o = {}) {
  const s = inf.slice(0, -4);
  const pl = [s + "ují", s + "ujou"];
  CS(inf, [s + "uji", s + "uju", s + "uješ", s + "uje", s + "ujeme", s + "ujete", ...pl], [s + "uj", s + "ujte", s + "ujme"], pastOf(inf), o.pass === undefined ? [s + "ován", s + "ovan"] : o.pass, { g3: [pl[0]], ...o });
}
// -nout: kliknout
function N(inf, o = {}) {
  const s = inf.slice(0, -3);
  const m = o.past || s + "ul";
  const past = [m, m + "a", m + "o", m.slice(0, -1) + "li", m + "y"];
  CS(inf, [s + "u", s + "eš", s + "e", s + "eme", s + "ete", s + "ou"], o.imp || [s + "i", s + "ěte", s + "ěme"], past, o.pass === undefined ? [s + "ut", s + "ut"] : o.pass, { perf: true, ...o });
}
// generic -e verbs: stem s, alt = also -i / -í endings (psát)
function E(inf, s, imp, pass, o = {}) {
  const pres = [s + "u", s + "eš", s + "e", s + "eme", s + "ete", s + "ou"];
  const g3 = [s + "ou"];
  if (o.alt) g3.length = 0;
  if (o.alt) { pres.push(s + "i", s + "í"); g3.push(s + "í"); }
  CS(inf, pres, imp, o.past || pastOf(inf), pass, { g3, ...o });
}
// -j verbs: žít, použít, hrát  (žiji / žiju / žiješ ...)
function J(inf, sj, pass, o = {}) {
  const pl = [sj + "í", sj + "ou"];
  CS(inf, [sj + "i", sj + "u", sj + "eš", sj + "e", sj + "eme", sj + "ete", ...pl], [sj, sj + "te", sj + "me"], pastOf(inf, o.long), pass, { g3: [pl[0]], ...o });
}
function X(inf, pres, imp, past, pass, o = {}) { CS(inf, pres, imp, past || pastOf(inf), pass, o); }
// jít + prefix
function JIT(pre, o = {}) {
  const pres = [pre + "jdu", pre + "jdeš", pre + "jde", pre + "jdeme", pre + "jdete", pre + "jdou"];
  const m = pre + "šel";
  const imp = o.imp || [pre + "jdi", pre + "jděte", pre + "jděme"];
  CS(pre + "jít", pres, imp, [m, pre + "šla", pre + "šlo", pre + "šli", pre + "šly"], o.pass || null, { perf: !!pre });
  if (o.imp2) add(o.imp2);
}
// future of jít (půjdu ...) is its own stem, not a pre + jdu prefix form
add(["půjdu", "půjdeš", "půjde", "půjdeme", "půjdete", "půjdou"]);
// jet + prefix
function JET(pre) {
  const pres = [pre + "jedu", pre + "jedeš", pre + "jede", pre + "jedeme", pre + "jedete", pre + "jedou"];
  CS(pre + "jet", pres, [pre + "jeď", pre + "jeďte", pre + "jeďme"], [pre + "jel", pre + "jela", pre + "jelo", pre + "jeli", pre + "jely"], null, { perf: !!pre });
}

// ---- be / have / modal
X("být", ["jsem", "jsi", "je", "jsme", "jste", "jsou"], ["buď", "buďte", "buďme"], ["byl", "byla", "bylo", "byli", "byly"], null, { g3: ["jsou"] });
add(["budu", "budeš", "bude", "budeme", "budete", "budou", "jsa", "jsouc", "jsouce", "jsoucí", "bývat", "bývám", "bývá", "bývají", "býval", "bývala", "bývalo", "bývali", "bývaly"]);
X("mít", ["mám", "máš", "má", "máme", "máte", "mají"], ["měj", "mějte", "mějme"], ["měl", "měla", "mělo", "měli", "měly"], null);
X("chtít", ["chci", "chceš", "chce", "chceme", "chcete", "chtějí"], ["chtěj", "chtějte", "chtějme"], ["chtěl", "chtěla", "chtělo", "chtěli", "chtěly"], null);
X("moci", ["mohu", "můžu", "můžeš", "může", "můžeme", "můžete", "mohou", "můžou"], null, ["mohl", "mohla", "mohlo", "mohli", "mohly"], null, { g3: ["mohou"] });
add(["moct", "mož", "moci", "mohoucí", "mohouce", "mohouc"]);
X("pomoci", ["pomohu", "pomůžu", "pomůžeš", "pomůže", "pomůžeme", "pomůžete", "pomohou", "pomůžou"], ["pomoz", "pomozte", "pomozme"], ["pomohl", "pomohla", "pomohlo", "pomohli", "pomohly"], null, { perf: true });
add(["pomoct"]);
I("muset", null, null, { eji: "ejí" });
I("smět", null, null, { eji: true });
I("umět", ["uměj", "umějte", "umějme"], null, { eji: true });
I("rozumět", ["rozuměj", "rozumějte", "rozumějme"], null, { eji: true });
X("vědět", ["vím", "víš", "ví", "víme", "víte", "vědí"], ["věz", "vězte", "vězme"], ["věděl", "věděla", "vědělo", "věděli", "věděly"], null);
X("znát", ["znám", "znáš", "zná", "známe", "znáte", "znají"], ["znej", "znejte", "znejme"], pastOf("znát"), ["znán", "znan"]);
A("poznat", { perf: true });
I("vidět", null, ["viděn", "viděn"]); I("uvidět", null, ["uviděn", "uviděn"], { perf: true });
I("slyšet", null, ["slyšen", "slyšen"]); I("uslyšet", null, ["uslyšen", "uslyšen"], { perf: true });
I("sedět", ["seď", "seďte", "seďme"], null); I("ležet", ["lež", "ležte", "ležme"], null); I("držet", ["drž", "držte", "držme"], ["držen", "držen"]);
I("myslet", ["mysli", "myslete", "mysleme"], ["myšlen", "myšlen"]);
I("mluvit", "mluv", ["mluven", "mluven"]); I("věřit", "věř", null); I("prosit", "pros", ["prošen", "prošen"]); I("bydlet", ["bydli", "bydlete", "bydleme"], null);
X("bát", ["bojím", "bojíš", "bojí", "bojíme", "bojíte", "bojí"], ["boj", "bojte", "bojme"], pastOf("bát", true), null);
X("spát", ["spím", "spíš", "spí", "spíme", "spíte", "spí"], ["spi", "spěte", "spěme"], pastOf("spát"), null);
X("stát", ["stojím", "stojíš", "stojí", "stojíme", "stojíte", "stojí"], ["stůj", "stůjte", "stůjme"], ["stál", "stála", "stálo", "stáli", "stály"], null);
add(["stal", "stala", "stalo", "stali", "staly"]);
E("stát", "stan", ["staň", "staňte", "staňme"], null, { perf: true, past: ["stal", "stala", "stalo", "stali", "staly"] });
// ---- motion
JIT("", { imp: ["jdi", "jděte", "jděme"] });
add(["pojď", "pojďte", "pojďme"]);
for (const p of ["při", "na", "vy", "pro", "za", "pře", "do", "ve", "po", "se", "u", "obe", "pode", "ode"]) JIT(p);
add(["přijď", "přijďte", "přijďme", "najdi", "najděte", "najděme", "nalezen", "nalezena", "nalezeno", "nalezeni", "nalezeny", "nalezený", "nalezená", "nalezené", "nalezeného", "nalezenou", "nalezeným", "nalezených"]);
for (const p of ["", "při", "od", "vy", "po", "za", "pro", "do", "pře"]) JET(p);
X("nést", ["nesu", "neseš", "nese", "neseme", "nesete", "nesou"], ["nes", "neste", "nesme"], ["nesl", "nesla", "neslo", "nesli", "nesly"], ["nesen", "nesen"]);
X("přinést", ["přinesu", "přineseš", "přinese", "přineseme", "přinesete", "přinesou"], ["přines", "přineste", "přinesme"], ["přinesl", "přinesla", "přineslo", "přinesli", "přinesly"], ["přinesen", "přinesen"], { perf: true });
X("vést", ["vedu", "vedeš", "vede", "vedeme", "vedete", "vedou"], ["veď", "veďte", "veďme"], ["vedl", "vedla", "vedlo", "vedli", "vedly"], ["veden", "veden"]);
X("přivést", ["přivedu", "přivedeš", "přivede", "přivedeme", "přivedete", "přivedou"], ["přiveď", "přiveďte", "přiveďme"], ["přivedl", "přivedla", "přivedlo", "přivedli", "přivedly"], ["přiveden", "přiveden"], { perf: true });
// ---- give / take / say
A("dát", { perf: true, pass: ["dán", "dan"] }); A("dávat"); A("prodat", { perf: true }); A("prodávat"); A("dodat", { perf: true }); A("dodávat"); A("přidat", { perf: true }); A("přidávat");
A("podat", { perf: true }); A("vydat", { perf: true }); A("vydávat"); A("předat", { perf: true }); A("předávat"); A("odevzdat", { perf: true });
E("vzít", "vezm", ["vezmi", "vezměte", "vezměme"], ["vzat", "vzat"], { perf: true, past: ["vzal", "vzala", "vzalo", "vzali", "vzaly"] });
E("brát", "ber", ["ber", "berte", "berme"], ["brán", "bran"]);
E("vybrat", "vyber", ["vyber", "vyberte", "vyberme"], ["vybrán", "vybran"], { perf: true });
E("odebrat", "odeber", ["odeber", "odeberte", "odeberme"], ["odebrán", "odebran"], { perf: true });
E("přijmout", "přijm", ["přijmi", "přijměte", "přijměme"], ["přijat", "přijat"], { perf: true, past: ["přijal", "přijala", "přijalo", "přijali", "přijaly"] });
A("přijímat"); A("vybírat"); A("odebírat");
E("říct", "řekn", ["řekni", "řekněte", "řekněme"], ["řečen", "řečen"], { perf: true, past: ["řekl", "řekla", "řeklo", "řekli", "řekly"] });
add(["říci", "řkoucí", "řka", "řkouc"]);
A("říkat"); A("ptát"); A("zeptat", { perf: true });
X("odpovědět", ["odpovím", "odpovíš", "odpoví", "odpovíme", "odpovíte", "odpovědí"], ["odpověz", "odpovězte", "odpovězme"], ["odpověděl", "odpověděla", "odpovědělo", "odpověděli", "odpověděly"], null, { perf: true });
A("odpovídat");
E("začít", "začn", ["začni", "začněte", "začněme"], null, { perf: true, past: ["začal", "začala", "začalo", "začali", "začaly"] });
A("začínat");
E("dostat", "dostan", ["dostaň", "dostaňte", "dostaňme"], null, { perf: true, past: ["dostal", "dostala", "dostalo", "dostali", "dostaly"] });
E("zůstat", "zůstan", ["zůstaň", "zůstaňte", "zůstaňme"], null, { perf: true, past: ["zůstal", "zůstala", "zůstalo", "zůstali", "zůstaly"] });
A("dostávat"); A("zůstávat");
X("číst", ["čtu", "čteš", "čte", "čteme", "čtete", "čtou"], ["čti", "čtěte", "čtěme"], ["četl", "četla", "četlo", "četli", "četly"], ["čten", "čten"]);
X("přečíst", ["přečtu", "přečteš", "přečte", "přečteme", "přečtete", "přečtou"], ["přečti", "přečtěte", "přečtěme"], ["přečetl", "přečetla", "přečetlo", "přečetli", "přečetly"], ["přečten", "přečten"], { perf: true });
E("psát", "píš", ["piš", "pište", "pišme"], ["psán", "psan"], { alt: true });
E("napsat", "napíš", ["napiš", "napište", "napišme"], ["napsán", "napsan"], { alt: true, perf: true });
E("zapsat", "zapíš", ["zapiš", "zapište", "zapišme"], ["zapsán", "zapsan"], { alt: true, perf: true });
E("popsat", "popíš", ["popiš", "popište", "popišme"], ["popsán", "popsan"], { alt: true, perf: true });
E("podepsat", "podepíš", ["podepiš", "podepište", "podepišme"], ["podepsán", "podepsan"], { alt: true, perf: true });
E("ukázat", "ukáž", ["ukaž", "ukažte", "ukažme"], ["ukázán", "ukázan"], { alt: true, perf: true });
E("pozvat", "pozv", ["pozvi", "pozvěte", "pozvěme"], ["pozván", "pozvan"], { perf: true });
E("zvát", "zv", ["zvi", "zvěte", "zvěme"], ["zván", "zvan"]);
E("otevřít", "otevř", ["otevři", "otevřete", "otevřeme"], ["otevřen", "otevřen"], { perf: true, past: ["otevřel", "otevřela", "otevřelo", "otevřeli", "otevřely"] });
E("zavřít", "zavř", ["zavři", "zavřete", "zavřeme"], ["zavřen", "zavřen"], { perf: true, past: ["zavřel", "zavřela", "zavřelo", "zavřeli", "zavřely"] });
A("otevírat"); A("zavírat");
E("poslat", "pošl", ["pošli", "pošlete", "pošleme"], ["poslán", "poslan"], { perf: true });
E("odeslat", "odešl", ["odešli", "odešlete", "odešleme"], ["odeslán", "odeslan"], { perf: true });
A("posílat"); A("odesílat");
X("jíst", ["jím", "jíš", "jí", "jíme", "jíte", "jedí"], ["jez", "jezte", "jezme"], ["jedl", "jedla", "jedlo", "jedli", "jedly"], null);
X("sníst", ["sním", "sníš", "sní", "sníme", "sníte", "snědí"], ["sněz", "snězte", "snězme"], ["snědl", "snědla", "snědlo", "snědli", "snědly"], ["snězen", "snězen"], { perf: true });
J("pít", "pij", ["pit", "pit"]); J("napít", "napij", null, { perf: true });
J("žít", "žij", null); J("použít", "použij", ["použit", "použit"], { perf: true }); J("užít", "užij", ["užit", "užit"], { perf: true }); J("využít", "využij", ["využit", "využit"], { perf: true });
J("hrát", "hraj", ["hrán", "hran"], { long: true }); J("nahrát", "nahraj", ["nahrán", "nahran"], { perf: true, long: true }); J("zahrát", "zahraj", ["zahrán", "zahran"], { perf: true, long: true }); J("vyhrát", "vyhraj", null, { perf: true, long: true });
J("přát", "přej", null, { long: true });
J("smát", "směj", null, { long: true }); J("krýt", "kryj", ["kryt", "kryt"]); J("odkrýt", "odkryj", ["odkryt", "odkryt"], { perf: true }); J("zakrýt", "zakryj", ["zakryt", "zakryt"], { perf: true });
A("používat"); A("využívat"); A("užívat"); A("získat", { perf: true }); A("získávat"); A("nahrávat");
// ---- -at verbs
A("udělat", { perf: true }); A("dělat"); A("čekat", { pass: null }); A("počkat", { perf: true, pass: null }); A("hledat"); A("vyhledat", { perf: true }); A("vyhledávat");
A("volat"); A("zavolat", { perf: true }); A("objednat", { perf: true }); A("objednávat"); A("porovnat", { perf: true }); A("porovnávat"); A("srovnat", { perf: true }); A("srovnávat");
A("vypadat", { pass: null }); A("trvat", { pass: null }); A("zdát", { pass: null }); A("vítat"); A("přivítat", { perf: true }); A("pomáhat", { pass: null }); A("ukládat"); A("vkládat");
A("žádat"); A("požádat", { perf: true }); A("zakládat"); A("přispívat", { pass: null }); A("vzdělávat"); A("zpracovávat"); A("srovnávat"); A("zkoumat");
A("sbírat");
// ---- -it / -et / -ět verbs
I("koupit", ["kup", "kupte", "kupme"], ["koupen", "koupen"], { perf: true });
I("zakoupit", ["zakup", "zakupte", "zakupme"], ["zakoupen", "zakoupen"], { perf: true });
I("navštívit", "navštiv", ["navštíven", "navštíven"], { perf: true });
I("platit", "plať", ["placen", "placen"]); I("zaplatit", "zaplať", ["zaplacen", "zaplacen"], { perf: true });
I("ušetřit", ["ušetři", "ušetřete", "ušetřeme"], ["ušetřen", "ušetřen"], { perf: true }); I("šetřit", ["šetři", "šetřete", "šetřeme"], null);
I("objevit", "objev", ["objeven", "objeven"], { perf: true });
I("chránit", "chraň", ["chráněn", "chráněn"]); I("ochránit", "ochraň", ["ochráněn", "ochráněn"], { perf: true });
I("opravit", "oprav", ["opraven", "opraven"], { perf: true });
I("čistit", ["čisti", "čistěte", "čistěme"], ["čištěn", "čištěn"]); I("vyčistit", ["vyčisti", "vyčistěte", "vyčistěme"], ["vyčištěn", "vyčištěn"], { perf: true });
I("doručit", "doruč", ["doručen", "doručen"], { perf: true });
I("vytvořit", "vytvoř", ["vytvořen", "vytvořen"], { perf: true }); I("vytvářet", ["vytvářej", "vytvářejte", "vytvářejme"], ["vytvářen", "vytvářen"]);
I("vyrobit", "vyrob", ["vyroben", "vyroben"], { perf: true }); I("vyrábět", ["vyráběj", "vyrábějte", "vyrábějme"], ["vyráběn", "vyráběn"]);
I("postavit", "postav", ["postaven", "postaven"], { perf: true }); I("stavět", ["stavěj", "stavějte", "stavějme"], ["stavěn", "stavěn"]);
I("zlepšit", ["zlepši", "zlepšete", "zlepšeme"], ["zlepšen", "zlepšen"], { perf: true }); I("zvýšit", "zvyš", ["zvýšen", "zvýšen"], { perf: true }); I("snížit", "sniž", ["snížen", "snížen"], { perf: true });
I("zajistit", ["zajisti", "zajistěte", "zajistěme"], ["zajištěn", "zajištěn"], { perf: true }); I("splnit", "splň", ["splněn", "splněn"], { perf: true });
I("vrátit", "vrať", ["vrácen", "vrácen"], { perf: true }); I("vracet", ["vracej", "vracejte", "vracejme"], null);
I("odstranit", "odstraň", ["odstraněn", "odstraněn"], { perf: true }); I("změnit", "změň", ["změněn", "změněn"], { perf: true }); I("měnit", "měň", ["měněn", "měněn"]);
I("potvrdit", "potvrď", ["potvrzen", "potvrzen"], { perf: true }); I("zrušit", "zruš", ["zrušen", "zrušen"], { perf: true }); I("rušit", "ruš", ["rušen", "rušen"]);
I("vyplnit", "vyplň", ["vyplněn", "vyplněn"], { perf: true }); I("doplnit", "doplň", ["doplněn", "doplněn"], { perf: true }); I("uložit", "ulož", ["uložen", "uložen"], { perf: true });
I("nabízet", ["nabízej", "nabízejte", "nabízejme"], ["nabízen", "nabízen"]);
I("sdílet", ["sdílej", "sdílejte", "sdílejme"], ["sdílen", "sdílen"]); I("zobrazit", "zobraz", ["zobrazen", "zobrazen"], { perf: true });
I("vysvětlit", ["vysvětli", "vysvětlete", "vysvětleme"], ["vysvětlen", "vysvětlen"], { perf: true }); I("patřit", "patř", null); I("záviset", null, null);
I("přihlásit", "přihlas", ["přihlášen", "přihlášen"], { perf: true }); I("odhlásit", "odhlas", ["odhlášen", "odhlášen"], { perf: true });
I("nastavit", "nastav", ["nastaven", "nastaven"], { perf: true }); I("spustit", "spusť", ["spuštěn", "spuštěn"], { perf: true });
I("zvolit", "zvol", ["zvolen", "zvolen"], { perf: true }); I("volit", "vol", ["volen", "volen"]);
I("vyřešit", "vyřeš", ["vyřešen", "vyřešen"], { perf: true }); I("řešit", "řeš", ["řešen", "řešen"]); I("přemýšlet", ["přemýšlej", "přemýšlejte", "přemýšlejme"], null);
I("doporučit", "doporuč", ["doporučen", "doporučen"], { perf: true }); I("radit", "rad", null); I("podpořit", "podpoř", ["podpořen", "podpořen"], { perf: true });
I("představit", "představ", ["představen", "představen"], { perf: true }); I("řídit", ["řiď", "řiďte", "řiďme"], ["řízen", "řízen"]);
I("učit", "uč", ["učen", "učen"]); I("naučit", "nauč", ["naučen", "naučen"], { perf: true }); I("líbit", null, null); I("těšit", "těš", null);
I("končit", null, null); I("skončit", ["skonči", "skončete", "skončeme"], ["skončen", "skončen"], { perf: true }); I("stačit", null, null);
I("zjistit", ["zjisti", "zjistěte", "zjistěme"], ["zjištěn", "zjištěn"], { perf: true }); I("sdělit", ["sděl", "sdělte", "sdělme"], ["sdělen", "sdělen"], { perf: true });
I("oznámit", "oznam", ["oznámen", "oznámen"], { perf: true }); I("upozornit", ["upozorni", "upozorněte", "upozorněme"], ["upozorněn", "upozorněn"], { perf: true });
I("připravit", "připrav", ["připraven", "připraven"], { perf: true }); I("vložit", "vlož", ["vložen", "vložen"], { perf: true });
I("připojit", "připoj", ["připojen", "připojen"], { perf: true }); I("spojit", "spoj", ["spojen", "spojen"], { perf: true }); I("odpojit", "odpoj", ["odpojen", "odpojen"], { perf: true });
I("zkoušet", ["zkoušej", "zkoušejte", "zkoušejme"], ["zkoušen", "zkoušen"]); I("zkusit", ["zkus", "zkuste", "zkusme"], null, { perf: true }); I("vyzkoušet", ["vyzkoušej", "vyzkoušejte", "vyzkoušejme"], ["vyzkoušen", "vyzkoušen"], { perf: true });
I("ověřit", ["ověř", "ověřte", "ověřme"], ["ověřen", "ověřen"], { perf: true }); I("hodnotit", "hodnoť", ["hodnocen", "hodnocen"]); I("ohodnotit", "ohodnoť", ["ohodnocen", "ohodnocen"], { perf: true });
I("pořídit", "pořiď", ["pořízen", "pořízen"], { perf: true }); I("vařit", "vař", ["vařen", "vařen"]); I("vybavit", "vybav", ["vybaven", "vybaven"], { perf: true });
I("překvapit", "překvap", ["překvapen", "překvapen"], { perf: true }); I("ukončit", ["ukonči", "ukončete", "ukončeme"], ["ukončen", "ukončen"], { perf: true });
// ---- -ovat verbs
for (const v of ["registrovat", "rezervovat", "kontaktovat", "poskytovat", "doručovat", "objevovat", "opravovat", "navrhovat", "zlepšovat", "zvyšovat", "snižovat", "zajišťovat", "splňovat", "odstraňovat", "potvrzovat", "vyplňovat", "zobrazovat", "ukazovat", "vysvětlovat", "přihlašovat", "odhlašovat", "nastavovat", "rozhodovat", "doporučovat", "konzultovat", "podporovat", "představovat", "navštěvovat", "stahovat", "produkovat", "prezentovat", "vyžadovat", "sledovat", "vybavovat", "kontrolovat", "ověřovat", "zjišťovat", "informovat", "upozorňovat", "připravovat", "nakupovat", "kupovat", "obsahovat", "zahrnovat", "studovat", "testovat", "instalovat", "aktualizovat", "aktivovat", "plánovat", "organizovat", "analyzovat", "importovat", "exportovat", "kopírovat", "generovat", "dokumentovat", "montovat", "fotografovat", "filmovat", "malovat", "potřebovat", "věnovat"]) U(v);
for (const v of ["pracovat", "cestovat", "pokračovat", "děkovat", "pamatovat", "fungovat", "existovat"]) U(v, { pass: null });
for (const v of ["zaregistrovat", "zarezervovat", "nainstalovat", "naplánovat", "zorganizovat", "zkontrolovat", "poinformovat", "vyfotografovat", "zdokumentovat", "vygenerovat", "zkopírovat", "otestovat", "zpracovat", "zaktualizovat"]) U(v, { perf: true });
U("poděkovat", { perf: true, pass: null });
// ---- -nout verbs
N("kliknout"); N("vypnout"); N("zapnout"); N("minout", { imp: ["miň", "miňte", "miňme"] }); N("dotknout"); N("sednout", { past: "sedl", pass: null }); N("odpočinout", { imp: ["odpočiň", "odpočiňte", "odpočiňme"], pass: null }); N("vyvinout", { imp: ["vyviň", "vyviňte", "vyviňme"] }); N("zahrnout", { imp: ["zahrň", "zahrňte", "zahrňme"] });
N("nabídnout", { past: "nabídl" }); N("poskytnout", { past: "poskytl" }); N("rozhodnout", { past: "rozhodl" }); N("vyzvednout", { past: "vyzvedl" }); N("dosáhnout", { past: "dosáhl" });
N("navrhnout", { past: "navrhl", pass: ["navržen", "navržen"] }); N("stáhnout", { past: "stáhl", imp: ["stáhni", "stáhněte", "stáhněme"], pass: ["stažen", "stažen"] });
N("zapomenout", { past: "zapomněl", imp: ["zapomeň", "zapomeňte", "zapomeňme"] });
//__MORE5__
export default function forms() {
  return [...out];
}

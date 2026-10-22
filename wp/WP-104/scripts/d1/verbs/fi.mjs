// Finnish verb forms (SE-121). Authored from linguistic knowledge; paradigm generators for verb types 1-6
// (with explicit consonant-gradation stems) plus explicit irregulars (olla).
const out = new Set();
const add = (...a) => { for (const x of a.flat()) if (x) out.add(x); };
const front = (w) => /[äöy]/.test(w);


// Build everything from a spec.
function emit(c) {
  const { inf, A } = c;
  const U = A === "ä" ? "y" : "u";
  add(inf, c.pres, c.conn, c.past, c.cond);
  // imperative
  add(c.imp2sg || c.conn, c.imp2pl, c.imp3sg, c.imp3pl);
  // passive finite
  if (c.passPres) {
    add(c.passPres, c.passConn, c.passPast, c.passCond, c.passImp);
  }
  // present active participle -va
  const R = c.vaStem + "v";
  add([R + A, R + A + "t", R + A + "n", R + A + A, R + "i" + A, R + "ien"]);
  // past active participle -nut
  const nr = c.nutNom.slice(0, -2);
  add([nr + U + "t", nr + "eet", nr + "een", nr + U + "tt" + A, nr + "eit" + A, nr + "eiden"]);
  // passive past participle
  if (c.tuStrong) {
    const s = c.tuStrong; // e.g. "oste" + "tt"
    add([s + U, s + U + A, s + U + "j" + A, s + U + "jen"]);
  }
  if (c.tuWeak) add([c.tuWeak + U + "t", c.tuWeak + U + "n"]);
  if (c.ttava) add([c.ttava + "v" + A, c.ttava + "v" + A + "t", c.ttava + "v" + A + "n", c.ttava + "v" + A + A, c.ttava + "vi" + A, c.ttava + "vien"]);
  // 3rd infinitive
  const M = c.maStem + "m" + A;
  add([M + A + "n", M + "ss" + A, M + "ll" + A, M + "st" + A, M + "tt" + A, M + "n", M + "t" + (A === "ä" ? "ö" : "o") + "n", M]);
  // 2nd infinitive + long 1st infinitive
  add([c.inf2 + "ess" + A, c.inf2 + "en"]);
  if (c.passInf2) add(c.passInf2);
  add([inf + "kseni", inf + "ksesi", inf + "kseen", inf + "ksemme", inf + "ksenne"]);
  if (c.extra) add(c.extra);
}

const impStem = (st, ao) => {
  const l = st.slice(-1);
  if (l === "a" || l === "ä") return st.slice(0, -1) + (ao ? "o" : "") + "i";
  if (l === "e") return st.slice(0, -1) + "i";
  if (l === "i") return st;
  return st + "i";
};
const condStem = (st) => {
  const l = st.slice(-1);
  if (l === "e" || l === "i") return st.slice(0, -1);
  return st;
};
const CONDEND = ["isin", "isit", "isi", "isimme", "isitte", "isivat"];
const sixOf = (st, A) => [st + "n", st + "t", st, st + "mme", st + "tte", st + "v" + A + "t"];

// ---- type 1 (-a/-ä/-ia/-ua ...): S strong stem, W weak stem
function T1(inf, W, S, o = {}) {
  S = S || inf.slice(0, -1);
  W = W || S;
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const v = S.slice(-1);
  const iW = o.i ? o.i[0] : impStem(W, o.ao);
  const iS = o.i ? o.i[1] : impStem(S, o.ao);
  const P = /[aä]$/.test(W) ? W.slice(0, -1) + "e" : W;
  const pres = [W + "n", W + "t", S + v, W + "mme", W + "tte", S + "v" + A + "t"];
  const past = [iW + "n", iW + "t", iS, iW + "mme", iW + "tte", iS + "v" + A + "t"];
  const cond = CONDEND.map((e) => condStem(S) + e);
  const K = A === "ä" ? "kää" : "kaa";
  const c = {
    inf, A, pres, conn: W, past, cond,
    imp2pl: S + K, imp3sg: S + (A === "ä" ? "köön" : "koon"), imp3pl: "",
    vaStem: S,
    nutNom: o.nutNom || S + "n" + U + "t",
    maStem: S,
    inf2: (S.endsWith("e") ? S.slice(0, -1) + "i" : S),
  };
  c.imp3pl = S + (A === "ä" ? "kööt" : "koot");
  if (!o.nopas) {
    Object.assign(c, {
      passPres: P + "t" + A + A + "n", passConn: P + "t" + A, passPast: P + "ttiin", passCond: P + "tt" + A + "isiin", passImp: P + "tt" + A + (A === "ä" ? "köön" : "koon"),
      tuStrong: P + "tt", tuWeak: P + "t", ttava: P + "tt" + A,
      passInf2: [P + "tt" + A + "ess" + A],
    });
  }
  emit(c);
}
// ---- type 2 (-da/-dä): V = inf minus da/dä; I2 = imperfect 3sg
function T2(inf, I2) {
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const V = inf.slice(0, -2);
  const K = A === "ä" ? "kää" : "kaa";
  const O = A === "ä" ? "ö" : "o";
  const c = {
    inf, A, pres: sixOf(V, A), conn: V, past: sixOf(I2, A), cond: CONDEND.map((e) => I2.slice(0, -1) + e),
    imp2pl: V + K, imp3sg: V + (A === "ä" ? "köön" : "koon"), imp3pl: V + (A === "ä" ? "kööt" : "koot"),
    passPres: inf + A + "n", passConn: inf, passPast: V + "tiin", passCond: V + "t" + A + "isiin", passImp: V + "t" + A + (A === "ä" ? "köön" : "koon"),
    vaStem: V, nutNom: V + "n" + U + "t", maStem: V,
    tuStrong: V + "t", tuWeak: V + "d", ttava: V + "t" + A, inf2: inf.slice(0, -1),
    passInf2: [V + "t" + A + "ess" + A],
  };
  emit(c);
}
// ---- type 3 (-la/-na/-ra/-sta): F finite consonant stem, T consonant stem of inf
function T3(inf, o = {}) {
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const T = o.T || inf.slice(0, -2);
  const F = o.F || T;
  const s1 = o.s1 || F + "e";
  const K = A === "ä" ? "kää" : "kaa";
  const O = A === "ä" ? "ö" : "o";
  const iW = o.iW || F + "i";
  const iS = o.iS || F + "i";
  const last = T.slice(-1);
  const nut = o.nutNom || (/[lnrs]/.test(last) ? T + last + U + "t" : T + "n" + U + "t");
  const c = {
    inf, A, pres: [s1 + "n", s1 + "t", F + "ee", s1 + "mme", s1 + "tte", F + "ev" + A + "t"], conn: s1,
    past: [iW + "n", iW + "t", iS, iW + "mme", iW + "tte", iS + "v" + A + "t"],
    cond: CONDEND.map((e) => F + e),
    imp2pl: T + K, imp3sg: T + (A === "ä" ? "köön" : "koon"), imp3pl: T + (A === "ä" ? "kööt" : "koot"),
    passPres: inf + A + "n", passConn: inf, passPast: T + "tiin", passCond: T + "t" + A + "isiin", passImp: T + "t" + A + (A === "ä" ? "köön" : "koon"),
    vaStem: F + "e", nutNom: nut, maStem: F + "e", ttava: T + "t" + A,
    tuStrong: T + "t", inf2: inf.slice(0, -1),
    passInf2: [T + "t" + A + "ess" + A],
  };
  emit(c);
}
// ---- type 4 (-ta/-tä after vowel): PS present stem (long vowel), T4s strong stem for imperfect
function T4(inf, o = {}) {
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const K = A === "ä" ? "kää" : "kaa";
  const O = A === "ä" ? "ö" : "o";
  const T4 = inf.slice(0, -2);
  const T4s = o.T4s || T4;
  const longStem = o.PS || (/[aä]$/.test(T4) ? T4 + A : null);
  const PS = longStem || T4 + A;
  const p3 = longStem ? PS : PS + A;
  const I = T4s + "si";
  const stem = inf.slice(0, -1);
  const c = {
    inf, A, pres: [PS + "n", PS + "t", p3, PS + "mme", PS + "tte", PS + "v" + A + "t"], conn: T4s + A, past: sixOf(I, A), cond: CONDEND.map((e) => (longStem ? PS.slice(0, -1) : PS) + e),
    imp2pl: stem + K, imp3sg: stem + (A === "ä" ? "köön" : "koon"), imp3pl: stem + (A === "ä" ? "kööt" : "koot"),
    passPres: inf + A + "n", passConn: inf, passPast: T4 + "ttiin", passCond: T4 + "tt" + A + "isiin", passImp: T4 + "tt" + A + (A === "ä" ? "köön" : "koon"),
    vaStem: PS, nutNom: T4 + "nn" + U + "t", maStem: PS, ttava: T4 + "tt" + A,
    tuStrong: T4 + "tt", tuWeak: T4 + "t", inf2: stem, passInf2: [T4 + "tt" + A + "ess" + A],
  };
  emit(c);
}
// ---- type 5 (-ita/-itä): valita -> valitsen
function T5(inf, o = {}) {
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const K = A === "ä" ? "kää" : "kaa";
  const O = A === "ä" ? "ö" : "o";
  const stem = inf.slice(0, -1);
  const PS = stem + "se";
  const I = stem + "si";
  const c = {
    inf, A, pres: [PS + "n", PS + "t", PS + "e", PS + "mme", PS + "tte", PS + "v" + A + "t"], conn: PS, past: sixOf(I, A), cond: CONDEND.map((e) => stem + "s" + e),
    imp2pl: stem + K, imp3sg: stem + (A === "ä" ? "köön" : "koon"), imp3pl: stem + (A === "ä" ? "kööt" : "koot"),
    passPres: inf + A + "n", passConn: inf, passPast: stem + "tiin", passCond: stem + "t" + A + "isiin", passImp: stem + "t" + A + (A === "ä" ? "köön" : "koon"),
    vaStem: PS, nutNom: inf.slice(0, -2) + "nn" + U + "t", maStem: PS, ttava: stem + "t" + A,
    tuStrong: stem + "t", tuWeak: stem, inf2: stem, passInf2: [stem + "t" + A + "ess" + A],
  };
  emit(c);
}
// ---- type 6 (-eta/-etä): vanheta -> vanhenen
function T6(inf) {
  const A = front(inf) ? "ä" : "a";
  const U = A === "ä" ? "y" : "u";
  const K = A === "ä" ? "kää" : "kaa";
  const O = A === "ä" ? "ö" : "o";
  const T6s = inf.slice(0, -2);
  const PS = T6s + "ne";
  const stem = inf.slice(0, -1);
  const c = {
    inf, A, pres: [PS + "n", PS + "t", PS + "e", PS + "mme", PS + "tte", PS + "v" + A + "t"], conn: PS, past: sixOf(T6s + "ni", A), cond: CONDEND.map((e) => T6s + "n" + e),
    imp2pl: stem + K, imp3sg: stem + (A === "ä" ? "köön" : "koon"), imp3pl: stem + (A === "ä" ? "kööt" : "koot"),
    passPres: inf + A + "n", passConn: inf, passPast: T6s + "ttiin", passCond: T6s + "tt" + A + "isiin", passImp: T6s + "tt" + A + (A === "ä" ? "köön" : "koon"),
    vaStem: PS, nutNom: T6s + "nn" + U + "t", maStem: PS, ttava: T6s + "tt" + A, tuStrong: T6s + "tt", tuWeak: T6s + "t", inf2: stem,
    passInf2: [T6s + "tt" + A + "ess" + A],
  };
  emit(c);
}

// ---- negation verb, imperative helpers
add("en", "et", "ei", "emme", "ette", "eivät", "älä", "älkää", "älköön", "älkööt", "älkäämme");
// ---- olla
add("olla", "olen", "olet", "on", "olemme", "olette", "ovat", "ole", "olkaa", "olkoon", "olkoot", "olin", "olit", "oli", "olimme", "olitte", "olivat",
  "olisin", "olisit", "olisi", "olisimme", "olisitte", "olisivat", "ollut", "olleet", "ollut", "olleen", "oleva", "olevat", "olevan", "olevaa", "olevia", "olevien",
  "ollaan", "oltiin", "oltaisiin", "oltu", "ollessa", "ollen", "olemaan", "olemassa", "olemasta", "olemalla", "olematta", "oleman", "ollakseen", "ollakseni", "ollaksesi", "ollaksemme", "ollaksenne",
  "ollutta", "olleita", "olleiden", "ollakseen", "olevana");
// ---- type 1, no gradation
for (const v of ["puhua", "sanoa", "ostaa", "katsoa", "toivoa", "uskoa", "kysyä", "kutsua", "kuulua", "tuntua", "toimia", "tutkia", "etsiä", "asua", "istua", "tutustua", "muistaa", "valmistaa", "yhdistää", "vahvistaa", "poistaa", "käynnistää", "järjestää", "säästää", "puhdistaa", "matkustaa", "kiinnostaa", "innostaa", "täytyä", "hyväksyä", "mainostaa", "suosia", "perustaa", "ihastua", "tarkistaa", "vastustaa"]) T1(v);
// ---- type 1 with consonant gradation: T1(inf, weak stem, strong stem, opts)
T1("lukea", "lue", "luke"); T1("hakea", "hae", "hake"); T1("tukea", "tue", "tuke"); T1("kokea", "koe", "koke"); T1("sulkea", "sulje", "sulke");
T1("nukkua", "nuku", "nukku"); T1("hankkia", "hanki", "hankki"); T1("oppia", "opi", "oppi"); T1("vaatia", "vaadi", "vaati"); T1("nauttia", "nauti", "nautti");
T1("pyrkiä", "pyri", "pyrki"); T1("liittyä", "liity", "liitty"); T1("esiintyä", "esiinny", "esiinty"); T1("kehittyä", "kehity", "kehitty");
T1("ilmoittautua", "ilmoittaudu", "ilmoittautu"); T1("kirjautua", "kirjaudu", "kirjautu"); T1("rekisteröityä", "rekisteröidy", "rekisteröity");
T1("jatkaa", "jatka", "jatka", { ao: true }); T1("maksaa", "maksa", "maksa", { ao: true }); T1("kasvaa", "kasva", "kasva", { ao: true });
T1("palaa", "pala", "pala", { ao: true }); T1("laulaa", "laula", "laula", { ao: true }); T1("ajaa", "aja", "aja", { ao: true }); T1("jaksaa", "jaksa", "jaksa", { ao: true });
T1("jakaa", "jaa", "jaka", { ao: true }); T1("antaa", "anna", "anta", { ao: true }); T1("auttaa", "auta", "autta", { ao: true });
T1("laittaa", "laita", "laitta", { ao: true }); T1("vaihtaa", "vaihda", "vaihta", { ao: true }); T1("kantaa", "kanna", "kanta", { ao: true });
T1("ottaa", "ota", "otta"); T1("kiittää", "kiitä", "kiittä"); T1("käyttää", "käytä", "käyttä"); T1("pitää", "pidä", "pitä");
T1("tietää", "tiedä", "tietä", { nutNom: "tiennyt", i: ["tiesi", "tiesi"] }); T1("löytää", "löydä", "löytä", { i: ["löysi", "löysi"] }); T1("pyytää", "pyydä", "pyytä", { i: ["pyysi", "pyysi"] });
T1("huutaa", "huuda", "huuta", { i: ["huusi", "huusi"] });
T1("rakentaa", "rakenna", "rakenta", { i: ["rakensi", "rakensi"] }); T1("vähentää", "vähennä", "vähentä", { i: ["vähensi", "vähensi"] });
T1("parantaa", "paranna", "paranta", { i: ["paransi", "paransi"] }); T1("tallentaa", "tallenna", "tallenta", { i: ["tallensi", "tallensi"] });
T1("kääntää", "käännä", "kääntä", { i: ["käänsi", "käänsi"] }); T1("hyödyntää", "hyödynnä", "hyödyntä", { i: ["hyödynsi", "hyödynsi"] });
T1("ymmärtää", "ymmärrä", "ymmärtä", { i: ["ymmärsi", "ymmärsi"] }); T1("uskaltaa", "uskalla", "uskalta", { i: ["uskalsi", "uskalsi"] });
T1("sisältää", "sisällä", "sisältä", { i: ["sisälsi", "sisälsi"], nopas: true }); T1("lentää", "lennä", "lentä", { i: ["lensi", "lensi"] });
T1("lähettää", "lähetä", "lähettä"); T1("säilyttää", "säilytä", "säilyttä"); T1("päivittää", "päivitä", "päivittä"); T1("muuttaa", "muuta", "muutta");
T1("soittaa", "soita", "soitta"); T1("tarkoittaa", "tarkoita", "tarkoitta"); T1("toimittaa", "toimita", "toimitta"); T1("ilmoittaa", "ilmoita", "ilmoitta");
T1("kirjoittaa", "kirjoita", "kirjoitta"); T1("palauttaa", "palauta", "palautta"); T1("kehittää", "kehitä", "kehittä"); T1("kannattaa", "kannata", "kannatta");
T1("riittää", "riitä", "riittä"); T1("näyttää", "näytä", "näyttä"); T1("vaikuttaa", "vaikuta", "vaikutta"); T1("luottaa", "luota", "luotta");
T1("heittää", "heitä", "heittä"); T1("jättää", "jätä", "jättä"); T1("päättää", "päätä", "päättä"); T1("aloittaa", "aloita", "aloitta");
T1("lopettaa", "lopeta", "lopetta"); T1("yrittää", "yritä", "yrittä"); T1("liittää", "liitä", "liittä"); T1("esittää", "esitä", "esittä");
T1("toteuttaa", "toteuta", "toteutta"); T1("tuottaa", "tuota", "tuotta"); T1("suorittaa", "suorita", "suoritta"); T1("selittää", "selitä", "selittä");
T1("lähteä", "lähde", "lähte"); T1("tuntea", "tunne", "tunte", { i: ["tunsi", "tunsi"] });
// ---- type 2
T2("syödä", "söi"); T2("juoda", "joi"); T2("saada", "sai"); T2("viedä", "vei"); T2("tuoda", "toi"); T2("myydä", "myi"); T2("käydä", "kävi");
T2("luoda", "loi"); T2("voida", "voi"); T2("jäädä", "jäi"); T2("lyödä", "löi");
// ---- type 3
T3("tulla"); T3("mennä"); T3("kuulla"); T3("purra"); T3("juosta", { F: "juoks" }); T3("nousta"); T3("pestä"); T3("päästä"); T3("kävellä");
T3("kokeilla"); T3("palvella"); T3("keskustella"); T3("vertailla"); T3("vierailla"); T3("opiskella"); T3("valmistella"); T3("arvostella");
T3("suunnitella", { F: "suunnittel" }); T3("ihmetellä", { F: "ihmettel" }); T3("kuunnella", { F: "kuuntel" }); T3("esitellä", { F: "esittel" });
T3("ajatella", { F: "ajattel" }); T3("työskennellä", { F: "työskentel" });
T3("tehdä", { s1: "tee", F: "tek", T: "teh", iW: "tei", iS: "teki", nutNom: "tehnyt" });
T3("nähdä", { s1: "näe", F: "näk", T: "näh", iW: "näi", iS: "näki", nutNom: "nähnyt" });
// ---- type 4
for (const v of ["haluta", "vastata", "pelata", "tilata", "osata", "avata", "lisätä", "kerätä", "tarjota", "varata", "kuvata", "suojata", "korjata", "siivota", "seurata"]) T4(v);
T4("tavata", { PS: "tapaa", T4s: "tapa" }); T4("ladata", { PS: "lataa", T4s: "lata" }); T4("muokata", { PS: "muokkaa", T4s: "muokka" }); T4("pakata", { PS: "pakkaa", T4s: "pakka" });
// ---- type 5 and 6
T5("valita"); T5("tarvita"); T5("mainita"); T5("häiritä"); T5("merkitä");
T6("vanheta"); T6("lämmetä"); T6("kylmetä");
//__MORE4__
export default function forms() {
  return [...out];
}

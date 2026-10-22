// WP-104 d1: French verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + irregular tables.
// Every simple (one-word) form of the tenses/moods used in running text: present, imparfait, passé simple, futur,
// conditionnel, subjonctif présent + imparfait, impératif, infinitif, participe passé (4 forms), participe présent.
export default function forms() {
  const out = new Set();
  const add = (arr) => { for (const x of arr) if (x) out.add(x); };

  // 3sg passé simple -> 3sg subjonctif imparfait (circumflex)
  const circ = (s) => {
    const t = /t$/.test(s) ? s : s + "t";
    return t.replace(/([aiu])(n?t)$/, (m, v, r) => ({ a: "â", i: "î", u: "û" })[v] + r);
  };
  const ppf = (ms) => (/[sx]$/.test(ms) ? [ms, ms + "e", ms, ms + "es"] : [ms, ms + "e", ms + "s", ms + "es"]);
  const PS = {
    a: ["ai", "as", "a", "âmes", "âtes", "èrent"],
    i: ["is", "is", "it", "îmes", "îtes", "irent"],
    u: ["us", "us", "ut", "ûmes", "ûtes", "urent"],
    in: ["ins", "ins", "int", "înmes", "întes", "inrent"],
  };
  const PSX = { a: "as", i: "is", u: "us", in: "ins" };
  const IMP = ["ais", "ais", "ait", "ions", "iez", "aient"];
  const FUT = ["ai", "as", "a", "ons", "ez", "ont"];

  // Generic builder. o: inf, pres[6], imp (imparfait stem), ps [stem,type] | null, fut (stem), pp (masc sg) or ppForms,
  // subj[6] (optional), imper[3] (optional), ger (optional). Returns the forms.
  function fr(o) {
    const r = [o.inf, ...o.pres];
    r.push(...IMP.map((e) => o.imp + e));
    if (o.ps) {
      const [st, ty] = o.ps;
      const ps = PS[ty].map((e) => st + e);
      r.push(...ps);
      const x = st + PSX[ty];
      r.push(x + "se", x + "ses", circ(ps[2]), x + "sions", x + "siez", x + "sent");
    }
    r.push(...FUT.map((e) => o.fut + e));
    r.push(...IMP.map((e) => o.fut + e));
    const ils = o.pres[5].replace(/ent$/, "");
    r.push(...(o.subj ?? [ils + "e", ils + "es", ils + "e", o.imp + "ions", o.imp + "iez", ils + "ent"]));
    r.push(...(o.imper ?? [o.pres[1], o.pres[3], o.pres[4]]));
    r.push(...(o.ppForms ?? ppf(o.pp)));
    r.push(o.ger ?? o.imp + "ant");
    return r;
  }
  const pre = (p, arr) => arr.map((x) => p + x);

  // ---------- regular -er (with spelling-change kinds) ----------
  function frEr(inf, kind = "") {
    const K = new Set(kind.split(" ").filter(Boolean));
    const stem = inf.slice(0, -2);
    const adj = (s, e) => {
      if (K.has("cer") && s.endsWith("c") && /^[aâo]/.test(e)) return s.slice(0, -1) + "ç" + e;
      if (K.has("ger") && s.endsWith("g") && /^[aâo]/.test(e)) return s + "e" + e;
      return s + e;
    };
    let s2 = [stem];
    let futS = [inf];
    if (K.has("e")) { s2 = [stem.replace(/e([^e]*)$/, "è$1")]; futS = [s2[0] + "er"]; }
    if (K.has("é")) { s2 = [stem.replace(/é([^é]*)$/, "è$1")]; futS = [inf, s2[0] + "er"]; }
    if (K.has("dbl")) { s2 = [stem + stem.slice(-1)]; futS = [s2[0] + "er"]; }
    if (K.has("yer")) { s2 = [stem.replace(/y$/, "i")]; futS = [s2[0] + "er"]; }
    if (K.has("yer2")) { s2 = [stem, stem.replace(/y$/, "i")]; futS = [inf, s2[1] + "er"]; }
    const r = [inf];
    for (const t of s2) r.push(t + "e", t + "es", t + "ent");
    r.push(adj(stem, "ons"), stem + "ez");
    r.push(...IMP.map((e) => adj(stem, e)));
    r.push(...PS.a.map((e) => adj(stem, e)));
    for (const f of futS) {
      r.push(...FUT.map((e) => f + e));
      r.push(...IMP.map((e) => f + e));
    }
    r.push(stem + "ions", stem + "iez"); // subjonctif nous/vous
    r.push(adj(stem, "asse"), adj(stem, "asses"), adj(stem, "ât"), adj(stem, "assions"), adj(stem, "assiez"), adj(stem, "assent"));
    r.push(stem + "é", stem + "ée", stem + "és", stem + "ées");
    r.push(adj(stem, "ant"));
    add(r);
  }

  // ---------- regular -ir (2nd group) ----------
  function frIr(inf) {
    const s = inf.slice(0, -2);
    add(fr({
      inf,
      pres: [s + "is", s + "is", s + "it", s + "issons", s + "issez", s + "issent"],
      imp: s + "iss", ps: [s, "i"], fut: inf, pp: s + "i",
    }));
  }
  // partir / sortir / dormir / servir / sentir / mentir type
  function frPartir(inf) {
    const s = inf.slice(0, -2);
    const sh = s.slice(0, -1);
    add(fr({
      inf,
      pres: [sh + "s", sh + "s", sh + "t", s + "ons", s + "ez", s + "ent"],
      imp: s, ps: [s, "i"], fut: inf, pp: s + "i",
    }));
  }
  // ouvrir / offrir / couvrir / souffrir type
  function frOuvrir(inf) {
    const s = inf.slice(0, -2);
    add(fr({
      inf,
      pres: [s + "e", s + "es", s + "e", s + "ons", s + "ez", s + "ent"],
      imp: s, ps: [s, "i"], fut: inf, pp: s.slice(0, -1) + "ert",
      imper: [s + "e", s + "ons", s + "ez"],
    }));
  }
  function frCueillir(inf) {
    const s = inf.slice(0, -2);
    add(fr({
      inf,
      pres: [s + "e", s + "es", s + "e", s + "ons", s + "ez", s + "ent"],
      imp: s, ps: [s, "i"], fut: s + "er", pp: s + "i",
      imper: [s + "e", s + "ons", s + "ez"],
    }));
  }
  // regular -re (vendre, rendre, répondre, rompre ...)
  function frRe(inf) {
    const s = inf.slice(0, -2);
    add(fr({
      inf,
      pres: [s + "s", s + "s", /[dt]$/.test(s) ? s : s + "t", s + "ons", s + "ez", s + "ent"],
      imp: s, ps: [s, "i"], fut: inf.slice(0, -1), pp: s + "u",
    }));
  }
  // -duire / -struire / cuire / suffire (produire, construire, détruire, traduire ...)
  function frDuire(inf, ppForms) {
    const s = inf.slice(0, -2); // produi
    add(fr({
      inf,
      pres: [s + "s", s + "s", s + "t", s + "sons", s + "sez", s + "sent"],
      imp: s + "s", ps: [s + "s", "i"], fut: inf.slice(0, -1), pp: s + "t", ppForms,
    }));
  }
  // -indre (craindre, peindre, joindre, atteindre ...)
  function frIndre(inf) {
    const s = inf.slice(0, -4); // crai
    add(fr({
      inf,
      pres: [s + "ns", s + "ns", s + "nt", s + "gnons", s + "gnez", s + "gnent"],
      imp: s + "gn", ps: [s + "gn", "i"], fut: inf.slice(0, -1), pp: s + "nt",
    }));
  }
  // connaître / paraître family
  function frConnaitre(inf) {
    const s = inf.slice(0, -5); // conn
    add(fr({
      inf,
      pres: [s + "ais", s + "ais", s + "aît", s + "aissons", s + "aissez", s + "aissent"],
      imp: s + "aiss", ps: [s, "u"], fut: s + "aîtr", pp: s + "u",
    }));
  }
  // -cevoir (recevoir, apercevoir, concevoir, décevoir, percevoir)
  function frCevoir(inf) {
    const s = inf.slice(0, -6); // re
    add(fr({
      inf,
      pres: [s + "çois", s + "çois", s + "çoit", s + "cevons", s + "cevez", s + "çoivent"],
      imp: s + "cev", ps: [s + "ç", "u"], fut: s + "cevr", pp: s + "çu",
    }));
  }
  // écrire family
  function frEcrire(inf) {
    const s = inf.slice(0, -3); // écr
    add(fr({
      inf,
      pres: [s + "is", s + "is", s + "it", s + "ivons", s + "ivez", s + "ivent"],
      imp: s + "iv", ps: [s + "iv", "i"], fut: s + "ir", pp: s + "it",
    }));
  }
  // lire / élire family
  function frLire(inf) {
    const s = inf.slice(0, -3);
    add(fr({
      inf,
      pres: [s + "is", s + "is", s + "it", s + "isons", s + "isez", s + "isent"],
      imp: s + "is", ps: [s, "u"], fut: s + "ir", pp: s + "u",
    }));
  }
  // traire family (no passé simple): extraire, distraire, soustraire, abstraire
  function frTraire(inf) {
    const s = inf.slice(0, -3); // extra
    add(fr({
      inf,
      pres: [s + "is", s + "is", s + "it", s + "yons", s + "yez", s + "ient"],
      imp: s + "y", ps: null, fut: inf.slice(0, -1), pp: s + "it",
      subj: [s + "ie", s + "ies", s + "ie", s + "yions", s + "yiez", s + "ient"],
      imper: [s + "is", s + "yons", s + "yez"],
    }));
  }

  // ---------- prefix families built from a base table ----------
  const tenir = fr({
    inf: "tenir", pres: ["tiens", "tiens", "tient", "tenons", "tenez", "tiennent"],
    imp: "ten", ps: ["t", "in"], fut: "tiendr", pp: "tenu",
  });
  const venir = fr({
    inf: "venir", pres: ["viens", "viens", "vient", "venons", "venez", "viennent"],
    imp: "ven", ps: ["v", "in"], fut: "viendr", pp: "venu",
  });
  add(tenir); add(venir);
  for (const p of ["ob", "re", "main", "con", "appar", "sou", "dé", "entre", "abs"]) add(pre(p, tenir));
  for (const p of ["de", "re", "par", "con", "pré", "sur", "inter", "pro", "sub", "sou"]) add(pre(p, venir));

  const prendre = fr({
    inf: "prendre", pres: ["prends", "prends", "prend", "prenons", "prenez", "prennent"],
    imp: "pren", ps: ["pr", "i"], fut: "prendr", pp: "pris",
  });
  add(prendre);
  for (const p of ["com", "ap", "sur", "re", "entre", "dé"]) add(pre(p, prendre));
  const mettre = fr({
    inf: "mettre", pres: ["mets", "mets", "met", "mettons", "mettez", "mettent"],
    imp: "mett", ps: ["m", "i"], fut: "mettr", pp: "mis",
  });
  add(mettre);
  for (const p of ["per", "pro", "re", "ad", "com", "sou", "trans", "é", "o", "entre"]) add(pre(p, mettre));
  const battre = fr({
    inf: "battre", pres: ["bats", "bats", "bat", "battons", "battez", "battent"],
    imp: "batt", ps: ["batt", "i"], fut: "battr", pp: "battu",
  });
  add(battre);
  for (const p of ["com", "a", "dé"]) add(pre(p, battre));

  const faire = fr({
    inf: "faire", pres: ["fais", "fais", "fait", "faisons", "faites", "font"],
    imp: "fais", ps: ["f", "i"], fut: "fer", pp: "fait",
    subj: ["fasse", "fasses", "fasse", "fassions", "fassiez", "fassent"],
    imper: ["fais", "faisons", "faites"], ger: "faisant",
  });
  add(faire);
  for (const p of ["dé", "re", "satis"]) add(pre(p, faire));
  const voir = fr({
    inf: "voir", pres: ["vois", "vois", "voit", "voyons", "voyez", "voient"],
    imp: "voy", ps: ["v", "i"], fut: "verr", pp: "vu",
  });
  add(voir);
  for (const p of ["re", "entre"]) add(pre(p, voir));
  add(pre("pré", voir).map((x) => x.replace(/verr/, "voir")));
  const dire = fr({
    inf: "dire", pres: ["dis", "dis", "dit", "disons", "dites", "disent"],
    imp: "dis", ps: ["d", "i"], fut: "dir", pp: "dit",
  });
  add(dire);
  for (const p of ["contre", "pré", "inter", "mé"]) {
    add(pre(p, dire).map((x) => (x === p + "dites" ? p + "disez" : x)));
  }
  const vivre = fr({
    inf: "vivre", pres: ["vis", "vis", "vit", "vivons", "vivez", "vivent"],
    imp: "viv", ps: ["véc", "u"], fut: "vivr", pp: "vécu",
  });
  add(vivre); add(pre("sur", vivre)); add(pre("re", vivre));
  const suivre = fr({
    inf: "suivre", pres: ["suis", "suis", "suit", "suivons", "suivez", "suivent"],
    imp: "suiv", ps: ["suiv", "i"], fut: "suivr", pp: "suivi",
  });
  add(suivre); add(pre("pour", suivre));
  const courir = fr({
    inf: "courir", pres: ["cours", "cours", "court", "courons", "courez", "courent"],
    imp: "cour", ps: ["cour", "u"], fut: "courr", pp: "couru",
  });
  add(courir);
  for (const p of ["par", "ac", "se", "con"]) add(pre(p, courir));
  const rire = fr({
    inf: "rire", pres: ["ris", "ris", "rit", "rions", "riez", "rient"],
    imp: "ri", ps: ["r", "i"], fut: "rir", ppForms: ["ri"],
  });
  add(rire); add(pre("sou", rire));
  const fuir = fr({
    inf: "fuir", pres: ["fuis", "fuis", "fuit", "fuyons", "fuyez", "fuient"],
    imp: "fuy", ps: ["fu", "i"], fut: "fuir", pp: "fui",
  });
  add(fuir); add(pre("en", fuir));
  const plaire = fr({
    inf: "plaire", pres: ["plais", "plais", "plaît", "plaisons", "plaisez", "plaisent"],
    imp: "plais", ps: ["pl", "u"], fut: "plair", ppForms: ["plu"],
  });
  add(plaire); add(pre("dé", plaire));
  const envoyer = fr({
    inf: "envoyer", pres: ["envoie", "envoies", "envoie", "envoyons", "envoyez", "envoient"],
    imp: "envoy", ps: ["envoy", "a"], fut: "enverr", pp: "envoyé",
    imper: ["envoie", "envoyons", "envoyez"],
  });
  add(envoyer); add(pre("r", envoyer));

  // ---------- fully irregular verbs ----------
  add(fr({
    inf: "être", pres: ["suis", "es", "est", "sommes", "êtes", "sont"],
    imp: "ét", ps: ["f", "u"], fut: "ser",
    subj: ["sois", "sois", "soit", "soyons", "soyez", "soient"],
    imper: ["sois", "soyons", "soyez"], ppForms: ["été"], ger: "étant",
  }));
  add(fr({
    inf: "avoir", pres: ["ai", "as", "a", "avons", "avez", "ont"],
    imp: "av", ps: ["e", "u"], fut: "aur",
    subj: ["aie", "aies", "ait", "ayons", "ayez", "aient"],
    imper: ["aie", "ayons", "ayez"], pp: "eu", ger: "ayant",
  }));
  add(fr({
    inf: "aller", pres: ["vais", "vas", "va", "allons", "allez", "vont"],
    imp: "all", ps: ["all", "a"], fut: "ir",
    subj: ["aille", "ailles", "aille", "allions", "alliez", "aillent"],
    imper: ["va", "allons", "allez"], pp: "allé",
  }));
  add(fr({
    inf: "pouvoir", pres: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"],
    imp: "pouv", ps: ["p", "u"], fut: "pourr",
    subj: ["puisse", "puisses", "puisse", "puissions", "puissiez", "puissent"],
    imper: [], ppForms: ["pu"],
  }));
  add(["puis"]);
  add(fr({
    inf: "vouloir", pres: ["veux", "veux", "veut", "voulons", "voulez", "veulent"],
    imp: "voul", ps: ["voul", "u"], fut: "voudr",
    subj: ["veuille", "veuilles", "veuille", "voulions", "vouliez", "veuillent"],
    imper: ["veuille", "veuillons", "veuillez"], pp: "voulu",
  }));
  add(fr({
    inf: "savoir", pres: ["sais", "sais", "sait", "savons", "savez", "savent"],
    imp: "sav", ps: ["s", "u"], fut: "saur",
    subj: ["sache", "saches", "sache", "sachions", "sachiez", "sachent"],
    imper: ["sache", "sachons", "sachez"], pp: "su", ger: "sachant",
  }));
  add(fr({
    inf: "devoir", pres: ["dois", "dois", "doit", "devons", "devez", "doivent"],
    imp: "dev", ps: ["d", "u"], fut: "devr", ppForms: ["dû", "due", "dus", "dues"],
  }));
  add(fr({
    inf: "croire", pres: ["crois", "crois", "croit", "croyons", "croyez", "croient"],
    imp: "croy", ps: ["cr", "u"], fut: "croir", pp: "cru",
  }));
  add(fr({
    inf: "boire", pres: ["bois", "bois", "boit", "buvons", "buvez", "boivent"],
    imp: "buv", ps: ["b", "u"], fut: "boir", pp: "bu",
  }));
  add(fr({
    inf: "mourir", pres: ["meurs", "meurs", "meurt", "mourons", "mourez", "meurent"],
    imp: "mour", ps: ["mour", "u"], fut: "mourr",
    subj: ["meure", "meures", "meure", "mourions", "mouriez", "meurent"],
    pp: "mort",
  }));
  add(fr({
    inf: "valoir", pres: ["vaux", "vaux", "vaut", "valons", "valez", "valent"],
    imp: "val", ps: ["val", "u"], fut: "vaudr",
    subj: ["vaille", "vailles", "vaille", "valions", "valiez", "vaillent"], pp: "valu",
  }));
  add(["falloir", "faut", "fallait", "fallut", "faudra", "faudrait", "faille", "fallût", "fallu"]);
  add(["pleuvoir", "pleut", "pleuvait", "plut", "pleuvra", "pleuvrait", "pleuve", "plût", "plu", "pleuvant"]);
  add(fr({
    inf: "acquérir", pres: ["acquiers", "acquiers", "acquiert", "acquérons", "acquérez", "acquièrent"],
    imp: "acquér", ps: ["acqu", "i"], fut: "acquerr",
    subj: ["acquière", "acquières", "acquière", "acquérions", "acquériez", "acquièrent"], pp: "acquis",
  }));
  add(fr({
    inf: "conquérir", pres: ["conquiers", "conquiers", "conquiert", "conquérons", "conquérez", "conquièrent"],
    imp: "conquér", ps: ["conqu", "i"], fut: "conquerr",
    subj: ["conquière", "conquières", "conquière", "conquérions", "conquériez", "conquièrent"], pp: "conquis",
  }));
  add(fr({
    inf: "naître", pres: ["nais", "nais", "naît", "naissons", "naissez", "naissent"],
    imp: "naiss", ps: ["naqu", "i"], fut: "naîtr", pp: "né",
  }));
  add(fr({
    inf: "résoudre", pres: ["résous", "résous", "résout", "résolvons", "résolvez", "résolvent"],
    imp: "résolv", ps: ["résol", "u"], fut: "résoudr", pp: "résolu",
  }));
  add(fr({
    inf: "coudre", pres: ["couds", "couds", "coud", "cousons", "cousez", "cousent"],
    imp: "cous", ps: ["cous", "i"], fut: "coudr", pp: "cousu",
  }));
  for (const p of ["", "con"]) {
    add(fr({
      inf: p + "vaincre", pres: [p + "vaincs", p + "vaincs", p + "vainc", p + "vainquons", p + "vainquez", p + "vainquent"],
      imp: p + "vainqu", ps: [p + "vainqu", "i"], fut: p + "vaincr", pp: p + "vaincu",
    }));
  }
  for (const [p, pp] of [["con", ["conclu", "conclue", "conclus", "conclues"]], ["ex", ["exclu", "exclue", "exclus", "exclues"]], ["in", ["inclus", "incluse", "inclus", "incluses"]]]) {
    add(fr({
      inf: p + "clure", pres: [p + "clus", p + "clus", p + "clut", p + "cluons", p + "cluez", p + "cluent"],
      imp: p + "clu", ps: [p + "clu", "u"], fut: p + "clur", ppForms: pp,
    }));
  }

  // ---------- regular groups ----------
  for (const v of ["connaître", "reconnaître", "méconnaître", "paraître", "apparaître", "disparaître", "comparaître", "transparaître"]) frConnaitre(v);
  for (const v of ["produire", "conduire", "construire", "détruire", "traduire", "introduire", "réduire", "séduire", "instruire", "cuire", "déduire", "reconstruire", "reproduire", "induire", "enduire", "reconduire"]) frDuire(v);
  frDuire("suffire", ["suffi"]);
  for (const v of ["craindre", "peindre", "joindre", "rejoindre", "atteindre", "éteindre", "plaindre", "teindre", "feindre", "contraindre", "restreindre", "étreindre", "enfreindre"]) frIndre(v);
  for (const v of ["recevoir", "apercevoir", "concevoir", "décevoir", "percevoir"]) frCevoir(v);
  for (const v of ["écrire", "décrire", "inscrire", "prescrire", "souscrire", "transcrire", "réécrire"]) frEcrire(v);
  for (const v of ["lire", "élire", "relire"]) frLire(v);
  for (const v of ["ouvrir", "offrir", "couvrir", "découvrir", "souffrir", "recouvrir", "rouvrir", "entrouvrir"]) frOuvrir(v);
  for (const v of ["cueillir", "accueillir", "recueillir"]) frCueillir(v);
  for (const v of ["extraire", "distraire", "soustraire", "abstraire", "traire"]) frTraire(v);
  for (const v of ["partir", "sortir", "dormir", "servir", "sentir", "mentir", "repartir", "ressortir", "endormir", "consentir", "ressentir", "desservir", "pressentir", "démentir"]) frPartir(v);
  for (const v of [
    "vendre", "rendre", "attendre", "entendre", "répondre", "perdre", "descendre", "tendre", "défendre", "étendre", "répandre", "fondre", "correspondre",
    "confondre", "mordre", "suspendre", "dépendre", "prétendre", "tondre", "pondre", "pendre", "détendre", "revendre", "rompre", "interrompre", "corrompre",
    "survendre", "redescendre", "épandre", "morfondre", "démordre", "retendre", "fendre", "pourfendre", "tordre",
  ]) frRe(v);
  for (const v of [
    "finir", "choisir", "réussir", "remplir", "établir", "grandir", "réfléchir", "agir", "définir", "fournir", "garantir", "unir", "bâtir",
    "rafraîchir", "accomplir", "applaudir", "avertir", "blanchir", "embellir", "enrichir", "guérir", "investir", "saisir", "nourrir", "punir",
    "ralentir", "rougir", "vieillir", "démolir", "élargir", "obéir", "réagir", "réunir", "subir", "trahir", "surgir", "jouir", "approfondir",
    "convertir", "pâlir", "ravir", "faiblir", "maigrir", "grossir", "mincir", "durcir", "éclaircir", "rétablir", "fleurir", "munir", "pourrir",
    "polir", "salir", "ternir", "tarir", "rajeunir", "affaiblir", "atterrir", "adoucir", "assortir", "désobéir", "dégarnir", "envahir",
    "épanouir", "étourdir", "fléchir", "gémir", "impartir", "languir", "mûrir", "obscurcir", "périr", "raccourcir", "refroidir", "resplendir",
    "rétrécir", "rôtir", "sévir", "bondir", "brunir", "bannir", "avilir", "agrandir", "anéantir", "alourdir", "amortir", "aplatir", "assouplir",
    "attendrir", "divertir", "engloutir", "frémir", "garnir", "jaillir", "meurtrir", "pétrir", "ramollir", "vomir", "compatir", "interagir",
    "ensevelir", "blottir", "dépérir", "dégourdir", "éblouir", "démunir", "farcir", "flétrir", "gravir", "moisir", "raffermir", "rebondir",
    "réjouir", "rugir",
  ]) frIr(v);

  // ---------- -er verbs by spelling kind ----------
  const ER = {
    "": [
      "donner", "trouver", "passer", "parler", "aimer", "penser", "demander", "rester", "arriver", "entrer", "monter", "tomber", "rentrer", "retourner",
      "travailler", "jouer", "marcher", "continuer", "terminer", "gagner", "dépenser", "coûter", "expliquer", "présenter", "organiser", "planifier", "préparer",
      "former", "accompagner", "simplifier", "optimiser", "connecter", "configurer", "activer", "valider", "confirmer", "annuler", "modifier", "supprimer", "ajouter",
      "enregistrer", "imprimer", "vérifier", "tester", "réaliser", "rencontrer", "dépasser", "respecter", "adapter", "adopter", "apporter", "emporter", "transporter",
      "louer", "augmenter", "diminuer", "innover", "inspirer", "motiver", "exécuter", "contacter", "commander", "réserver", "visiter", "installer", "comparer",
      "économiser", "sauvegarder", "explorer", "profiter", "apprécier", "assurer", "livrer", "expédier", "proposer", "abonner", "réparer", "développer", "cuisiner",
      "aider", "utiliser", "créer", "améliorer", "bénéficier", "accéder", "consulter", "publier", "rechercher", "chercher", "regarder", "écouter", "porter", "montrer",
      "laisser", "oublier", "étudier", "remercier", "retrouver", "compter", "tourner", "fermer", "poser", "garder", "toucher", "sauver", "tuer", "refuser", "accepter",
      "exister", "habiter", "décider", "danser", "chanter", "regrouper", "grouper", "personnaliser", "dessiner", "photographier", "filmer", "enseigner", "écraser",
      "tenter", "naviguer", "distinguer", "fatiguer", "intriguer", "communiquer", "appliquer", "indiquer", "remarquer", "fabriquer", "pratiquer", "provoquer", "cliquer",
      "critiquer", "manquer", "marquer", "masquer", "attaquer", "bloquer", "évoquer", "invoquer", "stationner", "durer", "importer", "exporter", "traiter", "tirer",
      "tarder", "taper", "tromper", "vider", "voler", "voter", "dîner", "déjeuner", "goûter", "savourer", "déguster", "féliciter", "souhaiter", "inviter", "réveiller",
      "coucher", "habiller", "laver", "brosser", "raser", "maquiller", "parfumer", "décorer", "meubler", "rénover", "bricoler", "jardiner", "planter", "arroser",
      "cultiver", "récolter", "pêcher", "chasser", "griller", "mijoter", "couper", "éplucher", "assaisonner", "déposer", "retirer", "virer", "débiter", "créditer",
      "rembourser", "emprunter", "prêter", "cotiser", "résilier", "facturer", "encaisser", "négocier", "commercialiser", "distribuer", "exploiter", "recruter",
      "embaucher", "licencier", "coordonner", "superviser", "animer", "présider", "représenter", "participer", "collaborer", "coopérer", "informer", "notifier",
      "alerter", "signaler", "rapporter", "analyser", "mesurer", "calculer", "estimer", "évaluer", "contrôler", "surveiller", "inspecter", "auditer", "certifier",
      "autoriser", "empêcher", "limiter", "imposer", "solliciter", "réclamer", "revendiquer", "sécuriser", "crypter", "chiffrer", "restaurer", "synchroniser",
      "copier", "coller", "renommer", "trier", "filtrer", "classer", "ordonner", "numériser", "scanner", "diffuser", "streamer", "poster", "commenter", "noter",
      "recommander", "conseiller", "orienter", "guider", "encadrer", "entraîner", "réviser", "mémoriser", "éduquer", "sensibiliser", "éclairer", "illustrer",
      "démontrer", "prouver", "argumenter", "persuader", "attirer", "fidéliser", "impliquer", "associer", "relier", "lier", "rassembler", "mobiliser", "stimuler",
      "dynamiser", "moderniser", "digitaliser", "automatiser", "standardiser", "harmoniser", "uniformiser", "ajuster", "calibrer", "programmer", "coder", "compiler",
      "déboguer", "fonctionner", "interpeller", "arrêter", "appréhender", "mériter", "supporter", "adorer", "détester", "visualiser", "télétravailler", "booster",
      "emballer", "empaqueter", "acheminer", "réceptionner", "stocker", "approvisionner", "parrainer", "sponsoriser", "dédier", "consacrer", "orner",
      "embarquer", "débarquer", "séjourner", "randonner", "skier", "surfer", "camper", "bivouaquer", "flâner", "visionner", "fêter", "marier", "épouser",
      "soigner", "diagnostiquer", "vacciner", "masser", "relaxer", "méditer", "respirer", "étirer", "sauter", "grimper", "attraper", "frapper", "viser",
      "arbitrer", "apprivoiser", "caresser", "dresser", "rouler", "garer", "dépanner", "remorquer", "freiner", "chatter", "bloguer", "liker", "tweeter",
      "indexer", "positionner", "monétiser", "tracker", "cibler", "segmenter", "crawler", "uploader", "cloner",
    ],
    ger: [
      "manger", "voyager", "changer", "ranger", "plonger", "échanger", "engager", "diriger", "encourager", "obliger", "corriger", "nager", "arranger", "bouger",
      "juger", "mélanger", "négliger", "décourager", "exiger", "soulager", "allonger", "déranger", "déménager", "partager", "télécharger", "interroger", "songer",
      "neiger", "héberger", "affliger", "mitiger", "aménager", "charger", "décharger", "recharger", "surcharger", "étager", "ménager", "figer", "forger", "ravager",
      "saccager", "venger", "rediriger", "ériger", "submerger", "émerger", "immerger", "converger", "diverger", "déroger", "abroger", "outrager", "rédiger",
    ],
    cer: [
      "commencer", "lancer", "placer", "avancer", "remplacer", "annoncer", "prononcer", "effacer", "financer", "influencer", "menacer", "dénoncer", "renoncer",
      "tracer", "enfoncer", "agencer", "forcer", "divorcer", "exercer", "sucer", "percer", "enlacer", "balancer", "déplacer", "recommencer", "relancer", "rincer",
      "grincer", "lacer", "pincer", "froncer", "émincer", "devancer", "fiancer", "agacer", "délacer", "épicer", "défoncer", "foncer", "grimacer", "renforcer",
      "amorcer", "référencer", "bercer", "coincer", "énoncer", "exaucer", "glacer", "semoncer",
    ],
    e: [
      "acheter", "lever", "mener", "peser", "geler", "amener", "emmener", "ramener", "promener", "élever", "enlever", "soulever", "semer", "modeler", "harceler",
      "peler", "racheter", "ciseler", "marteler", "déceler", "crever", "achever", "démanteler", "dégeler", "congeler", "surgeler", "parsemer", "malmener",
      "relever", "prélever", "égrener", "écarteler", "receler",
    ],
    "é": [
      "préférer", "espérer", "répéter", "considérer", "célébrer", "opérer", "céder", "révéler", "compléter", "posséder", "régler", "régner", "récupérer",
      "inquiéter", "interpréter", "générer", "accélérer", "tolérer", "libérer", "lécher", "digérer", "exagérer", "persévérer", "conférer", "référer", "différer",
      "suggérer", "pénétrer", "décélérer", "énumérer", "modérer", "rémunérer", "adhérer", "altérer", "tempérer", "vénérer", "gérer", "intégrer", "transférer",
      "fédérer", "paramétrer", "désintégrer", "sécher", "refléter", "régénérer", "dégénérer", "proférer", "déléguer", "révérer", "assécher", "empiéter",
      "aliéner", "procéder", "précéder", "concéder", "succéder", "reconsidérer", "alléguer",
    ],
    "é ger": ["protéger", "assiéger", "abréger", "alléger", "piéger", "siéger", "agréger"],
    dbl: [
      "appeler", "rappeler", "épeler", "jeter", "projeter", "renouveler", "feuilleter", "étiqueter", "rejeter", "ficeler", "chanceler", "épousseter", "décacheter",
      "cacheter", "morceler", "cliqueter", "atteler", "carreler", "denteler", "ruisseler", "interjeter", "craqueter", "étinceler", "museler", "amonceler",
      "niveler", "ensorceler", "grommeler", "bosseler", "breveter", "caqueter", "hoqueter", "ruisseler",
    ],
    yer: [
      "nettoyer", "employer", "appuyer", "ennuyer", "essuyer", "déployer", "tutoyer", "vouvoyer", "côtoyer", "broyer", "noyer", "aboyer", "octroyer", "tournoyer",
      "larmoyer", "foudroyer", "convoyer", "festoyer", "guerroyer", "rudoyer", "ployer", "flamboyer", "verdoyer", "choyer", "fourvoyer", "apitoyer", "soudoyer",
      "chatoyer", "ondoyer", "poudroyer",
    ],
    yer2: [
      "payer", "essayer", "balayer", "effrayer", "rayer", "égayer", "bégayer", "délayer", "enrayer", "frayer", "monnayer", "surpayer", "repayer", "défrayer",
      "réessayer", "zézayer",
    ],
  };
  for (const [kind, list] of Object.entries(ER)) {
    for (const v of list) frEr(v, kind);
  }
  return [...out];
}

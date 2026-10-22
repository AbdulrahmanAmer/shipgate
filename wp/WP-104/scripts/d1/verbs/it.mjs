// WP-104 d1: Italian verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + irregular tables.
// Simple forms of: presente, imperfetto, passato remoto, futuro, condizionale, congiuntivo presente + imperfetto,
// imperativo, infinito, participio passato (4 forms), gerundio. Elided/clitic/truncated forms (di', fa', va') are not included.
export default function forms() {
  const out = new Set();
  const add = (arr) => { for (const x of arr) if (x) out.add(x); };
  const pp4 = (ms) => (ms.endsWith("o") ? [ms, ms.slice(0, -1) + "a", ms.slice(0, -1) + "i", ms.slice(0, -1) + "e"] : [ms]);
  const pre = (p, arr) => arr.map((x) => p + x);

  const EN = {
    are: { I: ["avo", "avi", "ava", "avamo", "avate", "avano"], C: ["assi", "assi", "asse", "assimo", "aste", "assero"] },
    ere: { I: ["evo", "evi", "eva", "evamo", "evate", "evano"], C: ["essi", "essi", "esse", "essimo", "este", "essero"] },
    ire: { I: ["ivo", "ivi", "iva", "ivamo", "ivate", "ivano"], C: ["issi", "issi", "isse", "issimo", "iste", "issero"] },
  };

  // Generic builder. o: inf, type, ws (imperfect stem), P[6], Sj[6], F (future stem(s)), R[] (passato remoto forms),
  //  pp (string|array), tu[] (imperative forms), I[6]/Ci[6] overrides, ger override
  function it(o) {
    const t = EN[o.type];
    const r = [o.inf, ...o.P, ...o.Sj, ...o.R, ...(o.tu ?? [])];
    r.push(...(o.I ?? t.I.map((e) => o.ws + e)));
    r.push(...(o.Ci ?? t.C.map((e) => o.ws + e)));
    for (const f of Array.isArray(o.F) ? o.F : [o.F]) {
      r.push(...["ò", "ai", "à", "emo", "ete", "anno"].map((e) => f + e));
      r.push(...["ei", "esti", "ebbe", "emmo", "este", "ebbero"].map((e) => f + e));
    }
    r.push(o.ger ?? o.ws + (o.type === "are" ? "ando" : "endo"));
    for (const p of Array.isArray(o.pp) ? o.pp : [o.pp]) r.push(...pp4(p));
    return r;
  }

  // ---------- regular -are ----------
  function itAre(inf, stressed = false) {
    const s = inf.slice(0, -3);
    let P, Sj, F;
    if (s.endsWith("i")) {
      P = [s + "o", stressed ? s + "i" : s, s + "a", s + "amo", s + "ate", s + "ano"];
      Sj = stressed ? [s + "i", s + "i", s + "i", s + "amo", s + "ate", s + "ino"] : [s, s, s, s + "amo", s + "ate", s + "no"];
      F = /[cg]i$/.test(s) ? s.slice(0, -1) + "er" : s + "er";
    } else {
      const h = /[cg]$/.test(s) ? s + "h" : s;
      P = [s + "o", h + "i", s + "a", h + "iamo", s + "ate", s + "ano"];
      Sj = [h + "i", h + "i", h + "i", h + "iamo", h + "iate", h + "ino"];
      F = h + "er";
    }
    const r = it({
      inf, type: "are", ws: s, P, Sj, F, pp: s + "ato", tu: [P[2]],
      R: [s + "ai", s + "asti", s + "ò", s + "ammo", s + "aste", s + "arono"],
    });
    add(r);
    return r;
  }
  // ---------- regular -ere (optionally with strong remoto stem S and irregular participle) ----------
  function itEre(inf, o = {}) {
    const s = inf.slice(0, -3);
    const P = [s + "o", s + "i", s + "e", s + "iamo", s + "ete", s + "ono"];
    const Sj = [s + "a", s + "a", s + "a", s + "iamo", s + "iate", s + "ano"];
    let R;
    if (o.S) R = [o.S + "i", s + "esti", o.S + "e", s + "emmo", s + "este", o.S + "ero"];
    else R = [s + "ei", s + "etti", s + "esti", s + "é", s + "ette", s + "emmo", s + "este", s + "erono", s + "ettero"];
    if (o.S && o.weak) R.push(s + "ei", s + "etti", s + "é", s + "ette", s + "erono", s + "ettero");
    const r = it({ inf, type: "ere", ws: s, P, Sj, F: o.F ?? s + "er", R, pp: o.pp ?? s + "uto", tu: [P[1]] });
    add(r);
    return r;
  }
  // ---------- regular -ire (isc: 0 no, 1 yes, 2 both) ----------
  function itIre(inf, isc = 1, o = {}) {
    const s = inf.slice(0, -3);
    const Pn = [s + "o", s + "i", s + "e", s + "iamo", s + "ite", s + "ono"];
    const Pi = [s + "isco", s + "isci", s + "isce", s + "iamo", s + "ite", s + "iscono"];
    const Sn = [s + "a", s + "a", s + "a", s + "iamo", s + "iate", s + "ano"];
    const Si = [s + "isca", s + "isca", s + "isca", s + "iamo", s + "iate", s + "iscano"];
    const P = isc === 0 ? Pn : isc === 1 ? Pi : [...Pn, ...Pi];
    const Sj = isc === 0 ? Sn : isc === 1 ? Si : [...Sn, ...Si];
    const R = [s + "ii", s + "isti", s + "ì", s + "immo", s + "iste", s + "irono"];
    if (o.strong) { const S = s.slice(0, -1) + "er" + "s"; R.push(S + "i", S + "e", S + "ero"); }
    const r = it({ inf, type: "ire", ws: s, P, Sj, F: s + "ir", R, pp: o.pp ?? s + "ito", tu: isc === 0 ? [Pn[1]] : isc === 1 ? [Pi[1]] : [Pn[1], Pi[1]] });
    add(r);
    return r;
  }
  // -gliere family: scegliere, togliere, cogliere, sciogliere, raccogliere, accogliere
  function itGliere(inf) {
    const s = inf.slice(0, -6);
    const ws = s + "gli";
    const P = [s + "lgo", ws, ws + "e", ws + "amo", ws + "ete", s + "lgono"];
    const Sj = [s + "lga", s + "lga", s + "lga", ws + "amo", ws + "ate", s + "lgano"];
    const R = [s + "lsi", ws + "esti", s + "lse", ws + "emmo", ws + "este", s + "lsero"];
    add(it({ inf, type: "ere", ws, P, Sj, F: ws + "er", R, pp: s + "lto", tu: [P[1]] }));
  }
  // -urre family: produrre, condurre, tradurre, ridurre, introdurre, dedurre, indurre, sedurre
  function itUrre(inf) {
    const b = inf.slice(0, -4);
    const ws = b + "uc";
    const P = [ws + "o", ws + "i", ws + "e", ws + "iamo", ws + "ete", ws + "ono"];
    const Sj = [ws + "a", ws + "a", ws + "a", ws + "iamo", ws + "iate", ws + "ano"];
    const R = [b + "ussi", ws + "esti", b + "usse", ws + "emmo", ws + "este", b + "ussero"];
    add(it({ inf, type: "ere", ws, P, Sj, F: b + "urr", R, pp: b + "otto", tu: [P[1]] }));
  }
  // -scere family: conoscere, crescere, nascere ...
  function itScere(inf, strong, pp) {
    const s = inf.slice(0, -3);
    const P = [s + "o", s + "i", s + "e", s + "iamo", s + "ete", s + "ono"];
    const Sj = [s + "a", s + "a", s + "a", s + "iamo", s + "iate", s + "ano"];
    const R = [strong + "i", s + "esti", strong + "e", s + "emmo", s + "este", strong + "ero"];
    const r = it({ inf, type: "ere", ws: s, P, Sj, F: s + "er", R, pp, tu: [P[1]] });
    add(r);
    return r;
  }

  // ---------- fully irregular verbs ----------
  add(it({
    inf: "essere", type: "ere", ws: "ess", P: ["sono", "sei", "è", "siamo", "siete", "sono"],
    I: ["ero", "eri", "era", "eravamo", "eravate", "erano"], R: ["fui", "fosti", "fu", "fummo", "foste", "furono"],
    Ci: ["fossi", "fossi", "fosse", "fossimo", "foste", "fossero"], F: "sar",
    Sj: ["sia", "sia", "sia", "siamo", "siate", "siano"], tu: ["sii"], ger: "essendo", pp: "stato",
  }));
  add(it({
    inf: "avere", type: "ere", ws: "av", P: ["ho", "hai", "ha", "abbiamo", "avete", "hanno"],
    R: ["ebbi", "avesti", "ebbe", "avemmo", "aveste", "ebbero"], F: "avr",
    Sj: ["abbia", "abbia", "abbia", "abbiamo", "abbiate", "abbiano"], tu: ["abbi"], pp: "avuto",
  }));
  add(it({
    inf: "andare", type: "are", ws: "and", P: ["vado", "vai", "va", "andiamo", "andate", "vanno"],
    R: ["andai", "andasti", "andò", "andammo", "andaste", "andarono"], F: "andr",
    Sj: ["vada", "vada", "vada", "andiamo", "andiate", "vadano"], tu: ["va", "vai"], pp: "andato",
  }));
  const fare = it({
    inf: "fare", type: "ere", ws: "fac", P: ["faccio", "fai", "fa", "facciamo", "fate", "fanno"],
    R: ["feci", "facesti", "fece", "facemmo", "faceste", "fecero"], F: "far",
    Sj: ["faccia", "faccia", "faccia", "facciamo", "facciate", "facciano"], tu: ["fai", "fa"], pp: "fatto",
  });
  add(fare);
  for (const p of ["dis", "ri", "soddis", "assue", "stupe", "contraf"]) add(pre(p, fare));
  add(["soddisfo"]);
  add(it({
    inf: "dare", type: "are", ws: "d", P: ["do", "dai", "dà", "diamo", "date", "danno"],
    R: ["diedi", "desti", "diede", "demmo", "deste", "diedero", "detti", "dette", "dettero"], F: "dar",
    Ci: ["dessi", "dessi", "desse", "dessimo", "deste", "dessero"],
    Sj: ["dia", "dia", "dia", "diamo", "diate", "diano"], tu: ["dai"], pp: "dato",
  }));
  add(it({
    inf: "stare", type: "are", ws: "st", P: ["sto", "stai", "sta", "stiamo", "state", "stanno"],
    R: ["stetti", "stesti", "stette", "stemmo", "steste", "stettero"], F: "star",
    Ci: ["stessi", "stessi", "stesse", "stessimo", "steste", "stessero"],
    Sj: ["stia", "stia", "stia", "stiamo", "stiate", "stiano"], tu: ["stai", "sta"], pp: "stato",
  }));
  const dire = it({
    inf: "dire", type: "ere", ws: "dic", P: ["dico", "dici", "dice", "diciamo", "dite", "dicono"],
    R: ["dissi", "dicesti", "disse", "dicemmo", "diceste", "dissero"], F: "dir",
    Sj: ["dica", "dica", "dica", "diciamo", "diciate", "dicano"], tu: ["dì"], pp: "detto",
  });
  add(dire);
  for (const p of ["contrad", "pre", "bene", "male", "dis", "ri"]) add(pre(p, dire.filter((x) => x !== "dì")));
  add(["contraddici"]);
  add(it({
    inf: "potere", type: "ere", ws: "pot", P: ["posso", "puoi", "può", "possiamo", "potete", "possono"],
    R: ["potei", "potetti", "potesti", "poté", "potette", "potemmo", "poteste", "poterono", "potettero"], F: "potr",
    Sj: ["possa", "possa", "possa", "possiamo", "possiate", "possano"], pp: "potuto",
  }));
  add(it({
    inf: "volere", type: "ere", ws: "vol", P: ["voglio", "vuoi", "vuole", "vogliamo", "volete", "vogliono"],
    R: ["volli", "volesti", "volle", "volemmo", "voleste", "vollero"], F: "vorr",
    Sj: ["voglia", "voglia", "voglia", "vogliamo", "vogliate", "vogliano"], tu: ["vogli"], pp: "voluto",
  }));
  add(it({
    inf: "dovere", type: "ere", ws: "dov", P: ["devo", "debbo", "devi", "deve", "dobbiamo", "dovete", "devono", "debbono"],
    R: ["dovei", "dovetti", "dovesti", "dové", "dovette", "dovemmo", "doveste", "doverono", "dovettero"], F: ["dovr"],
    Sj: ["debba", "deva", "debba", "deva", "debba", "dobbiamo", "dobbiate", "debbano", "devano"], pp: "dovuto",
  }));
  add(it({
    inf: "sapere", type: "ere", ws: "sap", P: ["so", "sai", "sa", "sappiamo", "sapete", "sanno"],
    R: ["seppi", "sapesti", "seppe", "sapemmo", "sapeste", "seppero"], F: "sapr",
    Sj: ["sappia", "sappia", "sappia", "sappiamo", "sappiate", "sappiano"], tu: ["sappi"], pp: "saputo",
  }));
  const venire = it({
    inf: "venire", type: "ire", ws: "ven", P: ["vengo", "vieni", "viene", "veniamo", "venite", "vengono"],
    R: ["venni", "venisti", "venne", "venimmo", "veniste", "vennero"], F: "verr",
    Sj: ["venga", "venga", "venga", "veniamo", "veniate", "vengano"], tu: ["vieni"], pp: "venuto",
  });
  add(venire);
  for (const p of ["di", "con", "av", "pre", "inter", "pro", "s", "sov"]) add(pre(p, venire));
  add(it({
    inf: "uscire", type: "ire", ws: "usc", P: ["esco", "esci", "esce", "usciamo", "uscite", "escono"],
    R: ["uscii", "uscisti", "uscì", "uscimmo", "usciste", "uscirono"], F: "uscir",
    Sj: ["esca", "esca", "esca", "usciamo", "usciate", "escano"], tu: ["esci"], pp: "uscito",
  }));
  add(it({
    inf: "riuscire", type: "ire", ws: "riusc", P: ["riesco", "riesci", "riesce", "riusciamo", "riuscite", "riescono"],
    R: ["riuscii", "riuscisti", "riuscì", "riuscimmo", "riusciste", "riuscirono"], F: "riuscir",
    Sj: ["riesca", "riesca", "riesca", "riusciamo", "riusciate", "riescano"], tu: ["riesci"], pp: "riuscito",
  }));
  const salire = it({
    inf: "salire", type: "ire", ws: "sal", P: ["salgo", "sali", "sale", "saliamo", "salite", "salgono"],
    R: ["salii", "salisti", "salì", "salimmo", "saliste", "salirono"], F: "salir",
    Sj: ["salga", "salga", "salga", "saliamo", "saliate", "salgano"], tu: ["sali"], pp: "salito",
  });
  add(salire); add(pre("ri", salire)); add(pre("as", salire));
  const vedere = it({
    inf: "vedere", type: "ere", ws: "ved", P: ["vedo", "vedi", "vede", "vediamo", "vedete", "vedono"],
    R: ["vidi", "vedesti", "vide", "vedemmo", "vedeste", "videro"], F: "vedr",
    Sj: ["veda", "veda", "veda", "vediamo", "vediate", "vedano"], tu: ["vedi"], pp: ["visto", "veduto"],
  });
  add(vedere); add(pre("ri", vedere)); add(pre("intra", vedere)); add(pre("pre", vedere)); add(pre("pre", vedere.map((x) => x.replace("vedr", "veder"))));
  add(it({
    inf: "bere", type: "ere", ws: "bev", P: ["bevo", "bevi", "beve", "beviamo", "bevete", "bevono"],
    R: ["bevvi", "bevetti", "bevesti", "bevve", "bevette", "bevemmo", "beveste", "bevvero", "bevettero"], F: "berr",
    Sj: ["beva", "beva", "beva", "beviamo", "beviate", "bevano"], tu: ["bevi"], pp: "bevuto",
  }));
  const tenere = it({
    inf: "tenere", type: "ere", ws: "ten", P: ["tengo", "tieni", "tiene", "teniamo", "tenete", "tengono"],
    R: ["tenni", "tenesti", "tenne", "tenemmo", "teneste", "tennero"], F: "terr",
    Sj: ["tenga", "tenga", "tenga", "teniamo", "teniate", "tengano"], tu: ["tieni"], pp: "tenuto",
  });
  add(tenere);
  for (const p of ["man", "ot", "con", "sos", "appar", "trat", "ri", "de", "intrat", "as"]) add(pre(p, tenere));
  const porre = it({
    inf: "porre", type: "ere", ws: "pon", P: ["pongo", "poni", "pone", "poniamo", "ponete", "pongono"],
    R: ["posi", "ponesti", "pose", "ponemmo", "poneste", "posero"], F: "porr",
    Sj: ["ponga", "ponga", "ponga", "poniamo", "poniate", "pongano"], tu: ["poni"], pp: "posto",
  });
  add(porre);
  for (const p of ["pro", "com", "sup", "im", "es", "dis", "op", "ri", "de", "pre", "scom", "sovrap", "inter", "ante"]) add(pre(p, porre));
  const trarre = it({
    inf: "trarre", type: "ere", ws: "tra", P: ["traggo", "trai", "trae", "traiamo", "traete", "traggono"],
    R: ["trassi", "traesti", "trasse", "traemmo", "traeste", "trassero"], F: "trarr",
    Sj: ["tragga", "tragga", "tragga", "traiamo", "traiate", "traggano"], tu: ["trai"], pp: "tratto",
  });
  add(trarre);
  for (const p of ["at", "con", "es", "sot", "dis", "as", "ri"]) add(pre(p, trarre));
  const rimanere = it({
    inf: "rimanere", type: "ere", ws: "riman", P: ["rimango", "rimani", "rimane", "rimaniamo", "rimanete", "rimangono"],
    R: ["rimasi", "rimanesti", "rimase", "rimanemmo", "rimaneste", "rimasero"], F: "rimarr",
    Sj: ["rimanga", "rimanga", "rimanga", "rimaniamo", "rimaniate", "rimangano"], tu: ["rimani"], pp: "rimasto",
  });
  add(rimanere);
  add(it({
    inf: "sedere", type: "ere", ws: "sed", P: ["siedo", "seggo", "siedi", "siede", "sediamo", "sedete", "siedono", "seggono"],
    R: ["sedei", "sedetti", "sedesti", "sedé", "sedette", "sedemmo", "sedeste", "sederono", "sedettero"], F: ["sedr", "seder"],
    Sj: ["sieda", "segga", "sieda", "segga", "sieda", "sediamo", "sediate", "siedano", "seggano"], tu: ["siedi"], pp: "seduto",
  }));
  const piacere = it({
    inf: "piacere", type: "ere", ws: "piac", P: ["piaccio", "piaci", "piace", "piacciamo", "piacete", "piacciono"],
    R: ["piacqui", "piacesti", "piacque", "piacemmo", "piaceste", "piacquero"], F: "piacer",
    Sj: ["piaccia", "piaccia", "piaccia", "piacciamo", "piacciate", "piacciano"], tu: ["piaci"], pp: "piaciuto",
  });
  add(piacere); add(pre("dis", piacere)); add(pre("com", piacere));
  add(it({
    inf: "tacere", type: "ere", ws: "tac", P: ["taccio", "taci", "tace", "taciamo", "tacete", "tacciono"],
    R: ["tacqui", "tacesti", "tacque", "tacemmo", "taceste", "tacquero"], F: "tacer",
    Sj: ["taccia", "taccia", "taccia", "taciamo", "taciate", "tacciano"], tu: ["taci"], pp: "taciuto",
  }));
  const valere = it({
    inf: "valere", type: "ere", ws: "val", P: ["valgo", "vali", "vale", "valiamo", "valete", "valgono"],
    R: ["valsi", "valesti", "valse", "valemmo", "valeste", "valsero"], F: "varr",
    Sj: ["valga", "valga", "valga", "valiamo", "valiate", "valgano"], tu: ["vali"], pp: "valso",
  });
  add(valere);
  add(it({
    inf: "parere", type: "ere", ws: "par", P: ["paio", "pari", "pare", "paiamo", "pariamo", "parete", "paiono"],
    R: ["parvi", "paresti", "parve", "paremmo", "pareste", "parvero"], F: "parr",
    Sj: ["paia", "paia", "paia", "paiamo", "pariamo", "paiate", "pariate", "paiano"], pp: "parso",
  }));
  add(it({
    inf: "morire", type: "ire", ws: "mor", P: ["muoio", "muori", "muore", "moriamo", "morite", "muoiono"],
    R: ["morii", "moristi", "morì", "morimmo", "moriste", "morirono"], F: ["morir", "morr"],
    Sj: ["muoia", "muoia", "muoia", "moriamo", "moriate", "muoiano"], tu: ["muori"], pp: "morto",
  }));
  add(it({
    inf: "spegnere", type: "ere", ws: "spegn", P: ["spengo", "spegni", "spegne", "spegniamo", "spegnete", "spengono"],
    R: ["spensi", "spegnesti", "spense", "spegnemmo", "spegneste", "spensero"], F: "spegner",
    Sj: ["spenga", "spenga", "spenga", "spegniamo", "spegniate", "spengano"], tu: ["spegni"], pp: "spento",
  }));
  add(it({
    inf: "muovere", type: "ere", ws: "mov", P: ["muovo", "muovi", "muove", "muoviamo", "moviamo", "muovete", "muovono"],
    R: ["mossi", "movesti", "mosse", "movemmo", "moveste", "mossero"], F: "muover",
    Sj: ["muova", "muova", "muova", "muoviamo", "moviamo", "muoviate", "moviate", "muovano"], tu: ["muovi"], pp: "mosso",
  }));
  add(pre("ri", ["muovere", "muovo", "muovi", "muove", "muoviamo", "muovete", "muovono", "movevo", "movevi", "moveva", "movevamo", "movevate", "movevano", "mossi", "movesti", "mosse", "movemmo", "moveste", "mossero", "muoverò", "muoverà", "muoverai", "muoveremo", "muoverete", "muoveranno", "muoverei", "muoverebbe", "muoverebbero", "muova", "muovano", "movendo", "mosso", "mossa", "mossi", "mosse"]));
  const cadere = it({
    inf: "cadere", type: "ere", ws: "cad", P: ["cado", "cadi", "cade", "cadiamo", "cadete", "cadono"],
    R: ["caddi", "cadesti", "cadde", "cademmo", "cadeste", "caddero"], F: "cadr",
    Sj: ["cada", "cada", "cada", "cadiamo", "cadiate", "cadano"], tu: ["cadi"], pp: "caduto",
  });
  add(cadere); add(pre("ac", cadere)); add(pre("de", cadere)); add(pre("ri", cadere)); add(pre("s", cadere));
  add(it({
    inf: "vivere", type: "ere", ws: "viv", P: ["vivo", "vivi", "vive", "viviamo", "vivete", "vivono"],
    R: ["vissi", "vivesti", "visse", "vivemmo", "viveste", "vissero"], F: "vivr",
    Sj: ["viva", "viva", "viva", "viviamo", "viviate", "vivano"], tu: ["vivi"], pp: "vissuto",
  }));
  add(it({
    inf: "apparire", type: "ire", ws: "appar", P: ["appaio", "appari", "appare", "appariamo", "apparite", "appaiono", "apparisco", "apparisci", "apparisce", "appariscono"],
    R: ["apparvi", "apparisti", "apparve", "apparimmo", "appariste", "apparvero", "apparii", "apparì", "apparirono"], F: "apparir",
    Sj: ["appaia", "appaia", "appaia", "appariamo", "appariate", "appaiano", "apparisca", "appariscano"], tu: ["appari", "apparisci"], pp: ["apparso", "apparito"],
  }));
  add(it({
    inf: "sparire", type: "ire", ws: "spar", P: ["sparisco", "sparisci", "sparisce", "spariamo", "sparite", "spariscono", "spaio", "spari", "spare", "spaiono"],
    R: ["sparii", "sparisti", "sparì", "sparimmo", "spariste", "sparirono", "sparvi", "sparve", "sparvero"], F: "sparir",
    Sj: ["sparisca", "sparisca", "sparisca", "spariamo", "spariate", "spariscano"], tu: ["sparisci"], pp: "sparito",
  }));

  // ---------- families ----------
  for (const v of ["scegliere", "togliere", "cogliere", "sciogliere", "raccogliere", "accogliere", "ritogliere"]) itGliere(v);
  for (const v of ["produrre", "condurre", "tradurre", "ridurre", "introdurre", "dedurre", "indurre", "sedurre", "riprodurre", "addurre"]) itUrre(v);
  const cono = itScere("conoscere", "conobb", "conosciuto");
  add(pre("ri", cono));
  itScere("crescere", "crebb", "cresciuto");
  itScere("nascere", "nacqu", "nato");

  // regular-present -ere verbs with strong remoto stem and irregular participle: [infinitive, strong stem, participle]
  const ERE = [
    ["scrivere", "scriss", "scritto"], ["leggere", "less", "letto"], ["prendere", "pres", "preso"], ["mettere", "mis", "messo"],
    ["chiedere", "chies", "chiesto"], ["rispondere", "rispos", "risposto"], ["vincere", "vins", "vinto"], ["spendere", "spes", "speso"],
    ["decidere", "decis", "deciso"], ["chiudere", "chius", "chiuso"], ["correre", "cors", "corso"], ["scendere", "sces", "sceso"],
    ["accendere", "acces", "acceso"], ["difendere", "difes", "difeso"], ["offendere", "offes", "offeso"], ["rendere", "res", "reso"],
    ["ridere", "ris", "riso"], ["dividere", "divis", "diviso"], ["uccidere", "uccis", "ucciso"], ["rompere", "rupp", "rotto"],
    ["nascondere", "nascos", "nascosto"], ["mordere", "mors", "morso"], ["giungere", "giuns", "giunto"], ["piangere", "pians", "pianto"],
    ["stringere", "strins", "stretto"], ["spingere", "spins", "spinto"], ["dipingere", "dipins", "dipinto"], ["porgere", "pors", "porto"],
    ["sorgere", "sors", "sorto"], ["proteggere", "protess", "protetto"], ["correggere", "corress", "corretto"], ["reggere", "ress", "retto"],
    ["dirigere", "diress", "diretto"], ["eleggere", "eless", "eletto"], ["esprimere", "espress", "espresso"], ["imprimere", "impress", "impresso"],
    ["comprimere", "compress", "compresso"], ["opprimere", "oppress", "oppresso"], ["concludere", "conclus", "concluso"], ["includere", "inclus", "incluso"],
    ["escludere", "esclus", "escluso"], ["distruggere", "distruss", "distrutto"], ["attendere", "attes", "atteso"], ["intendere", "intes", "inteso"],
    ["tendere", "tes", "teso"], ["stendere", "stes", "steso"], ["connettere", "conness", "connesso"], ["appendere", "appes", "appeso"],
    ["volgere", "vols", "volto"], ["svolgere", "svols", "svolto"], ["fingere", "fins", "finto"], ["tingere", "tins", "tinto"],
    ["cingere", "cins", "cinto"], ["spargere", "spars", "sparso"], ["rodere", "ros", "roso"], ["radere", "ras", "raso"], ["ledere", "les", "leso"],
    ["evadere", "evas", "evaso"], ["invadere", "invas", "invaso"], ["persuadere", "persuas", "persuaso"], ["dissuadere", "dissuas", "dissuaso"],
    ["assumere", "assuns", "assunto"], ["emergere", "emers", "emerso"], ["immergere", "immers", "immerso"], ["sommergere", "sommers", "sommerso"],
    ["espellere", "espuls", "espulso"], ["scuotere", "scoss", "scosso"], ["trascorrere", "trascors", "trascorso"], ["discutere", "discuss", "discusso"],
    ["percuotere", "percoss", "percosso"], ["concedere", "concess", "concesso"], ["succedere", "success", "successo"],
    ["crocifiggere", "crocifiss", "crocifisso"], ["affliggere", "affliss", "afflitto"], ["sospendere", "sospes", "sospeso"],
  ];
  for (const [inf, S, pp] of ERE) itEre(inf, { S, pp });
  itEre("perdere", { S: "pers", pp: ["perso", "perduto"], weak: true });

  // prefix families built from base paradigms
  const prendere = itEre("prendere", { S: "pres", pp: "preso" });
  for (const p of ["ap", "com", "sor", "ri", "intra"]) add(pre(p, prendere));
  const mettere = itEre("mettere", { S: "mis", pp: "messo" });
  for (const p of ["per", "pro", "am", "ri", "tras", "sotto", "com", "s", "o", "e", "dis", "inter"]) add(pre(p, mettere));
  const scrivere = itEre("scrivere", { S: "scriss", pp: "scritto" });
  for (const p of ["de", "i", "pre", "tra", "ri", "sotto"]) add(pre(p, scrivere));
  add(pre("ri", itEre("leggere", { S: "less", pp: "letto" })));
  add(pre("ri", itEre("chiedere", { S: "chies", pp: "chiesto" })));
  add(pre("cor", itEre("rispondere", { S: "rispos", pp: "risposto" })));
  add(pre("con", itEre("vincere", { S: "vins", pp: "vinto" })));
  add(pre("con", itEre("dividere", { S: "divis", pp: "diviso" })));
  add(pre("ri", itEre("chiudere", { S: "chius", pp: "chiuso" })));
  const correre = itEre("correre", { S: "cors", pp: "corso", F: "correr" });
  for (const p of ["ac", "oc", "s", "per", "ri", "soc", "con", "dis"]) add(pre(p, correre));
  add(pre("di", itEre("scendere", { S: "sces", pp: "sceso" })));
  add(pre("ri", itEre("accendere", { S: "acces", pp: "acceso" })));
  add(pre("ar", itEre("rendere", { S: "res", pp: "reso" })));
  const giungere = itEre("giungere", { S: "giuns", pp: "giunto" });
  for (const p of ["ag", "rag", "con"]) add(pre(p, giungere));
  const rompere = itEre("rompere", { S: "rupp", pp: "rotto" });
  for (const p of ["ri", "cor", "inter"]) add(pre(p, rompere));
  add(pre("ri", itEre("sorgere", { S: "sors", pp: "sorto" })));
  add(pre("sor", itEre("ridere", { S: "ris", pp: "riso" })));

  // verbs in -esistere (participle in -ito), regular present
  for (const v of ["esistere", "resistere", "assistere", "insistere", "persistere", "consistere", "desistere", "subsistere"]) {
    itEre(v, { pp: v.slice(0, -3) + "ito" });
  }
  // distinguere, estinguere
  for (const v of ["distinguere", "estinguere"]) {
    const s = v.slice(0, -3);
    const sS = v.slice(0, -6) + "ns";
    add(it({
      inf: v, type: "ere", ws: s, P: [s + "o", s + "i", s + "e", s + "iamo", s + "ete", s + "ono"],
      R: [sS + "i", s + "esti", sS + "e", s + "emmo", s + "este", sS + "ero"], F: s + "er",
      Sj: [s + "a", s + "a", s + "a", s + "iamo", s + "iate", s + "ano"], tu: [s + "i"], pp: v.slice(0, -6) + "nto",
    }));
  }
  itEre("godere", { F: "goder" });
  add(["godrò", "godrai", "godrà", "godremo", "godrete", "godranno", "godrei", "godresti", "godrebbe", "godremmo", "godreste", "godrebbero"]);
  // cuocere (cuocio ... cossi ... cotto)
  add(["cuocere", "cuocio", "cuoci", "cuoce", "cuociamo", "cociamo", "cuocete", "cuociono", "cuocevo", "cuocevi", "cuoceva", "cuocevamo", "cuocevate", "cuocevano",
    "cocevo", "cossi", "cuocesti", "cosse", "cuocemmo", "cuoceste", "cossero", "cuocerò", "cuocerai", "cuocerà", "cuoceremo", "cuocerete", "cuoceranno", "cuocerei",
    "cuocerebbe", "cuocerebbero", "cuocia", "cuociate", "cuociano", "cuocessi", "cuocesse", "cuocendo", "cotto", "cotta", "cotti", "cotte"]);

  // aprire / coprire / offrire family
  for (const v of ["aprire", "coprire", "scoprire", "offrire", "soffrire", "riaprire", "ricoprire", "riscoprire"]) {
    const s = v.slice(0, -3);
    itIre(v, 0, { strong: true, pp: s.slice(0, -1) + "erto" });
  }
  // -ire without -isc (2 = both patterns in use)
  for (const v of ["partire", "dormire", "sentire", "servire", "seguire", "vestire", "fuggire", "bollire", "divertire", "convertire", "invertire", "mentire",
    "ripartire", "consentire", "risentire", "assentire", "perseguire", "conseguire", "proseguire", "svestire", "travestire", "rivestire", "pentire", "sovvertire", "pervertire"]) {
    itIre(v, 0);
  }
  itIre("avvertire", 2);
  itIre("investire", 2);
  // -ire with -isc
  for (const v of [
    "finire", "capire", "preferire", "costruire", "spedire", "pulire", "garantire", "fornire", "stabilire", "dimagrire", "agire", "reagire", "unire", "ubbidire",
    "istruire", "distribuire", "attribuire", "contribuire", "sostituire", "suggerire", "digerire", "colpire", "svanire", "gestire", "tradire", "restituire", "punire",
    "guarire", "riferire", "ferire", "impedire", "esaurire", "arrossire", "ingrandire", "abolire", "demolire", "esibire", "inibire", "proibire", "differire", "intuire",
    "scolpire", "stupire", "inserire", "obbedire", "patire", "tossire", "applaudire", "arricchire", "approfondire", "seppellire", "sbalordire", "rapire", "ammonire",
    "appassire", "abbellire", "annerire", "ricostruire", "condire", "favorire", "fiorire", "marcire", "nutrire", "rifinire", "ripulire", "schermire", "spartire",
    "starnutire", "trasferire", "definire", "fallire", "ingerire", "istituire", "partorire", "perire", "prestabilire", "proferire", "ribadire", "rinvigorire",
    "rifornire", "schiarire", "sminuire", "smaltire", "subire", "vagire", "zittire", "conferire", "interferire", "impartire", "ammorbidire", "accudire", "adempire",
    "affievolire", "alleggerire", "assorbire", "bandire", "brunire", "chiarire", "colorire", "compatire", "concepire", "custodire", "decolorire", "deperire",
    "disubbidire", "erudire", "esaudire", "esordire", "espandire", "fluire", "forbire", "gradire", "imbastire", "imbandire", "impazzire", "impigrire", "impoverire",
    "incanutire", "inorridire", "insospettire", "intimidire", "inverdire", "ammutolire", "sostituire", "reinserire", "ristabilire", "sopperire",
  ]) {
    itIre(v, 1);
  }

  // ---------- regular -ere ----------
  for (const v of ["credere", "temere", "ricevere", "ripetere", "battere", "vendere", "accedere", "competere", "premere", "tessere", "gemere", "cedere", "mietere",
    "pendere", "splendere", "fremere", "recedere", "retrocedere", "rivendere", "precedere", "ricredere", "sopravvivere_", "sbattere", "abbattere", "combattere",
    "dibattere", "riscuotere_", "intendere_", "rispettare_"]) {
    if (v.endsWith("_")) continue;
    itEre(v);
  }

  // ---------- regular -are ----------
  const ARE = [
    "parlare", "contattare", "ordinare", "acquistare", "comprare", "prenotare", "visitare", "registrare", "scaricare", "installare", "confrontare", "esplorare",
    "consegnare", "chiamare", "riparare", "progettare", "sviluppare", "cucinare", "imparare", "aiutare", "trovare", "pagare", "usare", "creare", "migliorare",
    "consultare", "pubblicare", "cercare", "guardare", "ascoltare", "portare", "mostrare", "arrivare", "entrare", "tornare", "lavorare", "giocare", "camminare",
    "continuare", "guadagnare", "costare", "domandare", "spiegare", "presentare", "organizzare", "pianificare", "preparare", "formare", "supportare", "accompagnare",
    "semplificare", "ottimizzare", "configurare", "attivare", "validare", "confermare", "annullare", "modificare", "eliminare", "salvare", "stampare", "verificare",
    "testare", "realizzare", "incontrare", "superare", "rispettare", "adattare", "adottare", "trasportare", "traslocare", "affittare", "aumentare", "innovare", "ispirare",
    "motivare", "celebrare", "sperare", "considerare", "operare", "abitare", "amare", "pensare", "restare", "passare", "nuotare", "ricordare", "dimenticare", "mancare",
    "importare", "funzionare", "bastare", "accettare", "rifiutare", "apprezzare", "desiderare", "aspettare", "lasciare", "viaggiare", "mangiare", "cominciare", "iniziare",
    "cambiare", "risparmiare", "studiare", "lanciare", "copiare", "annunciare", "negoziare", "associare", "sbagliare", "svegliare", "tagliare", "baciare", "bruciare",
    "caricare", "indicare", "applicare", "comunicare", "fabbricare", "praticare", "toccare", "attaccare", "bloccare", "cliccare", "navigare", "collegare", "delegare",
    "legare", "litigare", "frugare", "bagnare", "insegnare", "disegnare", "firmare", "stimare", "controllare", "monitorare", "analizzare", "valutare", "calcolare",
    "misurare", "amministrare", "coordinare", "partecipare", "collaborare", "informare", "notificare", "avvisare", "segnalare", "riportare", "autorizzare", "limitare",
    "richiamare", "criptare", "ripristinare", "recuperare", "sincronizzare", "incollare", "rinominare", "filtrare", "classificare", "scansionare", "digitalizzare",
    "automatizzare", "personalizzare", "aggiornare", "commentare", "votare", "consigliare", "orientare", "guidare", "allenare", "ripassare", "memorizzare", "educare",
    "sensibilizzare", "illustrare", "dimostrare", "provare", "argomentare", "fidelizzare", "integrare", "raggruppare", "mobilitare", "stimolare", "modernizzare",
    "regolare", "calibrare", "programmare", "compilare", "ricaricare", "depositare", "prelevare", "versare", "rimborsare", "prestare", "finanziare", "fatturare",
    "incassare", "commerciare", "esportare", "reclutare", "licenziare", "fondare", "sponsorizzare", "pareggiare", "arbitrare", "festeggiare", "invitare", "ospitare",
    "alloggiare", "cancellare", "volare", "atterrare", "decollare", "imbarcare", "sbarcare", "campeggiare", "fotografare", "filmare", "montare", "taggare",
    "disattivare", "disinstallare", "implementare", "migrare", "scalare", "rilasciare", "tracciare", "autenticare", "cifrare", "decifrare", "completare", "allegare",
    "inoltrare", "indicizzare", "posizionare", "monetizzare", "segmentare", "catturare", "tentare", "cenare", "pranzare", "gustare", "assaggiare", "grigliare",
    "pelare", "sbucciare", "decorare", "arredare", "ristrutturare", "lavare", "stirare", "asciugare", "pettinare", "truccare", "profumare", "curare", "coltivare",
    "piantare", "annaffiare", "pescare", "cacciare", "diventare", "allevare", "passeggiare", "riposare", "meditare", "respirare", "allungare", "saltare", "arrampicare",
    "afferrare", "mirare", "ringraziare", "salutare", "augurare", "abbracciare", "sposare", "ricordare", "ripetere_", "navigare", "abbonare", "iscrivere_", "scaricare",
    "cancellare", "pubblicizzare", "promuovere_", "condividere_", "distribuire_", "ottenere_", "assicurare", "proporre_", "offrire_", "raccomandare", "consumare",
    "utilizzare", "applicare", "eseguire_", "lavorare", "occupare", "preoccupare", "evitare", "citare", "menzionare", "descrivere_", "riflettere_", "evidenziare",
    "sottolineare", "richiedere_", "interessare", "appassionare", "entusiasmare", "emozionare", "sorprendere_", "stupire_", "divertire_", "rilassare", "riposare",
  ];
  const stressed = new Set(["inviare", "avviare", "sciare", "spiare", "riavviare"]);
  const seenA = new Set();
  for (const v of [...ARE, "inviare", "avviare", "riavviare", "spiare", "sciare"]) {
    if (!v.endsWith("are") || seenA.has(v)) continue;
    seenA.add(v);
    itAre(v, stressed.has(v));
  }
  return [...out];
}

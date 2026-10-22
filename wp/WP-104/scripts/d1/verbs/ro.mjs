// WP-104 d1: Romanian verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + irregular tables.
// Simple forms of: prezent, imperfect, perfect simplu, mai-mult-ca-perfect, subjunctiv (3sg/3pl -e/-ă), imperativ,
// infinitiv (without "a"), participiu (4 forms), gerunziu, plus the auxiliaries of perfect compus / viitor / condițional.
// s/t with comma below are written; the cedilla variants (ş, ţ) are emitted as well. The bare auxiliary "a" is NOT included
// (it is the infinitive marker / genitive article); long infinitives (cântare) are not included.
export default function forms() {
  const out = new Set();
  const add = (arr) => { for (const x of arr) if (x) out.add(x); };
  const pre = (p, arr) => arr.map((x) => p + x);
  const A = ["am", "ai", "a", "am", "ați", "au"];
  const E = ["eam", "eai", "ea", "eam", "eați", "eau"];

  // palatalisation of a stem before -i (2sg, plural participle): t->ț, d->z, s->ș, st->ști
  const pal = (s) => {
    if (s.endsWith("st")) return s.slice(0, -2) + "șt";
    if (s.endsWith("t")) return s.slice(0, -1) + "ț";
    if (s.endsWith("d")) return s.slice(0, -1) + "z";
    if (s.endsWith("s")) return s.slice(0, -1) + "ș";
    return s;
  };
  const ppf = (ms) => [ms, ms + "ă", pal(ms) + "i", ms + "e"];

  // general builder. o: inf, P[6], is (imperfect stem), ia (use -am endings), B (perfect simplu base), B3, Bm (mccp base),
  //  S[6] or S3, imper[], pp, ger, IMP[6] override
  function roG(o) {
    const r = [o.inf, ...o.P];
    r.push(...(o.IMP ?? (o.ia ? A : E).map((e) => o.is + e)));
    const B = o.B;
    r.push(B + "i", B + "și", o.B3 ?? B, B + "răm", B + "răți", B + "ră");
    const Bm = o.Bm ?? B;
    r.push(Bm + "sem", Bm + "seși", Bm + "se", Bm + "serăm", Bm + "serăți", Bm + "seră");
    r.push(...(o.S ?? [o.P[0], o.P[1], o.S3, o.P[3], o.P[4], o.S3]));
    r.push(...(o.imper ?? []));
    for (const p of Array.isArray(o.pp) ? o.pp : [o.pp]) r.push(...ppf(p));
    r.push(o.ger);
    return r;
  }

  // ---------- class I (-a) ----------
  function roA(inf, o = {}) {
    const base = inf.slice(0, -1);
    let P, S3;
    if (o.ez) {
      const third = base.endsWith("i") ? base + "ază" : base + "ează";
      P = [base + "ez", base + "ezi", third, base + "ăm", base + "ați", third];
      S3 = base + "eze";
    } else {
      P = o.P ?? [base, pal(base) + "i", base + "ă", base + "ăm", base + "ați", base + "ă"];
      S3 = o.S3 ?? base + "e";
    }
    const r = roG({
      inf, P, is: base, ia: true, B: inf, B3: base.endsWith("i") ? inf : base + "ă", S3, imper: [P[2], P[4]],
      pp: base + "at", ger: base + "ând",
    });
    add(r);
    return r;
  }
  // irregular -a verbs given as [inf, "p0,p1,p2,p3,p4,p5", S3]
  const roAx = (inf, p, S3) => roA(inf, { P: p.split(","), S3 });

  // ---------- class IV (-i): -esc verbs, or explicit forms ----------
  function roI(inf, o = {}) {
    const base = inf.slice(0, -1);
    const voc = /[aeiouăâî]$/.test(base);
    let P, S3, imper;
    if (!o.P) {
      const e = voc ? "i" : "";
      P = [base + e + "esc", base + e + "ești", base + e + "ește", base + "im", base + "iți", base + e + "esc"];
      S3 = voc ? base + "iască" : base + "ească";
      imper = [base + e + "ește", base + "iți"];
    } else {
      P = o.P.split(",");
      S3 = o.S3;
      imper = o.imper ?? [inf, base + "iți"];
    }
    const r = roG({
      inf, P, is: voc ? inf : base, ia: voc, B: inf, S3, imper, pp: base + "it", ger: base + "ind",
    });
    add(r);
    return r;
  }

  // ---------- class III -e verbs: [inf, perfect-simplu base, participle, subjunctive 3rd, overrides] ----------
  function roIII(inf, B, pp, S3, o = {}) {
    const base = inf.slice(0, -1);
    const P = o.P ? o.P.split(",") : [base, pal(base) + "i", inf, base + "em", base + "eți", base];
    const r = roG({
      inf, P, is: o.is ?? base, B, B3: o.B3, S3, imper: o.imper ?? [inf, P[4]], pp, ger: o.ger ?? base + "ând",
    });
    add(r);
    return r;
  }
  // -mite family: trimite, permite, promite, admite, transmite, omite, emite, comite
  function roMite(inf) {
    const base = inf.slice(0, -1);
    const st = base.slice(0, -1);
    const P = [base, st + "ți", inf, base + "em", base + "eți", base];
    const r = roG({
      inf, P, is: base, B: st + "se", S3: base + "ă", imper: [inf, base + "eți"],
      pp: st + "s", ger: st + "țând",
    });
    add(r);
    return r;
  }
  // -de verbs with d->z: deschide, închide, decide, ucide, divide, prinde, aprinde, cuprinde, surprinde, răspunde
  function roDe(inf, B, pp) {
    const base = inf.slice(0, -1);
    const P = [base, base.slice(0, -1) + "zi", inf, base + "em", base + "eți", base];
    const r = roG({
      inf, P, is: base, B, S3: base + "ă", imper: [inf, base + "eți"], pp, ger: base.slice(0, -1) + "zând",
    });
    add(r);
    return r;
  }

  // ---------- auxiliaries and fully irregular verbs ----------
  add(["aș", "ar", "ați", "au", "am", "ai", "voi", "vei", "va", "vom", "veți", "vor"]);
  add(roG({
    inf: "fi", P: ["sunt", "ești", "este", "e", "suntem", "sunteți"], IMP: ["eram", "erai", "era", "eram", "erați", "erau"],
    B: "fu", Bm: "fuse", S: ["fiu", "fii", "fie", "fim", "fiți", "fie"], imper: ["fii", "fiți"], pp: "fost", ger: "fiind",
  }));
  add(roG({
    inf: "avea", P: ["am", "ai", "are", "avem", "aveți", "au"], is: "av", B: "avu", Bm: "avuse",
    S: ["am", "ai", "aibă", "avem", "aveți", "aibă"], imper: ["ai", "aveți", "aibă"], pp: "avut", ger: "având",
  }));
  const face = roG({
    inf: "face", P: ["fac", "faci", "face", "facem", "faceți", "fac"], is: "făc", B: "făcu",
    S3: "facă", imper: ["fă", "faceți"], pp: "făcut", ger: "făcând",
  });
  add(face);
  for (const p of ["des", "re", "satis"]) add(pre(p, face.filter((x) => x !== "fă")));
  add(roG({
    inf: "putea", P: ["pot", "poți", "poate", "putem", "puteți", "pot"], is: "put", B: "putu",
    S3: "poată", pp: "putut", ger: "putând",
  }));
  add(roG({
    inf: "vrea", P: ["vreau", "vrei", "vrea", "vrem", "vreți", "vor"], IMP: ["voiam", "voiai", "voia", "voiam", "voiați", "voiau"], B: "vru",
    S: ["vreau", "vrei", "vrea", "vrem", "vreți", "vrea"], pp: "vrut", ger: "vrând",
  }));
  add(roG({
    inf: "ști", P: ["știu", "știi", "știe", "știm", "știți", "știu"], is: "ști", ia: true, B: "știu",
    S: ["știu", "știi", "știe", "știm", "știți", "știe"], imper: ["știi", "știți"], pp: "știut", ger: "știind",
  }));
  const veni = roG({
    inf: "veni", P: ["vin", "vii", "vine", "venim", "veniți", "vin"], is: "ven", B: "veni",
    S: ["vin", "vii", "vină", "venim", "veniți", "vină"], imper: ["vino", "veniți"], pp: "venit", ger: "venind",
  });
  add(veni);
  for (const p of ["de", "re", "con", "pre", "inter", "pro", "sur", "sub"]) add(pre(p, veni));
  roIII("merge", "merse", "mers", "meargă", { imper: ["mergi", "mergeți"] });
  add(roG({
    inf: "da", P: ["dau", "dai", "dă", "dăm", "dați", "dau"], is: "dăd", B: "dădu",
    S: ["dau", "dai", "dea", "dăm", "dați", "dea"], imper: ["dă", "dați"], pp: "dat", ger: "dând",
  }));
  add(roG({
    inf: "sta", P: ["stau", "stai", "stă", "stăm", "stați", "stau"], is: "stăt", B: "stătu",
    S: ["stau", "stai", "stea", "stăm", "stați", "stea"], imper: ["stai", "stați"], pp: "stat", ger: "stând",
  }));
  const lua = roG({
    inf: "lua", P: ["iau", "iei", "ia", "luăm", "luați", "iau"], is: "lu", ia: true, B: "lua", B3: "luă",
    S: ["iau", "iei", "ia", "luăm", "luați", "ia"], imper: ["ia", "luați"], pp: "luat", ger: "luând",
  });
  add(lua); add(pre("pre", lua));
  add(roG({
    inf: "bea", P: ["beau", "bei", "bea", "bem", "beți", "beau"], is: "be", ia: true, B: "bău",
    S: ["beau", "bei", "bea", "bem", "beți", "bea"], imper: ["bea", "beți"], pp: "băut", ger: "bând",
  }));
  const vedea = roG({
    inf: "vedea", P: ["văd", "vezi", "vede", "vedem", "vedeți", "văd"], is: "ved", B: "văzu",
    S3: "vadă", imper: ["vezi", "vedeți"], pp: "văzut", ger: "văzând",
  });
  add(vedea); add(pre("pre", vedea));
  roIII("spune", "spuse", "spus", "spună", { P: "spun,spui,spune,spunem,spuneți,spun" });
  const pune = roIII("pune", "puse", "pus", "pună", { P: "pun,pui,pune,punem,puneți,pun" });
  for (const p of ["pro", "com", "ex", "im", "dis", "su", "de", "re", "o", "descom"]) add(pre(p, pune));
  const scrie = roG({
    inf: "scrie", P: ["scriu", "scrii", "scrie", "scriem", "scrieți", "scriu"], is: "scri", ia: true, B: "scrise",
    S: ["scriu", "scrii", "scrie", "scriem", "scrieți", "scrie"], imper: ["scrie", "scrieți"], pp: "scris", ger: "scriind",
  });
  add(scrie);
  for (const p of ["de", "în", "pre", "trans", "sub", "re"]) add(pre(p, scrie));
  const tine = roG({
    inf: "ține", P: ["țin", "ții", "ține", "ținem", "țineți", "țin"], is: "țin", B: "ținu",
    S3: "țină", imper: ["ține", "țineți"], pp: "ținut", ger: "ținând",
  });
  add(tine);
  for (const p of ["ob", "men", "con", "de", "re", "apar", "sus", "în", "între", "abs"]) add(pre(p, tine));
  const duce = roIII("duce", "duse", "dus", "ducă", { imper: ["du", "duceți"] });
  for (const p of ["a", "con", "pro", "re", "intro", "de", "tra", "in", "se"]) add(pre(p, duce.filter((x) => x !== "du")));
  add(["adu", "condu", "redu", "dedu", "tradu", "indu", "introdu"]);
  roIII("cere", "ceru", "cerut", "ceară");
  roIII("crede", "crezu", "crezut", "creadă", { P: "cred,crezi,crede,credem,credeți,cred", ger: "crezând" });
  add(roG({
    inf: "cădea", P: ["cad", "cazi", "cade", "cădem", "cădeți", "cad"], is: "căd", B: "căzu",
    S3: "cadă", imper: ["cazi", "cădeți"], pp: "căzut", ger: "căzând",
  }));
  roIII("rămâne", "rămăse", "rămas", "rămână", { B3: "rămase", imper: ["rămâi", "rămâneți"], P: "rămân,rămâi,rămâne,rămânem,rămâneți,rămân" });
  roIII("ajunge", "ajunse", "ajuns", "ajungă");
  roIII("alege", "alese", "ales", "aleagă");
  roIII("culege", "culese", "cules", "culeagă");
  roIII("înțelege", "înțelese", "înțeles", "înțeleagă");
  roIII("atinge", "atinse", "atins", "atingă");
  roIII("trece", "trecu", "trecut", "treacă");
  roIII("petrece", "petrecu", "petrecut", "petreacă");
  roIII("începe", "începu", "început", "înceapă");
  roIII("zice", "zise", "zis", "zică", { imper: ["zi", "ziceți"] });
  roIII("bate", "bătu", "bătut", "bată", { is: "băt", ger: "bătând" });
  roIII("trimite", "trimise", "trimis", "trimită", { P: "trimit,trimiți,trimite,trimitem,trimiteți,trimit", ger: "trimițând" });
  roIII("vinde", "vându", "vândut", "vândă", { P: "vând,vinzi,vinde,vindem,vindeți,vând", is: "vind", ger: "vânzând" });
  roIII("pierde", "pierdu", "pierdut", "piardă", { P: "pierd,pierzi,pierde,pierdem,pierdeți,pierd", ger: "pierzând" });
  roIII("răspunde", "răspunse", "răspuns", "răspundă", { P: "răspund,răspunzi,răspunde,răspundem,răspundeți,răspund", ger: "răspunzând" });
  for (const v of ["permite", "promite", "admite", "transmite", "omite", "emite", "comite"]) roMite(v);
  for (const [v, B, pp] of [["deschide", "deschise", "deschis"], ["închide", "închise", "închis"], ["decide", "decise", "decis"], ["ucide", "ucise", "ucis"],
    ["divide", "divise", "divis"], ["prinde", "prinse", "prins"], ["aprinde", "aprinse", "aprins"], ["cuprinde", "cuprinse", "cuprins"],
    ["surprinde", "surprinse", "surprins"]]) {
    roDe(v, B, pp);
  }
  roIII("stinge", "stinse", "stins", "stingă");
  add(roG({
    inf: "cunoaște", P: ["cunosc", "cunoști", "cunoaște", "cunoaștem", "cunoașteți", "cunosc"], is: "cunoșt", B: "cunoscu",
    S3: "cunoască", imper: ["cunoaște", "cunoașteți"], pp: "cunoscut", ger: "cunoscând",
  }));
  add(["recunosc", "recunoști", "recunoaște", "recunoaștem", "recunoașteți", "recunoșteam", "recunoșteai", "recunoștea", "recunoșteați", "recunoșteau", "recunoscui", "recunoscu", "recunoscură", "recunoască", "recunoscut", "recunoscută", "recunoscuți", "recunoscute", "recunoscând", "recunoaște", "recunoaștem", "recunoscusem"]);
  add(roG({
    inf: "crește", P: ["cresc", "crești", "crește", "creștem", "creșteți", "cresc"], is: "creșt", B: "crescu",
    S3: "crească", imper: ["crește", "creșteți"], pp: "crescut", ger: "crescând",
  }));
  add(roG({
    inf: "părea", P: ["par", "pari", "pare", "părem", "păreți", "par"], is: "păr", B: "păru",
    S3: "pară", pp: "părut", ger: "părând",
  }));
  add(roG({
    inf: "plăcea", P: ["plac", "placi", "place", "plăcem", "plăceți", "plac"], is: "plăc", B: "plăcu",
    S3: "placă", imper: ["place", "plăceți"], pp: "plăcut", ger: "plăcând",
  }));
  add(roG({
    inf: "muri", P: ["mor", "mori", "moare", "murim", "muriți", "mor"], is: "mur", B: "muri",
    S3: "moară", imper: ["mori", "muriți"], pp: "murit", ger: "murind",
  }));
  add(roG({
    inf: "ieși", P: ["ies", "ieși", "iese", "ieșim", "ieșiți", "ies"], is: "ieș", B: "ieși",
    S3: "iasă", imper: ["ieși", "ieșiți"], pp: "ieșit", ger: "ieșind",
  }));
  add(roG({
    inf: "hotărî", P: ["hotărăsc", "hotărăști", "hotărăște", "hotărâm", "hotărâți", "hotărăsc"], is: "hotăr", ia: true, B: "hotărâ", B3: "hotărî",
    S3: "hotărască", imper: ["hotărăște", "hotărâți"], pp: "hotărât", ger: "hotărând",
  }));
  for (const [v, b] of [["coborî", "cobor"], ["omorî", "omor"]]) {
    add(roG({
      inf: v, P: [b, b + "i", b.slice(0, -1) + "ară", b + "âm", b + "âți", b.slice(0, -1) + "ară"], is: b, ia: true, B: b + "â", B3: v,
      S3: b.slice(0, -1) + "are", imper: [b.slice(0, -1) + "ară", b + "âți"], pp: b + "ât", ger: b + "ând",
    }));
  }
  add(["trebui", "trebuie", "trebuia", "trebuiau", "trebuiască", "trebuiră", "trebuit", "trebuind", "trebuiesc", "trebuiești", "trebuim", "trebuiți", "trebuiam", "trebuiai", "trebuiseră", "trebuise"]);
  add(["costă", "costa", "costau", "costase", "costat", "costând", "coste", "costară", "costă", "cost", "costăm", "costați"]);

  // ---------- class IV with -esc (regular) ----------
  for (const v of [
    "iubi", "citi", "primi", "mulțumi", "vorbi", "locui", "trăi", "găsi", "plăti", "folosi", "economisi", "construi", "reuși", "servi", "pregăti", "găti", "călători",
    "îmbunătăți", "privi", "dori", "gândi", "numi", "hrăni", "porni", "opri", "sfârși", "trezi", "munci", "uni", "răni", "sprijini", "lipsi", "mărturisi",
    "cheltui", "pedepsi", "zâmbi", "ghici", "grăbi", "lămuri", "isprăvi", "dezvălui", "îndrăzni", "izbuti", "pustii", "pieri", "sosi", "mări", "înverzi",
    "îmbogăți", "întări", "răcori", "încălzi", "reînnoi", "înnoi", "stabili", "distribui", "contribui", "atribui", "înlocui", "restitui", "garanti", "împlini",
    "găzdui", "ameți", "pomi", "orbi", "slăbi", "obosi", "îmbătrâni", "întineri", "înnebuni", "amorți", "stârni", "clipi", "plesni", "pocni", "râvni", "slobozi",
    "lovi", "ocroti", "stropi", "înghiți", "mărgini", "tânji", "ocoli", "pătimi",
  ]) {
    roI(v);
  }
  // class IV without -esc
  roI("dormi", { P: "dorm,dormi,doarme,dormim,dormiți,dorm", S3: "doarmă", imper: ["dormi", "dormiți"] });
  roI("fugi", { P: "fug,fugi,fuge,fugim,fugiți,fug", S3: "fugă", imper: ["fugi", "fugiți"] });
  roI("simți", { P: "simt,simți,simte,simțim,simțiți,simt", S3: "simtă", imper: ["simte", "simțiți"] });
  roI("minți", { P: "mint,minți,minte,mințim,mințiți,mint", S3: "mintă", imper: ["minte", "mințiți"] });
  roI("oferi", { P: "ofer,oferi,oferă,oferim,oferiți,oferă", S3: "ofere", imper: ["oferă", "oferiți"] });
  roI("descoperi", { P: "descopăr,descoperi,descoperă,descoperim,descoperiți,descoperă", S3: "descopere", imper: ["descoperă", "descoperiți"] });
  roI("acoperi", { P: "acopăr,acoperi,acoperă,acoperim,acoperiți,acoperă", S3: "acopere", imper: ["acoperă", "acoperiți"] });
  roI("suferi", { P: "sufăr,suferi,suferă,suferim,suferiți,suferă", S3: "sufere", imper: ["suferă", "suferiți"] });
  roI("sări", { P: "sar,sari,sare,sărim,săriți,sar", S3: "sară", imper: ["sari", "săriți"] });

  // ---------- class I (-a) ----------
  // -ez verbs
  for (const v of [
    "utiliza", "organiza", "personaliza", "optimiza", "instala", "vizita", "contacta", "livra", "salva", "expedia", "explora", "beneficia", "furniza", "apela",
    "abona", "proteja", "repara", "proiecta", "crea", "accesa", "plasa", "partaja", "activa", "valida", "configura", "conecta", "testa", "anula", "achiziționa",
    "lucra", "visa", "dansa", "studia", "asocia", "motiva", "inspira", "inova", "selecta", "implementa", "integra", "monitoriza", "sincroniza", "actualiza",
    "autoriza", "analiza", "vizualiza", "prioriza", "digitaliza", "automatiza", "standardiza", "armoniza", "colabora", "participa", "informa", "alerta", "raporta",
    "controla", "estima", "evalua", "limita", "restaura", "filtra", "comenta", "ilustra", "argumenta", "grupa", "stimula", "moderniza", "ajusta", "programa",
    "compila", "migra", "poziționa", "segmenta", "captura", "planta", "gestiona", "opera", "antrena", "memora", "cita", "menționa", "evidenția", "sublinia",
    "interesa", "emoționa", "relaxa", "iniția", "negocia", "copia", "cripta", "arhiva", "indexa", "înregistra", "finanța", "sponsoriza", "angaja", "recruta",
    "coordona", "fonda", "invita", "transfera", "încasa", "factura", "localiza", "minimiza", "maximiza", "atașa", "deranja", "inaugura", "ordona", "reda",
    "păstra", "echipa", "dota", "recicla", "simula", "calibra", "formata", "depana", "securiza", "digitiza", "rezuma", "adopta", "ataca", "comercializa",
    "premia", "exersa", "naviga", "surfa", "fotografia", "filma", "monta", "edita",
  ]) {
    roA(v, { ez: true });
  }
  // regular non -ez (consonant stem, palatalisation of the 2sg handled)
  for (const v of [
    "ajuta", "compara", "asigura", "rezerva", "consulta", "transporta", "dezvolta", "publica", "modifica", "elimina", "verifica", "confirma", "imprima", "importa",
    "exporta", "termina", "schimba", "câștiga", "calcula", "comunica", "anunța", "renunța", "pronunța", "plimba", "cânta", "suna", "urca", "uita", "aduna",
    "notifica", "certifica", "solicita", "reclama", "clasifica", "educa", "cultiva", "ocupa", "preocupa", "evita", "autentifica", "aplica", "explica", "indica",
    "simplifica", "justifica", "specifica", "identifica", "unifica", "muta", "adăuga", "salta", "nota", "vota", "completa", "elibera", "înlătura", "scăpa",
    "tolera", "regreta", "aprecia", "regla", "încuraja", "propaga",
  ]) {
    roA(v);
  }
  roA("comanda", { P: "comand,comanzi,comandă,comandăm,comandați,comandă".split(","), S3: "comande" });
  add(["comandi"]);
  roA("recomanda", { P: "recomand,recomanzi,recomandă,recomandăm,recomandați,recomandă".split(","), S3: "recomande" });
  add(["recomandi"]);
  roAx("mânca", "mănânc,mănânci,mănâncă,mâncăm,mâncați,mănâncă", "mănânce");
  roAx("cumpăra", "cumpăr,cumperi,cumpără,cumpărăm,cumpărați,cumpără", "cumpere");
  roAx("număra", "număr,numeri,numără,numărăm,numărați,numără", "numere");
  roAx("căuta", "caut,cauți,caută,căutăm,căutați,caută", "caute");
  roAx("lăsa", "las,lași,lasă,lăsăm,lăsați,lasă", "lase");
  roAx("arăta", "arăt,arăți,arată,arătăm,arătați,arată", "arate");
  roAx("purta", "port,porți,poartă,purtăm,purtați,poartă", "poarte");
  roAx("învăța", "învăț,înveți,învață,învățăm,învățați,învață", "învețe");
  roAx("chema", "chem,chemi,cheamă,chemăm,chemați,cheamă", "cheme");
  roAx("întreba", "întreb,întrebi,întreabă,întrebăm,întrebați,întreabă", "întrebe");
  roAx("pleca", "plec,pleci,pleacă,plecăm,plecați,pleacă", "plece");
  roAx("juca", "joc,joci,joacă,jucăm,jucați,joacă", "joace");
  roAx("ruga", "rog,rogi,roagă,rugăm,rugați,roagă", "roage");
  roAx("afla", "aflu,afli,află,aflăm,aflați,află", "afle");
  roAx("intra", "intru,intri,intră,intrăm,intrați,intră", "intre");
  roAx("încerca", "încerc,încerci,încearcă,încercăm,încercați,încearcă", "încerce");
  roAx("descărca", "descarc,descarci,descarcă,descărcăm,descărcați,descarcă", "descarce");
  roAx("încărca", "încarc,încarci,încarcă,încărcăm,încărcați,încarcă", "încarce");
  roAx("spăla", "spăl,speli,spală,spălăm,spălați,spală", "spele");
  roAx("umbla", "umblu,umbli,umblă,umblăm,umblați,umblă", "umble");
  roAx("aștepta", "aștept,aștepți,așteaptă,așteptăm,așteptați,așteaptă", "aștepte");
  roAx("alerga", "alerg,alergi,aleargă,alergăm,alergați,aleargă", "alerge");
  roAx("înota", "înot,înoți,înoată,înotăm,înotați,înoată", "înoate");
  roAx("lega", "leg,legi,leagă,legăm,legați,leagă", "lege");
  roAx("gusta", "gust,guști,gustă,gustăm,gustați,gustă", "guste");
  roAx("curăța", "curăț,cureți,curăță,curățăm,curățați,curăță", "curețe");
  roAx("prezenta", "prezint,prezinți,prezintă,prezentăm,prezentați,prezintă", "prezinte");
  roAx("reprezenta", "reprezint,reprezinți,reprezintă,reprezentăm,reprezentați,reprezintă", "reprezinte");
  roAx("continua", "continui,continui,continuă,continuăm,continuați,continuă", "continue");
  roAx("însemna", "înseamn,însemni,înseamnă,însemnăm,însemnați,înseamnă", "însemne");
  roAx("sufla", "suflu,sufli,suflă,suflăm,suflați,suflă", "sufle");

  // cedilla variants of the comma-below letters (ş ţ)
  for (const w of [...out]) {
    if (/[șț]/.test(w)) out.add(w.replaceAll("ș", "ş").replaceAll("ț", "ţ"));
  }
  return [...out];
}

// WP-104 d1: Portuguese verb forms (SE-121), European and Brazilian. Authored from linguistic knowledge;
// paradigm generators + irregular tables. Simple forms of: presente (incl. vós), pretérito perfeito (falamos/falámos),
// imperfeito, mais-que-perfeito simples, futuro, condicional, presente / imperfeito / futuro do conjuntivo,
// imperativo, infinitivo (impessoal and pessoal), particípio (4 forms), gerúndio.
export default function forms() {
  const out = new Set();
  const add = (arr) => { for (const x of arr) if (x) out.add(x); };
  const pre = (p, arr, fix = {}) => arr.map((x) => p + (Object.hasOwn(fix, x) ? fix[x] : x));
  const pp4 = (ms) => [ms, ms.slice(0, -1) + "a", ms + "s", ms.slice(0, -1) + "as"];
  const isV = (c) => "aeiouáéíóúâêôãõ".includes(c);
  void isV;

  // spelling adjustment of a stem before e (-ar) / o,a (-er, -ir)
  function sp(stem, ty, nxt) {
    if (ty === "ar" && nxt === "e") {
      if (stem.endsWith("c")) return stem.slice(0, -1) + "qu";
      if (stem.endsWith("g")) return stem + "u";
      if (stem.endsWith("ç")) return stem.slice(0, -1) + "c";
      return stem;
    }
    if (ty !== "ar" && (nxt === "o" || nxt === "a")) {
      if (stem.endsWith("gu")) return stem.slice(0, -1);
      if (stem.endsWith("g")) return stem.slice(0, -1) + "j";
      if (stem.endsWith("c")) return stem.slice(0, -1) + "ç";
    }
    return stem;
  }

  // common finishing step. o: inf, P[6], I[6], T[6], F, S[6], tu, vos, ger, pp, open, ibase, hiat
  function ptFin(o) {
    const ACC = { a: "á", e: o.open ? "é" : "ê", i: "í", o: "ô", u: "ú" };
    const acc = (s) => { const c = s.slice(-1); return ACC[c] ? s.slice(0, -1) + ACC[c] : s; };
    const r = [o.inf, ...o.P, ...o.I, ...o.T, ...o.S];
    if (o.T[3].endsWith("amos")) r.push(o.T[3].slice(0, -4) + "ámos");
    r.push(...["ei", "ás", "á", "emos", "eis", "ão"].map((e) => o.F + e));
    r.push(...["ia", "ias", "ia", "íamos", "íeis", "iam"].map((e) => o.F + e));
    const stR = o.T[5].slice(0, -3);
    r.push(stR + "ra", stR + "ras", stR + "ra", acc(stR) + "ramos", acc(stR) + "reis", stR + "ram");
    r.push(stR + "sse", stR + "sses", stR + "sse", acc(stR) + "ssemos", acc(stR) + "sseis", stR + "ssem");
    if (o.hiat) {
      const s0 = o.inf.slice(0, -2);
      r.push(o.inf, s0 + "íres", s0 + "írem", o.inf + "mos", o.inf + "des");
    } else {
      for (const b of [stR + "r", o.ibase ?? o.inf]) r.push(b, b + "es", b + "mos", b + "des", b + "em");
    }
    r.push(o.tu, o.vos, o.ger);
    for (const p of Array.isArray(o.pp) ? o.pp : [o.pp]) r.push(...pp4(p));
    return r;
  }

  // generic regular / alternating / spelling-changing verb
  // o: y (1sg + subjunctive stem), yw (subjunctive nós/vós stem), alt [from,to] (2sg/3sg/3pl stem change),
  //    st (explicit strong stem), pp, altBoth (also keep unaltered forms), F, extra
  function pt(inf, o = {}) {
    const ty = inf.slice(-2);
    const s0 = inf.slice(0, -2);
    const alt = o.alt ? s0.replace(new RegExp(o.alt[0] + "(?!.*" + o.alt[0] + ")"), o.alt[1]) : s0;
    const st = o.st ?? alt;
    const E = {
      ar: ["o", "as", "a", "amos", "ais", "am"],
      er: ["o", "es", "e", "emos", "eis", "em"],
      ir: ["o", "es", "e", "imos", "is", "em"],
    }[ty];
    const yo = o.y ?? sp(s0, ty, "o");
    const P = [yo + "o", st + E[1], o.p3 ?? st + E[2], s0 + E[3], s0 + E[4], st + E[5]];
    const I = (ty === "ar" ? ["ava", "avas", "ava", "ávamos", "áveis", "avam"] : ["ia", "ias", "ia", "íamos", "íeis", "iam"]).map((e) => s0 + e);
    const T = {
      ar: [sp(s0, "ar", "e") + "ei", s0 + "aste", s0 + "ou", s0 + "amos", s0 + "astes", s0 + "aram"],
      er: [s0 + "i", s0 + "este", s0 + "eu", s0 + "emos", s0 + "estes", s0 + "eram"],
      ir: [s0 + "i", s0 + "iste", s0 + "iu", s0 + "imos", s0 + "istes", s0 + "iram"],
    }[ty];
    const SE = ty === "ar" ? ["e", "es", "e", "emos", "eis", "em"] : ["a", "as", "a", "amos", "ais", "am"];
    const sS = o.y ?? sp(s0, ty, ty === "ar" ? "e" : "a");
    const sW = o.yw ?? sS;
    const S = [sS + SE[0], sS + SE[1], sS + SE[2], sW + SE[3], sW + SE[4], sS + SE[5]];
    const ger = s0 + { ar: "ando", er: "endo", ir: "indo" }[ty];
    const pp = o.pp ?? s0 + (ty === "ar" ? "ado" : "ido");
    const arr = ptFin({ inf, P, I, T, S, F: o.F ?? inf, tu: P[2], vos: s0 + { ar: "ai", er: "ei", ir: "i" }[ty], ger, pp });
    if (o.altBoth) arr.push(s0 + E[1], s0 + E[2], s0 + E[5]);
    add(arr);
    return arr;
  }
  // -ear verbs (passear, bloquear ...): passeio, passeias ... ; subjuntivo passeie ... passeemos
  const ear = (inf) => { const s0 = inf.slice(0, -2); return pt(inf, { y: s0 + "i", st: s0 + "i", yw: s0 }); };
  // verbs in -air (cair, sair, trair, atrair ...)
  function air(inf) {
    const s0 = inf.slice(0, -2);
    const o = {
      inf, P: [s0 + "io", s0 + "is", s0 + "i", s0 + "ímos", s0 + "ís", s0 + "em"],
      I: ["ía", "ías", "ía", "íamos", "íeis", "íam"].map((e) => s0 + e),
      T: [s0 + "í", s0 + "íste", s0 + "iu", s0 + "ímos", s0 + "ístes", s0 + "íram"], F: inf,
      S: ["ia", "ias", "ia", "iamos", "iais", "iam"].map((e) => s0 + e), tu: s0 + "i", vos: s0 + "í",
      ger: s0 + "indo", pp: s0 + "ído", hiat: true,
    };
    const r = ptFin(o);
    add(r);
    return r;
  }
  // verbs in -uir (incluir, distribuir ...) and -struir (construir, destruir ...)
  function uir(inf, struir = false) {
    const s0 = inf.slice(0, -2);
    const b = s0.slice(0, -2);
    const P = struir
      ? [s0 + "o", b + "róis", b + "rói", s0 + "ímos", s0 + "ís", b + "roem"]
      : [s0 + "o", s0 + "is", s0 + "i", s0 + "ímos", s0 + "ís", s0 + "em"];
    const o = {
      inf, P, I: ["ía", "ías", "ía", "íamos", "íeis", "íam"].map((e) => s0 + e),
      T: [s0 + "í", s0 + "íste", s0 + "iu", s0 + "ímos", s0 + "ístes", s0 + "íram"], F: inf,
      S: ["a", "as", "a", "amos", "ais", "am"].map((e) => s0 + e), tu: P[2], vos: s0 + "í",
      ger: s0 + "indo", pp: s0 + "ído", hiat: true,
    };
    if (struir) { // construir: constrói / constroem; keep 3sg/3pl also in regular -ui form
      o.P = [...P, s0 + "i", s0 + "is", s0 + "em"];
    }
    const r = ptFin(o);
    add(r);
    return r;
  }
  // -uzir (produzir ...): 3sg without -e
  function uzir(inf) {
    const s0 = inf.slice(0, -2);
    pt(inf, { p3: s0 });
  }

  // ---------- fully irregular verbs ----------
  add(ptFin({
    inf: "ser", P: ["sou", "és", "é", "somos", "sois", "são"], I: ["era", "eras", "era", "éramos", "éreis", "eram"],
    T: ["fui", "foste", "foi", "fomos", "fostes", "foram"], F: "ser",
    S: ["seja", "sejas", "seja", "sejamos", "sejais", "sejam"], tu: "sê", vos: "sede", ger: "sendo", pp: "sido",
  }));
  add(ptFin({
    inf: "estar", P: ["estou", "estás", "está", "estamos", "estais", "estão"],
    I: ["estava", "estavas", "estava", "estávamos", "estáveis", "estavam"],
    T: ["estive", "estiveste", "esteve", "estivemos", "estivestes", "estiveram"], F: "estar",
    S: ["esteja", "estejas", "esteja", "estejamos", "estejais", "estejam"], tu: "está", vos: "estai", ger: "estando", pp: "estado", open: true,
  }));
  const ter = ptFin({
    inf: "ter", P: ["tenho", "tens", "tem", "temos", "tendes", "têm"], I: ["tinha", "tinhas", "tinha", "tínhamos", "tínheis", "tinham"],
    T: ["tive", "tiveste", "teve", "tivemos", "tivestes", "tiveram"], F: "ter",
    S: ["tenha", "tenhas", "tenha", "tenhamos", "tenhais", "tenham"], tu: "tem", vos: "tende", ger: "tendo", pp: "tido", open: true,
  });
  add(ter);
  for (const p of ["con", "man", "ob", "re", "de", "abs", "entre"]) {
    add(pre(p, ter, { tens: "téns", tem: "tém" }));
  }
  add(ptFin({
    inf: "haver", P: ["hei", "hás", "há", "havemos", "haveis", "hão", "hemos", "heis"], I: ["havia", "havias", "havia", "havíamos", "havíeis", "haviam"],
    T: ["houve", "houveste", "houve", "houvemos", "houvestes", "houveram"], F: "haver",
    S: ["haja", "hajas", "haja", "hajamos", "hajais", "hajam"], tu: "há", vos: "havei", ger: "havendo", pp: "havido", open: true,
  }));
  add(ptFin({
    inf: "ir", P: ["vou", "vais", "vai", "vamos", "ides", "vão"], I: ["ia", "ias", "ia", "íamos", "íeis", "iam"],
    T: ["fui", "foste", "foi", "fomos", "fostes", "foram"], F: "ir",
    S: ["vá", "vás", "vá", "vamos", "vades", "vão"], tu: "vai", vos: "ide", ger: "indo", pp: "ido",
  }));
  const vir = ptFin({
    inf: "vir", P: ["venho", "vens", "vem", "vimos", "vindes", "vêm"], I: ["vinha", "vinhas", "vinha", "vínhamos", "vínheis", "vinham"],
    T: ["vim", "vieste", "veio", "viemos", "viestes", "vieram"], F: "vir",
    S: ["venha", "venhas", "venha", "venhamos", "venhais", "venham"], tu: "vem", vos: "vinde", ger: "vindo", pp: "vindo", open: true,
  });
  add(vir);
  for (const p of ["con", "inter", "pro", "ad", "sobre", "a"]) add(pre(p, vir, { vens: "véns", vem: "vém" }));
  const fazer = ptFin({
    inf: "fazer", P: ["faço", "fazes", "faz", "fazemos", "fazeis", "fazem"], I: ["fazia", "fazias", "fazia", "fazíamos", "fazíeis", "faziam"],
    T: ["fiz", "fizeste", "fez", "fizemos", "fizestes", "fizeram"], F: "far",
    S: ["faça", "faças", "faça", "façamos", "façais", "façam"], tu: "faz", vos: "fazei", ger: "fazendo", pp: "feito", open: true,
  });
  add(fazer);
  for (const p of ["des", "re", "satis", "contra"]) add(pre(p, fazer));
  const dizer = ptFin({
    inf: "dizer", P: ["digo", "dizes", "diz", "dizemos", "dizeis", "dizem"], I: ["dizia", "dizias", "dizia", "dizíamos", "dizíeis", "diziam"],
    T: ["disse", "disseste", "disse", "dissemos", "dissestes", "disseram"], F: "dir",
    S: ["diga", "digas", "diga", "digamos", "digais", "digam"], tu: "diz", vos: "dizei", ger: "dizendo", pp: "dito", open: true,
  });
  add(dizer); add(["dize"]);
  for (const p of ["pre", "contra", "des"]) add(pre(p, dizer));
  add(ptFin({
    inf: "trazer", P: ["trago", "trazes", "traz", "trazemos", "trazeis", "trazem"], I: ["trazia", "trazias", "trazia", "trazíamos", "trazíeis", "traziam"],
    T: ["trouxe", "trouxeste", "trouxe", "trouxemos", "trouxestes", "trouxeram"], F: "trar",
    S: ["traga", "tragas", "traga", "tragamos", "tragais", "tragam"], tu: "traz", vos: "trazei", ger: "trazendo", pp: "trazido", open: true,
  }));
  const por = ptFin({
    inf: "pôr", ibase: "por", P: ["ponho", "pões", "põe", "pomos", "pondes", "põem"], I: ["punha", "punhas", "punha", "púnhamos", "púnheis", "punham"],
    T: ["pus", "puseste", "pôs", "pusemos", "pusestes", "puseram"], F: "por",
    S: ["ponha", "ponhas", "ponha", "ponhamos", "ponhais", "ponham"], tu: "põe", vos: "ponde", ger: "pondo", pp: "posto", open: true,
  });
  add(por.filter((x) => x !== "por"));
  for (const p of ["com", "dis", "ex", "im", "o", "pro", "re", "su", "decom", "de", "pos", "ante", "inter", "justa", "sobre", "contra"]) {
    add(pre(p, por, { pôr: "por" }));
  }
  const ver = ptFin({
    inf: "ver", P: ["vejo", "vês", "vê", "vemos", "vedes", "veem"], I: ["via", "vias", "via", "víamos", "víeis", "viam"],
    T: ["vi", "viste", "viu", "vimos", "vistes", "viram"], F: "ver",
    S: ["veja", "vejas", "veja", "vejamos", "vejais", "vejam"], tu: "vê", vos: "vede", ger: "vendo", pp: "visto",
  });
  add(ver);
  for (const p of ["re", "pre", "ante", "entre"]) add(pre(p, ver));
  const ler = ptFin({
    inf: "ler", P: ["leio", "lês", "lê", "lemos", "ledes", "leem"], I: ["lia", "lias", "lia", "líamos", "líeis", "liam"],
    T: ["li", "leste", "leu", "lemos", "lestes", "leram"], F: "ler",
    S: ["leia", "leias", "leia", "leiamos", "leiais", "leiam"], tu: "lê", vos: "lede", ger: "lendo", pp: "lido",
  });
  add(ler); add(pre("re", ler));
  const crer = ptFin({
    inf: "crer", P: ["creio", "crês", "crê", "cremos", "credes", "creem"], I: ["cria", "crias", "cria", "críamos", "críeis", "criam"],
    T: ["cri", "creste", "creu", "cremos", "crestes", "creram"], F: "crer",
    S: ["creia", "creias", "creia", "creiamos", "creiais", "creiam"], tu: "crê", vos: "crede", ger: "crendo", pp: "crido",
  });
  add(crer); add(pre("des", crer));
  add(ptFin({
    inf: "dar", P: ["dou", "dás", "dá", "damos", "dais", "dão"], I: ["dava", "davas", "dava", "dávamos", "dáveis", "davam"],
    T: ["dei", "deste", "deu", "demos", "destes", "deram"], F: "dar",
    S: ["dê", "dês", "dê", "demos", "deis", "deem"], tu: "dá", vos: "dai", ger: "dando", pp: "dado", open: true,
  }));
  add(ptFin({
    inf: "poder", P: ["posso", "podes", "pode", "podemos", "podeis", "podem"], I: ["podia", "podias", "podia", "podíamos", "podíeis", "podiam"],
    T: ["pude", "pudeste", "pôde", "pudemos", "pudestes", "puderam"], F: "poder",
    S: ["possa", "possas", "possa", "possamos", "possais", "possam"], tu: "pode", vos: "podei", ger: "podendo", pp: "podido", open: true,
  }));
  add(ptFin({
    inf: "querer", P: ["quero", "queres", "quer", "queremos", "quereis", "querem"], I: ["queria", "querias", "queria", "queríamos", "queríeis", "queriam"],
    T: ["quis", "quiseste", "quis", "quisemos", "quisestes", "quiseram"], F: "querer",
    S: ["queira", "queiras", "queira", "queiramos", "queirais", "queiram"], tu: "quer", vos: "querei", ger: "querendo", pp: "querido", open: true,
  }));
  add(ptFin({
    inf: "saber", P: ["sei", "sabes", "sabe", "sabemos", "sabeis", "sabem"], I: ["sabia", "sabias", "sabia", "sabíamos", "sabíeis", "sabiam"],
    T: ["soube", "soubeste", "soube", "soubemos", "soubestes", "souberam"], F: "saber",
    S: ["saiba", "saibas", "saiba", "saibamos", "saibais", "saibam"], tu: "sabe", vos: "sabei", ger: "sabendo", pp: "sabido", open: true,
  }));
  add(ptFin({
    inf: "caber", P: ["caibo", "cabes", "cabe", "cabemos", "cabeis", "cabem"], I: ["cabia", "cabias", "cabia", "cabíamos", "cabíeis", "cabiam"],
    T: ["coube", "coubeste", "coube", "coubemos", "coubestes", "couberam"], F: "caber",
    S: ["caiba", "caibas", "caiba", "caibamos", "caibais", "caibam"], tu: "cabe", vos: "cabei", ger: "cabendo", pp: "cabido", open: true,
  }));
  const rir = ptFin({
    inf: "rir", P: ["rio", "ris", "ri", "rimos", "rides", "riem"], I: ["ria", "rias", "ria", "ríamos", "ríeis", "riam"],
    T: ["ri", "riste", "riu", "rimos", "ristes", "riram"], F: "rir",
    S: ["ria", "rias", "ria", "riamos", "riais", "riam"], tu: "ri", vos: "ride", ger: "rindo", pp: "rido",
  });
  add(rir); add(pre("sor", rir));
  pt("valer", { y: "valh", pp: "valido" });
  pt("perder", { y: "perc" });
  pt("pedir", { y: "peç" }); pt("impedir", { y: "impeç" }); pt("despedir", { y: "despeç" }); pt("medir", { y: "meç" });
  pt("ouvir", { y: "ouç" });

  // ---------- families ----------
  for (const v of ["cair", "sair", "trair", "atrair", "distrair", "extrair", "contrair", "subtrair", "abstrair", "decair", "recair", "retrair", "descair"]) air(v);
  for (const v of ["evoluir", "incluir", "excluir", "concluir", "contribuir", "distribuir", "atribuir", "substituir", "constituir", "diminuir", "influir", "retribuir", "possuir", "usufruir", "restituir", "poluir", "fluir", "intuir", "imbuir"]) uir(v);
  for (const v of ["construir", "destruir", "instruir", "reconstruir", "obstruir"]) uir(v, true);
  for (const v of ["produzir", "conduzir", "traduzir", "reduzir", "introduzir", "deduzir", "seduzir", "induzir", "reproduzir", "luzir"]) uzir(v);
  for (const v of ["passear", "recear", "nomear", "folhear", "bloquear", "chatear", "estrear", "pentear", "semear", "baratear", "granjear", "guerrear", "pedalear", "costear", "golear", "escanear", "monitorear", "testear", "rastrear", "saborear", "cear", "arrear", "lisonjear", "manusear", "hastear", "ladear", "basear", "renomear"]) {
    ear(v);
  }

  // alternating -ir verbs and others with irregular 1sg / subjunctive stem
  pt("dormir", { y: "durm" });
  pt("inserir", { y: "insir" });
  pt("inferir", { y: "infir" });
  pt("interferir", { y: "interfir" });
  pt("conferir", { y: "confir" });
  pt("diferir", { y: "difir" });
  pt("proferir", { y: "profir" });
  pt("ingerir", { y: "ingir" });
  pt("refletir", { y: "reflit" });
  pt("investir", { y: "invist" });
  pt("sentir", { y: "sint" });
  pt("servir", { y: "sirv" });
  pt("vestir", { y: "vist" });
  pt("despir", { y: "disp" });
  pt("seguir", { y: "sig" });
  pt("conseguir", { y: "consig" });
  pt("perseguir", { y: "persig" });
  pt("prosseguir", { y: "prossig" });
  pt("repetir", { y: "repit" });
  pt("preferir", { y: "prefir" });
  pt("divertir", { y: "divirt" });
  pt("mentir", { y: "mint" });
  pt("sugerir", { y: "sugir" });
  pt("referir", { y: "refir" });
  pt("transferir", { y: "transfir" });
  pt("digerir", { y: "digir" });
  pt("ferir", { y: "fir" });
  pt("competir", { y: "compit" });
  pt("agredir", { y: "agrid" });
  pt("progredir", { y: "progrid" });
  pt("transgredir", { y: "transgrid" });
  pt("invertir", { y: "invirt" });
  pt("advertir", { y: "advirt" });
  pt("convertir", { y: "convirt" });
  pt("prevenir", { y: "previn", alt: ["e", "i"] });
  pt("cobrir", { y: "cubr", pp: "coberto" });
  pt("descobrir", { y: "descubr", pp: "descoberto" });
  pt("encobrir", { y: "encubr", pp: "encoberto" });
  pt("recobrir", { y: "recubr", pp: "recoberto" });
  pt("engolir", { y: "engul" });
  pt("tossir", { y: "tuss" });
  pt("fugir", { y: "fuj", alt: ["u", "o"] });
  pt("subir", { alt: ["u", "o"], altBoth: true });
  pt("consumir", { alt: ["u", "o"], altBoth: true });
  pt("sacudir", { alt: ["u", "o"], altBoth: true });
  pt("cuspir", { alt: ["u", "o"], altBoth: true });
  pt("acudir", { alt: ["u", "o"], altBoth: true });
  pt("sumir", { alt: ["u", "o"], altBoth: true });
  pt("polir", { y: "pul", alt: ["o", "u"] });
  pt("abrir", { pp: "aberto" });
  pt("reabrir", { pp: "reaberto" });
  pt("entreabrir", { pp: "entreaberto" });
  pt("reunir", { y: "reún", yw: "reun", st: "reún" });
  pt("proibir", { y: "proíb", yw: "proib", st: "proíb" });
  pt("coibir", { y: "coíb", yw: "coib", st: "coíb" });
  pt("saudar", { y: "saúd", yw: "saud", st: "saúd" });
  pt("odiar", { y: "odei", yw: "odi", st: "odei" });
  pt("ansiar", { y: "ansei", yw: "ansi", st: "ansei" });
  pt("mediar", { y: "medei", yw: "medi", st: "medei" });
  pt("remediar", { y: "remedei", yw: "remedi", st: "remedei" });
  pt("incendiar", { y: "incendei", yw: "incendi", st: "incendei" });
  pt("morrer", { pp: ["morto", "morrido"] });
  pt("escrever", { pp: "escrito" });
  for (const v of ["descrever", "inscrever", "prescrever", "subscrever", "transcrever", "reescrever"]) {
    pt(v, { pp: v.slice(0, -4) + "ito" });
  }
  pt("ganhar", { pp: ["ganhado", "ganho"] });
  pt("gastar", { pp: ["gastado", "gasto"] });
  pt("pagar", { pp: ["pagado", "pago"] });
  pt("aceitar", { pp: ["aceitado", "aceito", "aceite"] });
  pt("entregar", { pp: ["entregado", "entregue"] });
  pt("eleger", { pp: ["elegido", "eleito"] });
  pt("imprimir", { pp: ["imprimido", "impresso"] });
  pt("prender", { pp: ["prendido", "preso"] });
  pt("salvar", { pp: ["salvado", "salvo"] });
  pt("limpar", { pp: ["limpado", "limpo"] });
  pt("expressar", { pp: ["expressado", "expresso"] });
  pt("suspender", { pp: ["suspendido", "suspenso"] });
  pt("acender", { pp: ["acendido", "aceso"] });
  pt("romper", { pp: ["rompido", "roto"] });

  // ---------- regular verbs (spelling changes are automatic) ----------
  const REG = [
    // -ar
    "falar", "chamar", "olhar", "ajudar", "usar", "utilizar", "comprar", "contactar", "contatar", "encomendar", "reservar", "visitar", "descarregar", "baixar", "instalar",
    "comparar", "poupar", "economizar", "explorar", "desfrutar", "aproveitar", "enviar", "proporcionar", "reparar", "limpar_", "desenhar", "cozinhar", "viajar", "procurar",
    "criar", "melhorar", "consultar", "publicar", "partilhar", "compartilhar", "deixar", "chegar", "entrar", "levar", "trabalhar", "caminhar", "continuar", "terminar", "mudar",
    "perguntar", "explicar", "apresentar", "organizar", "planear", "planejar", "preparar", "formar", "apoiar", "acompanhar", "simplificar", "otimizar", "optimizar", "ligar",
    "configurar", "ativar", "activar", "validar", "confirmar", "cancelar", "modificar", "eliminar", "guardar", "verificar", "lançar", "realizar", "alcançar", "superar",
    "respeitar", "adaptar", "adotar", "adoptar", "transportar", "alugar", "aumentar", "inovar", "inspirar", "motivar", "celebrar", "esperar", "considerar", "gerenciar", "operar",
    "amar", "ficar", "passar", "estudar", "lembrar", "faltar", "importar", "funcionar", "bastar", "recusar", "apreciar", "desejar", "escutar", "tirar", "tocar", "nadar", "dançar",
    "cantar", "saltar", "anunciar", "iniciar", "negociar", "associar", "copiar", "navegar", "atualizar", "actualizar", "autorizar", "analisar", "visualizar", "sincronizar",
    "priorizar", "digitalizar", "automatizar", "colaborar", "participar", "comunicar", "informar", "notificar", "alertar", "assinalar", "reportar", "calcular", "estimar",
    "controlar", "supervisionar", "inspecionar", "auditar", "certificar", "limitar", "solicitar", "reclamar", "cifrar", "restaurar", "colar", "renomear_", "classificar",
    "filtrar", "ordenar", "comentar", "aconselhar", "orientar", "treinar", "memorizar", "educar", "ilustrar", "argumentar", "integrar", "agrupar", "estimular", "modernizar",
    "ajustar", "programar", "compilar", "implementar", "migrar", "monitorizar", "monitorar", "posicionar", "segmentar", "capturar", "cuidar", "cultivar", "plantar", "pescar",
    "caçar", "assar", "cortar", "temperar", "depositar", "levantar", "investir_", "cobrar", "faturar", "exportar", "contratar", "recrutar", "coordenar", "liderar", "fundar",
    "financiar", "patrocinar", "apostar", "jogar", "arbitrar", "convidar", "hospedar", "alojar", "voar", "aterrar", "embarcar", "desembarcar", "acampar", "fotografar", "filmar",
    "gravar", "editar", "montar", "etiquetar", "desativar", "reiniciar", "desinstalar", "escalar", "testar", "depurar", "autenticar", "recuperar", "apagar", "anexar", "indexar",
    "encaminhar", "tentar", "jantar", "almoçar", "provar", "tratar", "necessitar", "resultar", "lograr", "gostar", "evitar", "indicar", "fomentar", "preocupar", "relacionar",
    "mencionar", "destacar", "incorporar", "gerar", "afetar", "afectar", "agregar", "marcar", "demandar", "arranjar", "enfrentar", "abordar", "centrar", "focar", "vigiar",
    "descansar", "respirar", "meditar", "esticar", "cumprimentar", "felicitar", "casar", "divorciar", "mostrar", "acabar", "começar", "acertar", "acordar", "adiar", "agradar",
    "alcançar", "alterar", "analisar", "apagar", "aplicar", "aprovar", "arrumar", "atender", "atingir_", "atrasar", "avaliar", "avisar", "brincar", "buscar", "cancelar", "carregar",
    "chamar", "citar", "clicar", "colocar", "combinar", "comemorar", "completar", "comprovar", "concordar", "confiar", "confirmar", "conectar", "contar", "convencer_", "converter_",
    "copiar", "corrigir_", "custar", "cumprir_", "decorar", "dedicar", "defender_", "demonstrar", "desenvolver_", "desligar", "despachar", "determinar", "dirigir_", "distribuir_",
    "divulgar", "doar", "duvidar", "emprestar", "encerrar", "encontrar", "enganar", "ensinar", "entregar_", "escolar_", "esquecer_", "estacionar", "estragar", "evoluir_", "exigir_",
    "expandir_", "explicar", "fabricar", "falhar", "fechar", "filtrar", "finalizar", "firmar", "formatar", "frequentar", "funcionar", "garantir_", "guiar", "habitar", "identificar",
    "imaginar", "impactar", "impulsionar", "incentivar", "informar", "inscrever_", "inserir_", "instruir_", "interessar", "interpretar", "investigar", "juntar", "justificar",
    "lavar", "libertar", "liberar", "lidar", "lotar", "manifestar", "manter_", "medicar", "mencionar", "merecer_", "misturar", "mover_", "namorar", "nascer_", "notar", "obrigar",
    "observar", "ocupar", "orçar", "organizar", "pensar", "pertencer_", "pesar", "planificar", "poluir_", "pontuar", "possibilitar", "praticar", "precisar", "preencher_",
    "premiar", "prestar", "pretender_", "procurar", "promover_", "propor_", "provocar", "publicitar", "queixar", "receitar", "recomendar", "reclamar", "reconhecer_", "recordar",
    "reduzir_", "refletir_", "reforçar", "registar", "registrar", "regular", "reivindicar", "relatar", "relaxar", "remover_", "renovar", "reparar", "repartir_", "reproduzir_",
    "resolver_", "responsabilizar", "restringir_", "resumir_", "revelar", "rever_", "reviver_", "sentar", "separar", "significar", "simular", "sinalizar", "sobrar", "sonhar",
    "sorrir_", "suportar", "surfar", "tomar", "trabalhar", "transformar", "transmitir_", "trocar", "unificar", "usufruir_", "valorizar", "vender_", "verificar", "viver_",
    "votar", "zelar", "atuar", "actuar", "viver", "preencher", "pretender", "reviver", "embelezar",
    // -er
    "comer", "beber", "vender", "aprender", "correr", "responder", "compreender", "dever", "meter", "temer", "escolher", "proteger", "recolher", "vencer", "convencer", "conhecer",
    "oferecer", "parecer", "aparecer", "desaparecer", "crescer", "merecer", "agradecer", "estabelecer", "reconhecer", "pertencer", "permanecer", "favorecer", "fortalecer",
    "enriquecer", "obedecer", "nascer", "acontecer", "suceder", "ceder", "prometer", "submeter", "suspender_", "depender", "ofender", "esconder", "varrer", "coser", "tecer",
    "converter", "perceber", "esquecer", "fornecer", "desenvolver", "resolver", "envolver", "volver", "mover", "remover", "promover", "defender", "atender", "entender", "bater",
    "combater", "abater", "sofrer", "comprometer", "permitir_", "aborrecer", "amanhecer", "anoitecer", "padecer", "perecer", "prevalecer", "enlouquecer", "envelhecer", "fallecer_",
    "falecer", "embelezar_", "escurecer", "restabelecer", "desconhecer", "estremecer", "empobrecer", "emergir_", "extender", "estender", "ascender", "descender", "acender_",
    "mexer", "remexer", "gemer", "tremer", "ferver", "torcer", "retorcer", "absolver", "dissolver", "revolver", "devolver", "devorar", "aborrecer",
    // -ir
    "partir", "permitir", "admitir", "existir", "decidir", "assistir", "insistir", "resistir", "persistir", "unir", "cumprir", "discutir", "omitir", "emitir", "transmitir", "dividir",
    "definir", "invadir", "evadir", "exibir", "inibir", "surgir", "dirigir", "exigir", "fingir", "assumir", "resumir", "presumir", "subsistir", "persuadir", "difundir", "confundir",
    "aplaudir", "garantir", "agir", "reagir", "atingir", "corrigir", "restringir", "emergir", "expandir", "repartir", "apodrecer", "cumprir", "banir", "ressurgir",
    "recorrer", "ocorrer", "percorrer", "decorrer", "concorrer", "socorrer", "discorrer", "incorrer", "transcorrer",
  ];
  const seen = new Set();
  for (const v of REG) {
    if (v.endsWith("_") || seen.has(v)) continue;
    seen.add(v);
    pt(v);
  }
  return [...out];
}

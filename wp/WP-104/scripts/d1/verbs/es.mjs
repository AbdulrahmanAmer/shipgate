// WP-104 d1: Spanish verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + irregular tables.
// Simple forms of: presente (incl. voseo), pretérito, imperfecto, futuro, condicional, presente de subjuntivo (incl. voseo),
// imperfecto de subjuntivo (-ra and -se), imperativo (tú, vos, vosotros; usted/nosotros/ustedes = subjuntivo), infinitivo,
// participio (4 forms), gerundio. The archaic future subjunctive (hablare) is not included.
export default function forms() {
  const out = new Set();
  const add = (arr) => { for (const x of arr) if (x) out.add(x); };
  const ACC = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
  const isV = (c) => "aeiouáéíóúü".includes(c);
  const lastRep = (s, from, to) => {
    const i = s.lastIndexOf(from);
    return i < 0 ? s : s.slice(0, i) + to + s.slice(i + from.length);
  };
  const pp4 = (ms) => [ms, ms.slice(0, -1) + "a", ms + "s", ms.slice(0, -1) + "as"];

  // spelling adjustment of a stem before an ending starting with e / o / a
  function sp(stem, ty, nxt) {
    if (ty === "ar" && nxt === "e") {
      if (stem.endsWith("c")) return stem.slice(0, -1) + "qu";
      if (stem.endsWith("g")) return stem + "u";
      if (stem.endsWith("z")) return stem.slice(0, -1) + "c";
      return stem;
    }
    if (ty !== "ar" && (nxt === "o" || nxt === "a")) {
      if (stem.endsWith("gu")) return stem.slice(0, -1);
      if (stem.endsWith("g")) return stem.slice(0, -1) + "j";
      if (stem.endsWith("c")) {
        const p = stem[stem.length - 2];
        return isV(p) ? stem.slice(0, -1) + "zc" : stem.slice(0, -1) + "z";
      }
    }
    return stem;
  }

  // common finishing step. o: inf, P[6], I[6], T[6], F (future stem), S[6], tu, ger, pp (string or array)
  function esFin(o) {
    const r = [o.inf, ...o.P, ...o.I, ...o.T, ...o.S];
    r.push(...["é", "ás", "á", "emos", "éis", "án"].map((e) => o.F + e));
    r.push(...["ía", "ías", "ía", "íamos", "íais", "ían"].map((e) => o.F + e));
    const stR = o.T[5].slice(0, -3);
    const stA = stR.slice(0, -1) + ACC[stR.slice(-1)];
    r.push(stR + "ra", stR + "ras", stR + "ra", stA + "ramos", stR + "rais", stR + "ran");
    r.push(stR + "se", stR + "ses", stR + "se", stA + "semos", stR + "seis", stR + "sen");
    r.push(o.inf.slice(0, -1) + "d"); // vosotros
    r.push(o.tu, o.ger);
    for (const p of Array.isArray(o.pp) ? o.pp : [o.pp]) r.push(...pp4(p));
    // voseo (present, subjunctive, imperative)
    if (o.inf.length > 3 && !o.inf.endsWith("ír")) {
      const ty = o.inf.slice(-2);
      const s0 = o.inf.slice(0, -2);
      r.push(s0 + { ar: "ás", er: "és", ir: "ís" }[ty]);
      r.push(o.S[3].slice(0, -4) + (ty === "ar" ? "és" : "ás"));
      r.push(s0 + { ar: "á", er: "é", ir: "í" }[ty]);
    }
    return r;
  }

  // generic regular / stem-changing / spelling-changing verb
  // o: ch [from,to] stressed-stem vowel change; ir [from,to] weak change (-ir); y yo/subjunctive stem; yo full yo form;
  //    pret strong preterite stem; F future stem; tu imperative; gs gerund stem; pp participle(s); P,S,T overrides
  function es(inf, o = {}) {
    const ty = inf.slice(-2);
    const s0 = inf.slice(0, -2);
    const strong = o.ch ? lastRep(s0, o.ch[0], o.ch[1]) : s0;
    const uir = ty === "ir" && s0.endsWith("u") && !/[gq]u$/.test(s0);
    const hiat = ty !== "ar" && /[aeo]$/.test(s0);
    const irS = o.ir ? lastRep(s0, o.ir[0], o.ir[1]) : s0;
    const strongP = uir ? s0 + "y" : strong;
    const E = {
      ar: ["o", "as", "a", "amos", "áis", "an"],
      er: ["o", "es", "e", "emos", "éis", "en"],
      ir: ["o", "es", "e", "imos", "ís", "en"],
    }[ty];
    const yoStem = o.y ?? (uir ? s0 + "y" : sp(strongP, ty, "o"));
    const yoForm = o.yo ?? yoStem + "o";
    const P = o.P ?? [yoForm, strongP + E[1], strongP + E[2], s0 + E[3], s0 + E[4], strongP + E[5]];
    const I = (ty === "ar" ? ["aba", "abas", "aba", "ábamos", "abais", "aban"] : ["ía", "ías", "ía", "íamos", "íais", "ían"]).map((e) => s0 + e);
    let T;
    if (o.T) T = o.T;
    else if (o.pret) {
      const j = o.pret.endsWith("j");
      T = ["e", "iste", "o", "imos", "isteis", j ? "eron" : "ieron"].map((e) => o.pret + e);
    } else if (ty === "ar") {
      T = [sp(s0, "ar", "e") + "é", s0 + "aste", s0 + "ó", s0 + "amos", s0 + "asteis", s0 + "aron"];
    } else if (hiat) {
      T = [s0 + "í", s0 + "íste", s0 + "yó", s0 + "ímos", s0 + "ísteis", s0 + "yeron"];
    } else if (uir) {
      T = [s0 + "í", s0 + "iste", s0 + "yó", s0 + "imos", s0 + "isteis", s0 + "yeron"];
    } else {
      const tail = /(ñ|ll)$/.test(irS) ? ["ó", "eron"] : ["ió", "ieron"];
      T = [s0 + "í", s0 + "iste", irS + tail[0], s0 + "imos", s0 + "isteis", irS + tail[1]];
    }
    const SE = ty === "ar" ? ["e", "es", "e", "emos", "éis", "en"] : ["a", "as", "a", "amos", "áis", "an"];
    const nxt = ty === "ar" ? "e" : "a";
    let sS, sW;
    if (o.y) { sS = o.y; sW = o.y; }
    else if (uir) { sS = s0 + "y"; sW = s0 + "y"; }
    else { sS = sp(strongP, ty, nxt); sW = sp(irS, ty, nxt); }
    const S = o.S ?? [sS + SE[0], sS + SE[1], sS + SE[2], sW + SE[3], sW + SE[4], sS + SE[5]];
    let ger;
    if (o.ger) ger = o.ger;
    else if (ty === "ar") ger = s0 + "ando";
    else if (hiat || uir) ger = s0 + "yendo";
    else { const b = o.gs ?? irS; ger = b + (/(ñ|ll)$/.test(b) ? "endo" : "iendo"); }
    const pp = o.pp ?? (ty === "ar" ? s0 + "ado" : hiat ? s0 + "ído" : s0 + "ido");
    const arr = esFin({ inf, P, I, T, S, F: o.F ?? inf, tu: o.tu ?? P[2], ger, pp });
    add(arr);
    return arr;
  }
  const withPrefix = (p, arr, fix = {}) => arr.map((x) => p + (fix[x] ?? x));

  // ---------- fully irregular verbs (raw tables) ----------
  add(esFin({
    inf: "ser", P: ["soy", "eres", "es", "somos", "sois", "son"], I: ["era", "eras", "era", "éramos", "erais", "eran"],
    T: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"], F: "ser",
    S: ["sea", "seas", "sea", "seamos", "seáis", "sean"], tu: "sé", ger: "siendo", pp: "sido",
  }));
  add(["sos", "sed"]);
  add(esFin({
    inf: "ir", P: ["voy", "vas", "va", "vamos", "vais", "van"], I: ["iba", "ibas", "iba", "íbamos", "ibais", "iban"],
    T: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"], F: "ir",
    S: ["vaya", "vayas", "vaya", "vayamos", "vayáis", "vayan"], tu: "ve", ger: "yendo", pp: "ido",
  }));
  add(["id", "vamos", "andá", "vayás"]);
  add(esFin({
    inf: "ver", P: ["veo", "ves", "ve", "vemos", "veis", "ven"], I: ["veía", "veías", "veía", "veíamos", "veíais", "veían"],
    T: ["vi", "viste", "vio", "vimos", "visteis", "vieron"], F: "ver",
    S: ["vea", "veas", "vea", "veamos", "veáis", "vean"], tu: "ve", ger: "viendo", pp: "visto",
  }));
  add(["ved", "vean", "veás"]);
  add(esFin({
    inf: "haber", P: ["he", "has", "ha", "hemos", "habéis", "han"], I: ["había", "habías", "había", "habíamos", "habíais", "habían"],
    T: ["hube", "hubiste", "hubo", "hubimos", "hubisteis", "hubieron"], F: "habr",
    S: ["haya", "hayas", "haya", "hayamos", "hayáis", "hayan"], tu: "he", ger: "habiendo", pp: "habido",
  }));
  add(["hay", "habed", "hayás"]);
  add(esFin({
    inf: "dar", P: ["doy", "das", "da", "damos", "dais", "dan"], I: ["daba", "dabas", "daba", "dábamos", "dabais", "daban"],
    T: ["di", "diste", "dio", "dimos", "disteis", "dieron"], F: "dar",
    S: ["dé", "des", "dé", "demos", "deis", "den"], tu: "da", ger: "dando", pp: "dado",
  }));
  add(["dad", "dá"]);
  add(esFin({
    inf: "oír", P: ["oigo", "oyes", "oye", "oímos", "oís", "oyen"], I: ["oía", "oías", "oía", "oíamos", "oíais", "oían"],
    T: ["oí", "oíste", "oyó", "oímos", "oísteis", "oyeron"], F: "oir",
    S: ["oiga", "oigas", "oiga", "oigamos", "oigáis", "oigan"], tu: "oye", ger: "oyendo", pp: "oído",
  }));
  const reir = esFin({
    inf: "reír", P: ["río", "ríes", "ríe", "reímos", "reís", "ríen"], I: ["reía", "reías", "reía", "reíamos", "reíais", "reían"],
    T: ["reí", "reíste", "rio", "reímos", "reísteis", "rieron"], F: "reir",
    S: ["ría", "rías", "ría", "riamos", "riáis", "rían"], tu: "ríe", ger: "riendo", pp: "reído",
  });
  add(reir); add(["rió", "reís"]);
  add(withPrefix("son", reir)); add(["sonrió"]);
  add(["frío", "fríes", "fríe", "freímos", "freís", "fríen", "freía", "freí", "freíste", "frio", "frió", "frieron", "freiré", "freiría", "fría", "frías", "friamos", "friáis", "frían", "friera", "friese", "friendo", "freído", "frito", "frita", "fritos", "fritas", "freír", "freíd"]);

  // ---------- irregular verbs via the generic builder ----------
  const estar = es("estar", {
    P: ["estoy", "estás", "está", "estamos", "estáis", "están"], S: ["esté", "estés", "esté", "estemos", "estéis", "estén"],
    pret: "estuv", tu: "está",
  });
  void estar;
  es("saber", { yo: "sé", y: "sep", pret: "sup", F: "sabr" });
  es("caber", { y: "quep", pret: "cup", F: "cabr" });
  es("andar", { pret: "anduv" });
  es("poder", { ch: ["o", "ue"], pret: "pud", F: "podr", gs: "pud" });
  es("querer", { ch: ["e", "ie"], pret: "quis", F: "querr" });
  es("valer", { y: "valg", F: "valdr", tu: "val" });
  es("salir", { y: "salg", F: "saldr", tu: "sal" });
  const hacer = es("hacer", {
    y: "hag", T: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"], F: "har", tu: "haz", pp: "hecho",
  });
  const fromH = (p, arr) => arr.filter((x) => x.startsWith("h")).map((x) => p + "f" + x.slice(1));
  add(withPrefix("des", hacer)); add(withPrefix("re", hacer));
  add(fromH("satis", hacer)); add(["satisfecho", "satisfecha", "satisfechos", "satisfechas"]);
  const decir = es("decir", { ch: ["e", "i"], y: "dig", pret: "dij", F: "dir", tu: "di", gs: "dic", pp: "dicho" });
  void decir;
  const tener = es("tener", { ch: ["e", "ie"], y: "teng", pret: "tuv", F: "tendr", tu: "ten" });
  for (const p of ["con", "man", "ob", "re", "de", "sos", "entre", "abs"]) {
    add(withPrefix(p, tener, { ten: "tén" }));
  }
  const venir = es("venir", { ch: ["e", "ie"], y: "veng", pret: "vin", F: "vendr", tu: "ven", gs: "vin" });
  for (const p of ["con", "pre", "inter", "pro", "de", "a", "sobre", "sub"]) add(withPrefix(p, venir, { ven: "vén" }));
  const poner = es("poner", { y: "pong", pret: "pus", F: "pondr", tu: "pon", pp: "puesto" });
  for (const p of ["com", "pro", "su", "ex", "im", "dis", "op", "re", "pos", "de", "descom", "contra", "inter", "ante"]) {
    add(withPrefix(p, poner, { pon: "pón" }));
  }
  const traer = es("traer", { y: "traig", pret: "traj" });
  for (const p of ["a", "con", "dis", "ex", "sus", "abs", "re"]) add(withPrefix(p, traer));
  const caer = es("caer", { y: "caig" });
  for (const p of ["de", "re"]) add(withPrefix(p, caer));
  for (const v of ["conducir", "producir", "traducir", "reducir", "introducir", "deducir", "seducir", "inducir", "reproducir", "reconducir"]) {
    const s0 = v.slice(0, -2);
    es(v, { y: s0.slice(0, -1) + "zc", pret: s0.slice(0, -1) + "j" });
  }
  es("lucir", { y: "luzc" });

  // ---------- stem-changing, spelling-changing and accent verbs ----------
  const ie = ["e", "ie"], ue = ["o", "ue"];
  for (const v of ["pensar", "empezar", "comenzar", "cerrar", "sentar", "recomendar", "entender", "perder", "defender", "encender", "atender", "tender", "negar", "regar",
    "merendar", "despertar", "calentar", "confesar", "gobernar", "apretar", "acertar", "temblar", "nevar", "descender", "ascender", "extender", "atravesar", "fregar", "desplegar",
    "quebrar", "sembrar", "helar", "cegar", "plegar", "arrendar", "enterrar", "reventar", "segar", "trocar_", "variar_"]) {
    if (!v.endsWith("_")) es(v, { ch: ie });
  }
  for (const v of ["encontrar", "recordar", "mostrar", "probar", "aprobar", "comprobar", "demostrar", "contar", "costar", "acostar", "almorzar", "forzar", "colgar",
    "rogar", "sonar", "soñar", "volar", "renovar", "apostar", "acordar", "volver", "mover", "resolver", "devolver", "envolver", "doler", "morder", "torcer", "llover",
    "soler", "absolver", "disolver", "revolver", "conmover", "promover", "remover", "poblar", "mostrar", "desarrollar_", "tostar", "trocar", "rodar", "consolar",
    "esforzar", "reforzar", "colar", "costar", "engrosar", "holgar", "avergonzar_"]) {
    if (v.endsWith("_")) continue;
    const opts = { ch: ue };
    if (["volver", "devolver", "envolver", "revolver"].includes(v)) opts.pp = v.slice(0, -5) + "uelto";
    if (v === "resolver") opts.pp = "resuelto";
    if (v === "absolver") opts.pp = "absuelto";
    if (v === "disolver") opts.pp = "disuelto";
    es(v, opts);
  }
  es("jugar", { ch: ["u", "ue"] });
  es("oler", { ch: ["o", "hue"] });
  es("errar", { ch: ["e", "ye"] });
  es("adquirir", { ch: ["i", "ie"] });
  es("morir", { ch: ue, ir: ["o", "u"], pp: "muerto" });
  es("dormir", { ch: ue, ir: ["o", "u"] });
  for (const v of ["sentir", "mentir", "preferir", "divertir", "convertir", "advertir", "invertir", "sugerir", "referir", "herir", "hervir", "digerir", "ingerir", "requerir", "transferir",
    "inferir", "arrepentir", "consentir", "disentir", "presentir", "pervertir", "subvertir", "conferir", "diferir", "interferir", "proferir", "erguir_"]) {
    if (!v.endsWith("_")) es(v, { ch: ie, ir: ["e", "i"] });
  }
  for (const v of ["pedir", "servir", "repetir", "vestir", "medir", "competir", "despedir", "impedir", "rendir", "gemir", "concebir", "derretir", "seguir", "conseguir", "perseguir",
    "elegir", "corregir", "regir", "reelegir", "proseguir", "desvestir", "revestir", "freír_", "teñir", "reñir", "ceñir", "constreñir", "embestir", "expedir", "colegir", "cernir_"]) {
    if (!v.endsWith("_")) es(v, { ch: ["e", "i"], ir: ["e", "i"] });
  }
  for (const v of ["enviar", "confiar", "guiar", "fiar", "variar", "esquiar", "liar", "criar", "vaciar", "ampliar", "enfriar", "desviar", "rociar", "espiar", "contrariar", "fotografiar", "resfriar", "extraviar", "fiar", "ansiar", "aliar", "arriar", "porfiar", "telegrafiar", "chirriar_"]) {
    if (!v.endsWith("_")) es(v, { ch: ["i", "í"] });
  }
  for (const v of ["continuar", "actuar", "evaluar", "graduar", "acentuar", "situar", "efectuar", "puntuar", "insinuar", "habituar", "exceptuar", "fluctuar", "valuar", "devaluar", "perpetuar", "atenuar", "extenuar", "individuar_", "licuar_", "rehusar", "aunar", "ahumar", "adecuar_", "menstruar_"]) {
    if (!v.endsWith("_")) es(v, { ch: ["u", "ú"] });
  }
  es("reunir", { ch: ["u", "ú"] });
  es("prohibir", { ch: ["i", "í"] });
  es("cohibir", { ch: ["i", "í"] });
  es("aislar", { ch: ["i", "í"] });
  es("enraizar", { ch: ["i", "í"] });

  // participios irregulares
  const abrir = es("abrir", { pp: "abierto" });
  void abrir;
  es("cubrir", { pp: "cubierto" });
  es("descubrir", { pp: "descubierto" });
  es("encubrir", { pp: "encubierto" });
  es("escribir", { pp: "escrito" });
  es("describir", { pp: "descrito" });
  es("inscribir", { pp: "inscrito" });
  es("suscribir", { pp: "suscrito" });
  es("prescribir", { pp: "prescrito" });
  es("transcribir", { pp: "transcrito" });
  es("reescribir", { pp: "reescrito" });
  es("romper", { pp: "roto" });
  es("imprimir", { pp: ["impreso", "imprimido"] });
  es("proveer", { pp: ["proveído", "provisto"] });
  es("poseer");

  // ---------- regular verbs (spelling changes are automatic) ----------
  const REG = [
    // -ar
    "hablar", "llamar", "mirar", "ayudar", "usar", "utilizar", "comprar", "contactar", "ordenar", "reservar", "visitar", "descargar", "instalar", "comparar", "ahorrar",
    "explorar", "disfrutar", "asegurar", "entregar", "proporcionar", "reparar", "limpiar", "diseñar", "desarrollar", "cocinar", "viajar", "buscar", "pagar", "crear",
    "mejorar", "consultar", "publicar", "regalar", "dejar", "llegar", "entrar", "tomar", "trabajar", "caminar", "continuar_", "terminar", "cambiar", "ganar", "gastar",
    "preguntar", "explicar", "presentar", "organizar", "planificar", "preparar", "formar", "apoyar", "acompañar", "simplificar", "optimizar", "conectar", "configurar",
    "activar", "validar", "confirmar", "cancelar", "modificar", "eliminar", "guardar", "verificar", "lanzar", "realizar", "alcanzar", "superar", "respetar", "adaptar",
    "adoptar", "llevar", "transportar", "alquilar", "aumentar", "innovar", "inspirar", "motivar", "celebrar", "esperar", "considerar", "gestionar", "operar", "amar",
    "quedar", "pasar", "estudiar", "olvidar", "faltar", "importar", "funcionar", "bastar", "rechazar", "apreciar", "desear", "escuchar", "sacar", "tocar", "nadar", "bailar",
    "cantar", "saltar", "aceptar", "anunciar", "iniciar", "negociar", "asociar", "copiar", "agradecer_", "pertenecer_", "navegar", "chatear", "clicar", "hacer_", "invertir_",
    "recomendar_", "personalizar", "actualizar", "autorizar", "analizar", "visualizar", "sincronizar", "priorizar", "digitalizar", "automatizar", "estandarizar", "armonizar",
    "colaborar", "participar", "comunicar", "informar", "notificar", "alertar", "señalar", "reportar", "medir_", "calcular", "estimar", "evaluar_", "controlar", "supervisar",
    "inspeccionar", "auditar", "certificar", "limitar", "imponer_", "solicitar", "reclamar", "reivindicar", "proteger_", "asegurar", "cifrar", "restaurar", "copiar", "pegar",
    "renombrar", "clasificar", "filtrar", "ordenar", "escanear", "digitar_", "difundir_", "publicitar", "comentar", "puntuar_", "recomendar_", "aconsejar", "orientar", "guiar_",
    "entrenar", "repasar", "memorizar", "educar", "sensibilizar", "ilustrar", "demostrar_", "argumentar", "persuadir_", "atraer_", "fidelizar", "implicar", "asociar", "enlazar",
    "reunir_", "agrupar", "movilizar", "estimular", "dinamizar", "modernizar", "ajustar", "calibrar", "programar", "compilar", "depurar", "desplegar_", "lanzar", "entregar",
    "cuidar", "cultivar", "cosechar", "plantar", "regar_", "pescar", "cazar", "cocer_", "asar", "hornear", "hervir_", "pelar", "cortar", "sazonar", "freír_", "servir_",
    "depositar", "retirar", "transferir_", "ingresar", "cargar", "pagar", "reembolsar", "prestar", "ahorrar", "cotizar", "facturar", "cobrar", "negociar", "vender_", "comerciar",
    "fabricar", "distribuir_", "comercializar", "exportar", "importar", "contratar", "reclutar", "despedir_", "capacitar", "dirigir_", "coordinar", "liderar", "gestionar",
    "emprender", "fundar", "financiar", "patrocinar", "invertir_", "apostar_", "jugar_", "ganar", "perder_", "empatar", "arbitrar", "entrenar", "competir_", "celebrar",
    "felicitar", "agradecer_", "invitar", "visitar", "hospedar", "alojar", "reservar", "cancelar", "viajar", "volar_", "aterrizar", "despegar", "embarcar", "desembarcar",
    "navegar", "pasear", "excursionar", "acampar", "esquiar_", "surfear", "fotografiar_", "filmar", "grabar", "editar", "montar", "publicar", "compartir_", "etiquetar",
    "seguir_", "bloquear", "reportar", "silenciar", "activar", "desactivar", "apagar", "encender_", "reiniciar", "actualizar", "instalar", "desinstalar", "configurar",
    "probar_", "testear", "depurar", "implementar", "integrar", "migrar", "desplegar_", "escalar", "monitorizar", "monitorear", "registrar", "autenticar", "autorizar",
    "cifrar", "descifrar", "respaldar", "recuperar", "restaurar", "borrar", "eliminar", "vaciar_", "llenar", "completar", "rellenar", "enviar_", "recibir_", "responder_",
    "contestar", "reenviar_", "adjuntar", "descargar", "subir_", "cargar", "indexar", "rastrear", "posicionar", "monetizar", "segmentar", "convertir_", "captar", "fidelizar",
    "tratar", "necesitar", "resultar", "lograr", "gustar", "levantar", "intentar", "acabar", "ocupar", "fijar", "acercar", "dedicar", "evitar", "indicar", "fomentar", "preocupar", "relacionar", "pretender", "ocurrir", "equivocar", "mencionar", "reflejar", "destacar", "incorporar", "generar", "afectar", "aprovechar", "disponer_", "obtener_", "agregar", "marcar", "cumplir", "evolucionar", "demandar", "producir_", "reparar", "arreglar", "afrontar", "enfrentar", "plantear", "enfocar", "centrar", "abordar", "comprometer", "dedicar", "disfrutar", "vigilar", "vender_",
    // -er
    "comer", "beber", "vender", "aprender", "leer", "creer", "correr", "responder", "comprender", "deber", "meter", "temer", "coger", "proteger", "escoger", "recoger", "vencer",
    "convencer", "ejercer", "conocer", "ofrecer", "parecer", "aparecer", "desaparecer", "crecer", "merecer", "agradecer", "establecer", "reconocer", "pertenecer",
    "permanecer", "favorecer", "fortalecer", "enriquecer", "obedecer", "nacer", "suceder", "ceder", "prometer", "someter", "suspender", "depender", "ofender", "esconder",
    "atender_", "barrer", "coser", "toser", "tejer", "ascender_", "emerger", "converger", "sorprender", "reprender", "entretejer", "acoger", "encoger", "sobresalir_",
    "complacer", "yacer_", "carecer", "florecer", "amanecer", "anochecer", "padecer", "perecer", "prevalecer", "enloquecer", "envejecer", "enrojecer", "fallecer", "ensombrecer",
    "embellecer", "humedecer", "oscurecer", "reaparecer", "restablecer", "desconocer", "estremecer", "agradecer", "ofrecer", "enriquecer", "robustecer", "empobrecer",
    // -ir
    "vivir", "recibir", "subir", "partir", "permitir", "admitir", "existir", "decidir", "asistir", "insistir", "resistir", "persistir", "sufrir", "consumir", "construir",
    "distribuir", "incluir", "excluir", "concluir", "contribuir", "atribuir", "sustituir", "constituir", "instruir", "influir", "disminuir", "intuir", "restituir", "retribuir",
    "destruir", "reconstruir", "obstruir", "huir_", "unir", "cumplir", "discutir", "omitir", "emitir", "transmitir", "dividir", "definir", "invadir", "evadir", "percibir",
    "exhibir", "inhibir", "añadir", "surgir", "dirigir", "exigir", "fingir", "compartir", "asumir", "resumir", "presumir", "subsistir", "persuadir", "difundir", "confundir",
    "fundir", "aplaudir", "sacudir", "batir", "aburrir", "recibir", "sumir", "pulir", "escupir", "cumplir", "prohibir_", "reducir_", "describir_", "morir_", "competir_",
  ];
  const seen = new Set();
  for (const v of REG) {
    if (v.endsWith("_") || seen.has(v)) continue;
    seen.add(v);
    es(v);
  }
  return [...out];
}

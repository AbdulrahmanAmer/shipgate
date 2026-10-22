// WP-104 d1 - Norwegian Bokmal verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// No person/number marking: infinitive, present (-r), preterite, perfect participle, imperative, present participle
// (-ende), s-passive. Weak group 1 (-et, with the accepted Bokmal -a variants), group 2 (-te / -t; every -ere verb),
// group 3 and strong/irregular verbs from explicit rows:  "inf pres pret pp imp [+]"   "/" = alternatives, "-" = none,
// "+" = also emit the s-passive and participle adjectives.

// group 1 (-et / -a). Trailing "+" = transitive
const N1 = `
snakke arbeide kontakte+ designe+ filme+ booke+ åpne+ lukke+ endre+ glede ønske+ håpe elske+ fjerne+ forbedre+ forenkle+ utforske+
danse tegne+ vandre sykle lytte kikke teste+ starte+ avslutte+ klikke logge laste+ bytte+ erstatte+ koste sikre+ forsikre+ love+
takke+ samarbeide slette+ ordne+ fikse+ bearbeide+ innrede+ stave+ hente+ pakke+ trykke+ vaske+ behandle+ tilslutte+ regne vente
beskytte+ rense+ sammenligne+ fortolke+ bekrefte+ begrunne+ beundre+ avvente+ utnytte+ utvide+ utarbeide+ overvåke+ overraske+
opprette+ oppfordre+ samle+ skifte+ slappe påvirke+ støtte+ styrke+ lette+ lede+ mangle passe+ rette+ benytte+ bruke? bestemme?
forsterke+ fremme+ gjennomføre? hindre+ forhindre+ forandre+ forlenge+ forkorte+ forstørre+ minske+ nøye? sjekke+ chatte
shoppe poste+ dele? tilpasse+ ansette? avbryte? kombinere? publisere? bruke? oppdatere? lansere? jobbe studere? trene? tilføye+
oppnå? ofre+ nytte? tilrettelegge? omfatte+ gjøre? plukke+ tenne? tømme? lagre+ slå? sortere? skanne+ printe+ maile+ google+
`;

// group 2 (-te / -t): every -ere verb, plus the others listed
const N2 = `
installere+ registrere+ levere+ reparere+ kontrollere+ analysere+ produsere+ organisere+ presentere+ garantere+ optimere+ kopiere+
fotografere+ oppdatere+ abonnere annullere+ kommunisere informere+ rapportere+ publisere+ annonsere+ lansere+ effektivisere+
automatisere+ digitalisere+ integrere+ implementere+ konfigurere+ gratulere+ reklamere dekorere+ massere+ inkludere+ respektere+
rekruttere+ oppgradere+ plassere+ polere+ reagere redigere+ redusere+ verifisere+ vurdere+ parkere+ promotere+ markere+ justere+
inspirere+ interessere+ imponere+ koncentrere? kombinere+ korrigere+ kvalifisere+ regulere+ refundere+ spesialisere
stabilisere+ standardisere+ transportere+ simulere+ stimulere+ evaluere+ eksportere+ importere+ diskutere+ fungere akseptere+
sertifisere+ fasilitere+ profitere trene+ funksjonere? passere+ debutere
spare+ dele+ bake+ steke+ koke+ måle+ tjene+ utføre+ medføre+ tilføre+ fylle+ tømme+ skape+ forsøke+ undervise opplyse+ oppdele+
forberede+ forklare+ besvare+ bevare+ nevne+ hilse+ uttrykke+ utstille+ oppbevare+ spille+ male+ svømme ringe lære? bruke+ rense?
kalle+ stemme øke+ glemme+ gjemme+ bestille+ avbestille+ betale+ kjøpe+ selge? sette? høre+ føle+ kjenne+ mene føre+ reise
kjøre+ besøke+ vise+ tenke tro? bety? vente? lære+ lete+ søke+ undersøke+ stenge+ velge? lukke? tilby? bruke+
`;

const ROWS = `
være er var vært vær
ha har hadde hatt ha
gjøre gjør gjorde gjort gjør +
si sier sa sagt si
gå går gikk gått gå
komme kommer kom kommet kom
se ser så sett se +
gi gir ga gitt gi +
ta tar tok tatt ta +
få får fikk fått få +
vite vet visste visst vit
kunne kan kunne kunnet -
ville vil ville villet -
skulle skal skulle skullet -
måtte må måtte måttet -
burde bør burde burdet -
tørre tør torde tort -
la lar lot latt la
finne finner fant funnet finn +
sette setter satte satt sett +
sitte sitter satt sittet sitt
ligge ligger lå ligget ligg
stå står sto/stod stått stå
tro tror trodde trodd tro +
bo bor bodde bodd bo
skrive skriver skrev skrevet skriv +
lese leser leste lest les +
spise spiser spiste spist spis +
drikke drikker drakk drukket drikk +
snakke snakker snakket/snakka snakket/snakka snakk
kalle kaller kalte kalt kall +
bruke bruker brukte brukt bruk +
kjøpe kjøper kjøpte kjøpt kjøp +
selge selger solgte solgt selg +
betale betaler betalte betalt betal +
bestille bestiller bestilte bestilt bestill +
avbestille avbestiller avbestilte avbestilt avbestill +
leve lever levde levd lev
prøve prøver prøvde prøvd prøv +
huske husker husket/huska husket/huska husk +
hjelpe hjelper hjalp hjulpet hjelp
holde holder holdt holdt hold +
bringe bringer brakte brakt bring +
bli blir ble blitt bli
vinne vinner vant vunnet vinn +
velge velger valgte valgt velg +
bære bærer bar båret bær +
løpe løper løp løpt/løpet løp
fly flyr fløy fløyet fly
falle faller falt falt fall
slå slår slo/slog slått slå +
synge synger sang sunget syng +
springe springer sprang sprunget spring
vise viser viste vist vis +
høre hører hørte hørt hør +
føle føler følte følt føl +
kjenne kjenner kjente kjent kjenn +
mene mener mente ment men
føre fører førte ført før +
reise reiser reiste reist reis
kjøre kjører kjørte kjørt kjør +
oppleve opplever opplevde opplevd opplev +
nyte nyter nøt nytt nyt +
tilby tilbyr tilbød tilbudt tilby +
besøke besøker besøkte besøkt besøk +
kreve krever krevde krevd krev +
begynne begynner begynte begynt begynn
fortsette fortsetter fortsatte fortsatt fortsett
sende sender sendte sendt send +
motta mottar mottok mottatt motta +
forstå forstår forsto forstått forstå +
følge følger fulgte fulgt følg +
hete heter het hett het
bety betyr betydde betydd bety
skje skjer skjedde skjedd -
treffe treffer traff truffet treff +
be ber ba bedt be +
by byr bød budt by
brenne brenner brant/brente brent brenn
vokse vokser vokste vokst -
inneholde inneholder inneholdt inneholdt -
bestå består besto bestått bestå
trekke trekker trakk trukket trekk +
skjære skjærer skar skåret skjær +
stikke stikker stakk stukket stikk +
rive river rev revet riv +
sove sover sov sovet sov
spørre spør spurte spurt spør +
legge legger la/lagde lagt legg +
tenke tenker tenkte tenkt tenk
rengjøre rengjør rengjorde rengjort rengjør +
forbinde forbinder forbandt forbundet forbind +
stjele stjeler stjal stjålet stjel +
delta deltar deltok deltatt delta
bidra bidrar bidro bidratt bidra
synes synes syntes syntes -
overvinne overvinner overvant overvunnet overvinn +
overveie overveier overveide overveid overvei +
unngå unngår unngikk unngått unngå +
utgi utgir utga utgitt utgi +
oppgi oppgir oppga oppgitt oppgi +
fortelle forteller fortalte fortalt fortell +
anbefale anbefaler anbefalte anbefalt anbefal +
avgjøre avgjør avgjorde avgjort avgjør +
utsette utsetter utsatte utsatt utsett +
sammenstille sammenstiller sammenstilte sammenstilt sammenstill +
pleie pleier pleide pleid pleie
veie veier veide veid vei +
greie greier greide greid greie
leie leier leide leid leie +
skru skrur skrudde skrudd skru +
tre trer trådte trådt tre
ri rir red ridd ri
gjenta gjentar gjentok gjentatt gjenta +
utgå utgår utgikk utgått utgå
fremgå fremgår fremgikk fremgått fremgå
innebære innebærer innebar innebåret -
tilhøre tilhører tilhørte tilhørt tilhør
tilstå tilstår tilstod tilstått tilstå
`;

const reduceMM = (s) => (s.endsWith("mm") ? s.slice(0, -1) : s);
const reduceDouble = (s) => (/([^aeiouyæøå])\1$/.test(s) ? s.slice(0, -1) : s);
const PART_IRREG = { gå: "gående", se: "seende", stå: "stående", bo: "boende", tro: "troende", få: "fående", ta: "tagende", gi: "givende", si: "sigende", be: "bedende", by: "byende" };

function partI(inf) {
  if (PART_IRREG[inf]) return PART_IRREG[inf];
  if (inf.endsWith("e") && inf.length > 3) return inf.slice(0, -1) + "ende";
  return null;
}
const adjFromPP = (pp, pret) => {
  if (/(å|ø)et$/.test(pp)) return null;
  if (pp.endsWith("et") && pp.length >= 6) return pret.endsWith("et") || pret.endsWith("a") ? pp.slice(0, -2) + "ede" : reduceDouble(pp.slice(0, -2)) + "ne";
  if (pp.endsWith("t") && !pp.endsWith("et")) return pp + "e";
  if (pp.endsWith("d") && pp.length > 3) return pp + "e";
  return null;
};

export function build() {
  const forms = new Set();
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));
  const seen = new Set();
  let nVerbs = 0;
  const alts = (x) => (x === undefined || x === "-" ? [] : x.split("/"));

  const emit = (inf, pres, pret, pp, imp, passive, adjs) => {
    add(inf, pres);
    alts(pret).forEach((p) => add(p));
    alts(pp).forEach((p) => add(p));
    alts(imp).forEach((p) => add(p));
    const pi = partI(inf);
    if (pi) add(pi);
    if (passive) {
      add(inf + "s");
      for (const a of adjs ?? alts(pp).map((p) => adjFromPP(p, alts(pret)[0]))) if (a) add(a);
    }
  };
  // imperatives of stems ending in a consonant cluster before n/l/m/r keep the -e as well (apne, ordne, sykle)
  const impForms = (stem, inf) => {
    const m = stem.match(/([^aeiouyæøå])([nlmr])$/);
    return m && m[1] !== m[2] ? `${stem}/${inf}` : stem;
  };

  for (const line of ROWS.trim().split("\n")) {
    const [inf, pres, pret, pp, imp, flag] = line.trim().split(/\s+/);
    if (seen.has(inf)) continue;
    seen.add(inf);
    nVerbs++;
    emit(inf, pres, pret, pp, imp, flag === "+");
  }
  add("sies", "sees");
  const gen = (list, kind) => {
    for (let tok of list.split(/\s+/).filter(Boolean)) {
      if (tok.endsWith("?")) continue;
      const passive = tok.endsWith("+");
      if (passive) tok = tok.slice(0, -1);
      if (seen.has(tok) || !tok.endsWith("e")) continue;
      seen.add(tok);
      nVerbs++;
      const stem = tok.slice(0, -1);
      if (kind === 1) {
        emit(tok, tok + "r", `${stem}et/${stem}a`, `${stem}et/${stem}a`, impForms(stem, tok), passive, [stem + "ede"]);
      } else {
        const s2 = reduceDouble(stem);
        emit(tok, tok + "r", s2 + "te", s2 + "t", reduceMM(stem), passive, [s2 + "te"]);
      }
    }
  };
  gen(N1, 1);
  gen(N2, 2);
  add("er", "var", "vært", "har", "hadde", "hatt", "kan", "kunne", "vil", "ville", "skal", "skulle", "må", "måtte", "bør", "burde", "vet", "visste",
    "gjør", "gjorde", "gjort", "sier", "sa", "sagt", "går", "gikk", "gått", "kommer", "kom", "kommet", "får", "fikk", "fått", "tar", "tok", "tatt",
    "gir", "ga", "gitt", "ser", "så", "sett", "står", "sto", "stod", "stått", "finner", "fant", "funnet", "blir", "ble", "blitt", "lar", "lot", "latt",
    "finnes", "ses", "gjøres", "tas", "gis", "fås", "sies", "bes", "tros", "slås", "tilbys");
  return { forms: [...forms], nVerbs };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

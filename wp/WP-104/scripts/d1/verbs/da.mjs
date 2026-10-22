// WP-104 d1 - Danish verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// Danish verbs have no person/number marking: infinitive, present (-r), past, perfect participle, imperative,
// present participle (-ende) and the s-passive. Regular verbs by generator (group 1 -ede/-et, group 2 -te/-t), irregular
// verbs from explicit rows:  "inf pres pret pp imp [+]"   "+" = also emit the s-passive and participle adjectives.

// group 1 (-ede / -et): trailing "+" = transitive (s-passive + adjective forms)
const D1 = `
arbejde leve huske+ lave+ kontakte+ opleve+ udvikle+ spare+ installere+ registrere+ levere+ reparere+ designe+ åbne+ lukke+
ændre+ glæde ønske+ håbe elske+ tilføje+ fjerne+ opdatere+ forbedre+ forenkle+ opdage+ udforske+ parkere+ producere+
organisere+ præsentere+ anbefale+ garantere+ kontrollere+ analysere+ optimere+ tilpasse+ fotografere+ filme+ spille+ danse
male+ tegne+ træne svømme vandre cykle lytte kigge prøve+ teste+ starte+ afslutte+ klikke logge uploade+ downloade+ abonnere
annullere+ returnere+ udskifte+ erstatte+ koste sikre+ forsikre+ love+ takke+ samarbejde kommunikere informere+ rapportere+
publicere+ annoncere+ lancere+ effektivisere+ automatisere+ digitalisere+ integrere+ implementere+ konfigurere+ slette+ ordne+
fikse+ gratulere+ besvare+ reklamere+ bearbejde+ indrette+ dekorere+ bevare+ stave+ hente+ afhente+ pakke+ trykke+ ringe vaske+
pleje+ behandle+ massere+ tilslutte+ bytte+ regne vente veje+ beskytte+ booke+ checke+ chatte shoppe rense+ sammenligne+
forklare+ inkludere+ ekskludere+ fortolke+ bekræfte+ begrunde+ beundre+ respektere+ rekruttere+ afvente+ afvikle+ udnytte+
udfolde+ udvide+ udarbejde+ udstille+ overvåge+ overraske+ opbevare+ oprette+ opgradere+ oplade+ opfordre+
gavne+ imponere+ inspirere+ interessere+ justere+ kombinere+ koncentrere kopiere+ korrigere+ kvalificere+
leje+ lette+ maile+ markere+ mangle+ medvirke ofre+ passe+ placere+ polere+ præge+ præcisere+ promovere+ reagere
realisere+ redigere+ reducere+ refundere+ regulere+ rette+ samle+ simplificere+ skifte+ skrue+ slappe snakke+ specialisere
sponsorere+ stabilisere+ standardisere+ styrke+ støtte+ transportere+ uddanne+ udtrykke+ verificere+ vurdere+
åbenbare+ undre
`;
// group 2 (-te / -t)
const D2 = `
dele+ bage+ stege+ koge+ måle+ tjene+ meddele+ markedsføre+ forberede+ udføre+ medføre+ tilføre+ udfylde+ fylde+ tømme+ stemme
gemme+ indføre+ skabe+ forsøge+ undervise oplyse+ hilse+ nævne+ opdele+ indlede+
`;

const ROWS = `
være er var været vær
have har havde haft hav
gøre gør gjorde gjort gør +
sige siger sagde sagt sig +
gå går gik gået gå
komme kommer kom kommet kom
se ser så set se +
give giver gav givet giv +
tage tager tog taget tag +
få får fik fået få +
vide ved vidste vidst ved
kunne kan kunne kunnet -
ville vil ville villet -
skulle skal skulle skullet -
måtte må måtte måttet -
turde tør turde turdet -
burde bør burde burdet -
lade lader lod ladet lad +
finde finder fandt fundet find +
sætte sætter satte sat sæt +
sidde sidder sad siddet sid
ligge ligger lå ligget lig
stå står stod stået stå
tro tror troede troet tro
bo bor boede boet bo
skrive skriver skrev skrevet skriv +
læse læser læste læst læs +
spise spiser spiste spist spis +
drikke drikker drak drukket drik +
tale taler talte talt tal
kalde kalder kaldte kaldt kald +
bruge bruger brugte brugt brug +
købe køber købte købt køb +
sælge sælger solgte solgt sælg +
betale betaler betalte betalt betal +
bestille bestiller bestilte bestilt bestil +
afbestille afbestiller afbestilte afbestilt afbestil +
hjælpe hjælper hjalp hjulpet hjælp
holde holder holdt holdt hold +
bringe bringer bragte bragt bring +
blive bliver blev blevet bliv
vinde vinder vandt vundet vind
vælge vælger valgte valgt vælg +
bære bærer bar båret bær +
løbe løber løb løbet løb
flyve flyver fløj fløjet flyv
falde falder faldt faldet fald
slå slår slog slået slå +
synge synger sang sunget syng +
springe springer sprang sprunget spring
besøge besøger besøgte besøgt besøg +
kende kender kendte kendt kend +
køre kører kørte kørt kør +
nyde nyder nød nydt nyd +
tilbyde tilbyder tilbød tilbudt tilbyd +
tilmelde tilmelder tilmeldte tilmeldt tilmeld +
kræve kræver krævede krævet kræv +
begynde begynder begyndte begyndt begynd
fortsætte fortsætter fortsatte fortsat fortsæt
sende sender sendte sendt send +
modtage modtager modtog modtaget modtag +
forstå forstår forstod forstået forstå +
følge følger fulgte fulgt følg +
hedde hedder hed heddet hed
betyde betyder betød betydet betyd
ske sker skete sket -
træffe træffer traf truffet træf +
bede beder bad bedt bed +
byde byder bød budt byd +
brænde brænder brændte brændt brænd
vokse vokser voksede vokset -
indeholde indeholder indeholdt indeholdt indehold
bestå består bestod bestået bestå
træde træder trådte trådt træd
trække trækker trak trukket træk +
skære skærer skar skåret skær +
stikke stikker stak stukket stik +
smide smider smed smidt smid +
ride rider red redet rid
rive river rev revet riv +
gide gider gad gidet -
lyve lyver løj løjet lyv
beholde beholder beholdt beholdt behold +
undersøge undersøger undersøgte undersøgt undersøg +
søge søger søgte søgt søg +
stille stiller stillede stillet stil +
tænde tænder tændte tændt tænd +
vende vender vendte vendt vend +
bygge bygger byggede bygget byg +
lægge lægger lagde lagt læg +
sove sover sov sovet sov
spørge spørger spurgte spurgt spørg
nå når nåede nået nå +
rengøre rengør rengjorde rengjort rengør +
forbinde forbinder forbandt forbundet forbind +
tælle tæller talte talt tæl +
stjæle stjæler stjal stjålet stjæl +
deltage deltager deltog deltaget deltag
bidrage bidrager bidrog bidraget bidrag
synes synes syntes syntes -
finde finder fandt fundet find +
overvinde overvinder overvandt overvundet overvind +
overveje overvejer overvejede overvejet overvej +
undgå undgår undgik undgået undgå +
udgive udgiver udgav udgivet udgiv +
afgive afgiver afgav afgivet afgiv
opgive opgiver opgav opgivet opgiv +
bevare bevarer bevarede bevaret bevar +
tænke tænker tænkte tænkt tænk
rejse rejser rejste rejst rejs
føle føler følte følt føl +
mene mener mente ment men
vise viser viste vist vis +
høre hører hørte hørt hør +
føre fører førte ført før +
lukke lukker lukkede lukket luk +
fortælle fortæller fortalte fortalt fortæl +
anbefale anbefaler anbefalede anbefalet anbefal +
beslutte beslutter besluttede besluttet beslut +
afgøre afgør afgjorde afgjort afgør +
tilføje tilføjer tilføjede tilføjet tilføj +
udsætte udsætter udsatte udsat udsæt +
afsætte afsætter afsatte afsat afsæt
opsætte opsætter opsatte opsat opsæt +
fastsætte fastsætter fastsatte fastsat fastsæt +
sammensætte sammensætter sammensatte sammensat sammensæt +
fremsætte fremsætter fremsatte fremsat fremsæt
lede leder ledte ledt led
leve lever levede levet lev
`;

// the D1 / D2 lists carry doubtful or non-group-1/2 entries marked "?" - those are skipped on purpose
const reduceDouble = (s) => (/([^aeiouyæøå])\1$/.test(s) ? s.slice(0, -1) : s);
const PART_IRREG = { gå: "gående", se: "seende", stå: "stående", bo: "boende", tro: "troende", få: "fående" };

function partI(inf) {
  if (PART_IRREG[inf]) return PART_IRREG[inf];
  if (inf === "ske") return null;
  if (inf.endsWith("e")) return inf + "nde";
  return null;
}
const adjFromPP = (pp, pret) => {
  if (pp.endsWith("ået")) return null;
  if (pp.endsWith("et") && pp.length >= 6) return pret.endsWith("ede") ? pp.slice(0, -2) + "ede" : reduceDouble(pp.slice(0, -2)) + "ne";
  if (pp.endsWith("t") && !pp.endsWith("et")) return pret.startsWith(pp) && pret.endsWith("te") ? pret : pp + "e";
  return null;
};

export function build() {
  const forms = new Set();
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));
  const seen = new Set();
  let nVerbs = 0;

  const emit = (inf, pres, pret, pp, imp, passive, adj) => {
    add(inf, pres, pret, pp);
    if (imp && imp !== "-") add(imp);
    const pi = partI(inf);
    if (pi) add(pi);
    if (passive) {
      add(inf + "s");
      const a = adj ?? adjFromPP(pp, pret);
      if (a) add(a);
    }
  };

  const group = (list, kind) => {
    for (let tok of list.split(/\s+/).filter(Boolean)) {
      if (tok.endsWith("?")) continue;
      const passive = tok.endsWith("+");
      if (passive) tok = tok.slice(0, -1);
      if (seen.has(tok) || !tok.endsWith("e")) continue;
      seen.add(tok);
      nVerbs++;
      const stem = tok.slice(0, -1);
      if (kind === 1) emit(tok, tok + "r", stem + "ede", stem + "et", reduceDouble(stem), passive, stem + "ede");
      else emit(tok, tok + "r", reduceDouble(stem) + "te", reduceDouble(stem) + "t", reduceDouble(stem), passive, reduceDouble(stem) + "te");
    }
  };
  // irregular rows first so that they win over the generators
  for (const line of ROWS.trim().split("\n")) {
    const t = line.trim().split(/\s+/);
    const [inf, pres, pret, pp, imp, flag] = t;
    if (!seen.has(inf)) { seen.add(inf); nVerbs++; }
    emit(inf, pres, pret, pp, imp, flag === "+");
  }
  group(D1, 1);
  group(D2, 2);
  // frequent finite forms that must exist as separate words
  add("er", "var", "været", "har", "havde", "haft", "kan", "kunne", "vil", "ville", "skal", "skulle", "må", "måtte", "bør", "burde", "ved", "vidste",
    "gør", "gjorde", "gjort", "siger", "sagde", "går", "gik", "gået", "kommer", "kom", "kommet", "får", "fik", "fået", "tager", "tog", "taget", "giver", "gav", "givet",
    "ser", "så", "set", "står", "stod", "stået", "finder", "fandt", "fundet", "bliver", "blev", "blevet", "lader", "lod", "ladet", "findes", "ses", "gøres", "tages", "gives");
  return { forms: [...forms], nVerbs };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

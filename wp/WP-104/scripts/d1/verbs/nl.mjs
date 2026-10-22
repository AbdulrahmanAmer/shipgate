// WP-104 d1 - Dutch verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// Weak verbs by rule ('t kofschip decides -te/-de, spelling of the stem, ge- rules); strong/irregular verbs from an
// explicit table; separable verbs give bare finite + prefixed finite (subordinate clause) + prefixed infinitive/participles.
// Entry syntax: "werken" plain | "maken>maak" explicit stem | "^reserveren" loan verb in -eren (stem ...eer)
// | "pre|verb" separable | "pre+verb" inseparable (no ge-). Entries nest: "terug|be+talen".

const fixStem = (raw) => {
  let s = raw;
  if (/([^aeiou])\1$/.test(s)) s = s.slice(0, -1); // zett -> zet, bell -> bel
  if (s.endsWith("v")) s = s.slice(0, -1) + "f";
  if (s.endsWith("z")) s = s.slice(0, -1) + "s";
  return s;
};
const UNDIA = { "ï": "i", "ë": "e", "ü": "u" };
const stripGe = (pp) => {
  if (!pp.startsWith("ge")) return pp;
  const r = pp.slice(2);
  return (UNDIA[r[0]] ?? r[0]) + r.slice(1);
};
const par = (o) => ({ fin: [], imp: [], inf: "", pp: [], partI: [], ...o });

// weak verbs whose open-syllable vowel is doubled in the stem (the spelling cannot be derived from the infinitive)
const DOUBLE = {
  maken: "maak", praten: "praat", wonen: "woon", horen: "hoor", leven: "leef", spelen: "speel", leren: "leer",
  delen: "deel", koken: "kook", huren: "huur", dromen: "droom", hopen: "hoop", duren: "duur", halen: "haal",
  sparen: "spaar", lenen: "leen", tonen: "toon", sturen: "stuur", dagen: "daag", keren: "keer", genezen: "genees",
  talen: "taal", palen: "paal", loven: "loof", waren: "waar", heren: "heer", storen: "stoor", weren: "weer",
};
function weakP(inf, override, loan) {
  if (!inf.endsWith("en")) throw new Error("bad weak infinitive " + inf);
  const raw = inf.slice(0, -2);
  let S = override ?? DOUBLE[inf] ?? fixStem(raw);
  if (loan) S = raw.slice(0, -2) + "eer";
  const T = /(t|k|f|s|p|x|ch)$/.test(raw);
  const third = S.endsWith("t") ? S : S + "t";
  const sg = S + (T ? "te" : "de");
  const fin = [S, third, inf, sg, S + (T ? "ten" : "den")];
  let pp = T ? (S.endsWith("t") ? S : S + "t") : S.endsWith("d") ? S : S + "d";
  const noge = /ieren$/.test(inf) && !loan ? true : false;
  // ge- + vowel-initial stem gets a diaeresis: geinstalleerd -> geïnstalleerd, geeist -> geëist, geupdatet -> geüpdatet
  const dia = { i: "ï", e: "ë", u: "ü" };
  const withGe = dia[pp[0]] ? "ge" + dia[pp[0]] + pp.slice(1) : "ge" + pp;
  return par({ fin, imp: [S], inf, pp: [noge ? pp : withGe], partI: [inf + "d", inf + "de"] });
}

// fields: inf stem[|3sg] pastSg pastPl pp   ("/" = alternatives, "-" = none)
const STRONG_TABLE = `
geven geef gaf gaven gegeven
nemen neem nam namen genomen
komen kom|komt kwam kwamen gekomen
zien zie|ziet zag zagen gezien
gaan ga|gaat ging gingen gegaan
staan sta|staat stond stonden gestaan
slaan sla|slaat sloeg sloegen geslagen
doen doe|doet deed deden gedaan
laten laat liet lieten gelaten
blijven blijf bleef bleven gebleven
krijgen krijg kreeg kregen gekregen
vinden vind vond vonden gevonden
brengen breng bracht brachten gebracht
denken denk dacht dachten gedacht
houden hou|houdt hield hielden gehouden
lezen lees las lazen gelezen
schrijven schrijf schreef schreven geschreven
spreken spreek sprak spraken gesproken
eten eet at aten gegeten
drinken drink dronk dronken gedronken
rijden rijd reed reden gereden
lopen loop liep liepen gelopen
beginnen begin begon begonnen begonnen
winnen win won wonnen gewonnen
zitten zit zat zaten gezeten
liggen lig lag lagen gelegen
zwemmen zwem zwom zwommen gezwommen
helpen help hielp hielpen geholpen
vragen vraag vroeg vroegen gevraagd
kiezen kies koos kozen gekozen
bieden bied bood boden geboden
trekken trek trok trokken getrokken
vallen val viel vielen gevallen
roepen roep riep riepen geroepen
vliegen vlieg vloog vlogen gevlogen
sluiten sluit sloot sloten gesloten
snijden snijd sneed sneden gesneden
kopen koop kocht kochten gekocht
zoeken zoek zocht zochten gezocht
weten weet|weet wist wisten geweten
willen wil|wil wilde/wou wilden/wouden gewild
kunnen kan|kan kon konden gekund
zullen zal|zal zou zouden -
mogen mag|mag mocht mochten gemogen
moeten moet|moet moest moesten gemoeten
hebben heb|heeft had hadden gehad
worden word|wordt werd werden geworden
heten heet heette heetten geheten
zeggen zeg zei/zegde zeiden/zegden gezegd
kijken kijk keek keken gekeken
lijken lijk leek leken geleken
blijken blijk bleek bleken gebleken
bakken bak bakte bakten gebakken
laden laad laadde laadden geladen
genieten geniet genoot genoten genoten
vergeten vergeet vergat vergaten vergeten
vergelijken vergelijk vergeleek vergeleken vergeleken
vangen vang ving vingen gevangen
schieten schiet schoot schoten geschoten
sterven sterf stierf stierven gestorven
vechten vecht vocht vochten gevochten
treffen tref trof troffen getroffen
steken steek stak staken gestoken
breken breek brak braken gebroken
schenken schenk schonk schonken geschonken
zingen zing zong zongen gezongen
springen spring sprong sprongen gesprongen
binden bind bond bonden gebonden
hangen hang hing hingen gehangen
dragen draag droeg droegen gedragen
wegen weeg woog wogen gewogen
varen vaar voer voeren gevaren
slapen slaap sliep sliepen geslapen
raden raad ried rieden geraden
lachen lach lachte lachten gelachen
wassen was waste wasten gewassen
gelden geld|geldt gold golden gegolden
verdwijnen verdwijn verdween verdwenen verdwenen
grijpen grijp greep grepen gegrepen
wijzen wijs wees wezen gewezen
mijden mijd meed meden gemeden
kennen ken kende kenden gekend
schijnen schijn scheen schenen geschenen
zenden zend zond zonden gezonden
meten meet mat maten gemeten
ontmoeten ontmoet ontmoette ontmoetten ontmoet
verliezen verlies verloor verloren verloren
ontwerpen ontwerp ontwierp ontwierpen ontworpen
`;
const STRONG = new Map();
for (const line of STRONG_TABLE.trim().split("\n")) {
  const f = line.trim().split(/\s+/);
  STRONG.set(f[0], f);
}
function strongP(f) {
  const [inf, st, pS, pP, ppF] = f;
  const [stem, sg3] = st.split("|");
  const third = sg3 ?? (stem.endsWith("t") ? stem : stem + "t");
  const alt = (x) => (x === "-" ? [] : x.split("/"));
  return par({
    fin: [stem, third, inf, ...alt(pS), ...alt(pP)],
    imp: [stem],
    inf,
    pp: alt(ppF),
    partI: [inf + "d", inf + "de"],
  });
}

const SPECIAL = {
  zijn: par({
    fin: ["ben", "bent", "is", "zijn", "was", "waren", "wees"],
    imp: ["wees"], inf: "zijn", pp: ["geweest"], partI: ["zijnde"],
  }),
};

function insepP(prefix, p) {
  return par({
    fin: p.fin.map((x) => prefix + x),
    imp: p.imp.map((x) => prefix + x),
    inf: prefix + p.inf,
    pp: p.pp.map((x) => prefix + stripGe(x)),
    partI: p.partI.map((x) => prefix + x),
  });
}
function sepP(prefix, p) {
  return par({
    fin: [...p.fin, ...p.fin.map((x) => prefix + x)],
    imp: p.imp,
    inf: prefix + p.inf,
    pp: p.pp.map((x) => prefix + x),
    partI: p.partI.map((x) => prefix + x),
  });
}
function paradigm(spec) {
  let override, loan = false;
  const gt = spec.indexOf(">");
  if (gt >= 0) { override = spec.slice(gt + 1); spec = spec.slice(0, gt); }
  const bar = spec.indexOf("|");
  if (bar >= 0) return sepP(spec.slice(0, bar), paradigm(spec.slice(bar + 1) + (override ? ">" + override : "")));
  const plus = spec.indexOf("+");
  if (plus >= 0) return insepP(spec.slice(0, plus), paradigm(spec.slice(plus + 1) + (override ? ">" + override : "")));
  if (spec.startsWith("^")) { loan = true; spec = spec.slice(1); }
  if (SPECIAL[spec]) return SPECIAL[spec];
  if (STRONG.has(spec)) return strongP(STRONG.get(spec));
  return weakP(spec, override, loan);
}

const WEAK = `
werken maken>maak wonen>woon horen>hoor leven>leef spelen>speel kopen? vragen? praten>praat leren>leer voelen>voel
delen>deel noemen>noem stellen zetten plaatsen koken>kook huren>huur boeken fietsen reizen>reis wandelen bouwen
proeven>proef dromen>droom hopen>hoop leggen redden stoppen printen mailen liken downloaden klikken sturen scannen
nodigen testen starten dansen vieren>vier passen
openen>open antwoorden winkelen kleuren tekenen>teken schilderen verven>verf
voeren>voer delen>deel duren>duur kosten tellen>tel schakelen>schakel groeien eisen>eis lossen>los regelen>regel
leveren>lever bellen>bel melden>meld tonen>toon vullen>vul
knippen>knip plakken>plak sparen>spaar leiden>leid rusten>rust stemmen>stem
^reserveren ^installeren ^registreren ^informeren ^organiseren ^controleren ^communiceren ^presenteren ^accepteren
^analyseren ^reageren ^repareren ^renoveren ^garanderen ^produceren ^fotograferen ^telefoneren ^studeren ^proberen
^inspireren ^motiveren ^optimaliseren ^personaliseren ^annuleren ^importeren ^exporteren ^transporteren ^contacteren
^faciliteren ^integreren ^implementeren ^inspecteren ^certificeren ^waarderen ^abonneren ^profiteren ^functioneren
^concentreren ^passeren ^combineren ^kwalificeren ^selecteren ^stimuleren ^simuleren ^debuteren ^trainen? ^verwerken?
zorgen>zorg danken>dank wensen>wens mikken lenen>leen pakken>pak halen>haal
trainen>train sporten>sport zwaaien>zwaai huilen>huil duwen>duw schudden>schud wachten>wacht
plannen>plan gooien dagen
be+talen>taal be+stellen be+zoeken be+palen>paal be+loven>loof be+leven>leef be+doelen be+schermen be+schikken be+slissen
be+heren>heer be+waren>waar be+antwoorden be+wonen>woon be+delen>deel be+nadelen>nadeel be+lasten be+moeien be+reiken
be+sluiten be+staan be+vinden be+zitten be+schrijven be+grijpen be+houden be+wijzen be+geleiden be+kijken be+weren
be+tekenen>teken be+dienen>dien be+danken>dank be+groeten>groet be+vestigen be+oordelen be+werken be+^studeren
ge+bruiken ge+loven>loof ge+lukken ge+wennen ge+leiden ge+bieden
ver+kopen ver+huren>huur ver+huizen>huis ver+nieuwen ver+anderen ver+beteren ver+lengen ver+zorgen ver+wachten
ver+trekken ver+binden ver+bieden ver+laten ver+wijderen ver+voeren>voer ver+werken ver+kennen ver+tellen
ver+klaren>klaar ver+vangen ver+zenden ver+sturen ver+sterken ver+volgen ver+beelden
ver+mijden ver+duidelijken ver+staan ver+lichten ver+melden>meld ver+schijnen
ver+schillen ver+tonen>toon ver+wijzen ver+antwoorden ver+ont+schuldigen ver+eenvoudigen ver+zamelen ver+zoeken
ver+krijgen ver+dienen ver+geven ver+bruiken ver+vullen>vul ver+snellen ver+hogen>hoog ver+lagen>laag ver+minderen
ver+meerderen ver+groten>groot ver+bouwen
ont+vangen ont+dekken ont+wikkelen ont+houden ont+breken ont+staan ont+vlammen ont+spannen
ont+gaan ont+trekken ont+kennen ont+slaan ont+snappen ont+zien ont+lenen>leen
her+inneren her+stellen her+halen>haal her+kennen her+nieuwen her+bouwen her+vinden her+schrijven
onder+steunen onder+houden onder+zoeken onder+nemen onder+tekenen>teken onder+gaan
over+tuigen over+leggen over+wegen over+winnen over+komen
voor+zien
aan|melden aan|bieden aan|komen aan|kondigen aan|nemen aan|geven aan|vragen aan|sluiten aan|passen aan|raken aan|schaffen
aan|tonen aan|wijzen aan|vullen aan|pakken aan|zetten aan|leggen aan|trekken aan|doen aan|gaan aan|houden aan|sturen
aan|duiden aan|klikken aan|moedigen aan|vallen aan|brengen aan|spreken aan|raden aan|bevelen? aan|vinken aan|maken
aan|schakelen aan|zetten aan|kijken aan|zien aan|leren aan|bellen aan|tekenen>teken aan|vragen aan|vullen
af|halen af|geven af|spreken af|zeggen af|melden af|sluiten af|maken af|nemen af|leveren af|rekenen af|wachten af|staan
af|zien af|schrijven af|wijzen af|slaan af|komen af|lopen af|schaffen af|be+stellen af|drukken af|spelen af|haken
af|ronden af|zetten  af|breken af|vallen af|stemmen af|sluiten af|bouwen af|snijden
op|bellen op|halen op|geven op|nemen op|zoeken op|staan op|stellen op|lossen op|sturen op|slaan op|splitsen op|laden
op|roepen op|ruimen op|bouwen op|sluiten op|vragen op|starten op|maken op|lopen op|komen op|volgen op|schrijven op|letten
op|zeggen op|noemen op|tellen op|vullen op|lossen op|eisen op|merken   op|werken  op|poetsen
uit|nodigen uit|geven uit|gaan uit|komen uit|kiezen uit|leggen uit|proberen uit|zoeken uit|stappen uit|breiden uit|vinden
uit|printen uit|zenden uit|werken uit|voeren uit|schrijven uit|leveren uit|loggen uit|kijken uit|delen uit|testen uit|drukken
uit|spreken uit|sluiten uit|rusten uit|dagen uit|lenen uit|betalen uit|checken uit|zetten uit|schakelen uit|halen uit|nemen
in|schrijven in|vullen in|loggen in|stellen in|voeren in|leveren in|dienen in|gaan in|komen in|kopen in|nemen in|plannen
in|richten in|ruilen in|checken in|halen in|sturen in|zien in|wisselen in|bouwen in|spelen in|leiden in|lichten in|passen
mee|nemen mee|brengen mee|gaan mee|komen mee|doen mee|werken mee|delen mee|helpen mee|denken mee|maken mee|rijden mee|spelen
mee|delen mee|tellen mee|betalen mee|sturen mee|lezen
na|denken na|kijken na|sturen na|gaan na|komen na|lezen na|bellen na|leven na|zien na|trekken na|noemen na|rekenen na|streven
voor|bereiden voor|stellen voor|komen voor|gaan voor|lezen voor|zien voor|schrijven voor|doen voor|bestellen? 
voor|zeggen voor|draaien  voor|stellen voor|kiezen voor|brengen voor|houden voor|uit|gaan?
terug|komen terug|geven terug|gaan terug|brengen terug|sturen terug|betalen terug|bellen terug|halen terug|keren terug|zien
terug|vinden terug|krijgen terug|nemen terug|lezen terug|schakelen terug|schrijven terug|storten terug|trekken terug|plaatsen
weg|gaan weg|brengen weg|doen weg|halen weg|nemen weg|sturen weg|leggen weg|lopen weg|gooien weg|zetten weg|laten weg|rijden
door|gaan door|sturen door|geven door|lopen door|zoeken door|lezen door|rekenen door|voeren door|betalen door|kijken
door|nemen door|trekken door|breken door|vertellen? door|stromen door|kruisen door|schakelen door|werken
over|gaan over|nemen over|stappen over|schakelen over|maken over|schrijven over|boeken over|dragen over|laten over|houden
over|zetten over|brengen over|komen  over|vallen over|hebben over|leggen
toe|voegen toe|staan toe|sturen toe|laten toe|passen toe|wijzen toe|kennen toe|schrijven toe|geven toe|nemen toe|zien
toe|zeggen  toe|lichten  toe|brengen toe|tekenen
samen|werken samen|vatten samen|stellen samen|komen samen|voegen samen|brengen samen|leven samen|gaan samen|doen samen|nemen
samen|zetten samen|vallen samen|sturen samen|tellen samen|rekenen samen|voegen 
vast|leggen vast|stellen vast|houden vast|zetten vast|pakken vast|maken vast|binden vast|klikken vast|plakken vast|zitten
bij|houden bij|werken bij|dragen bij|komen bij|brengen bij|voegen bij|staan bij|wonen bij|zetten bij|stellen bij|vullen
bij|tekenen? bij|schrijven bij|betalen bij|bestellen? bij|leren bij|sturen
rond|kijken rond|leiden rond|lopen rond|rijden rond|reizen rond|gaan rond|sturen rond|brengen rond|maken rond|zoeken
vrij|geven vrij|maken vrij|laten vrij|spreken vrij|stellen vrij|houden vrij|nemen vrij|komen
open|maken open|doen open|gaan open|stellen open|zetten open|leggen open|breken open|houden open|laten open|trekken open|klikken
dicht|doen dicht|maken dicht|gaan dicht|houden dicht|trekken dicht|knijpen dicht|zetten
neer|zetten neer|leggen neer|gaan neer|halen neer|komen neer|schrijven neer|vallen neer|laten neer|slaan neer|brengen
klaar|zetten klaar|maken klaar|staan klaar|leggen klaar|zitten klaar|komen klaar|stomen klaar|houden klaar|liggen
bijeen|komen bijeen|roepen bijeen|brengen bijeen|halen bijeen|voegen
  stil|staan stil|zitten stil|leggen stil|vallen stil|houden stil|zetten stil|blijven
los|laten los|maken los|gaan los|komen los|koppelen los|laten los|knippen los|weken los|raken los|schroeven los|zetten
leeg|maken leeg|halen leeg|lopen leeg|drinken leeg|eten leeg|gooien
goed|keuren goed|vinden goed|maken goed|doen goed|gaan goed|zetten goed|schrijven goed|praten
kennis|maken vorm|geven schoon|maken uit|^proberen door|ver+wijzen over+nachten be+sparen ver+rassen er+varen ver+blijven ver+zekeren ver+lenen>leen waarborgen reinigen ver+wennen
`;

export function build() {
  const forms = new Set();
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));
  const entries = new Set();
  for (const k of Object.keys(SPECIAL)) entries.add(k);
  for (const k of STRONG.keys()) entries.add(k);
  for (const tok of WEAK.split(/\s+/).filter(Boolean)) {
    if (tok.endsWith("?")) continue; // doubtful or duplicate entries deliberately left out
    entries.add(tok);
  }
  for (const spec of entries) {
    let p;
    try {
      p = paradigm(spec);
    } catch (e) {
      throw new Error(`nl: cannot build "${spec}": ${e.message}`);
    }
    add(...p.fin, ...p.imp, p.inf, ...p.pp, ...p.partI);
    for (const pp of p.pp) if (/[td]$/.test(pp)) add(pp + "e"); // attributive geboekte, gemaakte
  }
  // finite forms of the common irregular verbs that the table leaves out (jij/u forms, contractions)
  add("wilt", "kunt", "zult", "hebt", "bent", "ben", "heeft", "heb", "mag", "kan", "zal", "moet", "weet", "doet", "gaat", "staat", "ziet",
    "wordt", "word", "laat", "komt", "geeft", "houdt", "zegt", "zeg", "zei", "zeiden", "deed", "deden", "gedaan", "geweest", "zijnde");
  return { forms: [...forms], nVerbs: entries.size };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

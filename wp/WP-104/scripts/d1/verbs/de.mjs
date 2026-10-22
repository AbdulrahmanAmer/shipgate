// WP-104 d1 - German verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// Paradigm generators: weak verbs by rule (e-insertion, du-form after s/ss/x/z, ge- rules), strong/mixed verbs from an
// explicit table (du/er present, Praeteritum, Konjunktiv II, Partizip II), irregular verbs fully spelled out.
// Entry syntax:  "stem"  plain verb | "pre|verb" separable (finite forms appear bare AND prefixed, plus prefixed inf/zu-inf/pp)
// | "pre+verb" inseparable (no ge- in the participle). Entries nest: "nach|be+stellen".

const VOW = "aeiouäöüy";
const isCons = (c) => !!c && /\p{L}/u.test(c) && !VOW.includes(c);

// does a verb stem take an e before -st/-t/-te? (t/d, or consonant + m/n other than l,r,h-after-vowel,m,n)
function needsE(stem) {
  if (/[dt]$/.test(stem)) return true;
  if (!/[mn]$/.test(stem)) return false;
  const p = stem.at(-2);
  if (!isCons(p)) return false;
  if ("lrmn".includes(p)) return false;
  if (p === "h") return isCons(stem.at(-3)); // ch/sch + n/m ("rechnen") yes; vowel + h ("wohnen") no
  return true;
}
const sibilant = (s) => /[sßxz]$/.test(s);
const ends = (x, suf) => (x.endsWith("e") ? x + suf.slice(1) : x + suf); // "en" -> x+n when x ends in e
const stripGe = (pp) => (pp.startsWith("ge") ? pp.slice(2) : pp);

function par(o) {
  return { fin: [], imp: [], inf: "", pp: [], partI: "", extra: [], ...o };
}

// ---------- weak verbs ----------
function weakP(inf, noGe = false) {
  const fin = [], imp = [];
  let stem, t = "", pp;
  const sehr = /(eln|ern)$/.test(inf);
  if (!inf.endsWith("en") && !inf.endsWith("n")) throw new Error("bad weak infinitive " + inf);
  if (sehr) {
    stem = inf.slice(0, -1); // sammel / wander
    const ich = inf.endsWith("eln") ? [stem.slice(0, -2) + "le", stem + "e"] : [stem + "e", stem.slice(0, -2) + "re"];
    fin.push(...ich, stem + "st", stem + "t", inf);
    const pt = stem + "te";
    fin.push(pt, pt + "st", pt + "n", pt + "t");
    imp.push(...ich);
    pp = stem + "t";
  } else {
    stem = inf.slice(0, -2);
    const e = needsE(stem);
    fin.push(stem + "e", sibilant(stem) ? stem + "t" : stem + (e ? "est" : "st"), stem + (e ? "et" : "t"), inf);
    const pt = stem + (e ? "ete" : "te");
    fin.push(pt, pt + "st", pt + "n", pt + "t");
    fin.push(stem + "est", stem + "et"); // subjunctive I du / ihr
    if (!e) imp.push(stem);
    imp.push(stem + "e");
    pp = stem + (e ? "et" : "t");
  }
  const noge = noGe || /ieren$/.test(inf);
  return par({ fin, imp, inf, pp: [noge ? pp : "ge" + pp], partI: inf + "d" });
}

// ---------- strong / mixed verbs ----------
// fields: inf du er pret k2 pp [imp];  "=" = regular formation, "-" = none; "/" separates alternatives
const STRONG_TABLE = `
geben gibst gibt gab gäbe gegeben gib
nehmen nimmst nimmt nahm nähme genommen nimm
sehen siehst sieht sah sähe gesehen sieh
lesen liest liest las läse gelesen lies
sprechen sprichst spricht sprach spräche gesprochen sprich
helfen hilfst hilft half hülfe/hälfe geholfen hilf
treffen triffst trifft traf träfe getroffen triff
essen isst isst aß äße gegessen iss
vergessen vergisst vergisst vergaß vergäße vergessen vergiss
messen misst misst maß mäße gemessen miss
fahren fährst fährt fuhr führe gefahren fahr/fahre
tragen trägst trägt trug trüge getragen trag/trage
schlafen schläfst schläft schlief schliefe geschlafen schlaf/schlafe
laufen läufst läuft lief liefe gelaufen lauf/laufe
fallen fällst fällt fiel fiele gefallen fall/falle
halten hältst hält hielt hielte gehalten halt/halte
raten rätst rät riet riete geraten rat/rate
lassen lässt lässt ließ ließe gelassen lass/lasse
waschen wäschst wäscht wusch wüsche gewaschen wasch/wasche
wachsen wächst wächst wuchs wüchse gewachsen wachs/wachse
schlagen schlägst schlägt schlug schlüge geschlagen schlag/schlage
graben gräbst gräbt grub grübe gegraben grab/grabe
backen backst/bäckst backt/bäckt backte/buk backte/büke gebacken back/backe
braten brätst brät briet briete gebraten brat/brate
laden lädst/ladest lädt/ladet lud lüde geladen lad/lade
werfen wirfst wirft warf würfe geworfen wirf
sterben stirbst stirbt starb stürbe gestorben stirb
brechen brichst bricht brach bräche gebrochen brich
treten trittst tritt trat träte getreten tritt
empfehlen empfiehlst empfiehlt empfahl empföhle/empfähle empfohlen empfiehl
stehlen stiehlst stiehlt stahl stähle/stöhle gestohlen stiehl
befehlen befiehlst befiehlt befahl befähle/beföhle befohlen befiehl
gelten giltst gilt galt gälte/gölte gegolten gilt
werben wirbst wirbt warb würbe geworben wirb
stoßen stößt stößt stieß stieße gestoßen stoß/stoße
fangen fängst fängt fing finge gefangen fang/fange
gehen = = ging ginge gegangen geh/gehe
stehen = = stand stünde/stände gestanden steh/stehe
kommen = = kam käme gekommen komm/komme
bleiben = = blieb bliebe geblieben bleib/bleibe
schreiben = = schrieb schriebe geschrieben schreib/schreibe
steigen = = stieg stiege gestiegen steig/steige
scheinen = = schien schiene geschienen -
schweigen = = schwieg schwiege geschwiegen -
treiben = = trieb triebe getrieben treib/treibe
leihen = = lieh liehe geliehen leih/leihe
zeihen = = zieh ziehe geziehen -
meiden = = mied miede gemieden meid/meide
scheiden = = schied schiede geschieden -
beißen = = biss bisse gebissen beiß/beiße
reißen = = riss risse gerissen reiß/reiße
schneiden = = schnitt schnitte geschnitten schneid/schneide
leiden = = litt litte gelitten leid/leide
gleiten = = glitt glitte geglitten -
greifen = = griff griffe gegriffen greif/greife
pfeifen = = pfiff pfiffe gepfiffen -
streiten = = stritt stritte gestritten streit/streite
reiten = = ritt ritte geritten reit/reite
schreien = = schrie - geschrien schrei/schreie
gleichen = = glich gliche geglichen gleich/gleiche
winden = = wand wände gewunden wind/winde
streichen = = strich striche gestrichen streich/streiche
weisen = = wies wiese gewiesen weis/weise
finden = = fand fände gefunden find/finde
binden = = band bände gebunden bind/binde
singen = = sang sänge gesungen sing/singe
springen = = sprang spränge gesprungen spring/springe
trinken = = trank tränke getrunken trink/trinke
sinken = = sank sänke gesunken -
klingen = = klang klänge geklungen kling/klinge
gelingen = = gelang gelänge gelungen -
zwingen = = zwang zwänge gezwungen zwing/zwinge
dringen = = drang dränge gedrungen dring/dringe
schwimmen = = schwamm schwömme/schwämme geschwommen schwimm/schwimme
beginnen = = begann begänne/begönne begonnen beginn/beginne
gewinnen = = gewann gewönne/gewänne gewonnen gewinn/gewinne
bitten = = bat bäte gebeten bitte
sitzen = = saß säße gesessen sitz/sitze
liegen = = lag läge gelegen lieg/liege
ziehen = = zog zöge gezogen zieh/ziehe
fliegen = = flog flöge geflogen flieg/fliege
fliehen = = floh flöhe geflohen flieh/fliehe
schließen = = schloss schlösse geschlossen schließ/schließe
genießen = = genoss genösse genossen genieß/genieße
gießen = = goss gösse gegossen gieß/gieße
fließen = = floss flösse geflossen -
schieben = = schob schöbe geschoben schieb/schiebe
schießen = = schoss schösse geschossen schieß/schieße
verlieren = = verlor verlöre verloren verlier/verliere
wiegen = = wog wöge gewogen wieg/wiege
heben = = hob höbe gehoben heb/hebe
lügen = = log löge gelogen lüg/lüge
betrügen = = betrog betröge betrogen betrüg/betrüge
biegen = = bog böge gebogen bieg/biege
bieten = = bot böte geboten biet/biete
rufen = = rief riefe gerufen ruf/rufe
heißen = = hieß hieße geheißen heiß/heiße
hängen = = hing hinge gehangen häng/hänge
schaffen = = schuf schüfe geschaffen schaff/schaffe
denken = = dachte dächte gedacht denk/denke
kennen = = kannte kennte gekannt kenn/kenne
nennen = = nannte nennte genannt nenn/nenne
rennen = = rannte rennte gerannt renn/renne
brennen = = brannte brennte gebrannt brenn/brenne
bringen = = brachte brächte gebracht bring/bringe
senden = = sandte/sendete sendete gesandt/gesendet send/sende
wenden = = wandte/wendete wendete gewandt/gewendet wend/wende
geschehen geschieht geschieht geschah geschähe geschehen -
`;
const STRONG = new Map();
for (const line of STRONG_TABLE.trim().split("\n")) {
  const f = line.trim().split(/\s+/);
  STRONG.set(f[0], f);
}

function strongP(f) {
  const [inf, duF, erF, pretF, k2F, ppF, impF] = f;
  const stem = inf.slice(0, -2);
  const e = needsE(stem);
  const alt = (x) => (x === "-" ? [] : x.split("/"));
  const fin = [], imp = [];
  fin.push(stem + "e", ...(duF === "=" ? [sibilant(stem) ? stem + "t" : stem + (e ? "est" : "st")] : alt(duF)));
  fin.push(...(erF === "=" ? [stem + (e ? "et" : "t")] : alt(erF)));
  fin.push(inf, stem + (e ? "et" : "t"));
  for (const p of alt(pretF)) {
    const dEnd = /[dtsßxz]$/.test(p);
    fin.push(p, p.endsWith("e") ? p + "st" : p + (dEnd ? "est" : "st"), p.endsWith("e") ? p + "n" : p + "en",
      p.endsWith("e") ? p + "t" : p + (/[dt]$/.test(p) ? "et" : "t"));
  }
  for (const k of alt(k2F)) fin.push(k, k + "st", k + "n", k + "t");
  fin.push(stem + "e", stem + "est", stem + "et"); // Konjunktiv I
  if (impF && impF !== "-") imp.push(...impF.split("/"));
  else if (!impF) imp.push(stem + "e");
  return par({ fin, imp, inf, pp: alt(ppF), partI: inf + "d" });
}

// ---------- special / irregular verbs ----------
const SPECIAL = {
  sein: par({
    fin: ["bin", "bist", "ist", "sind", "seid", "sein", "war", "warst", "waren", "wart", "sei", "seiest", "seien", "seiet",
      "wäre", "wärest", "wärst", "wären", "wäret", "wärt", "seie"],
    imp: ["sei", "seid"], inf: "sein", pp: ["gewesen"], partI: "seiend",
  }),
  haben: par({
    fin: ["habe", "hast", "hat", "haben", "habt", "hatte", "hattest", "hatten", "hattet", "habest", "habet",
      "hätte", "hättest", "hätten", "hättet"],
    imp: ["hab", "habe"], inf: "haben", pp: ["gehabt"], partI: "habend",
  }),
  werden: par({
    fin: ["werde", "wirst", "wird", "werden", "werdet", "wurde", "wurdest", "wurden", "wurdet", "ward", "wardst",
      "würde", "würdest", "würden", "würdet", "werdest"],
    imp: ["werde"], inf: "werden", pp: ["geworden", "worden"], partI: "werdend",
  }),
  tun: par({
    fin: ["tue", "tust", "tut", "tun", "tat", "tatest", "taten", "tatet", "täte", "tätest", "täten", "tätet", "tuest", "tuet"],
    imp: ["tu", "tue"], inf: "tun", pp: ["getan"], partI: "tuend",
  }),
  wissen: par({
    fin: ["weiß", "weißt", "wissen", "wisst", "wusste", "wusstest", "wussten", "wusstet", "wüsste", "wüsstest", "wüssten",
      "wüsstet", "wisse", "wissest", "wisset"],
    imp: ["wisse"], inf: "wissen", pp: ["gewusst"], partI: "wissend",
  }),
  können: par({
    fin: ["kann", "kannst", "können", "könnt", "konnte", "konntest", "konnten", "konntet", "könnte", "könntest", "könnten",
      "könntet", "könne", "könnest", "könnet"],
    inf: "können", pp: ["gekonnt"], partI: "könnend",
  }),
  dürfen: par({
    fin: ["darf", "darfst", "dürfen", "dürft", "durfte", "durftest", "durften", "durftet", "dürfte", "dürftest", "dürften",
      "dürftet", "dürfe", "dürfest", "dürfet"],
    inf: "dürfen", pp: ["gedurft"], partI: "dürfend",
  }),
  müssen: par({
    fin: ["muss", "musst", "müssen", "müsst", "musste", "musstest", "mussten", "musstet", "müsste", "müsstest", "müssten",
      "müsstet", "müsse", "müssest", "müsset"],
    inf: "müssen", pp: ["gemusst"], partI: "müssend",
  }),
  sollen: par({
    fin: ["soll", "sollst", "sollen", "sollt", "sollte", "solltest", "sollten", "solltet", "solle", "sollest", "sollet"],
    inf: "sollen", pp: ["gesollt"], partI: "sollend",
  }),
  wollen: par({
    fin: ["will", "willst", "wollen", "wollt", "wollte", "wolltest", "wollten", "wolltet", "wolle", "wollest", "wollet"],
    inf: "wollen", pp: ["gewollt"], partI: "wollend",
  }),
  mögen: par({
    fin: ["mag", "magst", "mögen", "mögt", "mochte", "mochtest", "mochten", "mochtet", "möchte", "möchtest", "möchten",
      "möchtet", "möge", "mögest", "möget"],
    inf: "mögen", pp: ["gemocht"], partI: "mögend",
  }),
};

// ---------- composition ----------
function insepP(prefix, p) {
  return par({
    fin: p.fin.map((x) => prefix + x),
    imp: p.imp.map((x) => prefix + x),
    inf: prefix + p.inf,
    pp: p.pp.map((x) => prefix + stripGe(x)),
    partI: prefix + p.partI,
  });
}
function sepP(prefix, p) {
  return par({
    fin: [...p.fin, ...p.fin.map((x) => prefix + x)],
    imp: p.imp,
    inf: prefix + p.inf,
    pp: p.pp.map((x) => prefix + x),
    partI: prefix + p.partI,
    extra: [prefix + "zu" + p.inf],
  });
}
function paradigm(spec) {
  if (spec.startsWith("!")) return weakP(spec.slice(1), true); // weak verb with an unstressed prefix: no ge-
  const bar = spec.indexOf("|");
  if (bar >= 0) return sepP(spec.slice(0, bar), paradigm(spec.slice(bar + 1)));
  const plus = spec.indexOf("+");
  if (plus >= 0) return insepP(spec.slice(0, plus), paradigm(spec.slice(plus + 1)));
  if (SPECIAL[spec]) return SPECIAL[spec];
  if (STRONG.has(spec)) return strongP(STRONG.get(spec));
  return weakP(spec);
}

const WEAK = `
machen sagen kaufen suchen lernen spielen arbeiten leben wohnen lieben glauben hören fragen zeigen kosten brauchen meinen
stellen legen setzen holen kochen tanzen reisen buchen zahlen liefern schützen pflegen reinigen planen wählen danken
wünschen feiern wandern teilen folgen speichern drucken antworten schicken melden warten dauern passen wirken fehlen sorgen
kümmern achten ver+walten führen leiten er+zeugen fertigen rechnen zeichnen öffnen ordnen atmen regnen lächeln klingeln
zweifeln handeln wechseln sammeln ändern steigern testen starten nutzen bauen sparen tauschen lösen prüfen putzen malen
zählen kleben schenken stärken stören mieten reichen gründen parken frühstücken fördern sichern leisten fühlen lachen
weinen träumen hoffen lohnen stehen? nähen packen baden landen heizen schalten stecken drehen lenken wecken wagen mischen
klicken scrollen surfen posten liken bloggen chatten mailen scannen updaten mixen be+gegnen kontaktieren reservieren informieren registrieren installieren abonnieren
reparieren renovieren sanieren garantieren organisieren präsentieren produzieren kombinieren akzeptieren probieren
studieren funktionieren kontrollieren telefonieren diskutieren fotografieren interessieren konzentrieren motivieren
optimieren personalisieren recherchieren servieren trainieren transportieren stornieren existieren passieren
markieren integrieren definieren dokumentieren designen? implementieren analysieren
be+stellen be+zahlen be+suchen be+nutzen be+arbeiten be+antworten be+achten be+treuen be+gleiten be+schützen be+handeln
be+rechnen be+werten be+stätigen be+wirken be+sichtigen be+danken be+grüßen be+fürchten be+sorgen be+zeichnen
be+richten be+schäftigen be+schleunigen be+schränken be+setzen be+stimmen be+haupten be+tonen be+wahren be+wältigen
be+trachten be+rühren be+reichern be+nennen be+tragen be+raten be+schreiben be+stehen be+werben be+weisen be+halten
!bereiten be+kommen be+gehen be+fassen be+freien be+hindern be+leben be+lohnen be+mühen be+merken be+obachten be+rücksichtigen
er+klären er+leben er+reichen er+stellen er+warten er+halten er+öffnen er+setzen er+fahren er+füllen er+gänzen
er+leichtern er+lauben er+möglichen er+neuern er+wähnen er+zählen er+zeugen er+innern er+weitern er+mitteln er+arbeiten
er+kennen er+kunden er+ziehen er+sparen er+scheinen er+bauen er+fassen er+folgen er+freuen er+höhen er+schließen
er+teilen er+tragen er+halten er+holen er+gehen er+greifen er+leiden er+reichen er+bitten er+geben er+kunden
ver+kaufen ver+wenden ver+bessern ver+ändern ver+einbaren ver+suchen ver+walten ver+sichern ver+schicken ver+senden
ver+mieten ver+pachten ver+packen ver+binden ver+mitteln ver+anstalten ver+anlassen ver+arbeiten ver+bringen
ver+gleichen ver+größern ver+kleinern ver+längern ver+mehren ver+meiden ver+ringern ver+schönern ver+sprechen
ver+stärken ver+trauen ver+treten ver+wandeln ver+wirklichen ver+wöhnen ver+zichten ver+zeichnen ver+einfachen
ver+einigen ver+fassen ver+fügen ver+folgen ver+gessen ver+hindern ver+kürzen ver+leihen ver+lassen ver+legen
ver+lieben ver+öffentlichen ver+pflegen ver+sorgen ver+spüren ver+teilen ver+stehen ver+geben ver+bieten
ver+gehen ver+schieben ver+schließen ver+raten ver+sinken ver+zeihen ver+dienen ver+langen ver+abreden
ver+abschieden ver+antworten ver+bessern ver+bauen ver+bringen ver+ringern ver+rechnen ver+schenken
ver+wirren ver+wechseln ver+wöhnen ver+suchen ver+ursachen
ent+decken ent+wickeln ent+scheiden ent+halten ent+spannen ent+sprechen ent+stehen ent+fernen ent+falten ent+lassen
ent+nehmen ent+werfen ent+schuldigen ent+setzen ent+täuschen ent+zünden ent+gehen ent+kommen ent+fallen ent+lasten
ent+sorgen ent+schlüsseln ent+stören ent+wöhnen ent+gegnen
zer+stören zer+legen zer+schneiden zer+brechen zer+reißen zer+teilen
miss+brauchen miss+ver+stehen miss+achten
emp+fangen emp+finden
ge+hören ge+stalten ge+währen ge+brauchen ge+nehmigen ge+fallen ge+währleisten
über+prüfen über+nachten über+nehmen über+weisen über+raschen über+zeugen über+wachen über+legen über+liefern
über+arbeiten über+brücken über+tragen über+treffen über+sehen über+schreiben über+fallen über+fahren über+holen
über+winden über+leben über+schätzen
unter+stützen unter+nehmen unter|bringen unter+halten unter+scheiden unter+schreiben unter+richten unter+suchen
unter+brechen unter+bieten unter+streichen unter+lassen unter|gehen
wider+sprechen wider+stehen wider+rufen
an|melden an|bieten an|kommen an|rufen an|schauen an|sehen an|fangen an|nehmen an|geben an|fragen an|fordern an|passen
an|zeigen an|kündigen an|reisen an|sprechen an|wenden an|bauen an|legen an|lernen an|schließen an|stellen an|treffen an|tun
an|ziehen an|zünden an|klicken an|binden an|schreiben an|bringen an|gehen an|halten an|hören an|machen an|bieten an|laufen
an|ordnen an|sammeln an|spielen an|steigen an|strengen an|treten an|wachsen an|zahlen an|lächeln an|bahnen an|bellen
an|beten an|er+kennen an|ge+wöhnen
auf|bauen auf|be+wahren auf|fallen auf|führen auf|geben auf|hören auf|laden auf|machen auf|nehmen auf|passen auf|räumen
auf|rufen auf|schreiben auf|stehen auf|stellen auf|treten auf|wachen auf|wachsen auf|zeigen auf|zählen auf|ziehen auf|lösen
auf|!bereiten auf|brechen auf|fordern auf|frischen auf|heben auf|rüsten auf|werten auf|zeichnen auf|nehmen auf|halten
auf|legen auf|lassen auf|leuchten auf|listen auf|klären auf|machen auf|spielen auf|stocken auf|suchen auf|teilen auf|tragen
aus|füllen aus|geben aus|gehen aus|kommen aus|laden aus|probieren aus|rechnen aus|ruhen aus|sehen aus|schalten aus|suchen
aus|stellen aus|steigen aus|tauschen aus|wählen aus|wirken aus|zahlen aus|zeichnen aus|bauen aus|bilden aus|drucken
aus|fallen aus|führen aus|halten aus|leihen aus|lesen aus|packen aus|richten aus|schließen aus|schreiben aus|sprechen
aus|teilen aus|üben aus|weiten aus|werten aus|liefern aus|buchen aus|loggen aus|machen aus|nutzen aus|sortieren aus|wandern
ab|holen ab|geben ab|fahren ab|fliegen ab|lehnen ab|melden ab|sagen ab|schicken ab|senden ab|sprechen ab|stimmen ab|rechnen
ab|decken ab|lösen ab|nehmen ab|bauen ab|bilden ab|brechen ab|buchen ab|bieten ab|drucken ab|fragen ab|halten ab|hängen
ab|kürzen ab|laufen ab|legen ab|lesen ab|reisen ab|rufen ab|schalten ab|speichern ab|sichern ab|stellen ab|warten
ab|schließen ab|wickeln ab|ziehen ab|be+stellen
bei|tragen bei|treten bei|legen bei|fügen bei|liegen bei|bringen bei|stehen
ein|kaufen ein|laden ein|richten ein|stellen ein|treten ein|ziehen ein|geben ein|führen ein|halten ein|lösen ein|loggen
ein|packen ein|reichen ein|schalten ein|schließen ein|schreiben ein|setzen ein|tragen ein|tauschen ein|teilen ein|zahlen
ein|bauen ein|binden ein|bringen ein|fügen ein|gehen ein|hängen ein|kehren ein|lesen ein|nehmen ein|planen ein|rechnen
ein|sammeln ein|sparen ein|sehen ein|steigen ein|stufen ein|wirken ein|willigen ein|zeichnen ein|schlafen ein|fallen
ein|fahren ein|treffen ein|betten ein|laden ein|ordnen ein|räumen ein|richten ein|schätzen ein|scannen ein|stecken
mit|bringen mit|nehmen mit|machen mit|kommen mit|teilen mit|arbeiten mit|fahren mit|gehen mit|helfen mit|spielen mit|wirken
mit|zählen mit|schicken mit|senden mit|rechnen mit|liefern mit|be+stimmen mit|reden mit|singen mit|tragen mit|denken
nach|denken nach|fragen nach|sehen nach|schlagen nach|lesen nach|kommen nach|prüfen nach|weisen nach|liefern nach|folgen
nach|geben nach|gehen nach|lassen nach|rüsten nach|zahlen nach|füllen nach|bauen nach|messen nach|schauen nach|be+stellen
nach|machen nach|richten nach|forschen nach|ahmen nach|laden nach|rechnen nach|stellen
vor|!bereiten vor|stellen vor|schlagen vor|haben vor|kommen vor|nehmen vor|lesen vor|sehen vor|liegen vor|gehen vor|führen
vor|ziehen vor|schreiben vor|sagen vor|sorgen vor|zeigen vor|merken vor|be+stellen vor|reservieren vor|beugen vor|bauen
vor|werfen vor|rechnen vor|tragen vor|stehen vor|spielen vor|fahren vor|legen vor|halten
zu|machen zu|sagen zu|hören zu|sehen zu|nehmen zu|geben zu|stimmen zu|lassen zu|schicken zu|senden zu|ordnen zu|weisen
zu|treffen zu|gehen zu|!bereiten zu|fügen zu|schalten zu|schließen zu|trauen zu|ziehen zu|rufen zu|stellen zu|teilen zu|tragen
zu|bringen zu|schicken zu|greifen zu|sichern zu|packen zu|kommen
zurück|geben zurück|kommen zurück|kehren zurück|rufen zurück|senden zurück|schicken zurück|zahlen zurück|nehmen
zurück|treten zurück|halten zurück|fahren zurück|gehen zurück|legen zurück|melden zurück|bringen zurück|blicken
zurück|führen zurück|stellen zurück|lassen zurück|ziehen zurück|er+statten zurück|buchen zurück|setzen zurück|schalten
weg|gehen weg|bringen weg|nehmen weg|werfen weg|laufen weg|legen weg|schicken weg|fahren weg|lassen weg|räumen weg|stellen
weg|ziehen weg|schaffen weg|lassen
her|stellen her|kommen her|geben her|bringen her|richten her|leiten her|holen her|sehen her|zeigen
hin|gehen hin|weisen hin|fahren hin|stellen hin|fallen hin|legen hin|setzen hin|bringen hin|schicken
hinzu|fügen hinzu|kommen hinzu|rechnen hinzu|ziehen hinzu|nehmen hinzu|setzen hinzu|schalten hinzu|buchen
herunter|laden herunter|fahren herunter|kommen herunter|setzen herunter|stufen herunter|schalten herunter|gehen
herunter|ziehen herunter|scrollen
hoch|laden hoch|fahren hoch|gehen hoch|rechnen hoch|stufen hoch|ziehen hoch|halten hoch|heben hoch|kommen hoch|springen
hoch|setzen hoch|schalten hoch|skalieren
um|ziehen um|steigen um|tauschen um|buchen um|stellen um|bauen um|be+nennen um|be+stellen um|gehen um|kehren um|laden
um|leiten um|rechnen um|schalten um|schreiben um|setzen um|wandeln um|wechseln um|gestalten um|sehen um|denken um|fassen
um|rüsten um|rühren um|lenken um|drehen um|klappen um|klicken um|lagern um|melden um|organisieren um|formen um|programmieren
fest|legen fest|halten fest|stellen fest|setzen fest|machen fest|nehmen fest|binden fest|schreiben fest|lassen fest|sitzen
fest|klemmen fest|zurren
statt|finden statt|geben
teil|nehmen teil|haben teil|zahlen
wieder|sehen wieder|holen wieder|kommen wieder|geben wieder|finden wieder|ver+wenden wieder|ver+kaufen
weiter|geben weiter|leiten weiter|machen weiter|gehen weiter|führen weiter|empfehlen weiter|ent+wickeln weiter|bilden
weiter|kommen weiter|lesen weiter|fahren weiter|reichen weiter|schicken weiter|senden weiter|helfen weiter|ver+kaufen
weiter|bringen weiter|ver+arbeiten weiter|sagen aus|ver+kaufen
zusammen|fassen zusammen|arbeiten zusammen|stellen zusammen|bauen zusammen|kommen zusammen|setzen zusammen|führen
zusammen|legen zusammen|tragen zusammen|treffen zusammen|passen zusammen|bringen zusammen|halten zusammen|rechnen
zusammen|schließen zusammen|fügen zusammen|leben zusammen|wirken zusammen|ziehen
vorbei|kommen vorbei|gehen vorbei|fahren vorbei|schauen vorbei|bringen vorbei|laufen
heraus|finden heraus|geben heraus|fordern heraus|nehmen heraus|kommen heraus|stellen heraus|ziehen heraus|arbeiten
heraus|holen heraus|filtern heraus|lesen heraus|bringen heraus|rufen heraus|fallen heraus|putzen
hinaus|gehen hinaus|führen hinaus|schieben hinaus|werfen hinaus|laufen hinaus|zögern
herein|kommen herein|bitten herein|lassen herein|holen herein|fallen herein|bringen herein|rufen herein|schauen
hinein|gehen hinein|kommen hinein|fallen hinein|stecken hinein|legen hinein|passen hinein|schauen hinein|geben
los|gehen los|fahren los|lassen los|legen los|schicken los|laufen los|lösen los|ziehen los|schalten los|schlagen
frei|geben frei|schalten frei|lassen frei|stellen frei|halten frei|machen frei|setzen frei|sprechen frei|legen
bereit|stellen bereit|halten bereit|legen bereit|machen bereit|liegen bereit|stehen
voran|gehen voran|treiben voran|bringen voran|kommen voran|schreiten
entgegen|kommen entgegen|nehmen entgegen|treten entgegen|wirken entgegen|sehen entgegen|bringen entgegen|halten
dazu|gehören dazu|kommen dazu|lernen dazu|geben dazu|tun dazu|rechnen dazu|be+stellen dazu|buchen dazu|ver+dienen dazu|fügen
dazu|bringen dazu|zählen dazu|nehmen dazu|schreiben
durch|führen durch|lesen durch|gehen durch|sehen durch|halten durch|setzen durch|rechnen durch|suchen durch|spielen
durch|fallen durch|kommen durch|schauen durch|arbeiten durch|planen durch|fahren durch|laufen durch|stellen durch|checken
durch|blicken durch|denken durch|sprechen durch|ziehen durch|schneiden durch|messen
kennen|lernen spazieren|gehen sicher|stellen gut|schreiben gut|gehen fern|sehen auf|er+legen
nach|er+zählen
`;

export function build() {
  const forms = new Set();
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));
  const entries = new Set();
  for (const k of Object.keys(SPECIAL)) entries.add(k);
  for (const k of STRONG.keys()) entries.add(k);
  for (const tok of WEAK.split(/\s+/).filter(Boolean)) {
    if (tok.endsWith("?")) continue; // doubtful entries are left out deliberately
    entries.add(tok);
  }
  for (const spec of entries) {
    let p;
    try {
      p = paradigm(spec);
    } catch (e) {
      throw new Error(`de: cannot build "${spec}": ${e.message}`);
    }
    add(...p.fin, ...p.imp, p.inf, ...p.pp, p.partI, ...p.extra);
  }
  // hängen as a weak transitive verb (hängte / gehängt); strong intransitive hing / gehangen is in the table
  add("hängte", "hängtest", "hängten", "hängtet", "gehängt", "aufgehängt", "aufhängte", "aufhängen");
  // imperatives of the common irregular verbs
  add("lass", "lasst", "sei", "seid", "hab", "habt", "gib", "gebt", "nimm", "nehmt", "sieh", "seht", "komm", "kommt", "geh", "geht",
    "bleib", "bleibt", "wirf", "werft", "vergiss", "vergesst", "iss", "esst", "lies", "lest", "sprich", "sprecht", "hilf", "helft");
  return { forms: [...forms], nVerbs: entries.size };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

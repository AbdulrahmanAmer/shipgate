// WP-104 d1 - Swedish verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// Group 1 (-ar/-ade/-at) by generator; groups 2, 3 and 4 (strong) + irregular verbs from explicit rows:
//   "inf pres pret sup imp [+] [& pp ...]"   "/" = alternatives, "-" = none
//   "+"  : also emit the s-passive (inf-s, pres-s, pret-s, sup-s)
//   "&"  : explicit participle forms (otherwise derived from the ending of pret/sup)

// ---- group 1 : infinitive in -a ; a trailing "+" asks for the s-passive ----
const G1 = `
arbeta boka+ kontakta+ installera+ reservera+ registrera+ leverera+ garantera+ reparera+ designa+ utveckla+ spara+ ladda+ städa+
laga+ baka+ koka+ tala hitta+ betala+ handla visa+ hälsa vänta börja fråga svara prova+ testa+ starta+ avsluta+ öppna+ ändra+ skapa+
dela+ gilla+ kolla+ klicka logga uppdatera+ prenumerera abonnera producera+ organisera+ planera+ presentera+ rekommendera+
acceptera+ förbättra+ förenkla+ kontrollera+ analysera+ optimera+ anpassa+ träna simma vandra cykla lyssna titta utforska+ fira+
fiska fotografera+ filma+ spela+ leka dansa måla+ rita+ väva+ snickra renovera+ montera+ tvätta+ vårda+ behandla+ massera+ koppla+
ansluta+ hämta+ skicka+ fakturera+ returnera+ avboka+ lova+ tacka+ välkomna+ närvara delta medverka bidra
sponsra+ samarbeta kommunicera informera+ meddela+ rapportera+ publicera+ annonsera+ lämna+ räkna+ lita besluta+ bevisa+
förklara+ berätta+ förändra+ smaka flytta+ låna+ rädda+ duka+ kalla+ sluta tillverka+ förlora+ mista+
bruka förstora+ förminska+ förlänga+ förkorta+ förnya+ hantera+ tillämpa+
jobba studera+ undervisa+ utbilda+ programmera+ koda+ lansera+ effektivisera+ automatisera+
digitalisera+ integrera+ implementera+ konfigurera+ hosta+ synka+ radera+ ordna+ fixa+
gratulera+ besvara+ reklamera+ bearbeta+ behärska+
dekorera+ underlätta+ beundra+ respektera+ värdera+ värna+ uppskatta+ rekrytera+
avsluta+ avgränsa+ avvakta+ avnjuta+ avlägsna+ inkludera+ exkludera+ bevara+ stava+
`;

// ---- group 2, 3, 4 and irregular rows ----
const ROWS = `
köpa köper köpte köpt köp +
läsa läser läste läst läs +
tänka tänker tänkte tänkt tänk
tycka tycker tyckte tyckt tyck
försöka försöker försökte försökt försök
besöka besöker besökte besökt besök +
söka söker sökte sökt sök +
undersöka undersöker undersökte undersökt undersök +
leva lever levde levt lev
bygga bygger byggde byggt bygg +
hyra hyr hyrde hyrt hyr +
höra hör hörde hört hör +
köra kör körde kört kör +
lära lär lärde lärt lär
föra för förde fört för +
stänga stänger stängde stängt stäng +
tända tänder tände tänt tänd +
vända vänder vände vänt vänd +
använda använder använde använt använd +
sända sänder sände sänt sänd +
ställa ställer ställde ställt ställ +
beställa beställer beställde beställt beställ +
anmäla anmäler anmälde anmält anmäl +
följa följer följde följt följ +
resa reser reste rest res
åka åker åkte åkt åk
steka steker stekte stekt stek +
stödja stöder stödde stött stöd + & stödd stött stödda
sätta sätter satte satt sätt +
lägga lägger lade lagt lägg + & lagd lagt lagda
säga säger sa/sade sagt säg + & sagd sagt sagda
sälja säljer sålde sålt sälj +
välja väljer valde valt välj +
hjälpa hjälper hjälpte hjälpt hjälp
känna känner kände känt känn +
glömma glömmer glömde glömt glöm +
hända händer hände hänt -
lyfta lyfter lyfte lyft lyft +
räcka räcker räckte räckt räck
kräva kräver krävde krävt kräv +
bestämma bestämmer bestämde bestämt bestäm +
ersätta ersätter ersatte ersatt ersätt +
mäta mäter mätte mätt mät
döma dömer dömde dömt döm +
gömma gömmer gömde gömt göm +
stämma stämmer stämde stämt stäm
ringa ringer ringde ringt ring +
fylla fyller fyllde fyllt fyll +
trycka trycker tryckte tryckt tryck +
stärka stärker stärkte stärkt stärk +
lysa lyser lyste lyst lys
byta byter bytte bytt byt +
nämna nämner nämnde nämnt nämn +
växa växer växte växt väx
hänga hänger hängde hängt häng
bryta bryter bröt brutit bryt +
medföra medför medförde medfört medför
tillföra tillför tillförde tillfört tillför +
utföra utför utförde utfört utför +
jämföra jämför jämförde jämfört jämför +
framföra framför framförde framfört framför
överväga överväger övervägde övervägt överväg +
bo bor bodde bott bo
tro tror trodde trott tro +
nå når nådde nått nå +
uppnå uppnår uppnådde uppnått uppnå +
sy syr sydde sytt sy +
klä klär klädde klätt klä +
ske sker skedde skett -
bry bryr brydde brytt bry
betyda betyder betydde betytt betyd
vara är var varit var & -
ha har hade haft ha
göra gör gjorde gjort gör +
gå går gick gått gå + & gången gånget gångna
stå står stod stått stå
se ser såg sett se + & sedd sett sedda
ge ger gav gett/givit ge + & given givet givna
ta tar tog tagit ta + & tagen taget tagna
få får fick fått få
komma kommer kom kommit kom
bli blir blev blivit bli
skriva skriver skrev skrivit skriv +
dra drar drog dragit dra +
ligga ligger låg legat ligg
sitta sitter satt suttit sitt
bära bär bar burit bär +
bjuda bjuder bjöd bjudit bjud +
binda binder band bundit bind +
bita biter bet bitit bit +
dricka dricker drack druckit drick +
driva driver drev drivit driv +
falla faller föll fallit fall
fara far for farit far
finna finner fann funnit finn +
flyga flyger flög flugit flyg
frysa fryser frös frusit frys
försvinna försvinner försvann försvunnit försvinn
gråta gråter grät gråtit gråt
hålla håller höll hållit håll +
heta heter hette hetat het
knyta knyter knöt knutit knyt +
kunna kan kunde kunnat -
ljuga ljuger ljög ljugit ljug
låta låter lät låtit låt
lida lider led lidit lid
njuta njuter njöt njutit njut
rida rider red ridit rid
rinna rinner rann runnit rinn
skina skiner sken skinit skin
skjuta skjuter sköt skjutit skjut +
skola ska/skall skulle skolat -
skrika skriker skrek skrikit skrik
slita sliter slet slitit slit +
slippa slipper slapp sluppit slipp
slå slår slog slagit slå +
sjunga sjunger sjöng sjungit sjung +
sjunka sjunker sjönk sjunkit sjunk
springa springer sprang sprungit spring
sticka sticker stack stuckit stick +
stiga stiger steg stigit stig
stryka stryker strök strukit stryk +
sova sover sov sovit sov
spricka spricker sprack spruckit sprick
stjäla stjäl stal stulit stjäl +
svära svär svor svurit svär
tiga tiger teg tigit tig
vika viker vek vikit vik
vilja vill ville velat -
vinna vinner vann vunnit vinn +
veta vet visste vetat vet
äta äter åt ätit ät +
förstå förstår förstod förstått förstå
bestå består bestod bestått bestå
innehålla innehåller innehöll innehållit innehåll
ingå ingår ingick ingått ingå
behålla behåller behöll behållit behåll
underhålla underhåller underhöll underhållit underhåll
tillhandahålla tillhandahåller tillhandahöll tillhandahållit -
erhålla erhåller erhöll erhållit erhåll
anse anser ansåg ansett anse + & ansedd ansett ansedda
undvika undviker undvek undvikit undvik
tillåta tillåter tillät tillåtit tillåt +
förbjuda förbjuder förbjöd förbjudit förbjud +
erbjuda erbjuder erbjöd erbjudit erbjud +
anta antar antog antagit anta +
ange anger angav angivit ange +
avgöra avgör avgjorde avgjort avgör +
återkomma återkommer återkom återkommit återkom
upptäcka upptäcker upptäckte upptäckt upptäck +
uppleva upplever upplevde upplevt upplev +
börja börjar började börjat börja
förbereda förbereder förberedde förberett förbered +
inreda inreder inredde inrett inred +
lösa löser löste löst lös +
godkänna godkänner godkände godkänt godkänn +
anställa anställer anställde anställt anställ +
väga väger vägde vägt väg
tillfredsställa tillfredsställer tillfredsställde tillfredsställt tillfredsställ +
avhjälpa avhjälper avhjälpte avhjälpt avhjälp +
marknadsföra marknadsför marknadsförde marknadsfört marknadsför +
avbryta avbryter avbröt avbrutit avbryt +
behöva behöver behövde behövt behöv +
skilja skiljer skilde skilt skilj +
ersätta ersätter ersatte ersatt ersätt +
sluta slutar slutade slutat sluta
dö dör dog dött dö
måste måste måste måst -
böra bör borde bort -
våga vågar vågade vågat våga
minnas minns mindes mints -
finnas finns fanns funnits -
hoppas hoppas hoppades hoppats -
trivas trivs trivdes trivts -
lyckas lyckas lyckades lyckats -
rengöra rengör rengjorde rengjort rengör +
vidta vidtar vidtog vidtagit vidta
utge utger utgav utgivit utge +
uppge uppger uppgav uppgivit uppge +
medge medger medgav medgivit medge
tillägga tillägger tillade tillagt tillägg
tillsätta tillsätter tillsatte tillsatt tillsätt +
fortsätta fortsätter fortsatte fortsatt fortsätt
förutsätta förutsätter förutsatte förutsatt förutsätt +
`;

const PARTICIPLE_IRREG = {
  ta: "tagande", dra: "dragande", ha: "havande", gå: "gående", stå: "stående", se: "seende", bo: "boende", tro: "troende",
  ske: "skeende", bli: "blivande", dö: "döende", sy: "syende", nå: "nående", få: "fående", klä: "klädande", bry: "bryende",
  ge: "givande", vara: "varande",
};

function partI(inf) {
  if (PARTICIPLE_IRREG[inf]) return PARTICIPLE_IRREG[inf];
  if (inf.endsWith("a") && inf.length > 3) return inf.slice(0, -1) + "ande";
  return null;
}
const alts = (x) => (x === undefined || x === "-" ? [] : x.split("/"));

function passivePres(inf, pres) {
  if (inf.length <= 2) return pres.slice(0, -1) + "s"; // ger -> ges, ser -> ses, tar -> tas, syr -> sys
  if (pres.endsWith("ar")) return pres.slice(0, -1) + "s"; // arbetar -> arbetas
  if (pres.endsWith("er")) {
    const stem = pres.slice(0, -2);
    if (stem.endsWith("s")) return pres.slice(0, -1) + "s"; // läser -> läses
    if (stem.endsWith("mm")) return stem.slice(0, -1) + "s"; // glömmer -> glöms
    return stem + "s"; // köper -> köps
  }
  if (pres === inf.slice(0, -1)) return pres + "s"; // hyr -> hyrs, gör -> görs
  return null;
}

function emitRow(add, line) {
  const t = line.trim().split(/\s+/);
  const [inf, pres, pret, sup, imp, ...rest] = t;
  const amp = rest.indexOf("&");
  const flags = amp >= 0 ? rest.slice(0, amp) : rest;
  const given = amp >= 0 ? rest.slice(amp + 1) : null;
  const passive = flags.includes("+");
  add(inf);
  alts(pres).forEach((p) => add(p));
  alts(pret).forEach((p) => add(p));
  alts(sup).forEach((p) => add(p));
  alts(imp).forEach((p) => add(p));
  const pi = partI(inf);
  if (pi) add(pi);
  // participles
  if (given) {
    given.filter((x) => x !== "-").forEach((x) => add(x));
  } else if (passive) {
    for (const p of alts(pret)) {
      if (p.endsWith("ade")) {
        const s = p.slice(0, -3);
        add(s + "ad", s + "at", s + "ade");
      } else if (p.endsWith("te") && sup) {
        for (const su of alts(sup)) add(su, su + "a");
      } else if (p.endsWith("de") && sup) {
        const s = p.slice(0, -2);
        add(s + "d", s + "t", s + "da");
      }
    }
    for (const su of alts(sup)) if (passive && su.endsWith("it") && su.length > 3) { const s = su.slice(0, -2); add(s + "en", s + "et", s.endsWith("n") ? s + "a" : s + "na"); }
  }
  if (passive) {
    add(inf + "s");
    for (const p of alts(pres)) {
      const ps = passivePres(inf, p);
      if (ps) add(ps);
    }
    alts(pret).forEach((p) => add(p + "s"));
    alts(sup).forEach((p) => add(p + "s"));
  }
}

export function build() {
  const forms = new Set();
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));
  let nVerbs = 0;
  const seen = new Set();
  for (let tok of G1.split(/\s+/).filter(Boolean)) {
    if (tok.endsWith("?")) continue; // verbs that are not group 1 (listed in the explicit rows) or doubtful
    const passive = tok.endsWith("+");
    if (passive) tok = tok.slice(0, -1);
    if (seen.has(tok)) continue;
    seen.add(tok);
    nVerbs++;
    const s = tok.slice(0, -1);
    emitRow(add, `${tok} ${tok}r ${s}ade ${s}at ${tok} ${passive ? "+" : ""}`);
  }
  for (const line of ROWS.trim().split("\n")) {
    const inf = line.trim().split(/\s+/)[0];
    if (seen.has(inf)) continue;
    seen.add(inf);
    nVerbs++;
    emitRow(add, line);
  }
  // subjunctive and a few frequent irregular finite forms
  ["vore", "månde", "må", "mån", "lär", "tör", "törs", "skall", "kunde", "ville", "skulle", "borde", "måste", "blev", "blivit", "varit", "hade", "haft",
    "gick", "gått", "sade", "givit", "gjort", "tagit", "fått", "kommit", "sett", "sagt", "satt", "suttit", "legat"].forEach((x) => add(x));
  return { forms: [...forms], nVerbs };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

// Polish verb forms (SE-121). Authored from linguistic knowledge; paradigm generators + explicit irregular tables.
const out = new Set();
const add = (arr) => { for (const f of arr) if (f) out.add(f); };
const ADJ = ["y", "a", "e", "ego", "ej", "emu", "ą", "ym", "ych", "ymi"];

// PL(inf, pres[6], imp, past [m, f, v], pass-stem, opts)
//   past: m = masculine stem ending in ł (czytał); f = stem ending in ł before -a/-o/-y (czytał); v = stem before virile -i (czytal)
function PL(inf, pres, imp, past, pass, o = {}) {
  add([inf, ...pres]);
  if (!o.perf) {
    const G = pres[5] + "c";
    add([G, ...ADJ.map((e) => G + e)]);
  }
  if (imp) add([imp, imp + "my", imp + "cie"]);
  const [m, f, v] = past;
  add([m, (o.mem || m) + "em", (o.mem || m) + "eś", m + "by", m + "bym", m + "byś"]);
  add([f + "a", f + "am", f + "aś", f + "o", f + "aby", f + "abym", f + "abyś", f + "oby"]);
  add([f + "y", f + "yśmy", f + "yście", f + "yby", f + "ybyśmy", f + "ybyście"]);
  add([v + "i", v + "iśmy", v + "iście", v + "iby", v + "ibyśmy", v + "ibyście"]);
  if (pass) add([...ADJ.map((e) => pass + e), pass + "o"]);
  if (o.perf && m === f && !o.nowszy) add([/[aeiouyąęó]ł$/.test(f) ? f.slice(0, -1) + "wszy" : f + "szy"]);
}
const pastReg = (inf) => { const b = inf.slice(0, -1); return [b + "ł", b + "ł", b + "l"]; };
const pastE = (inf, stemSoft) => { // -eć verbs: -ał/-ała/-eli
  const b = inf.slice(0, -2);
  return [b + "ał", b + "ał", (stemSoft || b) + "el"];
};
// a-type: czytać, czytam
function A(inf, o = {}) {
  const s = inf.slice(0, -1);
  PL(inf, [s + "m", s + "sz", s, s + "my", s + "cie", s + "ją"], o.imp || s + "j", o.past || pastReg(inf), o.pass === undefined ? s + "n" : o.pass, o);
}
// i/y-type: robić, uczyć. s1 = stem of 1sg/3pl incl. palatalisation (default s+i for -ić, s for -yć)
function I(inf, imp, pass, o = {}) {
  const s = inf.slice(0, -2);
  const v = inf.endsWith("ić") ? "i" : "y";
  const s1 = o.s1 || (v === "i" && !/(c|dz|l)$/.test(s) ? s + "i" : s);
  PL(inf, [s1 + "ę", s + v + "sz", s + v, s + v + "my", s + v + "cie", s1 + "ą"], imp, pastReg(inf), pass, o);
}
// u-type: kupować, pokazywać, obsługiwać
function U(inf, o = {}) {
  const s = inf.slice(0, -4) + "uj";
  PL(inf, [s + "ę", s + "esz", s + "e", s + "emy", s + "ecie", s + "ą"], s, pastReg(inf), o.pass !== undefined ? o.pass : inf.slice(0, -1) + "n", o);
}
// j-type: dawać (daj), pić (pij), żyć (żyj)
function J(inf, sj, pass, o = {}) {
  PL(inf, [sj + "ę", sj + "esz", sj + "e", sj + "emy", sj + "ecie", sj + "ą"], sj, pastReg(inf), pass, o);
}
// n-type: kliknąć, usunąć
function N(inf, o = {}) {
  const s = inf.slice(0, -2);
  PL(inf, [s + "ę", s + "iesz", s + "ie", s + "iemy", s + "iecie", s + "ą"], o.imp || (/[aeiouyąęó]n$/.test(s) ? s.slice(0, -1) + "ń" : s + "ij"), [s + "ął", s + "ęł", s + "ęl"], o.pass === undefined ? s + "ięt" : o.pass, { perf: true, ...o });
}
// e-type: pisać (pisz-)
function E(inf, s, imp, pass, o = {}) {
  PL(inf, [s + "ę", s + "esz", s + "e", s + "emy", s + "ecie", s + "ą"], imp, o.past || pastReg(inf), pass, o);
}
function X(inf, pres, imp, past, pass, o = {}) { PL(inf, pres, imp, past || pastReg(inf), pass, o); }
// idź-class: przyjść, wyjść ...
function IDZ(inf, ps, m, f, imp) {
  PL(inf, [ps + "dę", ps + "dziesz", ps + "dzie", ps + "dziemy", ps + "dziecie", ps + "dą"], imp, [m, f, f.slice(0, -1) + "l"], null, { perf: true });
}

// ---- be / have / modal
X("być", ["jestem", "jesteś", "jest", "jesteśmy", "jesteście", "są"], "bądź", ["był", "był", "byl"], null);
add(["będę", "będziesz", "będzie", "będziemy", "będziecie", "będą", "będąc", "będący", "będąca", "będące", "bądźmy", "bądźcie", "niebędący"]);
A("bywać");
X("mieć", ["mam", "masz", "ma", "mamy", "macie", "mają"], "miej", pastE("mieć"), null);
X("chcieć", ["chcę", "chcesz", "chce", "chcemy", "chcecie", "chcą"], "chciej", ["chciał", "chciał", "chciel"], null);
X("zechcieć", ["zechcę", "zechcesz", "zechce", "zechcemy", "zechcecie", "zechcą"], null, ["zechciał", "zechciał", "zechciel"], null, { perf: true });
X("móc", ["mogę", "możesz", "może", "możemy", "możecie", "mogą"], null, ["mógł", "mogł", "mogl"], null, { mem: "mogł" });
X("pomóc", ["pomogę", "pomożesz", "pomoże", "pomożemy", "pomożecie", "pomogą"], "pomóż", ["pomógł", "pomogł", "pomogl"], null, { perf: true, mem: "pomogł" });
A("pomagać");
X("musieć", ["muszę", "musisz", "musi", "musimy", "musicie", "muszą"], null, pastE("musieć"), null);
X("umieć", ["umiem", "umiesz", "umie", "umiemy", "umiecie", "umieją"], "umiej", pastE("umieć"), null);
X("rozumieć", ["rozumiem", "rozumiesz", "rozumie", "rozumiemy", "rozumiecie", "rozumieją"], "rozumiej", pastE("rozumieć"), null);
X("zrozumieć", ["zrozumiem", "zrozumiesz", "zrozumie", "zrozumiemy", "zrozumiecie", "zrozumieją"], "zrozum", pastE("zrozumieć"), "zrozumian", { perf: true });
X("wiedzieć", ["wiem", "wiesz", "wie", "wiemy", "wiecie", "wiedzą"], "wiedz", ["wiedział", "wiedział", "wiedziel"], null);
X("widzieć", ["widzę", "widzisz", "widzi", "widzimy", "widzicie", "widzą"], null, ["widział", "widział", "widziel"], "widzian");
X("zobaczyć", ["zobaczę", "zobaczysz", "zobaczy", "zobaczymy", "zobaczycie", "zobaczą"], "zobacz", pastReg("zobaczyć"), "zobaczon", { perf: true });
X("słyszeć", ["słyszę", "słyszysz", "słyszy", "słyszymy", "słyszycie", "słyszą"], null, ["słyszał", "słyszał", "słyszel"], "słyszan");
X("usłyszeć", ["usłyszę", "usłyszysz", "usłyszy", "usłyszymy", "usłyszycie", "usłyszą"], "usłysz", ["usłyszał", "usłyszał", "usłyszel"], "usłyszan", { perf: true });
X("siedzieć", ["siedzę", "siedzisz", "siedzi", "siedzimy", "siedzicie", "siedzą"], "siedź", ["siedział", "siedział", "siedziel"], null);
X("leżeć", ["leżę", "leżysz", "leży", "leżymy", "leżycie", "leżą"], "leż", ["leżał", "leżał", "leżel"], null);
X("lecieć", ["lecę", "lecisz", "leci", "lecimy", "lecicie", "lecą"], "leć", ["leciał", "leciał", "leciel"], null);
X("myśleć", ["myślę", "myślisz", "myśli", "myślimy", "myślicie", "myślą"], "myśl", ["myślał", "myślał", "myślel"], null);
X("istnieć", ["istnieję", "istniejesz", "istnieje", "istniejemy", "istniejecie", "istnieją"], "istniej", ["istniał", "istniał", "istniel"], null);
X("zależeć", ["zależę", "zależysz", "zależy", "zależymy", "zależycie", "zależą"], null, ["zależał", "zależał", "zależel"], null);
X("należeć", ["należę", "należysz", "należy", "należymy", "należycie", "należą"], null, ["należał", "należał", "należel"], null);
X("obejrzeć", ["obejrzę", "obejrzysz", "obejrzy", "obejrzymy", "obejrzycie", "obejrzą"], "obejrzyj", ["obejrzał", "obejrzał", "obejrzel"], "obejrzan", { perf: true });
X("odpowiedzieć", ["odpowiem", "odpowiesz", "odpowie", "odpowiemy", "odpowiecie", "odpowiedzą"], "odpowiedz", ["odpowiedział", "odpowiedział", "odpowiedziel"], null, { perf: true });
X("powiedzieć", ["powiem", "powiesz", "powie", "powiemy", "powiecie", "powiedzą"], "powiedz", ["powiedział", "powiedział", "powiedziel"], "powiedzian", { perf: true });
I("mówić", "mów", "mówion");
I("zrobić", "zrób", "zrobion", { perf: true });
I("robić", "rób", "robion");
I("lubić", "lub", "lubion");
I("polubić", "polub", "polubion", { perf: true });
// ---- motion
X("iść", ["idę", "idziesz", "idzie", "idziemy", "idziecie", "idą"], "idź", ["szedł", "szł", "szl"], null);
IDZ("pójść", "pój", "poszedł", "poszł", "pójdź");
IDZ("przyjść", "przyj", "przyszedł", "przyszł", "przyjdź");
IDZ("wyjść", "wyj", "wyszedł", "wyszł", "wyjdź");
IDZ("wejść", "wej", "wszedł", "weszł", "wejdź");
IDZ("dojść", "doj", "doszedł", "doszł", "dojdź");
IDZ("przejść", "przej", "przeszedł", "przeszł", "przejdź");
IDZ("odejść", "odej", "odszedł", "odeszł", "odejdź");
IDZ("zajść", "zaj", "zaszedł", "zaszł", "zajdź");
X("znaleźć", ["znajdę", "znajdziesz", "znajdzie", "znajdziemy", "znajdziecie", "znajdą"], "znajdź", ["znalazł", "znalazł", "znaleźl"], "znalezion", { perf: true });
add(["znaleziony", "znaleziona", "znalezione", "znalezionego", "znalezionej", "znalezionemu", "znalezioną", "znalezionym", "znalezionych", "znalezionymi", "znaleziono"]);
X("jechać", ["jadę", "jedziesz", "jedzie", "jedziemy", "jedziecie", "jadą"], "jedź", ["jechał", "jechał", "jechal"], null);
X("pojechać", ["pojadę", "pojedziesz", "pojedzie", "pojedziemy", "pojedziecie", "pojadą"], "pojedź", ["pojechał", "pojechał", "pojechal"], null, { perf: true });
X("przyjechać", ["przyjadę", "przyjedziesz", "przyjedzie", "przyjedziemy", "przyjedziecie", "przyjadą"], "przyjedź", ["przyjechał", "przyjechał", "przyjechal"], null, { perf: true });
add(["jechali", "pojechali", "przyjechali", "jechaliśmy", "pojechaliśmy", "przyjechaliśmy"]);
I("przychodzić", "przychodź", null, { s1: "przychodz" });
// ---- give / take / basic
X("dać", ["dam", "dasz", "da", "damy", "dacie", "dadzą"], "daj", ["dał", "dał", "dal"], "dan", { perf: true });
X("sprzedać", ["sprzedam", "sprzedasz", "sprzeda", "sprzedamy", "sprzedacie", "sprzedadzą"], "sprzedaj", ["sprzedał", "sprzedał", "sprzedal"], "sprzedan", { perf: true });
X("dodać", ["dodam", "dodasz", "doda", "dodamy", "dodacie", "dodadzą"], "dodaj", ["dodał", "dodał", "dodal"], "dodan", { perf: true });
X("podać", ["podam", "podasz", "poda", "podamy", "podacie", "podadzą"], "podaj", ["podał", "podał", "podal"], "podan", { perf: true });
X("przekazać", ["przekażę", "przekażesz", "przekaże", "przekażemy", "przekażecie", "przekażą"], "przekaż", pastReg("przekazać"), "przekazan", { perf: true });
J("dawać", "daj", "dawan");
J("sprzedawać", "sprzedaj", "sprzedawan");
J("dodawać", "dodaj", "dodawan");
J("podawać", "podaj", "podawan");
J("zostawać", "zostaj", "zostawan");
J("wstawać", "wstaj", "wstawan");
J("poznawać", "poznaj", "poznawan");
X("wziąć", ["wezmę", "weźmiesz", "weźmie", "weźmiemy", "weźmiecie", "wezmą"], "weź", ["wziął", "wzięł", "wzięl"], "wzięt", { perf: true });
X("brać", ["biorę", "bierzesz", "bierze", "bierzemy", "bierzecie", "biorą"], "bierz", pastReg("brać"), "bran");
X("pobrać", ["pobiorę", "pobierzesz", "pobierze", "pobierzemy", "pobierzecie", "pobiorą"], "pobierz", pastReg("pobrać"), "pobran", { perf: true });
X("wybrać", ["wybiorę", "wybierzesz", "wybierze", "wybierzemy", "wybierzecie", "wybiorą"], "wybierz", pastReg("wybrać"), "wybran", { perf: true });
X("zabrać", ["zabiorę", "zabierzesz", "zabierze", "zabierzemy", "zabierzecie", "zabiorą"], "zabierz", pastReg("zabrać"), "zabran", { perf: true });
A("pobierać", { pass: "pobieran" }); A("wybierać"); A("zabierać");
X("przyjąć", ["przyjmę", "przyjmiesz", "przyjmie", "przyjmiemy", "przyjmiecie", "przyjmą"], "przyjmij", ["przyjął", "przyjęł", "przyjęl"], "przyjęt", { perf: true });
U("przyjmować");
X("zacząć", ["zacznę", "zaczniesz", "zacznie", "zaczniemy", "zaczniecie", "zaczną"], "zacznij", ["zaczął", "zaczęł", "zaczęl"], "zaczęt", { perf: true });
A("zaczynać"); A("porównać", { perf: true }); A("naprawiać"); A("rozpoczynać");
X("rozpocząć", ["rozpocznę", "rozpoczniesz", "rozpocznie", "rozpoczniemy", "rozpoczniecie", "rozpoczną"], "rozpocznij", ["rozpoczął", "rozpoczęł", "rozpoczęl"], "rozpoczęt", { perf: true });
X("jeść", ["jem", "jesz", "je", "jemy", "jecie", "jedzą"], "jedz", ["jadł", "jadł", "jedl"], "jedzon");
X("zjeść", ["zjem", "zjesz", "zje", "zjemy", "zjecie", "zjedzą"], "zjedz", ["zjadł", "zjadł", "zjedl"], "zjedzon", { perf: true });
X("spać", ["śpię", "śpisz", "śpi", "śpimy", "śpicie", "śpią"], "śpij", ["spał", "spał", "spal"], null);
J("pić", "pij", "pit");
J("wypić", "wypij", "wypit", { perf: true });
J("żyć", "żyj", null);
J("czuć", "czuj", "czut");
J("myć", "myj", "myt");
J("odkryć", "odkryj", "odkryt", { perf: true });
J("użyć", "użyj", "użyt", { perf: true });
J("ukryć", "ukryj", "ukryt", { perf: true });
J("okryć", "okryj", "okryt", { perf: true });
X("stać", ["stoję", "stoisz", "stoi", "stoimy", "stoicie", "stoją"], "stój", ["stał", "stał", "stal"], null);
N("stanąć", { imp: "stań", pass: null });
N("kliknąć"); N("usunąć"); N("zamknąć"); N("dotknąć"); N("rozwinąć"); N("zwinąć"); N("cofnąć"); N("pociągnąć"); N("wysunąć"); N("przesunąć");
X("zostać", ["zostanę", "zostaniesz", "zostanie", "zostaniemy", "zostaniecie", "zostaną"], "zostań", ["został", "został", "zostal"], null, { perf: true });
X("pozostać", ["pozostanę", "pozostaniesz", "pozostanie", "pozostaniemy", "pozostaniecie", "pozostaną"], "pozostań", ["pozostał", "pozostał", "pozostal"], null, { perf: true });
// ---- n-type
// ---- a-type
A("czytać", { pass: "czytan" }); A("przeczytać", { perf: true });
A("znać"); A("poznać", { perf: true });
A("kochać"); A("pytać"); A("zapytać", { perf: true }); A("czekać"); A("poczekać", { perf: true }); A("szukać"); A("wyszukać", { perf: true });
A("mieszkać"); A("grać"); A("zagrać", { perf: true }); A("odpowiadać"); A("zapewniać"); A("rozwijać"); A("oszczędzać"); A("dostarczać"); A("dołączać"); A("pobierać");
A("zamawiać"); A("odwiedzać"); A("używać"); A("korzystać"); A("skorzystać", { perf: true }); A("sprawdzać"); A("klikać"); A("usuwać"); A("zmieniać"); A("wypełniać");
A("potwierdzać"); A("wysyłać"); A("otwierać"); A("zamykać"); A("wracać"); A("zostawiać"); A("składać"); A("zawierać"); A("oznaczać"); A("umożliwiać"); A("ułatwiać");
A("polecać"); A("oglądać"); A("słuchać"); A("posłuchać", { perf: true }); A("pozwalać"); A("zapraszać"); A("witać"); A("powitać", { perf: true }); A("zachęcać"); A("przedstawiać");
// ---- more a-type
A("wykorzystać", { perf: true }); A("wykonać", { perf: true }); A("ogłaszać"); A("zgadzać", { pass: null }); A("dbać", { pass: null }); A("zadbać", { perf: true, pass: null });
A("udostępniać"); A("spełniać"); A("zabezpieczać"); A("wdrażać"); A("usprawniać"); A("doradzać"); A("odnawiać"); A("wspomagać"); A("wprowadzać"); A("zarządzać");
A("otrzymać", { perf: true }); A("rozmawiać", { pass: null }); A("oceniać"); A("ustawiać"); A("poprawiać"); A("zwiększać"); A("zmniejszać"); A("spędzać"); A("odbierać");
A("podobać", { pass: null }); A("wyglądać", { pass: null }); A("wyświetlać"); A("uzyskać", { perf: true });
X("odebrać", ["odbiorę", "odbierzesz", "odbierze", "odbierzemy", "odbierzecie", "odbiorą"], "odbierz", pastReg("odebrać"), "odebran", { perf: true });
X("dostać", ["dostanę", "dostaniesz", "dostanie", "dostaniemy", "dostaniecie", "dostaną"], "dostań", ["dostał", "dostał", "dostal"], "dostan", { perf: true });
J("dostawać", "dostaj", "dostawan");
X("rozwiązać", ["rozwiążę", "rozwiążesz", "rozwiąże", "rozwiążemy", "rozwiążecie", "rozwiążą"], "rozwiąż", pastReg("rozwiązać"), "rozwiązan", { perf: true });
// ---- more e-type
E("pisać", "pisz", "pisz", "pisan"); E("napisać", "napisz", "napisz", "napisan", { perf: true }); E("zapisać", "zapisz", "zapisz", "zapisan", { perf: true }); E("opisać", "opisz", "opisz", "opisan", { perf: true });
E("pokazać", "pokaż", "pokaż", "pokazan", { perf: true }); E("wysłać", "wyśl", "wyślij", "wysłan", { perf: true }); E("przesłać", "prześl", "prześlij", "przesłan", { perf: true });
E("płakać", "płacz", "płacz", null); E("skakać", "skacz", "skacz", null);
// ---- i/y-type
I("kupić", "kup", "kupion", { perf: true }); I("zakupić", "zakup", "zakupion", { perf: true }); I("zamówić", "zamów", "zamówion", { perf: true });
I("odwiedzić", "odwiedź", "odwiedzon", { s1: "odwiedz", perf: true }); I("dzwonić", "dzwoń", null); I("zadzwonić", "zadzwoń", null, { perf: true });
I("dołączyć", "dołącz", "dołączon", { perf: true }); I("płacić", "płać", "płacon", { s1: "płac" }); I("zapłacić", "zapłać", "zapłacon", { s1: "zapłac", perf: true });
I("zapewnić", "zapewnij", "zapewnion", { perf: true }); I("chronić", "chroń", "chronion"); I("ochronić", "ochroń", "ochronion", { perf: true });
I("naprawić", "napraw", "naprawion", { perf: true });
I("czyścić", "czyść", "czyszczon", { s1: "czyszcz" }); I("wyczyścić", "wyczyść", "wyczyszczon", { s1: "wyczyszcz", perf: true });
I("oszczędzić", "oszczędź", "oszczędzon", { s1: "oszczędz", perf: true }); I("dostarczyć", "dostarcz", "dostarczon", { perf: true });
I("kończyć", "kończ", null); I("skończyć", "skończ", "skończon", { perf: true });
I("tworzyć", "twórz", "tworzon"); I("stworzyć", "stwórz", "stworzon", { perf: true });
I("sprawdzić", "sprawdź", "sprawdzon", { s1: "sprawdz", perf: true }); I("zmienić", "zmień", "zmienion", { perf: true });
I("wypełnić", "wypełnij", "wypełnion", { perf: true }); I("potwierdzić", "potwierdź", "potwierdzon", { s1: "potwierdz", perf: true });
I("otworzyć", "otwórz", "otwart", { perf: true }); I("wrócić", "wróć", null, { perf: true }); I("zostawić", "zostaw", "zostawion", { perf: true });
I("złożyć", "złóż", "złożon", { perf: true }); I("umożliwić", "umożliw", "umożliwion", { perf: true }); I("ułatwić", "ułatw", "ułatwion", { perf: true });
I("polecić", "poleć", "polecon", { perf: true }); I("pozwolić", "pozwól", "pozwolon", { perf: true }); I("życzyć", "życz", null);
I("zaprosić", "zaproś", "zaproszon", { s1: "zaprosz", perf: true }); I("prosić", "proś", "proszon", { s1: "prosz" }); I("poprosić", "poproś", "poproszon", { s1: "poprosz", perf: true });
I("cieszyć", "ciesz", null); I("zachęcić", "zachęć", "zachęcon", { s1: "zachęc", perf: true }); I("przedstawić", "przedstaw", "przedstawion", { perf: true });
I("nosić", "noś", "noszon", { s1: "nosz" }); I("wynosić", "wynoś", null, { s1: "wynosz" }); I("uczyć", "ucz", "uczon"); I("nauczyć", "naucz", "nauczon", { perf: true });
I("ćwiczyć", "ćwicz", null); I("wierzyć", "wierz", null); I("sądzić", "sądź", "sądzon", { s1: "sądz" });
I("wyłączyć", "wyłącz", "wyłączon", { perf: true }); I("włączyć", "włącz", "włączon", { perf: true }); I("obsłużyć", "obsłuż", "obsłużon", { perf: true });
I("spędzić", "spędź", "spędzon", { s1: "spędz", perf: true }); I("ocenić", "oceń", "ocenion", { perf: true }); I("ustawić", "ustaw", "ustawion", { perf: true });
I("polepszyć", "polepsz", "polepszon", { perf: true }); I("poprawić", "popraw", "poprawion", { perf: true }); I("zwiększyć", "zwiększ", "zwiększon", { perf: true });
I("zmniejszyć", "zmniejsz", "zmniejszon", { perf: true }); I("udostępnić", "udostępnij", "udostępnion", { perf: true }); I("spełnić", "spełnij", "spełnion", { perf: true });
I("zabezpieczyć", "zabezpiecz", "zabezpieczon", { perf: true }); I("wdrożyć", "wdroż", "wdrożon", { perf: true }); I("doradzić", "doradź", null, { s1: "doradz", perf: true });
I("odnowić", "odnów", "odnowion", { perf: true }); I("prowadzić", "prowadź", "prowadzon", { s1: "prowadz" }); I("wprowadzić", "wprowadź", "wprowadzon", { s1: "wprowadz", perf: true });
I("szkolić", "szkol", "szkolon"); I("doskonalić", "doskonal", "doskonalon"); I("pomówić", "pomów", null, { perf: true });
// ---- u-type (-ować / -ywać / -iwać)
for (const v of ["kupować", "rezerwować", "kontaktować", "potrzebować", "kosztować", "organizować", "planować", "realizować", "kontynuować", "aktualizować", "anulować", "instalować", "konfigurować", "gwarantować", "budować", "produkować", "obsługiwać", "studiować", "testować", "subskrybować", "oferować", "projektować", "rejestrować", "pokazywać", "zapisywać", "porównywać", "informować", "stosować", "oczekiwać", "otrzymywać", "dopasowywać", "opisywać", "wykorzystywać", "wykonywać", "publikować", "reprezentować", "proponować", "sugerować", "rekomendować", "konsultować", "trenować", "edukować", "motywować", "inspirować", "modernizować", "remontować", "dostosowywać", "rozwiązywać", "kierować", "przygotowywać", "pakować", "szanować", "ratować", "kopiować", "importować", "eksportować", "generować", "analizować", "weryfikować", "kalkulować", "dokumentować", "sterować", "montować", "demontować", "fotografować", "filmować", "malować", "pakować"]) U(v);
for (const v of ["pracować", "podróżować", "współpracować", "dziękować", "funkcjonować", "debiutować", "obowiązywać"]) U(v, { pass: null });
for (const v of ["zarezerwować", "skontaktować", "zorganizować", "zaplanować", "zrealizować", "zaktualizować", "zainstalować", "zbudować", "zaprojektować", "zarejestrować", "poinformować", "zastosować", "dopasować", "opublikować", "zaproponować", "zasugerować", "przygotować", "zamontować", "skopiować", "zaimportować", "wyeksportować", "wygenerować", "przeanalizować", "zweryfikować", "przetestować", "wyprodukować", "zainwestować", "zainspirować", "skonfigurować", "sfinalizować", "zrezygnować", "zaoferować"]) U(v, { perf: true });
U("rezygnować", { pass: null });
A("odkrywać"); U("inwestować"); U("zasugerować", { perf: true });
export default function forms() {
  return [...out];
}

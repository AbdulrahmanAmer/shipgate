// Turkish verb forms (SE-121). Authored from linguistic knowledge; suffix templates with vowel harmony.
// Template letters: A = a/e (2-way), I = ı/i/u/ü (4-way), D = d/t (after ç f h k p s ş t); lowercase = literal.
const out = new Set();
const add = (...a) => { for (const x of a.flat()) if (x) out.add(x); };
const VOW = "aeıioöuü";
const isV = (c) => VOW.includes(c);
const lastV = (s) => { for (let i = s.length - 1; i >= 0; i--) if (isV(s[i])) return s[i]; return "e"; };
const isFront = (v) => "eiöü".includes(v);
const isRound = (v) => "oöuü".includes(v);
const nVowels = (s) => [...s].filter(isV).length;
function ap(base, tpl) {
  let s = base;
  for (const ch of tpl) {
    if (ch === "A") s += isFront(lastV(s)) ? "e" : "a";
    else if (ch === "I") { const v = lastV(s); s += isFront(v) ? (isRound(v) ? "ü" : "i") : (isRound(v) ? "u" : "ı"); }
    else if (ch === "D") s += /[çfhkpsşt]$/.test(s) ? "t" : "d";
    else s += ch;
  }
  return s;
}
const P1 = (b) => [b + "m", b + "n", b, b + "k", ap(b, "nIz"), ap(b, "lAr")];
const P2 = (b) => [ap(b, "Im"), ap(b, "sIn"), b, ap(b, "Iz"), ap(b, "sInIz"), ap(b, "lAr")];
const P2y = (b) => [ap(b, "yIm"), ap(b, "sIn"), b, ap(b, "yIz"), ap(b, "sInIz"), ap(b, "lAr")];
const FUT = (b) => { const g = b.slice(0, -1) + "ğ"; return [ap(g, "Im"), ap(b, "sIn"), b, ap(g, "Iz"), ap(b, "sInIz"), ap(b, "lAr")]; };
// present-continuous base ("yapıyor") from a stem
function contBase(rr) {
  const last = rr.slice(-1);
  if (last === "a" || last === "e") return ap(rr.slice(0, -1), "Iyor");
  if (isV(last)) return rr + "yor";
  return ap(rr, "Iyor");
}
const EXC = new Set(["al", "bil", "bul", "dur", "gel", "gör", "kal", "ol", "öl", "san", "var", "ver", "vur"]);

// level: 0 lite, 1 mid, 2 full.  o: { soft, ry, aor }
function conj(root, o, level) {
  const endsV = isV(root.slice(-1));
  const rC = root;
  const rV = o.soft ? root.slice(0, -1) + "d" : root;
  const rY = o.ry || rV;
  const rr = endsV ? rY : rV; // stem before vowel-initial / y-buffered suffixes
  const yb = endsV ? rr + "y" : rr; // with buffer
  const nb = ap(rC, "mA");

  add(ap(rC, "mAk"));
  // present continuous
  const cb = contBase(endsV ? rY : rV);
  add(P2(cb));
  const ncb = contBase(nb);
  add(P2(ncb));
  // aorist
  let ab;
  if (endsV) ab = rV + "r";
  else {
    const kind = o.aor || (nVowels(root) === 1 && !EXC.has(root) ? "A" : "I");
    ab = ap(rV, kind + "r");
  }
  add(P2(ab));
  add([nb + "m", ap(nb, "zsIn"), ap(nb, "z"), ap(nb, "yIz"), ap(nb, "zsInIz"), ap(nb, "zlAr")]);
  // past
  const pb = ap(rC, "DI");
  add(P1(pb));
  add(P1(ap(nb, "DI")));
  // narrative past
  const eb = ap(rC, "mIş");
  add(P2(eb));
  add(P2(ap(nb, "mIş")));
  // future
  const fb = ap(yb, "AcAk");
  add(FUT(fb));
  add(FUT(ap(nb + "y", "AcAk")));
  // necessitative
  const mb = ap(rC, "mAlI");
  add(P2y(mb));
  add(P2y(ap(nb, "mAlI")));
  // conditional
  add(P1(ap(rC, "sA")));
  add(P1(ap(nb, "sA")));
  // imperative / optative
  add(rC, ap(yb, "In"), ap(yb, "InIz"), ap(rC, "sIn"), ap(rC, "sInlAr"));
  add(nb, ap(nb, "yIn"), ap(nb, "yInIz"), ap(nb, "sIn"), ap(nb, "sInlAr"));
  const ob = ap(yb, "A");
  add(ap(ob, "yIm"), ap(ob, "sIn"), ob, ap(ob, "lIm"), ap(ob, "sInIz"), ap(ob, "lAr"));
  add(ap(nb + "y", "AyIm"), ap(nb + "y", "AlIm"));
  // participles / gerunds
  add(ap(yb, "An"), ap(ap(yb, "An"), "lAr"));
  add(ap(yb, "ArAk"), ap(yb, "Ip"), ap(yb, "IncA"), ap(rC, "mAdAn"));
  const dk = ap(rC, "DIk");
  const g = ap(rC, "DI") + "ğ";
  add(dk, ap(g, "I"), ap(g, "Im"), ap(g, "In"), ap(g, "ImIz"), ap(g, "InIz"), ap(dk, "lArI"), ap(rC, "DIkçA"), ap(rC, "DIktAn"));
  add(ap(fb.slice(0, -1) + "ğ", "I"));
  if (level >= 1) {
    add(ap(rC, "mA"), ap(rC, "mAsI"), ap(rC, "mAyA"), ap(rC, "mAyI"), ap(rC, "mAktAn"));
    const mk = ap(rC, "mAktA");
    add(ap(mk, "yIm"), ap(mk, "sIn"), ap(mk, "dIr"), ap(mk, "yIz"), ap(mk, "sInIz"), ap(mk, "dIrlAr"), ap(mk, "lAr"));
  }
  if (level >= 2) {
    add(P1(ap(cb, "DI")).slice(0, 5), ap(ap(cb, "lAr"), "DI"));
    add(P1(ap(ncb, "DI")).slice(0, 5), ap(ap(ncb, "lAr"), "DI"));
    add(P1(ap(eb, "DI")).slice(0, 5), ap(ap(eb, "lAr"), "DI"));
    add(P1(ap(fb, "DI")).slice(0, 5), ap(ap(fb, "lAr"), "DI"));
    add(P1(ap(ab, "DI")).slice(0, 5), ap(ap(ab, "lAr"), "DI"));
    add(ap(nb + "z", "DI"), ap(cb, "mIş"), ap(fb, "mIş"), ap(ab, "mIş"));
    if (o.ry) add(rC + "yin", rC + "yiniz");
  }
}

function abilityBase(root, o) {
  const endsV = isV(root.slice(-1));
  const rV = o.soft ? root.slice(0, -1) + "d" : root;
  const rY = o.ry || rV;
  return endsV ? rY + "y" : rV;
}
function abilityRoot(root, o) { return ap(abilityBase(root, o), "Abil"); }
function negAbility(root, o) {
  const nbA = ap(abilityBase(root, o), "Ama");
  add([nbA + "m", ap(nbA, "zsIn"), ap(nbA, "z"), ap(nbA, "yIz"), ap(nbA, "zsInIz"), ap(nbA, "zlAr")]);
  add(P2(contBase(nbA)));
  add(P1(ap(nbA, "DI")));
  add(P2(ap(nbA, "mIş")));
  add(FUT(ap(nbA + "y", "AcAk")));
  add(ap(nbA, "yAn"));
}
function passiveRoot(root, o) {
  const rV = o.soft ? root.slice(0, -1) + "d" : root;
  if (isV(root.slice(-1))) return root + "n";
  if (root.endsWith("l")) return ap(rV, "In");
  return ap(rV, "Il");
}

// R(root, opts): full paradigm + ability + negative ability (+ passive paradigm when opts.pass)
function R(root, o = {}) {
  conj(root, o, 2);
  conj(abilityRoot(root, o), {}, 0);
  negAbility(root, o);
  if (o.pass) {
    const p = passiveRoot(root, o);
    conj(p, {}, 1);
    conj(abilityRoot(p, {}), {}, 0);
    negAbility(p, {});
  }
}
const SOFT = { soft: true, aor: "A" };

// ---- irregular / basic
R("ol", { pass: false });
R("et", { ...SOFT, pass: false });
R("de", { ry: "di" });
R("ye", { ry: "yi", pass: false });
R("git", { soft: true });
// ---- intransitive / basic (no passive)
for (const v of ["gel", "kal", "dur", "var", "san", "öl", "çık", "gir", "dön", "yat", "otur", "kalk", "kaç", "düş", "geç", "uç", "koş", "yürü", "gez", "yaşa", "çalış", "ilgilen", "başvur", "katıl", "tanış", "konuş", "bağlan", "ulaş", "buluş", "danış", "kaydol", "uyu", "uyan", "gül", "büyü", "doğ", "dinlen", "bulun", "yetiş", "sevin", "ağla", "yüksel"]) R(v);
R("vazgeç", { aor: "A" });
// ---- transitive (with passive paradigm)
for (const v of ["yap", "al", "ver", "gör", "bil", "bul", "söyle", "bak", "koy", "sat", "tut", "at", "say", "seç", "sev", "iç", "kes", "yaz", "oku", "çiz", "çal", "sür", "sun", "kur", "tak", "bas", "çek", "aç", "kapat", "bekle", "başla", "bitir", "iste", "ara", "tanı", "hatırla", "unut", "düşün", "kullan", "ilet", "gönder", "öde", "indir", "yükle", "karşılaştır", "geliştir", "sakla", "koru", "onar", "temizle", "öğren", "öğret", "destekle", "paylaş", "ekle", "çıkar", "değiştir", "güncelle", "ağırla", "onayla", "tıkla", "kopyala", "yazdır", "sor", "cevapla", "yanıtla", "ayır", "tasarla", "üret", "hazırla", "sağla", "belirle", "incele", "planla", "tara", "ayarla", "artır", "azalt", "dene", "uygula", "bırak", "bağla", "çağır", "dinle", "izle", "kazan", "harca", "biriktir", "değerlendir", "getir", "götür", "taşı", "tamamla", "başar", "anlat", "göster", "çalıştır", "oyna", "anla"]) R(v, { pass: true });
// ---- -et compounds (t -> d before a vowel)
for (const v of ["kaydet", "keşfet", "reddet", "kaybet", "affet", "seyret"]) R(v, { ...SOFT, pass: true });
for (const v of ["hisset", "bahset"]) R(v, SOFT);
//__MORE2__
export default function forms() {
  return [...out];
}

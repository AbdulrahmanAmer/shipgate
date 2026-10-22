// WP-104 d1 / SE-121: Arabic verb forms (undiacritised, as web pages write them), generated from stem-based paradigms.
// Authored from the author's own knowledge; no external morphology data.
// Per verb: perfect (13 persons), imperfect indicative / subjunctive / jussive (all persons), imperative (ms fs d mp fp),
// active + passive participles (and defective -ي variants), plus the passive voice where its spelling differs from the active
// (hollow, defective, assimilated-و, initial-hamza), plus the future with the attached particle سـ (indicative only).
// Covers Form I (sound, hollow, defective, doubled, assimilated, hamzated) and derived Forms II-X.
// Not generated on purpose: verbal nouns, pronoun-suffixed forms, و/ف/ب/ل-prefixed forms (those are separate writings).
// Forms of two letters or fewer are dropped (they collide with particles/prepositions: في لم لن من عن ...), except a small
// allow-list of unambiguous imperatives.

const arr = (x) => (x === undefined || x === null ? [] : Array.isArray(x) ? x : [x]);
// join a stem and a suffix; a doubled ت/ن at the seam is written once (shadda is not written): كن+نا = كنا, مت+ت = مت
const J = (stem, suf) => (stem.at(-1) === suf[0] && (suf[0] === "ت" || suf[0] === "ن") ? stem + suf.slice(1) : stem + suf);
const ALLOW_SHORT =new Set(["قل", "كن", "خذ", "ضع", "قف"]);

// ---- paradigm engine -------------------------------------------------------------------------------------------
// spec fields: pl (3ms perfect) s3 (stem + ت for 3fs/3fd) sc (stem before consonant suffixes) p3d p3mp
//              I (3ms imperfect stem after the prefix) Ij (jussive) Id (before ان/ا) Imp (before ون/وا) I2fs (before ين/ي)
//              Ic (before the feminine plural ن) I1 (full 1s override) imps (imperatives) act pass
function conj(sp, out, fut) {
  const P = (...xs) => out.push(...xs);
  if (sp.pl) {
    P(sp.pl, sp.s3 + "ت", ...arr(sp.p3d), sp.s3 + "تا", ...arr(sp.p3mp), J(sp.sc, "ن"), J(sp.sc, "ت"), J(sp.sc, "تما"), J(sp.sc, "تم"),
      J(sp.sc, "تن"), J(sp.sc, "نا"));
  }
  if (sp.I) {
    const I = arr(sp.I), Ij = arr(sp.Ij ?? sp.I), Id = arr(sp.Id ?? sp.I), Imp = arr(sp.Imp ?? sp.I);
    const I2 = arr(sp.I2fs ?? sp.Imp ?? sp.I), Ic = arr(sp.Ic ?? sp.I);
    const ind = [];
    for (const pre of ["ي", "ت"]) {
      for (const x of I) ind.push(pre + x);
      if (sp.dual) { ind.push(pre + sp.dual + "ن"); P(pre + sp.dual); }
      else for (const x of Id) { ind.push(pre + x + "ان"); P(pre + x + "ا"); }
      for (const x of Imp) { ind.push(pre + x + "ون"); P(pre + x + "وا"); }
      for (const x of Ic) ind.push(J(pre + x, "ن"));
      for (const x of Ij) P(pre + x);
    }
    for (const x of I2) { ind.push("ت" + x + "ين"); P("ت" + x + "ي"); }
    for (const x of sp.I1 ? arr(sp.I1) : I.map((y) => "أ" + y)) ind.push(x);
    for (const x of sp.I1 ? arr(sp.I1) : Ij.map((y) => "أ" + y)) P(x);
    for (const x of I) ind.push("ن" + x);
    for (const x of Ij) P("ن" + x);
    P(...ind);
    if (fut) for (const f of ind) P("س" + f);
  }
  if (sp.imps) P(...sp.imps);
  P(...arr(sp.act), ...arr(sp.pass));
}
const imperatives = (im, imL, imF) => [im, imL + "ي", imL + "ا", imL + "وا", (imF ?? im) + "ن"];

// ---- constructors ----------------------------------------------------------------------------------------------
// sound verb of any form: P = 3ms perfect, I = imperfect stem after the prefix, im = imperative
function sound(P, I, im, act, pass) {
  return { pl: P, s3: P, sc: P, p3d: P + "ا", p3mp: P + "وا", I, imps: imperatives(im, im), act, pass };
}
const FORM_I_INTRANS = true;
function soundI(r, { iv = false, act, pass, I, im, I1 } = {}) {
  const [a, b, c] = r;
  const sp = sound(r, I ?? r, im ?? "ا" + r, act ?? [a + "ا" + b + c], iv ? [] : (pass ?? ["م" + a + b + "و" + c]));
  if (I1) sp.I1 = I1;
  return sp;
}
function derivedSound(P, kind) {
  const I = ["IV", "VII", "VIII", "X"].includes(kind) ? P.slice(1) : P;
  return sound(P, I, P, ["م" + I], ["م" + I]);
}
// Form I hollow (قال باع خاف): t = w | y | a (long vowel of the imperfect), pm = middle letter of the passive participle
function hollowI(c1, c3, t, iv = false, pm) {
  const m = t === "w" ? "و" : t === "y" ? "ي" : "ا";
  const pl = c1 + "ا" + c3, sh = c1 + c3, lg = c1 + m + c3;
  const sp = { pl, s3: pl, sc: sh, p3d: pl + "ا", p3mp: pl + "وا", I: lg, Ij: sh, Ic: sh, imps: imperatives(sh, lg, sh),
    act: [c1 + "ائ" + c3], pass: iv ? [] : ["م" + c1 + (pm ?? (t === "y" ? "ي" : "و")) + c3] };
  return sp;
}
function hollowIPassive(c1, c3) { // قيل / يقال
  const pl = c1 + "ي" + c3;
  return { pl, s3: pl, sc: c1 + c3, p3d: pl + "ا", p3mp: pl + "وا", I: c1 + "ا" + c3, Ij: c1 + c3, Ic: c1 + c3 };
}
// Form I defective: type W (دعا يدعو), Y (رمى يرمي), A (نسي ينسى); B = first two radicals
function defI(c1, c2, type) {
  const B = c1 + c2;
  const common = { s3: B, Ij: B, Imp: B, I2fs: B, act: [c1 + "ا" + c2, c1 + "ا" + c2 + "ي"] };
  if (type === "W") {
    return { ...common, pl: B + "ا", sc: B + "و", p3d: B + "وا", p3mp: B + "وا", I: B + "و", Id: B + "و", Ic: B + "و",
      imps: ["ا" + B, "ا" + B + "ي", "ا" + B + "وا", "ا" + B + "وا", "ا" + B + "ون"], pass: ["م" + B + "و"] };
  }
  const base = { ...common, sc: B + "ي", p3d: B + "يا", p3mp: B + "وا", Id: B + "ي", Ic: B + "ي",
    imps: ["ا" + B, "ا" + B + "ي", "ا" + B + "يا", "ا" + B + "وا", "ا" + B + "ين"], pass: ["م" + B + "ي"] };
  if (type === "Y") return { ...base, pl: B + "ى", I: B + "ي" };
  return { ...base, pl: B + "ي", s3: B + "ي", I: B + "ى" };
}
// defective passive voice: دعي يدعى (the passive of any defective is an A-type paradigm)
function defPassive(B, Bi = B) {
  return { pl: B + "ي", s3: B + "ي", sc: B + "ي", p3d: B + "يا", p3mp: B + "وا", I: Bi + "ى", Ij: Bi, Id: Bi + "ي", Imp: Bi, Ic: Bi + "ي" };
}
// derived defective: B = perfect stem without the final radical (with its prefix), Bi = same after the imperfect prefix
function defD(B, Bi, endsY) {
  return { pl: B + "ى", s3: B, sc: B + "ي", p3d: B + "يا", p3mp: B + "وا", I: Bi + (endsY ? "ي" : "ى"), Ij: Bi, Id: Bi + "ي", Imp: Bi,
    Ic: Bi + "ي", imps: [B, B + "ي", B + "يا", B + "وا", B + "ين"], act: ["م" + Bi, "م" + Bi + "ي"], pass: ["م" + Bi + "ى"] };
}
// Form I doubled (مد رد)
function dbI(c1, c2) {
  const pl = c1 + c2, lo = c1 + c2 + c2;
  return { pl, s3: pl, sc: lo, p3d: pl + "ا", p3mp: pl + "وا", I: pl, Ij: [pl, lo], Ic: lo,
    imps: [pl, "ا" + lo, pl + "ي", pl + "ا", pl + "وا", "ا" + lo + "ن"], act: [c1 + "ا" + c2], pass: ["م" + c1 + c2 + "و" + c2] };
}
// derived doubled (أحب استمر احتل): P = 3ms perfect
function dbD(P, kind) {
  const last = P.at(-1), I = P.slice(1), lo = I + last;
  return { pl: P, s3: P, sc: P + last, p3d: P + "ا", p3mp: P + "وا", I, Ij: [I, lo], Ic: lo,
    imps: [P, P + last, P + "ي", P + "ا", P + "وا", P + last + "ن"], act: ["م" + I], pass: ["م" + I] };
}
// derived hollow. kind IV | VII | VIII | X ; c1 c3 radicals ; inf = VIII infix letter
function hollowD(kind, c1, c3, inf = "ت") {
  const pre = { IV: "أ", VII: "ان", X: "است" }[kind];
  if (kind === "VIII") {
    const sh = "ا" + c1 + inf + c3, lg = "ا" + c1 + inf + "ا" + c3;
    return { pl: lg, s3: lg, sc: sh, p3d: lg + "ا", p3mp: lg + "وا", I: c1 + inf + "ا" + c3, Ij: c1 + inf + c3, Ic: c1 + inf + c3,
      imps: imperatives(sh, lg, sh), act: ["م" + c1 + inf + "ا" + c3], pass: ["م" + c1 + inf + "ا" + c3] };
  }
  const pl = pre + c1 + "ا" + c3, sh = pre + c1 + c3;
  const iLong = kind === "VII" ? "ن" + c1 + "ا" + c3 : (kind === "X" ? "ست" : "") + c1 + "ي" + c3;
  const iShort = kind === "VII" ? "ن" + c1 + c3 : (kind === "X" ? "ست" : "") + c1 + c3;
  const longImp = pre + c1 + (kind === "VII" ? "ا" : "ي") + c3;
  return { pl, s3: pl, sc: sh, p3d: pl + "ا", p3mp: pl + "وا", I: iLong, Ij: iShort, Ic: iShort,
    imps: imperatives(sh, longImp, sh), act: ["م" + iLong], pass: [kind === "VII" ? "م" + iLong : "م" + iLong.replace("ي", "ا")] };
}
function hollowDPassive(kind, c1, c3) { // أقيم يقام ; استفيد يستفاد
  const pre = { IV: "أ", X: "است" }[kind];
  const pl = pre + c1 + "ي" + c3;
  const ip = (kind === "X" ? "ست" : "") + c1 + "ا" + c3, is = (kind === "X" ? "ست" : "") + c1 + c3;
  return { pl, s3: pl, sc: pre + c1 + c3, p3d: pl + "ا", p3mp: pl + "وا", I: ip, Ij: is, Ic: is };
}
// final-hamza verbs. Form I a-type (قرأ بدأ ملأ) and i-type (أنشأ ابتدأ أخطأ)
function hfA(c1, c2) {
  const h = c1 + c2, pl = h + "أ";
  return { pl, s3: pl, sc: pl, p3d: h + "آ", p3mp: [h + "ؤوا", pl + "وا"], I: pl, Ij: pl, dual: h + "آ", Imp: [h + "ؤ", pl], I2fs: h + "ئ",
    Ic: pl, imps: ["ا" + pl, "ا" + h + "ئي", "ا" + h + "آ", "ا" + h + "ؤوا", "ا" + pl + "ن"], act: [c1 + "ا" + c2 + "ئ"], pass: ["م" + h + "و" + "ء"] };
}
function hfI(P, Ib) {
  const h = P.slice(0, -1), ic = Ib + "ئ", im = h + "ئ";
  return { pl: P, s3: P, sc: P, p3d: h + "آ", p3mp: [h + "ؤوا", P + "وا"], I: ic, Ij: ic, Id: ic, Imp: ic, I2fs: ic, Ic: ic,
    imps: [im, im + "ي", im + "ا", im + "وا", im + "ن"], act: ["م" + ic], pass: ["م" + Ib + "أ"] };
}
// assimilated (initial و): وجد يجد
function mithal(r) {
  const [a, b, c] = r, sh = b + c;
  const sp = sound(r, sh, sh, [a + "ا" + b + c], ["م" + a + b + "و" + c]);
  return sp;
}

export default function forms() {
  const out = [];
  const fut = true;
  const add = (sp, f = fut) => conj(sp, out, f);
  const words = (s) => s.split(/\s+/).filter(Boolean);

  // ---- Form I sound ('-' prefix: intransitive, no passive participle)
  for (const tok of words(`كتب -ذهب -دخل -خرج -جلس -نزل شرب فتح طلب حمل سجل فعل عمل علم فهم درس كسب ربح خسر بحث ركب رفع -سكن شكر
    صنع ضرب عرف غسل قتل لعب لبس مسح ملك نشر نقل حفظ حذف حجز -حضر حصل حسب حكم دفع دعم ذكر رتب -رجع سبق سحب شرح شعر صرف -ظهر
    عرض عقد فقد فرض قبل قدم قطع كشف كسر منع -نجح نظر نسخ بعث بلغ ترك تبع جمع جعل جلب ربط زرع سرق -سقط شمل ضغط طرح قسم قصد نفع
    نقر خلق خدم شحن`)) {
    const iv = tok.startsWith("-");
    add(soundI(iv ? tok.slice(1) : tok, { iv }));
  }
  // medial hamza
  add(soundI("سأل", { act: ["سائل"], pass: ["مسؤول"] }));
  // initial hamza: يأخذ آخذ خذ مأخوذ يؤخذ
  for (const [r, im] of [["أخذ", "خذ"], ["أكل", "كل"], ["أمر", "مر"]]) {
    add(soundI(r, { im, I1: "آ" + r.slice(1), act: ["آ" + r.slice(1)] }));
    add({ I: "ؤ" + r.slice(1) });
  }
  // final hamza
  for (const r of ["قرأ", "بدأ", "ملأ"]) add(hfA(r[0], r[1]));
  // assimilated و
  for (const r of words("وجد وصل وقف وضع ولد وعد وصف وقع وزن وهب ورث وجب")) {
    add(mithal(r));
    add({ I: r }); // passive imperfect يوجد
  }
  // ---- Form I hollow  [c1, c3, type, intransitive, passive-participle mid letter]
  for (const [c1, c3, t, iv, pm] of [
    ["ك", "ن", "w", true], ["ق", "ل", "w"], ["ز", "ر", "w"], ["ع", "د", "w", true], ["ق", "م", "w", true], ["ص", "ر", "w", true],
    ["ق", "د", "w"], ["د", "ر", "w", true], ["ح", "ز", "w"], ["ف", "ز", "w", true], ["ط", "ل", "w", true], ["ح", "ل", "w", true],
    ["ن", "م", "a", true], ["م", "ت", "a", true], ["خ", "ف", "a"], ["ن", "ل", "a", false, "ي"],
    ["ب", "ع", "y"], ["س", "ر", "y", true], ["ع", "ش", "y", true], ["ط", "ر", "y", true], ["ز", "د", "y", true], ["غ", "ب", "y", true],
    ["ض", "ع", "y", true], ["ش", "ع", "y", true],
  ]) {
    add(hollowI(c1, c3, t, !!iv, pm));
    if (!iv) add(hollowIPassive(c1, c3));
  }
  // جاء (يجيء) and شاء (يشاء), irregular hamza spelling
  add({ pl: "جاء", s3: "جاء", sc: "جئ", p3d: "جاءا", p3mp: ["جاؤوا", "جاءوا"], I: "جيء", Ij: "جئ", Ic: "جئ", Id: "جيئ", Imp: "جيئ", I2fs: "جيئ",
    imps: ["جئ", "جيئي", "جيئا", "جيئوا", "جئن"], act: ["جاء"], pass: ["مجيء"] });
  add({ pl: "شاء", s3: "شاء", sc: "شئ", p3d: "شاءا", p3mp: ["شاؤوا", "شاءوا"], I: "شاء", Ij: "شأ", Id: "شاء", Imp: ["شاؤ", "شاء"],
    I2fs: "شائ", Ic: "شأ", imps: ["شأ", "شائي", "شاءا", "شاؤوا", "شأن"] });
  // ليس
  out.push("ليس", "ليست", "ليسا", "ليستا", "ليسوا", "لسن", "لست", "لستما", "لستم", "لستن", "لسنا");
  // ---- Form I defective  [c1, c2, type, transitive]
  for (const [c1, c2, t, tr] of [
    ["د", "ع", "W", true], ["ر", "م", "Y", true], ["م", "ش", "Y"], ["ب", "ن", "Y", true], ["س", "ع", "Y"], ["ج", "ر", "Y"],
    ["ن", "س", "A", true], ["ب", "ق", "A"], ["ل", "ق", "A", true], ["ر", "ض", "A"], ["خ", "ش", "A"], ["ب", "ك", "Y"], ["ر", "و", "Y", true],
    ["ح", "ك", "Y", true], ["ن", "و", "Y", true], ["ه", "د", "Y", true], ["م", "ض", "Y"],
  ]) {
    add(defI(c1, c2, t));
    if (tr) add(defPassive(c1 + c2));
  }
  // رأى
  add({ pl: "رأى", s3: "رأ", sc: "رأي", p3d: "رأيا", p3mp: "رأوا", I: "رى", Ij: "ر", Id: "ري", Imp: "ر", I2fs: "ر", Ic: "ري",
    imps: ["ر", "ري", "ريا", "روا", "رين"], act: ["راء", "رائي"], pass: ["مرئي"] });
  add(defPassive("رئ", "ر"));
  // أتى
  add({ pl: "أتى", s3: "أت", sc: "أتي", p3d: "أتيا", p3mp: "أتوا", I: "أتي", Ij: "أت", Id: "أتي", Imp: "أت", Ic: "أتي", I1: "آتي",
    imps: ["ائت", "ائتي", "ائتيا", "ائتوا", "ائتين"], act: ["آت", "آتي"], pass: ["مأتي"] });
  // ---- Form I doubled
  for (const r of words("مد رد ظن عد شد حل مر ظل ضم دل قل سد جد حج شق ضر حط مس ود هز صب")) add(dbI(r[0], r[1]));

  // ---- derived Forms (3ms perfect given)
  const D = (kind, list) => { for (const P of words(list)) add(derivedSound(P, kind)); };
  D("II", "علم درس قدم حدث غير سجل وصل ركز فسر نظم طور صمم وضح وفر عدل جدد بدل حمل أكد شغل حدد حسن ضمن طبق");
  D("III", "شارك ساعد قابل حاول عامل تابع شاهد قاتل كاتب راسل ناقش واصل حارب سافر لاحظ نافس عالج حافظ راجع شاور واجه طالب سابق ساهم");
  D("IV", "أرسل أعلن أكمل أصبح أمسك أحضر أخبر أنزل أرفق أوضح أظهر أرجع أدخل أخرج أعلم أحسن أنتج أنفق أقبل أكثر أسلم أبلغ أتم أعجب أضمن أرفع أمكن");
  D("V", "تعلم تكلم تحدث تقدم تغير تطور تمكن تذكر تخيل تأخر تأثر تأكد توقع توفر توقف تحمل تسجل تحقق تضمن تحول تدرب تعرف تفكر تسوق");
  D("VI", "تعاون تبادل تواصل تعارف تقابل تشارك تساءل تحاور تفاعل تنافس تعامل تجاوز تعاقد");
  D("VII", "انكسر انطلق انقطع انضم انسحب انفتح انخفض انقلب انشغل انحرف انفصل");
  D("VIII", "انتقل اجتمع اشترك انتظر ارتفع اعتمد اعتبر افتتح احتفل اتصل اتخذ اتبع اتفق اتحد ابتعد ارتكب اقترب اعتقد اكتشف اكتسب التزم التحق اقترح اختلف امتلك اتجه اعتذر انتشر اطلع");
  D("X", "استخدم استقبل استعمل استلم استمع استورد استثمر استكشف استغرق استفسر استرجع استبدل استأنف استهدف استند استنتج استأجر استمتع استهلك");
  // hamza-initial derived
  add({ ...sound("آمن", "ؤمن", "آمن", ["مؤمن"], ["مؤمن"]), sc: "آمن" });
  // derived hollow [kind, c1, c3, infix]
  for (const [k, c1, c3, inf] of [
    ["IV", "ر", "د"], ["IV", "ض", "ف"], ["IV", "ع", "د"], ["IV", "ق", "م"], ["IV", "ج", "ب"], ["IV", "ف", "د"], ["IV", "ص", "ب"],
    ["IV", "ش", "ر"], ["IV", "ت", "ح"], ["IV", "ث", "ر"], ["IV", "د", "ر"],
    ["VII", "ه", "ر"],
    ["VIII", "ز", "د", "د"], ["VIII", "ح", "ج"], ["VIII", "خ", "ر"], ["VIII", "ع", "د"],
    ["X", "ش", "ر"], ["X", "ط", "ع"], ["X", "ف", "د"], ["X", "ع", "د"], ["X", "ج", "ب"], ["X", "ق", "ل"], ["X", "ض", "ف"],
  ]) {
    add(hollowD(k, c1, c3, inf));
    if (k === "IV" || k === "X") add(hollowDPassive(k, c1, c3));
  }
  // derived doubled
  for (const P of words("أحب أعد أصر أمد احتل امتد اشتد اضطر استمر استعد استقر استحق استرد")) add(dbD(P));
  // derived defective [B, Bi, imperfect ends in ي?]  (B = perfect stem minus the final radical)
  for (const [B, Bi, y] of [
    ["أعط", "عط", true], ["أنه", "نه", true], ["أبق", "بق", true], ["ألق", "لق", true], ["أجر", "جر", true], ["أخف", "خف", true],
    ["أمض", "مض", true], ["ألغ", "لغ", true], ["سم", "سم", true], ["وف", "وف", true], ["غن", "غن", true], ["رب", "رب", true], ["أد", "ؤد", true],
    ["تمن", "تمن", false], ["تلق", "تلق", false], ["تسم", "تسم", false],
    ["التق", "لتق", true], ["اشتر", "شتر", true], ["انته", "نته", true], ["اشتك", "شتك", true], ["اكتف", "كتف", true],
    ["احتو", "حتو", true], ["اعتن", "عتن", true],
    ["استدع", "ستدع", true], ["استوف", "ستوف", true], ["استغن", "ستغن", true],
  ]) {
    add(defD(B, Bi, y));
    if (B[0] === "أ" || B.startsWith("است") || B === "سم" || B === "وف") add(defPassive(B, Bi));
  }
  // derived final-hamza
  add(hfI("أنشأ", "نش"));
  add(hfI("أخطأ", "خط"));
  add(hfI("ابتدأ", "بتد"));

  const set = new Set();
  for (const f of out) if (f.length > 2 || ALLOW_SHORT.has(f)) set.add(f);
  return [...set];
}

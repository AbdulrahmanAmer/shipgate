// WP-104 d1 / SE-121: Japanese verb forms, generated from paradigms (godan rows, ichidan, する, 来る, ある, honorific ra-row verbs).
// Authored from the author's own knowledge; no external morphology data. Forms are written without spaces, in kanji+okurigana
// and in hiragana. Every verb has a kanji spelling (full paradigm) and a hiragana spelling (full paradigm when the verb is
// normally written in kana or flagged k, otherwise a core subset).
//
// Verb table entry: "kanjiPrefix|kanaPrefix|class|flags"
//   class: "1" ichidan (prefix excludes the final る) | godan ending kana (う く ぐ す つ ぬ ぶ む る) | "iku" (行く te-form) |
//          "h" honorific ra-row (なさる くださる いらっしゃる おっしゃる ござる: i-stem い) | "aru" (ある) | "suru" | "kuru"
//   kanjiPrefix "-" = no kanji spelling.   flags: n = no potential/passive/causative, k = full paradigm for the kana spelling.

const ROW = {
  う: ["わ", "い", "え", "お", "って", "った"],
  く: ["か", "き", "け", "こ", "いて", "いた"],
  ぐ: ["が", "ぎ", "げ", "ご", "いで", "いだ"],
  す: ["さ", "し", "せ", "そ", "して", "した"],
  つ: ["た", "ち", "て", "と", "って", "った"],
  ぬ: ["な", "に", "ね", "の", "んで", "んだ"],
  ぶ: ["ば", "び", "べ", "ぼ", "んで", "んだ"],
  む: ["ま", "み", "め", "も", "んで", "んだ"],
  る: ["ら", "り", "れ", "ろ", "って", "った"],
};

const TABLE = `
見|み|1|k 食べ|たべ|1 寝|ね|1 起き|おき|1 出|で|1 着|き|1 得|え|1 見え|みえ|1|n 聞こえ|きこえ|1|n
教え|おしえ|1 答え|こたえ|1 考え|かんがえ|1 覚え|おぼえ|1 忘れ|わすれ|1 始め|はじめ|1 続け|つづけ|1 変え|かえ|1
受け|うけ|1 付け|つけ|1 開け|あけ|1 閉め|しめ|1 止め|とめ|1 辞め|やめ|1 集め|あつめ|1 決め|きめ|1 調べ|しらべ|1
伝え|つたえ|1 比べ|くらべ|1 並べ|ならべ|1 入れ|いれ|1 生まれ|うまれ|1 別れ|わかれ|1 慣れ|なれ|1 疲れ|つかれ|1
離れ|はなれ|1 触れ|ふれ|1 降り|おり|1 借り|かり|1 足り|たり|1 信じ|しんじ|1 感じ|かんじ|1 閉じ|とじ|1
投げ|なげ|1 逃げ|にげ|1 上げ|あげ|1 下げ|さげ|1 掛け|かけ|1 助け|たすけ|1 見つけ|みつけ|1 届け|とどけ|1
預け|あずけ|1 負け|まけ|1 避け|さけ|1 立て|たて|1 捨て|すて|1 育て|そだて|1 建て|たて|1 与え|あたえ|1
増え|ふえ|1 加え|くわえ|1 備え|そなえ|1 認め|みとめ|1 求め|もとめ|1 進め|すすめ|1 勧め|すすめ|1
確かめ|たしかめ|1 寄せ|よせ|1 乗せ|のせ|1 載せ|のせ|1 任せ|まかせ|1 見せ|みせ|1 知らせ|しらせ|1
出来|でき|1|nk 居|い|1|k 終え|おえ|1 超え|こえ|1 越え|こえ|1 数え|かぞえ|1 迎え|むかえ|1 支え|ささえ|1
訪れ|おとずれ|1 揃え|そろえ|1 諦め|あきらめ|1 売れ|うれ|1 -|くれ|1|k
行|い|iku|k 書|か|く 聞|き|く 歩|ある|く 働|はたら|く 引|ひ|く 置|お|く 続|つづ|く 動|うご|く 届|とど|く
開|ひら|く 泣|な|く 咲|さ|く 着|つ|く 付|つ|く 磨|みが|く 抜|ぬ|く 招|まね|く 焼|や|く 描|えが|く 築|きず|く
敷|し|く 頂|いただ|く 気付|きづ|く 気づ|きづ|く
泳|およ|ぐ 急|いそ|ぐ 脱|ぬ|ぐ 騒|さわ|ぐ 防|ふせ|ぐ 稼|かせ|ぐ 繋|つな|ぐ 注|そそ|ぐ
話|はな|す 貸|か|す 返|かえ|す 出|だ|す 探|さが|す 押|お|す 消|け|す 渡|わた|す 直|なお|す 落と|おと|す
起こ|おこ|す 示|しめ|す 指|さ|す 試|ため|す 残|のこ|す 表|あらわ|す 回|まわ|す 戻|もど|す 流|なが|す
申|もう|す 放|はな|す 思い出|おもいだ|す 増|ま|す 殺|ころ|す 通|とお|す 致|いた|す 治|なお|す
待|ま|つ 持|も|つ 立|た|つ 勝|か|つ 打|う|つ 保|たも|つ 育|そだ|つ 建|た|つ 経|た|つ
死|し|ぬ
呼|よ|ぶ 遊|あそ|ぶ 飛|と|ぶ 選|えら|ぶ 学|まな|ぶ 運|はこ|ぶ 並|なら|ぶ 喜|よろこ|ぶ 結|むす|ぶ 叫|さけ|ぶ 転|ころ|ぶ
読|よ|む 飲|の|む 住|す|む 休|やす|む 楽し|たのし|む 頼|たの|む 進|すす|む 込|こ|む 組|く|む 済|す|む
盗|ぬす|む 好|この|む 包|つつ|む 悩|なや|む 望|のぞ|む 生|う|む 痛|いた|む 踏|ふ|む 刻|きざ|む 汲|く|む
買|か|う 言|い|う 使|つか|う 会|あ|う 思|おも|う 笑|わら|う 習|なら|う 払|はら|う 手伝|てつだ|う 通|かよ|う
歌|うた|う 洗|あら|う 願|ねが|う 違|ちが|う 失|うしな|う 迷|まよ|う 疑|うたが|う 戦|たたか|う 向か|むか|う
扱|あつか|う 支払|しはら|う 伺|うかが|う 従|したが|う 行|おこな|う 誘|さそ|う 吸|す|う 拾|ひろ|う 救|すく|う
争|あらそ|う 追|お|う 合|あ|う 貰|もら|う
帰|かえ|る 入|はい|る 走|はし|る 作|つく|る 取|と|る 乗|の|る 売|う|る 知|し|る 分か|わか|る|nk 終わ|おわ|る
始ま|はじま|る 変わ|かわ|る 止ま|とま|る 泊ま|とま|る 座|すわ|る 送|おく|る 切|き|る 降|ふ|る 渡|わた|る
通|とお|る 登|のぼ|る 上が|あが|る 下が|さが|る 集ま|あつま|る 決ま|きま|る 閉ま|しま|る 助か|たすか|る
見つか|みつか|る 預か|あずか|る 掛か|かか|る 困|こま|る 頑張|がんば|る 守|まも|る 怒|おこ|る 残|のこ|る
戻|もど|る 眠|ねむ|る 撮|と|る 治|なお|る 直|なお|る 当た|あた|る 異な|ことな|る 広が|ひろが|る 繋が|つなが|る
減|へ|る 余|あま|る 触|さわ|る 割|わ|る 折|お|る 要|い|る|n 成|な|る|k 祈|いの|る 参|まい|る 光|ひか|る
振|ふ|る 回|まわ|る 貼|は|る 張|は|る -|や|る|k -|お|る|k
有|あ|aru|k 在|あ|aru
-|なさ|h|n 下さ|くださ|h|n -|いらっしゃ|h|n -|おっしゃ|h|n -|ござ|h|n
-|す|suru|k 来|く|kuru|k
`;

function godan(p, end, kind) {
  const [a, i, e, o, te, ta] = ROW[end];
  const S = { dict: p + end, i: p + i, a: p + a, ba: p + e + "ば", vol: p + o + "う", imp: [p + e], te: p + te, ta: p + ta,
    pot: p + e, pas: p + a + "れ", cau: p + a + "せ" };
  if (kind === "iku") { S.te = p + "って"; S.ta = p + "った"; }
  if (kind === "h") { S.i = p + "い"; S.imp = [p + "い"]; S.noTai = true; S.honorific = true; }
  if (kind === "aru") { S.noNai = true; S.noTai = true; S.vol = p + "ろう"; S.imp = []; S.pot = null; S.pas = null; S.cau = null; }
  return S;
}
function ichidan(p) {
  return { dict: p + "る", i: p, a: p, ba: p + "れば", vol: p + "よう", imp: [p + "ろ", p + "よ"], te: p + "て", ta: p + "た",
    pot: p + "られ", pot2: p + "れ", pas: p + "られ", cau: p + "させ" };
}
const SURU = { dict: "する", i: "し", a: "し", ba: "すれば", vol: "しよう", imp: ["しろ", "せよ"], te: "して", ta: "した",
  pot: null, pas: "され", cau: "させ", extra: ["せず"] };
const KURU_KANJI = { dict: "来る", i: "来", a: "来", ba: "来れば", vol: "来よう", imp: ["来い", "来ろ"], te: "来て", ta: "来た",
  pot: "来られ", pas: "来られ", cau: "来させ" };
const KURU_KANA = { dict: "くる", i: "き", a: "こ", ba: "くれば", vol: "こよう", imp: ["こい"], te: "きて", ta: "きた",
  pot: "こられ", pas: "こられ", cau: "こさせ" };

export default function forms() {
  const out = new Set();
  const add = (...xs) => { for (const x of xs) if (x) out.add(x); };
  const tail = (base, list) => add(...list.map((s) => base + s));

  function lite(stem) { // ichidan-type derived verb (potential / passive / causative); stem excludes る
    add(stem + "る");
    tail(stem, ["ます", "ません", "ました", "ませんでした", "ましょう", "て", "た", "ない", "なかった", "れば", "よう"]);
  }

  function emit(S, full, flags) {
    add(S.dict);
    tail(S.i, ["ます", "ません", "ました", "ましょう"]);
    add(S.te, S.ta, S.ba, S.vol, ...S.imp);
    if (!S.noNai) tail(S.a, ["ない", "なかった"]);
    tail(S.te, ["いる", "います"]);
    if (!full) return;
    if (!S.noNai) add(S.dict + "な");
    tail(S.i, ["ませんでした", "ますか", "ませんか", "ましたか"]);
    if (!S.noTai) tail(S.i, ["たい", "たくない", "たかった", "たくて", "ながら", "やすい", "にくい", "なさい"]);
    if (S.honorific) tail(S.i, ["ませ"]);
    tail(S.te, ["いた", "いました", "いない", "いません", "いて", "いなかった", "ください", "いれば", "る"]);
    tail(S.ta, ["ら", "り"]);
    if (!S.noNai) tail(S.a, ["なくて", "ないで", "なければ", "ず", "ないでください"]);
    if (S.extra) add(...S.extra);
    if (!flags.n) {
      if (S.pot) { lite(S.pot); if (S.pot2) lite(S.pot2); }
      if (S.pas) lite(S.pas);
      if (S.cau) lite(S.cau);
    }
  }

  for (const entry of TABLE.split(/\s+/).filter(Boolean)) {
    const [kj, kn, cls, fl = ""] = entry.split("|");
    const flags = { n: fl.includes("n"), k: fl.includes("k") };
    const spell = [];
    if (kj !== "-") spell.push([kj, true]);
    spell.push([kn, flags.k || kj === "-"]);
    for (const [p, full] of spell) {
      let S;
      if (cls === "1") S = ichidan(p);
      else if (cls === "suru") S = SURU;
      else if (cls === "kuru") S = p === "来" ? KURU_KANJI : KURU_KANA;
      else if (cls === "h") S = godan(p, "る", "h");
      else if (cls === "aru") S = godan(p, "る", "aru");
      else if (cls === "iku") S = godan(p, "く", "iku");
      else if (ROW[cls]) S = godan(p, cls, "");
      else throw new Error("ja: unknown class " + cls + " in " + entry);
      if (cls === "h" && p === "ござ") S = { ...S, imp: [] };
      emit(S, full, flags);
    }
  }
  return [...out];
}

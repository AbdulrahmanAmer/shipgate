// WP-104 part d1: authoring source of rules/load-more-labels.json (RTE-017), rules/pagination-labels.json (PRF-012)
// and rules/bool-labels.json (04 section 15 default field formats). Run: node nav-labels.mjs <rulesDir>
// pagination-labels = load-more labels + next/previous labels (PRF-012 counts "load more" controls as bounding a list).
import fs from "node:fs";
import path from "node:path";

const loadMore = {
  ar: ["تحميل المزيد", "عرض المزيد", "المزيد من النتائج", "اعرض المزيد", "إظهار المزيد", "مشاهدة المزيد", "المزيد من المقالات"],
  cs: ["načíst další", "načíst více", "zobrazit další", "zobrazit více", "ukázat více", "více výsledků", "další výsledky", "další články"],
  da: ["indlæs mere", "vis mere", "hent mere", "flere resultater", "flere artikler", "se flere", "load mere"],
  de: ["mehr laden", "weitere laden", "mehr anzeigen", "mehr ergebnisse", "weitere ergebnisse", "mehr beiträge", "mehr artikel", "weitere artikel laden", "mehr produkte"],
  en: ["load more", "show more", "view more", "see more", "more results", "more articles", "more posts", "load next"],
  es: ["cargar más", "ver más", "mostrar más", "más resultados", "más artículos", "más publicaciones"],
  fi: ["lataa lisää", "näytä lisää", "näytä enemmän", "lisää tuloksia", "katso lisää", "lisää artikkeleita"],
  fr: ["charger plus", "voir plus", "afficher plus", "voir davantage", "plus de résultats", "plus d'articles"],
  it: ["carica altri", "carica di più", "mostra altri", "mostra di più", "vedi altri", "vedi di più", "più risultati", "altri risultati", "altri articoli"],
  ja: ["もっと見る", "さらに表示", "もっと表示", "もっと読み込む", "さらに読み込む", "さらに見る", "続きを見る", "次を読み込む"],
  ko: ["더보기", "더 보기", "더 불러오기", "더 많이 보기", "더 많은 결과", "결과 더 보기"],
  nb: ["last inn mer", "last mer", "vis mer", "flere resultater", "flere artikler", "se flere"],
  nl: ["meer laden", "laad meer", "toon meer", "meer tonen", "meer weergeven", "meer resultaten", "meer artikelen", "meer berichten", "bekijk meer"],
  pl: ["załaduj więcej", "wczytaj więcej", "pokaż więcej", "zobacz więcej", "więcej wyników", "więcej artykułów", "załaduj kolejne", "pokaż kolejne"],
  pt: ["carregar mais", "ver mais", "mostrar mais", "exibir mais", "mais resultados", "mais artigos", "mais publicações"],
  ro: ["încarcă mai multe", "încarcă mai mult", "arată mai multe", "afișează mai multe", "vezi mai multe", "mai multe rezultate", "mai multe articole"],
  ru: ["загрузить ещё", "загрузить еще", "загрузить больше", "показать ещё", "показать еще", "показать больше", "больше результатов", "ещё статьи"],
  sv: ["ladda fler", "ladda mer", "visa fler", "visa mer", "fler resultat", "fler artiklar", "se fler"],
  tr: ["daha fazla yükle", "daha fazlasını yükle", "daha fazla göster", "daha fazlasını göster", "devamını yükle", "devamını göster", "daha fazla sonuç", "daha fazla ürün", "daha fazla makale"],
  zh: ["加载更多", "加載更多", "載入更多", "查看更多", "显示更多", "顯示更多", "更多结果", "更多結果", "更多文章", "点击加载更多", "點擊載入更多"],
};

const nextPrev = {
  ar: ["الصفحة التالية", "الصفحة السابقة", "الصفحة القادمة", "التالي »", "« السابق", "المقالات الأقدم", "المقالات الأحدث", "المشاركات الأقدم", "المشاركات الأحدث", "النتائج التالية", "النتائج السابقة"],
  cs: ["další stránka", "předchozí stránka", "následující stránka", "další »", "« předchozí", "starší příspěvky", "novější příspěvky", "starší články", "další výsledky", "předchozí výsledky"],
  da: ["næste side", "forrige side", "næste »", "« forrige", "ældre indlæg", "nyere indlæg", "ældre artikler", "næste resultater", "forrige resultater"],
  de: ["nächste seite", "vorherige seite", "vorige seite", "weiter »", "« zurück", "ältere beiträge", "neuere beiträge", "ältere einträge", "ältere artikel", "neuere artikel", "nächste ergebnisse", "vorherige ergebnisse"],
  en: ["next page", "previous page", "next »", "« previous", "older posts", "newer posts", "older entries", "newer entries", "next posts", "previous posts", "next results", "previous results"],
  es: ["página siguiente", "siguiente página", "página anterior", "siguiente »", "« anterior", "entradas anteriores", "entradas siguientes", "entradas más antiguas", "entradas más recientes", "artículos anteriores", "resultados siguientes", "resultados anteriores"],
  fi: ["seuraava sivu", "edellinen sivu", "seuraava »", "« edellinen", "vanhemmat artikkelit", "uudemmat artikkelit", "vanhemmat kirjoitukset", "uudemmat kirjoitukset", "seuraavat tulokset", "edelliset tulokset"],
  fr: ["page suivante", "page précédente", "suivant »", "« précédent", "articles plus anciens", "articles plus récents", "anciens articles", "articles précédents", "articles suivants", "résultats suivants", "résultats précédents"],
  it: ["pagina successiva", "pagina seguente", "pagina precedente", "successivo »", "« precedente", "articoli precedenti", "articoli successivi", "post precedenti", "post successivi", "risultati successivi", "risultati precedenti"],
  ja: ["次のページ", "前のページ", "次の記事", "前の記事", "過去の記事", "新しい記事", "古い記事", "次の結果", "前の結果", "次へ »", "« 前へ"],
  ko: ["다음 페이지", "이전 페이지", "다음 글", "이전 글", "다음 결과", "이전 결과", "오래된 글", "최신 글", "다음 »", "« 이전"],
  nb: ["neste side", "forrige side", "neste »", "« forrige", "eldre innlegg", "nyere innlegg", "tidligere innlegg", "eldre artikler", "neste resultater", "forrige resultater"],
  nl: ["volgende pagina", "vorige pagina", "volgende »", "« vorige", "oudere berichten", "nieuwere berichten", "oudere artikelen", "volgende berichten", "vorige berichten", "volgende resultaten", "vorige resultaten"],
  pl: ["następna strona", "poprzednia strona", "kolejna strona", "następna »", "« poprzednia", "starsze wpisy", "nowsze wpisy", "starsze artykuły", "następne wyniki", "poprzednie wyniki"],
  pt: ["próxima página", "página seguinte", "página anterior", "próximo »", "« anterior", "publicações anteriores", "publicações seguintes", "artigos anteriores", "posts anteriores", "posts mais antigos", "posts mais recentes", "resultados seguintes"],
  ro: ["pagina următoare", "pagina anterioară", "următoarea »", "« anterioară", "articole mai vechi", "articole mai noi", "postări mai vechi", "postări mai noi", "rezultatele următoare", "rezultatele anterioare"],
  ru: ["следующая страница", "предыдущая страница", "вперёд »", "вперед »", "далее »", "« назад", "старые записи", "новые записи", "предыдущие записи", "следующие записи", "следующие результаты", "предыдущие результаты"],
  sv: ["nästa sida", "föregående sida", "nästa »", "« föregående", "äldre inlägg", "nyare inlägg", "tidigare inlägg", "senare inlägg", "äldre artiklar", "nästa resultat", "föregående resultat"],
  tr: ["sonraki sayfa", "önceki sayfa", "sonraki »", "« önceki", "eski yazılar", "yeni yazılar", "önceki yazılar", "sonraki yazılar", "sonraki sonuçlar", "önceki sonuçlar"],
  zh: ["下一页", "上一页", "下页", "上页", "下一頁", "上一頁", "下一篇", "上一篇", "更早的文章", "更新的文章", "较早的文章", "較早的文章", "后一页", "前一页"],
};

// Localized yes / no, display forms (not case-folded: these are rendered, not matched).
const bool = {
  ar: { true: "نعم", false: "لا" },
  cs: { true: "Ano", false: "Ne" },
  da: { true: "Ja", false: "Nej" },
  de: { true: "Ja", false: "Nein" },
  en: { true: "Yes", false: "No" },
  es: { true: "Sí", false: "No" },
  fi: { true: "Kyllä", false: "Ei" },
  fr: { true: "Oui", false: "Non" },
  it: { true: "Sì", false: "No" },
  ja: { true: "はい", false: "いいえ" },
  ko: { true: "예", false: "아니요" },
  nb: { true: "Ja", false: "Nei" },
  nl: { true: "Ja", false: "Nee" },
  pl: { true: "Tak", false: "Nie" },
  pt: { true: "Sim", false: "Não" },
  ro: { true: "Da", false: "Nu" },
  ru: { true: "Да", false: "Нет" },
  sv: { true: "Ja", false: "Nej" },
  tr: { true: "Evet", false: "Hayır" },
  zh: { true: "是", false: "否" },
};

const dir = process.argv[2];
if (!dir) throw new Error("usage: nav-labels.mjs <rulesDir>");
const pagination = Object.fromEntries(Object.keys(loadMore).map((k) => [k, [...loadMore[k], ...nextPrev[k]]]));
for (const [name, data] of [["load-more-labels", loadMore], ["pagination-labels", pagination], ["bool-labels", bool]]) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
}
console.log("wrote load-more-labels.json, pagination-labels.json, bool-labels.json");

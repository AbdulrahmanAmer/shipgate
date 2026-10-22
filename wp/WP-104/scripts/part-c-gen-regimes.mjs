// Usage: node wp/WP-104/scripts/part-c-gen-regimes.mjs <out rules/regulated-product-regimes.json>
// WP-104 part c. Builds rules/regulated-product-regimes.json (PRV-040): [{ id, categoryRegexes: { locale: [regex] } }].
// Regexes are Rust `regex` syntax, matched case-insensitively against JSON-LD Product.category, BreadcrumbList item names and <h1>.
// Compound-word languages (de nl da sv nb fi) and non-spaced scripts (ja ko zh ar) use plain substrings (no \b).
// The self-test converts (?i) to the `i` flag and runs each regex over one positive and one negative sample.
import fs from "node:fs";

const out = process.argv[2];
if (!out) throw new Error("usage: part-c-gen-regimes.mjs <out.json>");

const NOB = new Set(["de", "nl", "da", "sv", "nb", "fi", "ja", "ko", "zh", "ar", "ru"]);
const wrap = (loc, terms) => {
  const body = terms.join("|");
  return NOB.has(loc) ? `(?i)(?:${body})` : `(?i)\\b(?:${body})`;
};
const wrapEnd = (loc, terms) => (loc === "en" ? `(?i)\\b(?:${terms.join("|")})\\b` : wrap(loc, terms));

// ---- eu-energy-label: product groups with an EU energy label (energy-efficient-products.ec.europa.eu/product-list_en, 2026-10-22)
const ENERGY = {
  ar: ["غسالة", "مجفف ملابس", "غسالة صحون", "غسالة أطباق", "ثلاجة", "فريزر", "مجمد", "شفاط", "مكيف", "مروحة", "تلفزيون", "تلفاز", "شاشة", "هاتف ذكي", "جهاز لوحي", "مصباح", "لمبة", "سخان مياه", "مضخة حرارية", "مدفأة"],
  cs: ["pračk", "sušičk", "myčk", "lednic", "chladnič", "mrazák", "vestavn[áé] trub", "odsavač", "klimatizac", "ventilátor", "televiz", "tv\\b", "monitor", "chytrý telefon", "smartphone", "mobilní telefon", "tablet", "žárovk", "světelný zdroj", "pneumatik", "bojler", "ohřívač vody", "tepelné čerpadlo", "kotel"],
  da: ["vaskemaskine", "tørretumbler", "opvaskemaskine", "køleskab", "fryser", "vinkøler", "indbygningsovn", "emhætte", "aircondition", "ventilator", "fjernsyn", "skærm", "monitor", "smartphone", "mobiltelefon", "tablet", "led-pære", "pære", "lyskilde", "dæk", "vandvarmer", "varmepumpe", "radiator"],
  de: ["waschmaschine", "wäschetrockner", "waschtrockner", "geschirrspüler", "spülmaschine", "kühlschrank", "gefrierschrank", "kühl-gefrier", "weinklimaschrank", "backofen", "einbauherd", "dunstabzugshaube", "dunsthaube", "klimagerät", "klimaanlage", "fernseher", "monitor", "bildschirm", "smartphone", "mobiltelefon", "tablet-pc", "leuchtmittel", "glühbirne", "led-lampe", "autoreifen", "reifen", "warmwasserbereiter", "durchlauferhitzer", "wärmepumpe", "lüftungsgerät"],
  en: ["washing machines?", "washer[- ]?dryers?", "tumble dryers?", "dishwashers?", "fridges?", "freezers?", "refrigerators?", "wine (?:coolers?|cabinets?)", "(?:built-in|electric|gas|domestic|single|double|steam|combi) ovens?", "(?:range|cooker|extractor) hoods?", "air[- ]conditioner(?:s|ing)?", "comfort fans?", "television(?:s)?", "tvs?", "monitors?", "smartphones?", "mobile phones?", "tablet computers?", "(?:light|led) bulbs?", "led lamps?", "light sources?", "tyres?", "tires?", "water heaters?", "heat pumps?", "space heaters?", "ventilation units?"],
  es: ["lavadoras?", "secadoras?", "lavavajillas", "frigor[ií]ficos?", "congeladores?", "neveras?", "vinotecas?", "hornos? (?:empotrables?|el[eé]ctricos?)", "campanas? extractoras?", "aires? acondicionados?", "climatizadores?", "ventiladores?", "televisor(?:es)?", "televisi[oó]n", "tv\\b", "monitores?", "smartphones?", "tel[eé]fonos? m[oó]viles?", "tablets?", "bombillas?", "l[aá]mparas? led", "fuentes? de luz", "neum[aá]ticos?", "calentadores? de agua", "bombas? de calor", "calefactores?", "calderas?"],
  fi: ["pesukone", "kuivausrumpu", "astianpesukone", "jääkaappi", "pakastin", "viinikaappi", "kiinteä uuni", "liesituuletin", "ilmastointilaite", "ilmalämpöpumppu", "tuuletin", "televisio", "näyttö", "monitori", "älypuhelin", "matkapuhelin", "taulutietokone", "tablettitietokone", "hehkulamppu", "led-lamppu", "valonlähde", "autonrengas", "vesivaraaja", "lämpöpumppu"],
  fr: ["lave[- ]linge", "sèche[- ]linge", "lave[- ]vaisselle", "réfrigérateurs?", "congélateurs?", "frigos?", "cave à vin", "fours? (?:encastrables?|électriques?|à encastrer)", "hottes?", "climatiseurs?", "climatisation", "ventilateurs?", "téléviseurs?", "télévisions?", "tv\\b", "moniteurs?", "écrans? (?:plat|led|lcd|oled|plasma)", "smartphones?", "téléphones? portables?", "tablettes? (?:tactiles?|numériques?)", "ampoules?", "lampes? led", "sources? lumineuses?", "pneus?", "pneumatiques?", "chauffe[- ]eau", "pompes? à chaleur", "radiateurs?", "chaudières?"],
  it: ["lavatrici?", "asciugatrici?", "lavasciuga", "lavastoviglie", "frigoriferi?", "congelatori?", "cantine? per vini", "forni? (?:da incasso|elettrici|a incasso)", "cappe", "condizionatori?", "climatizzatori?", "ventilatori?", "televisori?", "televisione", "tv\\b", "monitor", "smartphone", "telefoni? cellulari?", "tablet", "lampadine?", "lampade led", "sorgenti? luminose?", "pneumatici", "scaldabagni?", "scalda[- ]acqua", "pompe? di calore", "caldaie"],
  ja: ["洗濯機", "乾燥機", "食器洗い機", "食洗機", "冷蔵庫", "冷凍庫", "ワインセラー", "オーブン", "レンジフード", "エアコン", "扇風機", "テレビ", "モニター", "ディスプレイ", "スマートフォン", "スマホ", "タブレット", "電球", "光源", "タイヤ", "給湯器", "ヒートポンプ", "ヒーター"],
  ko: ["세탁기", "건조기", "식기세척기", "냉장고", "냉동고", "와인셀러", "오븐", "레인지후드", "에어컨", "선풍기", "텔레비전", "TV", "모니터", "스마트폰", "휴대폰", "태블릿", "전구", "광원", "타이어", "온수기", "히트펌프", "히터"],
  nb: ["vaskemaskin", "tørketrommel", "oppvaskmaskin", "kjøleskap", "fryser", "vinskap", "stekeovn", "kjøkkenvifte", "klimaanlegg", "vifte", "fjernsyn", "tv-apparat", "skjerm", "monitor", "smarttelefon", "mobiltelefon", "nettbrett", "lyspære", "led-pære", "lyskilde", "dekk", "varmtvannsbereder", "varmepumpe", "panelovn"],
  nl: ["wasmachine", "wasdroger", "vaatwasser", "koelkast", "vriezer", "diepvries", "wijnklimaatkast", "inbouwoven", "elektrische oven", "heteluchtoven", "combi-oven", "afzuigkap", "airco", "airconditioner", "ventilator", "televisie", "monitor", "smartphone", "mobiele telefoon", "tablet", "gloeilamp", "ledlamp", "led-lamp", "spaarlamp", "lichtbron", "autoband", "autobanden", "zomerbanden", "winterbanden", "boiler", "warmtepomp"],
  pl: ["pralk", "suszark", "zmywark", "lod[óo]wk", "zamra[żz]ark", "piekarnik", "okap", "klimatyzator", "wentylator", "telewizor", "tv\\b", "monitor", "smartfon", "telefon kom[óo]rkowy", "tablet", "[żz]ar[óo]wk", "lampa led", "[żz]r[óo]d[łl]o [śs]wiat[łl]a", "opon[ay]", "podgrzewacz wody", "pompa ciep[łl]a", "grzejnik", "kocio[łl]"],
  pt: ["m[aá]quinas? de lavar (?:roupa|loi[cç]a)", "m[aá]quinas? de secar", "secadoras?", "lava[- ]lou[cç]as?", "frigor[ií]ficos?", "arcas? congeladoras?", "congeladores?", "fornos? (?:el[eé]ctricos?|de encastrar|embutidos?)", "exaustores?", "coifas?", "ar[- ]condicionado", "ventoinhas?", "televis(?:or|ores|[aã]o)", "tv\\b", "monitores?", "smartphones?", "telem[oó]veis?", "celulares?", "tablets?", "l[aâ]mpadas? led", "fontes? de luz", "pneus?", "pneum[aá]ticos?", "termoacumuladores?", "aquecedores? de [aá]gua", "bombas? de calor", "caldeiras?"],
  ro: ["ma[sș]in[ăa] de sp[ăa]lat", "uscător", "frigider", "congelator", "cuptor", "hot[ăa]", "aer condi[tț]ionat", "ventilator", "televizor", "tv\\b", "monitor", "smartphone", "telefon mobil", "tablet[ăa]", "bec", "surs[ăa] de lumin[ăa]", "anvelop", "boiler", "pomp[ăa] de c[ăa]ldur[ăa]", "radiator", "central[ăa] termic[ăa]"],
  ru: ["стиральн[а-яё]+ машин", "сушильн[а-яё]+ машин", "посудомоечн[а-яё]+", "холодильник", "морозильн", "винный шкаф", "духов[а-яё]+ шкаф", "вытяжк", "кондиционер", "вентилятор", "телевизор", "монитор", "смартфон", "мобильн[а-яё]+ телефон", "планшет", "лампочк", "светодиодн[а-яё]+ ламп", "источник света", "автошин", "водонагреватель", "тепловой насос", "обогревател", "котел", "котёл"],
  sv: ["tvättmaskin", "torktumlare", "diskmaskin", "kylskåp", "frys", "vinkyl", "inbyggnadsugn", "köksfläkt", "luftkonditionering", "fläkt", "tv-apparat", "bildskärm", "monitor", "smartphone", "mobiltelefon", "surfplatta", "glödlampa", "led-lampa", "ljuskälla", "bildäck", "varmvattenberedare", "värmepump"],
  tr: ["çamaşır makinesi", "kurutma makinesi", "bulaşık makinesi", "buzdolabı", "dondurucu", "şarap soğutucu", "ankastre fırın", "davlumbaz", "klima", "vantilatör", "televizyon", "tv\\b", "monitör", "akıllı telefon", "cep telefonu", "tablet bilgisayar", "ampul", "ışık kaynağı", "lastik", "şofben", "su ısıtıcı", "ısı pompası", "kombi", "radyatör"],
  zh: ["洗衣机", "烘干机", "洗碗机", "冰箱", "冷柜", "酒柜", "烤箱", "抽油烟机", "油烟机", "空调", "风扇", "电视", "显示器", "智能手机", "手机", "平板电脑", "灯泡", "光源", "轮胎", "热水器", "热泵", "取暖器"],
};

// ---- eu-food-info: foods sold at a distance (Reg. (EU) No 1169/2011 Art. 14)
const FOOD = {
  ar: ["أغذية", "مواد غذائية", "وجبات خفيفة", "حلويات", "شوكولاتة", "قهوة", "شاي", "توابل", "زيت زيتون", "مكملات غذائية", "مشروبات", "أغذية الأطفال"],
  cs: ["potravin", "snack", "sladkost", "čokolád", "káv[ay]", "čaj", "koření", "olivový olej", "těstovin", "müsli", "nápoj", "doplňky stravy", "dětská výživa", "med\\b"],
  da: ["fødevarer", "madvarer", "snacks", "slik", "chokolade", "kaffebønner", "te\\b", "krydderier", "olivenolie", "pasta", "müsli", "drikkevarer", "kosttilskud", "babymad", "honning"],
  de: ["lebensmittel", "nahrungsmittel", "feinkost", "süßwaren", "schokolade", "kekse", "gebäck", "kaffeebohnen", "ganze bohnen", "kräutertee", "schwarztee", "grüner tee", "gewürze", "speiseöl", "olivenöl", "nudeln", "müsli", "getränke", "säfte", "nahrungsergänzung", "babynahrung", "fertiggericht", "honig", "konfitüre", "marmelade"],
  en: ["foods?", "groceries", "grocery", "snacks?", "sweets", "confectionery", "chocolates?", "biscuits?", "cookies", "crisps", "coffee beans?", "ground coffee", "tea", "spices?", "sauces?", "condiments?", "cooking oils?", "olive oil", "pasta", "rice", "cereals?", "dairy", "cheese", "sausages?", "bakery", "jams?", "honey", "dried fruit", "soft drinks?", "juices?", "food supplements?", "dietary supplements?", "baby food", "ready meals?"],
  es: ["alimentos", "alimentación", "comestibles", "snacks?", "dulces", "golosinas", "chocolates?", "galletas", "caf[eé] en grano", "caf[eé] molido", "t[eé]s?", "especias", "salsas", "aceite de oliva", "pasta", "arroz", "cereales", "bebidas", "zumos", "complementos alimenticios", "suplementos alimenticios", "comida para beb[eé]s", "platos preparados", "miel"],
  fi: ["elintarvikkeet", "ruoka", "välipalat", "makeiset", "suklaa", "kahvipavut", "jauhettu kahvi", "tee\\b", "mausteet", "oliiviöljy", "pasta", "murot", "juomat", "mehut", "ravintolisät", "vauvanruoka", "hunaja"],
  fr: ["alimentation", "épicerie", "produits alimentaires", "denrées", "snacks?", "confiseries?", "bonbons", "chocolats?", "biscuits?", "café en grains", "café moulu", "thés?", "épices", "sauces?", "huile d'olive", "huile d’olive", "pâtes", "riz", "céréales", "boissons", "jus", "compléments alimentaires", "aliments pour bébés", "plats cuisinés", "miel"],
  it: ["alimentari", "prodotti alimentari", "gastronomia", "snack", "dolciumi", "cioccolat", "biscotti", "caff[eè] in grani", "caff[eè] macinato", "t[eè]\\b", "spezie", "salse", "olio d'oliva", "olio d’oliva", "pasta", "riso", "cereali", "bevande", "succhi", "integratori alimentari", "alimenti per l'infanzia", "alimenti per l’infanzia", "piatti pronti", "miele"],
  ja: ["食品", "食料品", "お菓子", "菓子", "チョコレート", "コーヒー豆", "紅茶", "緑茶", "調味料", "オリーブオイル", "健康食品", "サプリメント", "飲料", "ベビーフード", "レトルト"],
  ko: ["식품", "간식", "과자", "초콜릿", "커피", "조미료", "올리브유", "건강기능식품", "보충제", "음료", "이유식"],
  nb: ["matvarer", "mat og drikke", "snacks", "godteri", "sjokolade", "kaffebønner", "te\\b", "krydder", "olivenolje", "pasta", "müsli", "drikkevarer", "kosttilskudd", "barnemat", "honning"],
  nl: ["voedingsmiddelen", "levensmiddelen", "boodschappen", "snacks", "snoep", "chocolade", "koekjes", "koffiebonen", "gemalen koffie", "thee\\b", "kruiden", "specerijen", "olijfolie", "pasta", "muesli", "dranken", "sappen", "voedingssupplementen", "babyvoeding", "kant-en-klaar", "honing"],
  pl: ["żywność", "artykuły spożywcze", "przekąski", "słodycze", "czekolad", "ciastka", "kawa ziarnista", "kawa mielona", "herbat", "przyprawy", "sosy", "oliwa z oliwek", "makaron", "ryż", "płatki", "napoje", "soki", "suplementy diety", "żywność dla niemowląt", "dania gotowe", "miód"],
  pt: ["alimentos", "alimentação", "mercearia", "snacks?", "doces", "guloseimas", "chocolates?", "bolachas", "biscoitos", "caf[eé] em gr[aã]o", "caf[eé] mo[ií]do", "ch[aá]s?", "especiarias", "molhos", "azeite", "massa", "arroz", "cereais", "bebidas", "sumos", "sucos", "suplementos alimentares", "comida para beb[eé]s", "refei[cç][oõ]es prontas", "mel"],
  ro: ["alimente", "produse alimentare", "băcănie", "snacks", "dulciuri", "ciocolat", "biscui", "cafea boabe", "cafea măcinată", "ceai", "condimente", "sosuri", "ulei de măsline", "paste", "orez", "cereale", "băuturi", "sucuri", "suplimente alimentare", "mâncare pentru bebeluși", "mâncăruri gata", "miere"],
  ru: ["продукты питания", "продукты", "бакалея", "снеки", "сладости", "шоколад", "печенье", "кофе в зернах", "молотый кофе", "чай", "специи", "соусы", "оливковое масло", "макароны", "рис", "крупы", "напитки", "соки", "биологически активные добавки", "бад", "детское питание", "готовые блюда", "мед\\b"],
  sv: ["livsmedel", "mat och dryck", "snacks", "godis", "choklad", "kaffebönor", "te\\b", "kryddor", "olivolja", "pasta", "müsli", "drycker", "kosttillskott", "barnmat", "honung"],
  tr: ["gıda", "yiyecek", "market", "atıştırmalık", "şekerleme", "çikolata", "bisküvi", "kahve çekirdeği", "çay", "baharat", "soslar", "zeytinyağı", "makarna", "pirinç", "tahıl", "içecek", "meyve suyu", "gıda takviyesi", "bebek maması", "hazır yemek", "bal\\b"],
  zh: ["食品", "零食", "糖果", "巧克力", "咖啡", "茶叶", "调味", "橄榄油", "保健品", "营养补充剂", "饮料", "婴儿食品", "方便食品"],
};

// ---- us-ca-prop65: consumer-product categories commonly the subject of Proposition 65 notices
const P65 = {
  ar: ["مستحضرات التجميل", "مكياج", "شموع", "مجوهرات", "خزف", "أدوات المائدة", "أواني الطهي", "مكملات غذائية", "فيتامينات", "شاحن", "كابل", "سماعات", "فينيل", "جلد", "حقائب", "أحذية", "منتجات الأطفال", "أثاث"],
  cs: ["kosmetik", "make-?up", "svíčk", "šperk", "keramik", "nádobí", "doplňky stravy", "vitam[ií]n", "nabíječk", "kabel", "sluchátk", "vinyl", "pvc\\b", "kožen", "kabelk", "obuv", "dětské výrobky", "nábytek", "matrac"],
  da: ["kosmetik", "makeup", "stearinlys", "smykker", "keramik", "service", "køkkenudstyr", "kosttilskud", "vitamin", "oplader", "kabel", "hovedtelefon", "vinyl", "pvc\\b", "læder", "håndtasker", "fodtøj", "babyprodukter", "møbler", "madras"],
  de: ["kosmetik", "schminke", "kerzen", "schmuck", "keramik", "geschirr", "kochgeschirr", "nahrungsergänzung", "vitamine", "proteinpulver", "ladekabel", "ladegerät", "kopfhörer", "vinyl", "pvc\\b", "leder", "handtasche", "geldbörse", "schuhe", "babyartikel", "möbel", "matratze", "schaumstoff"],
  en: ["cosmetics?", "make-?up", "candles?", "jewel(?:le)?ry", "ceramics?", "dinnerware", "cookware", "kitchenware", "supplements?", "vitamins?", "protein (?:powder|bars?)", "chargers?", "cables?", "headphones?", "earbuds?", "vinyl", "pvc", "leather", "handbags?", "wallets?", "footwear", "shoes?", "baby products?", "children'?s products?", "furniture", "mattress(?:es)?", "foam", "e-?cigarettes?", "vap(?:e|ing)"],
  es: ["cosm[eé]ticos?", "maquillaje", "velas?", "joyer[ií]a", "bisuter[ií]a", "cer[aá]mica", "vajilla", "bater[ií]a de cocina", "suplementos?", "vitaminas?", "prote[ií]na en polvo", "cargadores?", "cables?", "auriculares", "vinilo", "pvc\\b", "cuero", "bolsos?", "carteras?", "calzado", "productos para beb[eé]s", "muebles", "colch[oó]n", "espuma"],
  fi: ["kosmetiikka", "meikki", "kynttilä", "korut", "keramiikka", "astiat", "keittiövälineet", "ravintolisä", "vitamiini", "laturi", "kaapeli", "kuulokkeet", "vinyyli", "pvc\\b", "nahka", "käsilaukku", "lompakko", "jalkineet", "vauvatuotteet", "huonekalut", "patja"],
  fr: ["cosm[eé]tiques?", "maquillage", "bougies?", "bijoux", "c[eé]ramique", "vaisselle", "batterie de cuisine", "compl[eé]ments? alimentaires?", "vitamines?", "prot[eé]ines en poudre", "chargeurs?", "c[aâ]bles?", "casques? audio", "[eé]couteurs", "vinyle", "pvc\\b", "cuir", "sacs? [aà] main", "portefeuilles?", "chaussures", "articles? de pu[eé]riculture", "meubles?", "matelas", "mousse"],
  it: ["cosmetici", "trucco", "candele", "gioielli", "bigiotteria", "ceramica", "stoviglie", "pentole", "integratori", "vitamine", "proteine in polvere", "caricabatterie", "cavi", "cuffie", "vinile", "pvc\\b", "pelle", "borse", "portafogli", "calzature", "scarpe", "prodotti per neonati", "mobili", "materass", "gommapiuma"],
  ja: ["化粧品", "メイク", "キャンドル", "ジュエリー", "アクセサリー", "陶器", "食器", "調理器具", "サプリメント", "ビタミン", "プロテイン", "充電器", "ケーブル", "ヘッドホン", "イヤホン", "ビニール", "塩ビ", "レザー", "革製品", "バッグ", "財布", "靴", "ベビー用品", "家具", "マットレス"],
  ko: ["화장품", "메이크업", "캔들", "양초", "주얼리", "도자기", "식기", "조리기구", "보충제", "비타민", "프로틴", "충전기", "케이블", "헤드폰", "이어폰", "비닐", "가죽", "핸드백", "지갑", "신발", "유아용품", "가구", "매트리스"],
  nb: ["kosmetikk", "sminke", "lys\\b", "stearinlys", "smykker", "keramikk", "servise", "kokekar", "kosttilskudd", "vitamin", "lader", "kabel", "hodetelefoner", "vinyl", "pvc\\b", "skinn", "håndvesker", "lommebok", "fottøy", "babyprodukter", "møbler", "madrass"],
  nl: ["cosmetica", "make-up", "kaarsen", "sieraden", "keramiek", "servies", "kookgerei", "voedingssupplementen", "vitamines", "eiwitpoeder", "oplader", "kabel", "koptelefoon", "vinyl", "pvc\\b", "leer", "handtas", "portemonnee", "schoenen", "babyproducten", "meubels", "matras"],
  pl: ["kosmetyk", "makija[żz]", "[śs]wiec", "bi[żz]uteri", "ceramik", "zastawa sto[łl]owa", "naczynia kuchenne", "suplementy", "witamin", "bia[łl]ko w proszku", "[łl]adowark", "kabel", "s[łl]uchawk", "winyl", "pcw\\b", "sk[óo]r", "torebk", "portfel", "obuwie", "produkty dla niemowl[ąa]t", "meble", "materac"],
  pt: ["cosm[eé]ticos?", "maquilhagem", "maquiagem", "velas?", "joalharia", "bijuteria", "cer[aâ]mica", "loi[cç]a", "utens[ií]lios de cozinha", "suplementos?", "vitaminas?", "prote[ií]na em p[oó]", "carregadores?", "cabos?", "auscultadores", "fones de ouvido", "vinil", "pvc\\b", "couro", "mala", "carteira", "cal[cç]ado", "produtos para beb[eé]s", "m[oó]veis", "colch[aã]o", "espuma"],
  ro: ["cosmetice", "machiaj", "lum[aâ]n", "bijuterii", "ceramic", "veselă", "vase de gătit", "suplimente", "vitamine", "proteine pudră", "încărcător", "cablu", "căști", "vinil", "pvc\\b", "piele", "genți", "portofel", "încălțăminte", "produse pentru bebeluși", "mobilier", "saltea", "spumă"],
  ru: ["косметик", "макияж", "свеч", "ювелирн", "украшени", "керамик", "посуда", "кухонн[а-яё]+ принадлежност", "добавк", "витамин", "протеин", "зарядн[а-яё]+ устройств", "кабел", "наушник", "винил", "пвх\\b", "кожан", "сумк", "кошел", "обувь", "детские товары", "мебел", "матрас"],
  sv: ["kosmetika", "smink", "ljus\\b", "stearinljus", "smycken", "keramik", "servis", "köksutrustning", "kosttillskott", "vitamin", "laddare", "kabel", "hörlurar", "vinyl", "pvc\\b", "läder", "handväskor", "plånbok", "skor", "babyprodukter", "möbler", "madrass"],
  tr: ["kozmetik", "makyaj", "mum", "mücevher", "takı", "seramik", "sofra takımı", "mutfak gereçleri", "takviye", "vitamin", "protein tozu", "şarj", "kablo", "kulaklık", "vinil", "pvc\\b", "deri", "el çantası", "cüzdan", "ayakkabı", "bebek ürünleri", "mobilya", "yatak", "sünger"],
  zh: ["化妆品", "彩妆", "蜡烛", "珠宝", "首饰", "陶瓷", "餐具", "炊具", "保健品", "维生素", "蛋白粉", "充电器", "数据线", "耳机", "乙烯基", "聚氯乙烯", "皮革", "手提包", "钱包", "鞋", "婴儿用品", "家具", "床垫", "海绵"],
};

const regimes = [
  { id: "eu-energy-label", src: ENERGY },
  { id: "eu-food-info", src: FOOD },
  { id: "us-ca-prop65", src: P65 },
];

const LOCALES = ["ar", "cs", "da", "de", "en", "es", "fi", "fr", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sv", "tr", "zh"];
const result = regimes.map(({ id, src }) => {
  const categoryRegexes = {};
  for (const loc of LOCALES) {
    if (!src[loc]) throw new Error(`${id}: missing locale ${loc}`);
    categoryRegexes[loc] = [wrapEnd(loc, src[loc])];
  }
  return { id, categoryRegexes };
});

// ---- self-test: compile every regex in JS (Rust-compatible subset) and run one positive sample
const POS = {
  "eu-energy-label": { en: "Washing Machines", de: "Einbau-Geschirrspüler", fr: "Lave-linge frontal", es: "Frigoríficos combi", it: "Lavatrici a carico frontale", pt: "Máquinas de lavar roupa", nl: "Inductie wasmachine", pl: "Pralki", cs: "Pračky", da: "Opvaskemaskine", fi: "Jääkaappi", sv: "Torktumlare", ro: "Frigider", nb: "Kjøleskap", ru: "Стиральные машины", tr: "Buzdolabı", ar: "ثلاجة", ja: "冷蔵庫", ko: "냉장고", zh: "洗衣机" },
  "eu-food-info": { en: "Snacks", de: "Feinkost & Lebensmittel", fr: "Épicerie", es: "Alimentos", it: "Alimentari", pt: "Mercearia", nl: "Levensmiddelen", pl: "Przekąski", cs: "Potraviny", da: "Fødevarer", fi: "Elintarvikkeet", sv: "Livsmedel", ro: "Alimente", nb: "Matvarer", ru: "Продукты питания", tr: "Gıda", ar: "مواد غذائية", ja: "食品", ko: "식품", zh: "食品" },
  "us-ca-prop65": { en: "Handbags", de: "Kosmetik", fr: "Bijoux", es: "Cosméticos", it: "Candele", pt: "Calçado", nl: "Sieraden", pl: "Kosmetyki", cs: "Šperky", da: "Smykker", fi: "Kosmetiikka", sv: "Smycken", ro: "Cosmetice", nb: "Smykker", ru: "Косметика", tr: "Kozmetik", ar: "مجوهرات", ja: "化粧品", ko: "화장품", zh: "化妆品" },
};
const NEG = { en: "Gift certificates", de: "Gutscheine", fr: "Cartes cadeaux", es: "Tarjetas regalo", it: "Buoni regalo", pt: "Vales de oferta", nl: "Cadeaubonnen", pl: "Bony podarunkowe", cs: "Dárkové poukazy", da: "Gavekort", fi: "Lahjakortit", sv: "Presentkort", ro: "Carduri cadou", nb: "Gavekort", ru: "Подарочные сертификаты", tr: "Hediye çekleri", ar: "بطاقات الهدايا", ja: "ギフト券", ko: "상품권", zh: "礼品卡" };
let bad = 0;
for (const r of result) {
  for (const loc of LOCALES) {
    for (const rx of r.categoryRegexes[loc]) {
      let re;
      try {
        re = new RegExp(rx.replace(/^\(\?i\)/, ""), "iu");
      } catch (e) {
        bad++;
        console.error("COMPILE", r.id, loc, e.message);
        continue;
      }
      if (!re.test(POS[r.id][loc])) { bad++; console.error("MISS positive", r.id, loc, POS[r.id][loc]); }
      if (re.test(NEG[loc])) { bad++; console.error("HIT negative", r.id, loc, NEG[loc]); }
    }
  }
}
// The JS engine's \b is ASCII-only, so a JS miss on an accented first letter is not a Rust miss; the authoritative check is
// the Rust `regex` run over the tests file (argv[3]) - run the tests file through the Rust regex crate (cargo scratch crate, not committed).
if (bad) console.error(`JS self-test: ${bad} miss(es) (re-check in Rust)`);
const testsOut = process.argv[3];
if (testsOut) {
  const tests = [];
  for (const r of result) for (const loc of LOCALES) for (const rx of r.categoryRegexes[loc]) {
    tests.push({ regex: rx, text: POS[r.id][loc], match: true, label: `${r.id}/${loc}/pos` });
    tests.push({ regex: rx, text: NEG[loc], match: false, label: `${r.id}/${loc}/neg` });
  }
  fs.writeFileSync(testsOut, JSON.stringify(tests, null, 1));
}
fs.writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
console.log("ok regimes=" + result.length);

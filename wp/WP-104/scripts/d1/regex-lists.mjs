// WP-104 part d1: authoring source of rules/clickbait-patterns.json (SE-103) and rules/advice-patterns.json (DAT-012).
// Patterns are Rust `regex` syntax (no look-around, no back-references), matched case-insensitively.
// String.raw keeps backslashes literal; JSON escaping is done by JSON.stringify. Run: node regex-lists.mjs <rulesDir>
import fs from "node:fs";
import path from "node:path";

const R = String.raw;

const clickbait = {
  ar: [
    R`لن تصدق`, R`لن تصدقوا`, R`لن تتوقع`, R`ما حدث بعد ذلك`, R`ما حدث بعدها`, R`ستصدم`, R`سوف تصدم`, R`الأطباء يكرهون`, R`لن تخمن أبدا`,
  ],
  cs: [
    R`\bnebudete věřit\b`, R`\bnebudeš věřit\b`, R`\bneuvěříte\b`, R`\bco se stalo potom\b`, R`\bco se stalo dál\b`, R`\btohle vás (šokuje|překvapí|ohromí)\b`,
    R`\blékaři nenávidí\b`, R`\bnikdy (neuhodnete|neuhodneš)\b`, R`\bdoslova šokující\b`,
  ],
  da: [
    R`\bdu vil ikke tro\b`, R`\bdu kommer ikke til at tro\b`, R`\bhvad der skete bagefter\b`, R`\bhvad der skete derefter\b`, R`\bdet vil chokere dig\b`,
    R`\blæger hader\b`, R`\bdu gætter aldrig\b`, R`\bdu bliver målløs\b`,
  ],
  de: [
    R`\bsie werden (es )?nicht glauben\b`, R`\bdu wirst (es )?nicht glauben\b`, R`\bdas (hätten|hättest) (sie|du) nicht gedacht\b`, R`\bwas (dann|danach) passiert(e)?\b`,
    R`\bdas wird (sie|dich) (schockieren|umhauen|sprachlos machen)\b`, R`\bärzte hassen\b`, R`\bdiese(r)? (einfache(r)? )?trick\b`, R`\bsie werden nie (erraten|raten)\b`,
    R`\bdu wirst nie (erraten|raten)\b`, R`\bwas (er|sie) dann tat\b`, R`\bschockierende wahrheit\b`,
  ],
  en: [
    R`\byou (won['’]?t|will not|wouldn['’]?t|would never|never) believe\b`, R`\bwhat happen(s|ed) next\b`, R`\b(will|won['’]?t) (blow your mind|shock you|amaze you|make you (cry|laugh|gasp))\b`,
    R`\bdoctors (hate|don['’]?t want you to know)\b`, R`\b(one|1) (weird|simple|crazy|secret|little) trick\b`, R`\b(you['’]?ll|you will) (never|not) guess\b`,
    R`\b(jaw[- ]dropping|mind[- ]blowing|heart[- ]stopping)\b`, R`\bwait (until|till) you see\b`, R`\bcan['’]?t stop (watching|laughing|crying)\b`, R`\bthe shocking truth\b`,
    R`\bnumber \d+ will (shock|surprise|blow)\b`,
  ],
  es: [
    R`\bno (te )?lo vas a creer\b`, R`\bno vas a creer\b`, R`\blo que (pasó|ocurrió|sucedió) (después|luego|a continuación)\b`, R`\bte (va a|vas a) (sorprender|impactar|dejar sin palabras)\b`,
    R`\blos médicos odian\b`, R`\bnunca (vas a )?adivinar(ás|as)\b`, R`\bmira lo que (pasó|hizo)\b`, R`\bte dejará sin palabras\b`,
  ],
  fi: [
    R`\bet (tule )?(usko|uskomaan)\b`, R`\bet voi uskoa\b`, R`\bmitä tapahtui sitten\b`, R`\bmitä tapahtui seuraavaksi\b`, R`\bsaa sinut (ällistymään|järkyttymään|sanattomaksi)\b`,
    R`\blääkärit vihaavat\b`, R`\bet arvaa koskaan\b`,
  ],
  fr: [
    R`\bvous n['’]en croirez pas vos yeux\b`, R`\bvous ne (le )?croirez pas\b`, R`\bce qui (s['’]est passé|se passe|arrive|est arrivé) ensuite\b`, R`\bla suite (va|vous va) (vous )?(choquer|surprendre|étonner)\b`,
    R`\bles médecins détestent\b`, R`\bvous ne devinerez jamais\b`, R`\bça va vous (choquer|bluffer|étonner|surprendre)\b`, R`\bla vérité choquante\b`, R`\bcette astuce (simple )?que\b`,
  ],
  it: [
    R`\bnon (ci )?crederai\b`, R`\bnon crederete\b`, R`\bquello che (è )?(successo|accaduto) (dopo|poi)\b`, R`\bti (sconvolgerà|lascerà senza parole|stupirà)\b`, R`\bi medici (la )?odiano\b`,
    R`\bnon indovinerai mai\b`, R`\bla verità shock\b`,
  ],
  ja: [
    R`信じられない`, R`衝撃の(結末|事実|真実|光景)`, R`驚愕の`, R`その後(どうなった|まさかの)`, R`医者(が|も)(教えない|嫌がる|隠す)`, R`知らないと損`,
    R`絶対に(見ないで|やってはいけない|知らないと)`, R`涙が止まらない`, R`まさかの結末`, R`たった(1|１|一)つの(方法|コツ|習慣)で`,
  ],
  ko: [
    R`믿을 수 없`, R`충격적인 (결말|사실|진실|반전)`, R`그 후 (벌어진|일어난) 일`, R`의사(들)?(이|가) (싫어|숨기|말하지)`, R`절대 (모를|알 수 없|상상)`, R`소름 ?돋`, R`경악`,
    R`이것만 알면`,
  ],
  nb: [
    R`\bdu kommer ikke til å tro\b`, R`\bdu vil ikke tro\b`, R`\bhva som skjedde (videre|deretter|etterpå)\b`, R`\bdette vil sjokkere deg\b`, R`\blegene hater\b`,
    R`\bdu vil aldri gjette\b`, R`\bdu blir målløs\b`,
  ],
  nl: [
    R`\bje gelooft je ogen niet\b`, R`\bu gelooft uw ogen niet\b`, R`\bje gaat (het )?niet geloven\b`, R`\bwat er daarna gebeurde\b`, R`\bdit gaat je (verbazen|schokken|versteld doen staan)\b`,
    R`\bartsen haten\b`, R`\bje raadt nooit\b`, R`\bdeze (ene )?(simpele )?truc\b`,
  ],
  pl: [
    R`\bnie uwierzysz\b`, R`\bnie uwierzycie\b`, R`\bco (się )?stało (się )?potem\b`, R`\bto cię (zszokuje|zaskoczy|zadziwi)\b`, R`\blekarze nienawidzą\b`, R`\bnigdy nie zgadniesz\b`,
    R`\bten (prosty )?trik\b`, R`\bzobacz,? co się stało\b`, R`\bzostaniesz bez słów\b`,
  ],
  pt: [
    R`\bvocê não vai acreditar\b`, R`\bvoce nao vai acreditar\b`, R`\bnão vai acreditar\b`, R`\bo que aconteceu (depois|em seguida|a seguir)\b`, R`\bvai (te )?(chocar|surpreender|deixar sem palavras)\b`,
    R`\bmédicos odeiam\b`, R`\bnunca vai adivinhar\b`, R`\bvocê nunca vai (imaginar|adivinhar)\b`,
  ],
  ro: [
    R`\bnu (o să|vei) crede\b`, R`\bnu o să crezi\b`, R`\bce s-a întâmplat (apoi|după aceea)\b`, R`\bte va ([șş]oca|uimi|lăsa fără cuvinte)\b`, R`\bmedicii urăsc\b`,
    R`\bnu vei ghici niciodată\b`,
  ],
  ru: [
    R`\bвы не поверите\b`, R`\bты не поверишь\b`, R`\bчто (случилось|произошло) дальше\b`, R`\bэто (вас|тебя) (шокирует|удивит|потрясёт|потрясет)\b`, R`\bврачи (в шоке|ненавидят)\b`,
    R`\bникогда не (угадаете|угадаешь)\b`, R`\bне могли поверить\b`, R`\bшокирующая правда\b`,
  ],
  sv: [
    R`\bdu kommer inte (att )?tro\b`, R`\bvad som hände sedan\b`, R`\bdet här kommer (att )?chocka dig\b`, R`\bläkare hatar\b`, R`\bdu kommer aldrig (att )?gissa\b`,
    R`\bdu blir mållös\b`,
  ],
  tr: [
    R`\binanamayacaksınız\b`, R`\binanamayacaksın\b`, R`\bgözlerinize inanamayacaksınız\b`, R`\bsonrasında ne oldu\b`, R`\bşok olacaksınız\b`, R`\bdoktorlar nefret ediyor\b`,
    R`\basla tahmin edemezsiniz\b`, R`\bne olduğuna inanamayacaksınız\b`,
  ],
  zh: [
    R`你绝对(想不到|猜不到|不会相信)`, R`你絕對(想不到|猜不到|不會相信)`, R`不看(会|會)?后悔`, R`不看(會)?後悔`, R`看完.{0,6}(震惊|惊呆)`, R`看完.{0,6}(震驚|驚呆)`, R`医生(不会告诉你|都不想让你知道)`,
    R`醫生(不會告訴你|都不想讓你知道)`, R`结果让人(大吃一惊|意想不到|惊呆)`, R`結果讓人(大吃一驚|意想不到|驚呆)`, R`震惊[！!]`, R`震驚[！!]`,
  ],
};

// DAT-012 `advice`: sentence-level imperative / modal recommendation patterns. Each pattern is tested
// against one UAX #29 sentence at a time, so `^` anchors the sentence start.
const advice = {
  ar: [
    R`يجب عليك`, R`يجب أن`, R`ينبغي (عليك|أن)`, R`نوصي(ك)? (ب|أن)`, R`ننصح(ك)? (ب|أن)`, R`يُنصح`, R`ينصح ب`, R`استشر (طبيبك|الطبيب|محاميك|المحامي|مستشارك)`,
    R`تحدث (إلى|مع) (طبيبك|الطبيب|محاميك|المحامي)`, R`اطلب (المشورة|الاستشارة) (الطبية|القانونية|المالية)`,
  ],
  cs: [
    R`\bměli byste\b`, R`\bměl bys\b`, R`\bdoporučujeme\b`, R`\bje (doporučeno|vhodné|třeba)\b`, R`\bmusíte\b`, R`\bporadte se\b.{0,40}\b(lékařem|lékárníkem|právníkem|poradcem)\b`,
    R`\bkonzultujte\b`, R`\bnezapomeňte\b`, R`^\s*(vždy|nikdy|vyhněte se|dbejte na)\b`, R`\bvyhledejte (lékařskou|odbornou|právní) (pomoc|radu)\b`,
  ],
  da: [
    R`\bdu bør\b`, R`\bman bør\b`, R`\bvi anbefaler\b`, R`\bdet anbefales\b`, R`\bdu skal\b`, R`\bkontakt din (læge|apoteker|advokat|rådgiver)\b`, R`\bkonsulter\b.{0,40}\b(før|inden)\b`,
    R`\btal med din (læge|apoteker|advokat|rådgiver)\b`, R`\bsøg (læge|professionel|juridisk) (hjælp|rådgivning)\b`, R`\bhusk at\b`, R`^\s*(undgå|husk|sørg for)\b`,
  ],
  de: [
    R`\bsie sollten\b`, R`\bdu solltest\b`, R`\bman sollte\b`, R`\bwir empfehlen\b`, R`\bes (wird|ist) (dringend )?empfohlen\b`, R`\bsie müssen\b`, R`\bdu musst\b`,
    R`\bkonsultieren sie\b.{0,60}\bbevor\b`, R`\bfragen sie (ihren|ihre|ihrem)\b.{0,20}\b(arzt|ärztin|apotheker|apothekerin|anwalt|anwältin|berater|beraterin|steuerberater)\b`,
    R`\bsprechen sie mit (ihrem|ihrer)\b`, R`\bholen sie (sich )?(ärztlichen|rechtlichen|professionellen|fachlichen|anwaltlichen) (rat|hilfe)\b`, R`\bvergessen sie nicht\b`,
    R`^\s*(nehmen|verwenden|vermeiden|beachten|achten) sie\b`,
  ],
  en: [
    R`\byou should\b`, R`\byou (must|need to|have to|ought to)\b`, R`\bwe (strongly )?(recommend|advise|suggest)\b`, R`\bit(?: is|['’]s) (strongly )?(recommended|advisable|advised)\b`,
    R`\bconsult\b.{0,60}\bbefore\b`, R`\b(speak|talk) (to|with) (your|a) (doctor|gp|physician|pharmacist|lawyer|solicitor|attorney|accountant|adviser|advisor)\b`,
    R`\bseek (medical|legal|professional|financial) (advice|help|attention)\b`, R`\bmake sure (that )?you\b`, R`\bdon['’]?t forget to\b`, R`\byou['’]?d (be )?(better|best)\b`,
    R`^\s*(always|never|avoid|remember to|be sure to|make sure to|try to) \w+`,
  ],
  es: [
    R`\bdebes\b`, R`\bdebería(s|n)?\b`, R`\bdebe (usted )?(consultar|acudir|evitar)\b`, R`\brecomendamos\b`, R`\bse recomienda\b`, R`\bte aconsejamos\b`, R`\bse aconseja\b`, R`\bnecesitas\b`,
    R`\bconsulta(r)? (con )?(a )?(tu|su) (médico|farmacéutico|abogado|asesor)\b`, R`\bconsulte\b.{0,60}\bantes\b`, R`\bhabla(r)? con (tu|su) (médico|abogado|asesor)\b`, R`\bbusca (ayuda|asesoramiento) (médic[ao]|legal|profesional)\b`,
    R`^\s*(siempre|nunca|evita|evite|recuerda|recuerde|asegúrate|asegúrese)\b`,
  ],
  fi: [
    R`\bsinun (pitäisi|tulisi|kannattaa)\b`, R`\b(pitäisi|tulisi|kannattaa) (aina|ensin)\b`, R`\bsuosittelemme\b`, R`\bsuositellaan\b`, R`\bneuvomme\b`, R`\bsinun täytyy\b`, R`\bsinun on\b`,
    R`\bkysy (neuvoa )?(lääkäriltä|apteekista|lakimieheltä|asiantuntijalta)\b`, R`\bota yhteyttä (lääkäriin|lakimieheen|asiantuntijaan)\b`, R`\bkonsultoi\b`, R`\bmuista\b`,
    R`^\s*(vältä|älä|varmista)\b`,
  ],
  fr: [
    R`\bvous devriez\b`, R`\btu devrais\b`, R`\bvous devez\b`, R`\bil (faut|convient de|est (recommandé|conseillé|préférable) de)\b`, R`\bnous (vous )?(recommandons|conseillons)\b`, R`\bon (vous )?recommande\b`,
    R`\bconsultez\b.{0,60}\bavant\b`, R`\bdemandez (conseil )?à (votre|un) (médecin|pharmacien|avocat|conseiller|notaire)\b`, R`\bparlez-en à (votre|un) (médecin|pharmacien|avocat|conseiller)\b`,
    R`\bn['’]oubliez pas de\b`, R`\bassurez-vous (de|que)\b`, R`^\s*(évitez|veillez|prenez|utilisez|n['’]hésitez pas)\b`,
  ],
  it: [
    R`\bdovresti\b`, R`\bdovrebbe\b`, R`\bdevi\b`, R`\bdeve (sempre )?(consultare|rivolgersi|evitare)\b`, R`\bconsigliamo\b`, R`\bsi consiglia\b`, R`\bè (consigliabile|consigliato|raccomandato)\b`, R`\braccomandiamo\b`,
    R`\bconsult(a|i|are)\b.{0,60}\bprima\b`, R`\bchiedi (consiglio )?al tuo (medico|farmacista|avvocato|consulente|commercialista)\b`, R`\brivolgiti (a|al) (tuo )?(medico|farmacista|avvocato|consulente)\b`,
    R`\bnon dimenticare di\b`, R`\bassicurati di\b`, R`^\s*(evita|evitare|ricorda|ricordati|usa)\b`,
  ],
  ja: [
    R`すべきです`, R`べきです`, R`してください`, R`(することを|を)お(すすめ|勧め|薦め)(します|いたします)`, R`推奨(します|いたします|されます)`, R`必ず.{0,20}(してください|ください|しましょう)`,
    R`(医師|薬剤師|弁護士|専門家|税理士)(に|へ)(ご)?(相談|確認)(ください|して|を)`, R`しましょう`, R`(ご|お)(注意|確認)ください`, R`(避け|控え)(て|る)ください`,
  ],
  ko: [
    R`하셔야 합니다`, R`해야 합니다`, R`하는 것이 좋습니다`, R`하시기 바랍니다`, R`권장(합니다|드립니다|됩니다)`, R`추천(합니다|드립니다)`, R`(의사|약사|변호사|전문가)(와|과|에게)(\s*)(상담|문의)`,
    R`반드시.{0,20}(하세요|하십시오|하시기)`, R`(하세요|하십시오)[.!]?$`, R`피(하세요|하십시오|해야)`,
  ],
  nb: [
    R`\bdu bør\b`, R`\bman bør\b`, R`\bvi anbefaler\b`, R`\bdet anbefales\b`, R`\bdu må\b`, R`\bdu skal\b`, R`\bkontakt (din |en )?(lege|fastlege|apoteker|advokat|rådgiver)\b`, R`\bkonsulter\b.{0,40}\b(før|innen)\b`,
    R`\bsnakk med (din |en )?(lege|fastlege|apoteker|advokat|rådgiver)\b`, R`\bsøk (medisinsk|juridisk|profesjonell) (hjelp|råd)\b`, R`\bhusk å\b`, R`^\s*(unngå|husk|sørg for)\b`,
  ],
  nl: [
    R`\bje moet\b`, R`\bu moet\b`, R`\bje zou moeten\b`, R`\bu zou moeten\b`, R`\bje dient\b`, R`\bu dient\b`, R`\bwij raden (u |je )?aan\b`, R`\bwe raden (u |je )?aan\b`, R`\bhet is (aan te raden|raadzaam|verstandig)\b`,
    R`\braadpleeg\b.{0,60}\b(voordat|alvorens|eerst)\b`, R`\bvraag (advies )?(aan )?(uw|je) (arts|huisarts|apotheker|advocaat|adviseur)\b`, R`\bpraat met (uw|je) (arts|huisarts|apotheker|advocaat)\b`, R`\bvergeet niet\b`,
    R`^\s*(vermijd|zorg ervoor|let op)\b`,
  ],
  pl: [
    R`\bpowinieneś\b`, R`\bpowinnaś\b`, R`\bpowinni(ście|śmy)?\b`, R`\bpowinien\b`, R`\bpowinna\b`, R`\bmusisz\b`, R`\bzalecamy\b`, R`\bzaleca się\b`, R`\bradzimy\b`, R`\bwarto\b`,
    R`\bskonsultuj\b`, R`\bzapytaj (swojego )?(lekarza|farmaceutę|prawnika|doradcę)\b`, R`\bskontaktuj się z (lekarzem|farmaceutą|prawnikiem|doradcą)\b`, R`\bnie zapomnij\b`, R`^\s*(unikaj|pamiętaj|upewnij się|zawsze|nigdy)\b`,
  ],
  pt: [
    R`\bvocê deve(ria)?\b`, R`\bdeves\b`, R`\bdeve(ria)? (sempre )?(consultar|procurar|evitar)\b`, R`\brecomendamos\b`, R`\baconselhamos\b`, R`\bé (recomendável|aconselhável|recomendado)\b`, R`\bprecisa(s)? de\b.{0,30}\b(consultar|procurar)\b`,
    R`\bconsulte\b.{0,60}\bantes\b`, R`\bfale com (o seu|seu|a sua|sua) (médico|farmacêutico|advogado|consultor)\b`, R`\bpergunte ao (seu|teu) (médico|farmacêutico|advogado)\b`, R`\bprocure (ajuda|aconselhamento|orientação) (médic[ao]|jurídic[ao]|profissional)\b`,
    R`\bnão se esqueça de\b`, R`^\s*(evite|lembre-se|certifique-se|sempre|nunca)\b`,
  ],
  ro: [
    R`\btrebuie să\b`, R`\bar trebui să\b`, R`\bvă recomandăm\b`, R`\bîți recomandăm\b`, R`\beste recomandat\b`, R`\bse recomandă\b`, R`\bvă sfătuim\b`, R`\bconsultați\b.{0,60}\b(înainte|inainte)\b`, R`\bconsultă\b.{0,60}\b(înainte|inainte)\b`,
    R`\bîntrebați (medicul|farmacistul|avocatul|consultantul)\b`, R`\bvorbiți cu (medicul|farmacistul|avocatul|consultantul)\b`, R`\bsolicitați (sfatul|consultul) (medicului|avocatului|unui specialist)\b`, R`\bnu uitați să\b`, R`^\s*(evitați|evită|asigurați-vă|asigură-te)\b`,
  ],
  ru: [
    R`\bвам следует\b`, R`\bвы должны\b`, R`\bтебе следует\b`, R`\bследует\b`, R`\bрекомендуем\b`, R`\bрекомендуется\b`, R`\bсоветуем\b`, R`\bнеобходимо\b`, R`\bконсультируйтесь\b`, R`\bпроконсультируйтесь\b`,
    R`\bобратитесь к (врачу|фармацевту|юристу|специалисту|консультанту)\b`, R`\bпосоветуйтесь с (врачом|юристом|специалистом)\b`, R`\bне забудьте\b`, R`^\s*(избегайте|убедитесь|всегда|никогда)\b`,
  ],
  sv: [
    R`\bdu bör\b`, R`\bdu ska\b`, R`\bdu måste\b`, R`\bman bör\b`, R`\bvi rekommenderar\b`, R`\brekommenderas\b`, R`\bvi råder dig\b`, R`\bkontakta (din |en )?(läkare|apotekare|advokat|jurist|rådgivare)\b`, R`\bkonsultera\b.{0,60}\binnan\b`,
    R`\bprata med (din |en )?(läkare|apotekare|advokat|jurist)\b`, R`\bsök (medicinsk|juridisk|professionell) (hjälp|rådgivning)\b`, R`\bglöm inte att\b`, R`^\s*(undvik|kom ihåg|se till att)\b`,
  ],
  tr: [
    R`\bmelisiniz\b`, R`\bmalısınız\b`, R`\bmelisin\b`, R`\bmalısın\b`, R`\btavsiye ederiz\b`, R`\bönerilir\b`, R`\btavsiye edilir\b`, R`\bönermekteyiz\b`, R`\bdanışın\b`, R`\bdanışınız\b`,
    R`\b(doktorunuza|eczacınıza|avukatınıza|uzmanınıza) (danışın|danışınız|başvurun|başvurunuz)\b`, R`\bunutmayın\b`, R`\bmutlaka\b`, R`^\s*(kaçının|emin olun|asla|her zaman)\b`,
  ],
  zh: [
    R`您应该`, R`你应该`, R`您應該`, R`你應該`, R`您(必须|需要)`, R`你(必须|需要)`, R`您(必須|需要)`, R`你(必須|需要)`, R`建议您`, R`建議您`, R`建议你`, R`建議你`, R`我们建议`, R`我們建議`, R`请(务必)?(咨询|遵医嘱)`, R`請(務必)?(諮詢|遵醫囑)`,
    R`(咨询|諮詢|询问|詢問)(您的|你的)?(医生|醫生|律师|律師|药剂师|藥劑師|专业人士|專業人士)`, R`(务必|務必|切勿)`,
  ],
};

// Turkish: text typed in capitals uses plain "I" for the dotless letter, and simple case folding does not relate it to "i".
for (const set of [clickbait, advice]) set.tr = set.tr.map((p) => p.replaceAll("ı", "[ıiIİ]"));

const dir = process.argv[2];
if (!dir) throw new Error("usage: regex-lists.mjs <rulesDir>");
for (const [name, data] of [["clickbait-patterns", clickbait], ["advice-patterns", advice]]) {
  fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2) + "\n");
}
console.log("wrote clickbait-patterns.json and advice-patterns.json");

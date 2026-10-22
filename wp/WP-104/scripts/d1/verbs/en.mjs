// WP-104 d1 - English verb forms (SE-121). Hand-authored from linguistic knowledge; no third-party morphology data.
// Paradigm generators for regular verbs + an explicit table for irregular verbs.

const VOWELS = "aeiou";
const isV = (c) => VOWELS.includes(c);

// third-person singular present
function third(b) {
  if (/(s|x|z|ch|sh|o)$/.test(b)) return b + "es";
  if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ies";
  return b + "s";
}
// -ing form; dbl = double the final consonant
function ing(b, dbl) {
  if (b.endsWith("ie")) return b.slice(0, -2) + "ying";
  if (/(ee|ye|oe)$/.test(b)) return b + "ing";
  if (b.endsWith("e")) return b.slice(0, -1) + "ing";
  if (dbl) return b + b.at(-1) + "ing";
  return b + "ing";
}
// regular -ed
function ed(b, dbl) {
  if (b.endsWith("e")) return b + "d";
  if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ied";
  if (dbl) return b + b.at(-1) + "ed";
  return b + "ed";
}

// regular verbs. "*" = double final consonant, "~" = British doubled and American single (both emitted)
const REGULAR = `
accept access achieve act add adapt adopt advise afford agree aim allow announce answer apply appreciate arrange arrive ask
assist assure attend attract avoid award bake bathe believe belong benefit~ blend book boost borrow brand brew browse brush
bundle call care carry celebrate challenge change charge chat* check clean clear click climb close coach collect combine
comfort comment commit* communicate compare compete complete concentrate confirm connect consider consist construct consult
contact contain continue contribute control* convert cook cool copy count cover craft create cross cure customize cycle
dance decide decorate dedicate define deliver demand depend describe deserve design destroy detect determine develop differ
direct discover discuss display distribute divide donate double download drag* dress drop* earn ease edit educate email employ
enable encourage end energize engage engineer enhance enjoy ensure enter equip* escape establish estimate evaluate exceed
exchange excite exercise exist expand expect experience explain explore export express extend face fail fancy fear feature
fill film finish fit* fix flip* float focus follow force form format* frame fund gain gather generate gift grab* grant greet
grill guarantee guard guide handle happen hate head heal heat help highlight hire host hope hunt identify ignore illustrate
imagine impact implement import impress improve include increase indicate influence inform inherit inquire insert inspect
inspire install instruct insure integrate intend interest introduce invest investigate invite involve join judge jump kick
kiss label~ land last laugh launch lease level~ license lift like limit link list listen live load lock log* look love
maintain manage map* mark market match matter measure mention merge mind miss mix model~ modify monitor move name navigate
need negotiate note notice notify obtain occur* offer open operate optimize order organize own pack paint park partner pass
pause perform permit* personalize pick place plan* plant play plug* point polish post pour practice praise predict prefer*
prepare present preserve press pretend prevent price print process produce program* progress promise promote protect provide
publish pull purchase push qualify question quote race raise rank rate reach realize reboot receive recognize recommend
record recover recycle reduce refer* reflect refresh refund refuse register regret* relate relax release rely remain
remember remind remove renew rent repair repeat replace reply report represent request require rescue research reserve
resolve respect respond rest restore result retire return reveal review reward rock roll rush sail sample save scan*
schedule score scratch screen search secure select serve settle shape share shift ship* shop* sign signal~ simplify skip*
slice smile solve sort sound source specialize stage start state stay step* stop* store stream stress stretch study
subscribe succeed suffer suggest suit supply support surprise survive switch tackle tag* talk target taste team tend test
text thank tip* total touch tour track trade train transfer* transform translate transport travel~ treat trim* trust try
turn type unlock update upgrade upload urge use utilize validate value vary verify view visit volunteer vote wait walk want
warm warn wash waste watch wave welcome whisper wish wonder work worry wrap* yield zoom
ban* pin* pop* rob* die tie dye deny hop* address guess apply cancel~ refine renovate redesign revamp relocate sanitize sharpen shorten soften straighten tighten widen brighten lighten
deepen nourish hydrate soothe relieve sculpt whiten tone tailor tune surf sustain sponsor spotlight stabilize strengthen
style submit* supervise swap* tap* sustain unveil uncover unwind weigh wire cater dine cherish hug* rebrand recharge reuse
reorder repurpose restyle revitalize reinvent reform preview pledge pose please spark spice stock spoil~x
accelerate adjust administer advertise advocate analyze appear approach approve assemble assess associate attach attempt
audit authorize automate bring~x broadcast~x budget capture catalog certify claim classify collaborate commission compile
compose conduct configure conserve contract convince coordinate correct create crop* deploy deposit derive detail diagnose
discount distinguish document download drain drill dry duplicate eliminate embed* embrace emphasize empower engage enroll
entertain entitle examine execute expire extract fashion finance flag* flow fold frame fulfill gift gauge graduate grill
hang~x highlight imitate impose incorporate indulge inspect interact interview issue iterate jog* join knock lead~x lend~x
lunch manufacture mention migrate moderate mount nominate observe occupy organise overlook oversee participate pitch
pioneer pledge pray precede prioritize pursue qualify quit~x rebuild~x recall receive reckon recruit reflect register
rehearse reimburse reinforce reject remodel~ render renew repair replicate resemble reside resist resolve resume retain
retrieve reuse revise revolve ring~x rotate route sanction satisfy scale search seal sense separate shadow shuttle simulate
sketch slide~x snap* snack soar solve span* spare speak~x specify spend~x sponsor spread~x sprinkle stamp standardize
stir* stitch store stuff subscribe substitute summarize supplement surround survey sweeten swim~x tackle tame tap*
terminate thrive tick ticket tolerate topple transition transmit* trap* travel trigger tweet undergo~x unify unite
upholster uphold~x utilize vacation venture visualize wander warrant weave~x wed* wonder worship wow yield
`;

// irregular verbs: "base:past[/past2]:participle[/participle2]"; "*" after base = double final consonant in -ing
const IRREGULAR = `
arise:arose:arisen awake:awoke:awoken bear:bore:borne/born beat:beat:beaten/beat become:became:become begin*:began:begun
bend:bent bet*:bet/betted bid*:bid/bade:bid/bidden bind:bound bite:bit:bitten/bit bleed:bled blow:blew:blown
break:broke:broken breed:bred bring:brought build:built burn:burned/burnt burst:burst buy:bought cast:cast catch:caught
choose:chose:chosen cling:clung come:came:come cost:cost creep:crept cut*:cut deal:dealt dig*:dug dive:dived/dove:dived
do:did:done draw:drew:drawn dream:dreamed/dreamt drink:drank:drunk drive:drove:driven dwell:dwelt/dwelled eat:ate:eaten
fall:fell:fallen feed:fed feel:felt fight:fought find:found flee:fled fling:flung fly:flew:flown
forbid*:forbade/forbad:forbidden forget*:forgot:forgotten/forgot forgive:forgave:forgiven freeze:froze:frozen
get*:got:got/gotten give:gave:given go:went:gone grind:ground grow:grew:grown hang:hung/hanged hear:heard
hide:hid:hidden hit*:hit hold:held hurt:hurt keep:kept kneel:knelt/kneeled know:knew:known lay:laid lead:led
lean:leaned/leant leap:leaped/leapt learn:learned/learnt leave:left lend:lent let*:let lie:lay:lain light:lit/lighted
lose:lost make:made mean:meant meet:met pay:paid put*:put quit*:quit/quitted read:read ride:rode:ridden ring:rang:rung
rise:rose:risen run*:ran:run say:said see:saw:seen seek:sought sell:sold send:sent set*:set sew:sewed:sewn/sewed
shake:shook:shaken shed*:shed shine:shone/shined shoot:shot show:showed:shown/showed shrink:shrank/shrunk:shrunk/shrunken
shut*:shut sing:sang:sung sink:sank/sunk:sunk sit*:sat sleep:slept slide:slid sling:slung slit*:slit
smell:smelled/smelt sow:sowed:sown/sowed speak:spoke:spoken speed:sped/speeded spell:spelled/spelt spend:spent
spill:spilled/spilt spin*:spun spit*:spat/spit split*:split spoil:spoiled/spoilt spread:spread
spring:sprang/sprung:sprung stand:stood steal:stole:stolen stick:stuck sting:stung stink:stank/stunk:stunk
stride:strode:stridden strike:struck:struck/stricken string:strung strive:strove:striven swear:swore:sworn sweep:swept
swell:swelled:swollen/swelled swim*:swam:swum swing:swung take:took:taken teach:taught tear:tore:torn tell:told
think:thought throw:threw:thrown thrust:thrust tread:trod:trodden/trod wake:woke/waked:woken/waked wear:wore:worn
weave:wove:woven weep:wept wet*:wet/wetted win*:won wind:wound withdraw:withdrew:withdrawn wring:wrung write:wrote:written
prove:proved:proven/proved
`;
// prefixed compounds of irregular bases: prefix -> bases
const PREFIXED = {
  under: ["stand", "take", "go", "write", "lie", "cut", "pay"],
  over: ["come", "take", "see", "do", "hear", "throw", "run", "eat", "draw", "hang", "pay", "write", "sleep", "ride"],
  re: ["do", "write", "build", "think", "tell", "make", "set", "hear", "run", "read", "send", "sell", "wind", "take", "draw", "lay", "pay", "bind"],
  mis: ["take", "lead", "understand", "spell", "hear", "read"],
  with: ["hold", "stand"],
  fore: ["see", "tell", "go", "know"],
  out: ["do", "grow", "run", "sell", "bid", "put", "wear"],
  up: ["set", "hold"],
  un: ["do", "bind", "wind"],
  be: ["fall", "set", "hold", "get"],
};

export function build() {
  const forms = new Set();
  let nVerbs = 0;
  const add = (...xs) => xs.forEach((x) => x && forms.add(x));

  // regular
  for (let tok of [...new Set(REGULAR.split(/\s+/).filter(Boolean))]) {
    if (tok.endsWith("~x")) continue; // marker: really an irregular verb, covered by the irregular table
    let dbl = false, both = false;
    if (tok.endsWith("*")) { dbl = true; tok = tok.slice(0, -1); }
    else if (tok.endsWith("~")) { both = true; tok = tok.slice(0, -1); }
    nVerbs++;
    add(tok, third(tok), ed(tok, dbl), ing(tok, dbl));
    if (both) add(tok + tok.at(-1) + "ed", tok + tok.at(-1) + "ing");
    if (tok === "benefit") add("benefited", "benefiting");
    if (tok === "focus") add("focussed", "focussing");
  }
  add("focused", "focusing", "focuses", "focusses", "focussed", "focussing");
  add("age", "ages", "aged", "aging", "ageing");

  // irregular (+ prefixed compounds)
  const table = new Map();
  for (const tok of IRREGULAR.split(/\s+/).filter(Boolean)) {
    const [b0, past, pp] = tok.split(":");
    const dbl = b0.endsWith("*");
    const base = dbl ? b0.slice(0, -1) : b0;
    table.set(base, { dbl, past: past.split("/"), pp: (pp ?? past).split("/") });
  }
  const emit = (prefix, base, e) => {
    const b = prefix + base;
    nVerbs++;
    add(b, third(b), ing(b, e.dbl));
    e.past.forEach((p) => add(prefix + p));
    e.pp.forEach((p) => add(prefix + p));
    if (base === "lie") add(prefix + "lying");
  };
  for (const [base, e] of table) emit("", base, e);
  for (const [prefix, bases] of Object.entries(PREFIXED)) {
    for (const base of bases) {
      const e = table.get(base);
      if (e) emit(prefix, base, e);
    }
  }
  // the regular sense of lie (to tell an untruth) and hang is covered by explicit forms
  add("lied", "lies", "lying");
  add("hanged", "hangs", "hanging");
  add("lays", "laying", "lays");
  // be, have, and auxiliaries / modals
  nVerbs += 2;
  add("be", "am", "is", "are", "was", "were", "been", "being");
  add("have", "has", "had", "having");
  add("do", "does", "did", "done", "doing");
  nVerbs += 9; // can could may might must shall should will would
  add("can", "could", "may", "might", "must", "shall", "should", "will", "would", "ought", "cannot", "dare", "dares", "dared", "daring", "need", "needs", "needed", "needing", "used");
  // contractions (negated auxiliaries and pronoun + auxiliary), apostrophe form
  add(
    "don't", "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't", "won't", "wouldn't",
    "can't", "couldn't", "shouldn't", "mustn't", "mightn't", "needn't", "shan't", "ain't",
    "i'm", "you're", "we're", "they're", "he's", "she's", "it's", "that's", "there's", "here's", "what's", "who's", "let's",
    "i've", "you've", "we've", "they've", "i'd", "you'd", "he'd", "she'd", "we'd", "they'd",
    "i'll", "you'll", "he'll", "she'll", "we'll", "they'll", "it'll", "that'll", "there'll", "gonna", "wanna", "gotta"
  );
  return { forms: [...forms], nVerbs };
}

export default function forms() {
  return build().forms;
}
export function count() {
  return build().nVerbs;
}

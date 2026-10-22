//! The template-language measurements behind `rules/grammar-tiers.json`: every template grammar
//! parses its fixtures without ERROR/MISSING nodes, the ast-grep detectors find exactly the
//! expected raw-HTML sinks, and the recorded `embedding` / `regexSinks` / licence fields agree with
//! what the code measures.

use sg_analysis::{
    Engine, LangId, SinkHints, Tiers, count_error_nodes, find_regex_sinks, find_sinks, parse,
    probe, probe_with,
};
use std::collections::BTreeSet;
use std::path::PathBuf;

fn fixtures() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("tests/fixtures")
}

fn wp_103() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../sg-cli/tests/wp_103")
}

struct Fixture {
    lang: LangId,
    dir: PathBuf,
    file: &'static str,
    /// 1-based lines of the raw-HTML sinks.
    lines: &'static [usize],
}

/// The stress fixtures (ours) and the shared WP-103 samples; sink lines counted by hand.
fn all_fixtures() -> Vec<Fixture> {
    let own = |lang, file, lines| Fixture {
        lang,
        dir: fixtures(),
        file,
        lines,
    };
    let shared = |lang, file, lines| Fixture {
        lang,
        dir: wp_103(),
        file,
        lines,
    };
    vec![
        own(LangId::Vue, "stress.vue", &[8, 9]),
        shared(LangId::Vue, "sample.vue", &[3]),
        own(LangId::Svelte, "stress.svelte", &[20, 21]),
        own(LangId::Svelte, "svelte5.svelte", &[18]),
        shared(LangId::Svelte, "sample.svelte", &[6]),
        own(LangId::Astro, "stress.astro", &[11, 12]),
        shared(LangId::Astro, "sample.astro", &[5]),
        own(LangId::EmbeddedTemplate, "stress.html.erb", &[9, 10, 11]),
        own(LangId::EmbeddedTemplate, "sample.ejs", &[2]),
        shared(LangId::EmbeddedTemplate, "sample.html.erb", &[2, 3]),
        own(LangId::Twig, "stress.html.twig", &[14, 15, 16]),
        shared(LangId::Twig, "sample.html.twig", &[2]),
        own(LangId::Blade, "stress.blade.php", &[15, 20]),
        shared(LangId::Blade, "sample.blade.php", &[2]),
        own(LangId::Jinja2, "stress.html.j2", &[15, 16, 17]),
        shared(LangId::Jinja2, "sample.html.j2", &[2, 3]),
        own(LangId::Tsx, "stress.tsx", &[2, 5]),
        shared(LangId::Tsx, "sample.tsx", &[2]),
    ]
}

fn read(f: &Fixture) -> String {
    let path = f.dir.join(f.file);
    std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("{}: {e}", path.display()))
}

#[test]
fn fixtures_parse_clean_and_sinks_are_exactly_the_expected_lines() {
    let mut problems = Vec::new();
    for f in all_fixtures() {
        let src = read(&f);
        let root = parse(f.lang, &src).expect("a tree");
        let errors = count_error_nodes(&root);
        if errors != 0 {
            problems.push(format!(
                "{} {}: {errors} ERROR/MISSING nodes",
                f.lang, f.file
            ));
        }
        let hints = SinkHints {
            file_name: Some(f.file),
        };
        let sinks = find_sinks(&root, hints).expect("detectors run");
        let lines: Vec<usize> = sinks
            .iter()
            .map(|s| s.line)
            .collect::<BTreeSet<_>>()
            .into_iter()
            .collect();
        if lines != f.lines {
            problems.push(format!(
                "{} {}: sinks on {lines:?}, expected {:?}",
                f.lang, f.file, f.lines
            ));
        }
    }
    assert!(problems.is_empty(), "{}", problems.join("\n"));
}

#[test]
fn the_wp_103_expected_json_is_met_through_the_library() {
    let text = std::fs::read_to_string(wp_103().join("expected.json")).expect("expected.json");
    let expected: serde_json::Value = serde_json::from_str(&text).expect("json");
    let mut checked = 0;
    for (lang, e) in expected.as_object().expect("object") {
        let file = e["file"].as_str().expect("file");
        let src = std::fs::read_to_string(wp_103().join(file)).expect("sample");
        let report = probe(lang, &src, Some(file)).expect("probe runs");
        assert_eq!(report.engine, "tree-sitter", "{lang}");
        assert!(report.parsed, "{lang}");
        assert_eq!(report.error_nodes, 0, "{lang}");
        let mut got: Vec<u64> = report.sinks.iter().map(|s| s.line as u64).collect();
        got.dedup();
        let want: Vec<u64> = e["sinkLines"]
            .as_array()
            .expect("sinkLines")
            .iter()
            .filter_map(serde_json::Value::as_u64)
            .collect();
        assert_eq!(got, want, "{lang} sinks");
        checked += 1;
    }
    assert_eq!(checked, LangId::ALL.len());
}

#[test]
fn the_recorded_embedding_result_is_what_the_code_measures() {
    let tiers = Tiers::embedded();
    for lang in LangId::ALL.into_iter().filter(|l| l.is_template()) {
        let mut pass = true;
        for f in all_fixtures().iter().filter(|f| f.lang == lang) {
            let src = read(f);
            let Ok(root) = parse(lang, &src) else {
                pass = false;
                continue;
            };
            let hints = SinkHints {
                file_name: Some(f.file),
            };
            let lines: BTreeSet<usize> = find_sinks(&root, hints)
                .map(|s| s.iter().map(|x| x.line).collect())
                .unwrap_or_default();
            let want: BTreeSet<usize> = f.lines.iter().copied().collect();
            pass &= count_error_nodes(&root) == 0 && lines == want;
        }
        let entry = tiers.entry(lang).expect("entry");
        let recorded = entry.embedding == "pass";
        assert_eq!(recorded, pass, "{lang}: recorded `{}`", entry.embedding);
        assert_eq!(
            entry.tier_cap == "full",
            entry.maintained && recorded,
            "{lang}: tierCap `{}` must be full exactly when the grammar is maintained and embeds (02 § 4)",
            entry.tier_cap
        );
    }
}

#[test]
fn recorded_licences_are_on_the_allow_list_and_regex_sinks_compile() {
    // deny.toml `[licenses] allow` (spec 05 § 8) minus the exception clause.
    let allowed = [
        "MIT",
        "Apache-2.0",
        "BSD-2-Clause",
        "BSD-3-Clause",
        "ISC",
        "Zlib",
        "Unicode-3.0",
        "PostgreSQL",
    ];
    for (id, entry) in Tiers::embedded().entries() {
        assert!(
            entry
                .licence
                .split(" OR ")
                .any(|l| allowed.contains(&l.trim())),
            "{id}: licence `{}` is not permissive",
            entry.licence
        );
        for sink in &entry.regex_sinks {
            assert!(
                (0.0..=1.0).contains(&sink.precision),
                "{id}: precision {}",
                sink.precision
            );
        }
        if !entry.regex_sinks.is_empty() {
            find_regex_sinks("", &entry.regex_sinks).unwrap_or_else(|e| panic!("{id}: {e}"));
        }
    }
}

#[test]
fn the_declared_regex_sinks_find_the_same_lines_as_the_grammar_on_every_fixture() {
    let tiers = Tiers::embedded();
    let mut problems = Vec::new();
    for f in all_fixtures() {
        if !f.lang.is_template() {
            continue;
        }
        // EJS `<%-` needs the file name; the regex fallback cannot tell it from ERB's trim marker.
        if f.file.ends_with(".ejs") {
            continue;
        }
        let entry = tiers.entry(f.lang).expect("entry");
        let sinks = find_regex_sinks(&read(&f), &entry.regex_sinks).expect("valid regex");
        let lines: Vec<usize> = sinks
            .iter()
            .map(|s| s.line)
            .collect::<BTreeSet<_>>()
            .into_iter()
            .collect();
        if lines != f.lines {
            problems.push(format!(
                "{} {}: regexSinks found {lines:?}, the grammar found {:?}",
                f.lang, f.file, f.lines
            ));
        }
    }
    assert!(problems.is_empty(), "{}", problems.join("\n"));
}

/// Source where a sink token appears but nothing is rendered raw: a comment or prose.
const DECOYS: &[(LangId, &str)] = &[
    (
        LangId::Vue,
        "<template>\n<!-- never use v-html here -->\n<p>v-html is unsafe</p>\n</template>\n",
    ),
    (
        LangId::Svelte,
        "<!-- {@html body} is unsafe -->\n<p>ok</p>\n",
    ),
    (LangId::Astro, "<!-- set:html is unsafe -->\n<p>ok</p>\n"),
    (
        LangId::EmbeddedTemplate,
        "<%# x.html_safe is unsafe %>\n<p>ok</p>\n",
    ),
    (LangId::Twig, "{# {{ a|raw }} is unsafe #}\n<p>ok</p>\n"),
    (LangId::Blade, "{{-- {!! $a !!} is unsafe --}}\n<p>ok</p>\n"),
    (LangId::Jinja2, "{# {{ a|safe }} is unsafe #}\n<p>ok</p>\n"),
];

#[test]
fn the_grammar_ignores_decoys_that_the_regex_fallback_reports() {
    // This is why regexSinks carry a precision below 1 and cap the tier at `structural` (02 § 4).
    let tiers = Tiers::embedded();
    for (lang, src) in DECOYS {
        let root = parse(*lang, src).expect("a tree");
        let grammar = find_sinks(&root, SinkHints::default()).expect("detectors run");
        assert!(grammar.is_empty(), "{lang}: grammar reported {grammar:?}");
        let entry = tiers.entry(*lang).expect("entry");
        let regex = find_regex_sinks(src, &entry.regex_sinks).expect("valid");
        assert!(
            !regex.is_empty(),
            "{lang}: the decoy does not trip the regex, so it proves nothing"
        );
        assert!(
            entry.regex_sinks.iter().all(|s| s.precision < 1.0),
            "{lang}: a pattern that false-positives on prose cannot claim precision 1"
        );
    }
}

#[test]
fn a_template_language_without_a_maintained_grammar_is_analysed_by_regex() {
    // Mark blade as not maintained: the probe must switch engines and still find the sink lines.
    let mut json: serde_json::Value =
        serde_json::from_str(include_str!("../../../rules/grammar-tiers.json")).expect("json");
    json["blade"]["maintained"] = serde_json::Value::Bool(false);
    let tiers = Tiers::from_json(&json.to_string()).expect("tiers");
    assert_eq!(tiers.engine_for(LangId::Blade), Engine::Regex);
    let src = std::fs::read_to_string(wp_103().join("sample.blade.php")).expect("sample");
    let report = probe_with(&tiers, "blade", &src, None).expect("probe runs");
    assert_eq!(report.engine, "regex");
    assert!(!report.parsed);
    assert_eq!(report.error_nodes, 0);
    assert_eq!(report.sinks.iter().map(|s| s.line).collect::<Vec<_>>(), [2]);

    // With the declared regexSinks removed there is nothing to analyse with: an error, not "no sinks".
    json["blade"]["regexSinks"] = serde_json::json!([]);
    let bare = Tiers::from_json(&json.to_string()).expect("tiers");
    assert!(probe_with(&bare, "blade", &src, None).is_err());
}

#[test]
fn probing_is_deterministic_and_unknown_languages_are_refused() {
    let src = std::fs::read_to_string(wp_103().join("sample.vue")).expect("sample");
    let a = serde_json::to_string(&probe("vue", &src, None).expect("probe")).expect("json");
    let b = serde_json::to_string(&probe("vue", &src, None).expect("probe")).expect("json");
    assert_eq!(a, b);
    assert!(a.contains("\"formatVersion\":1") && a.contains("\"errorNodes\":0"));
    assert!(probe("cobol", "x", None).is_err());
}

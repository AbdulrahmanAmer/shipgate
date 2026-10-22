//! WP-103 acceptance tests (owned section 02 § 4; acceptance `wp_103__grammar_tiers_recorded`).
//! Written by the orchestrator before the build. They drive the built `shipgate` binary:
//!
//!   shipgate dev grammar-probe --lang <id> --file <path> --json
//!   → { "lang": "<id>", "engine": "tree-sitter" | "regex", "parsed": bool, "errorNodes": int,
//!       "sinks": [{ "line": int, "text": string }] }
//!
//! (hidden like `dev fixture`, 05 § 1). For template languages the probe reports raw-HTML sinks
//! (02 § 4: SEC-001 raw sinks) with the ast-grep-core engine on the language's tree-sitter grammar,
//! or with the declared `regexSinks` where `rules/grammar-tiers.json` says no maintained grammar
//! exists (coverage at most `structural`).
#![allow(non_snake_case)]

use serde_json::Value;
use std::path::PathBuf;
use std::process::Command;

fn here() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("tests")
        .join("wp_103")
}

fn repo() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("..")
        .join("..")
}

fn load(p: PathBuf) -> Value {
    let t = std::fs::read_to_string(&p).unwrap_or_else(|e| panic!("{}: {e}", p.display()));
    serde_json::from_str(t.trim_start_matches('\u{feff}'))
        .unwrap_or_else(|e| panic!("{}: {e}", p.display()))
}

const TEMPLATES: &[&str] = &[
    "vue",
    "svelte",
    "astro",
    "embedded-template",
    "twig",
    "blade",
    "jinja2",
];

#[test]
fn wp_103__grammar_tiers_recorded() {
    let tiers = load(repo().join("rules").join("grammar-tiers.json"));
    let mut problems = Vec::new();
    for lang in TEMPLATES {
        let Some(t) = tiers.get(lang) else {
            problems.push(format!("rules/grammar-tiers.json: no entry for `{lang}`"));
            continue;
        };
        let s = |k: &str| t.get(k).and_then(Value::as_str).unwrap_or("").to_string();
        let maintained = t.get("maintained").and_then(Value::as_bool);
        if maintained.is_none()
            || s("licence").is_empty()
            || s("embedding").is_empty()
            || s("notes").len() < 10
        {
            problems.push(format!(
                "`{lang}`: needs maintained (bool), licence, embedding (pass|fail) and notes"
            ));
        }
        if maintained == Some(true) && (s("grammar").is_empty() || s("version").is_empty()) {
            problems.push(format!("`{lang}`: a maintained grammar names its crate/repo (`grammar`) and pinned `version`"));
        }
        let cap = s("tierCap");
        if !["full", "structural"].contains(&cap.as_str()) {
            problems.push(format!(
                "`{lang}`: tierCap must be full or structural (02 § 2)"
            ));
        }
        if (maintained == Some(false) || s("embedding") != "pass") && cap != "structural" {
            problems.push(format!(
                "`{lang}`: without a maintained, embedding grammar the cap is `structural` (02 § 4)"
            ));
        }
        if maintained == Some(false)
            && t.get("regexSinks")
                .and_then(Value::as_array)
                .is_none_or(|a| a.is_empty())
        {
            problems.push(format!("`{lang}`: the regex fallback needs `regexSinks` [{{ pattern, precision }}] (03 § 6)"));
        }
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

#[test]
fn wp_103__sec_02_4__grammars_embed_in_ast_grep() {
    let expected = load(here().join("expected.json"));
    let tiers = load(repo().join("rules").join("grammar-tiers.json"));
    let mut problems = Vec::new();
    for (lang, e) in expected.as_object().expect("expected.json object") {
        let file = here().join(e["file"].as_str().expect("file"));
        let out = Command::new(env!("CARGO_BIN_EXE_shipgate"))
            .args(["dev", "grammar-probe", "--lang", lang, "--file"])
            .arg(&file)
            .arg("--json")
            .output()
            .expect("run shipgate");
        if !out.status.success() {
            problems.push(format!(
                "`{lang}`: probe exited {} ({})",
                out.status,
                String::from_utf8_lossy(&out.stderr).trim()
            ));
            continue;
        }
        let Ok(r) = serde_json::from_slice::<Value>(&out.stdout) else {
            problems.push(format!("`{lang}`: probe output is not JSON"));
            continue;
        };
        let template = TEMPLATES.contains(&lang.as_str());
        let maintained = !template
            || tiers
                .get(lang)
                .and_then(|t| t.get("maintained"))
                .and_then(Value::as_bool)
                == Some(true);
        let want_engine = if maintained { "tree-sitter" } else { "regex" };
        if r.get("engine").and_then(Value::as_str) != Some(want_engine) {
            problems.push(format!(
                "`{lang}`: engine must be `{want_engine}` (per rules/grammar-tiers.json), is {:?}",
                r.get("engine")
            ));
        }
        if maintained
            && (r.get("parsed").and_then(Value::as_bool) != Some(true)
                || r.get("errorNodes").and_then(Value::as_u64) != Some(0))
        {
            problems.push(format!("`{lang}`: the sample must parse with 0 ERROR nodes, got parsed={:?} errorNodes={:?}", r.get("parsed"), r.get("errorNodes")));
        }
        let mut got: Vec<u64> = r
            .get("sinks")
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|s| s.get("line").and_then(Value::as_u64))
                    .collect()
            })
            .unwrap_or_default();
        got.sort_unstable();
        got.dedup();
        let want: Vec<u64> = e["sinkLines"]
            .as_array()
            .expect("sinkLines")
            .iter()
            .filter_map(Value::as_u64)
            .collect();
        if got != want {
            problems.push(format!(
                "`{lang}`: raw-HTML sinks on lines {got:?}, expected {want:?}"
            ));
        }
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

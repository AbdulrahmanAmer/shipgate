//! WP-101 acceptance tests (owned sections 05 § 3.3 and 03 § 16). Written by the orchestrator
//! before the build. WP-101 observes each agent host's hooks live and records what it saw under
//! `crates/sg-hooks/tests/host-payloads/<host>/`; these tests tie the recordings to the spec text,
//! so the spec says exactly what was observed, and a host that couldn't be observed is reported as
//! reduced enforcement, never as verified.
#![allow(non_snake_case)]

use serde_json::Value;
use std::fs;
use std::path::PathBuf;

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root")
        .to_path_buf()
}

fn read(rel: &str) -> Option<String> {
    fs::read_to_string(root().join(rel))
        .ok()
        .map(|t| t.replace("\r\n", "\n"))
}

fn json(rel: &str) -> Option<Value> {
    read(rel).and_then(|t| serde_json::from_str(t.trim_start_matches('\u{feff}')).ok())
}

const PAYLOADS: &str = "crates/sg-hooks/tests/host-payloads";

/// (03 § 16 host id, 05 § 3.3 row label, native events the 03 § 16 Events column maps).
const HOSTS: &[(&str, &str, &[&str])] = &[
    (
        "claude-code",
        "Claude Code",
        &[
            "SessionStart",
            "UserPromptSubmit",
            "PreToolUse",
            "PostToolUse",
            "Stop",
        ],
    ),
    (
        "codex",
        "Codex",
        &[
            "SessionStart",
            "UserPromptSubmit",
            "PreToolUse",
            "PostToolUse",
            "Stop",
        ],
    ),
    (
        "cursor",
        "Cursor",
        &[
            "sessionStart",
            "beforeSubmitPrompt",
            "preToolUse",
            "beforeShellExecution",
            "afterFileEdit",
            "stop",
        ],
    ),
    (
        "opencode",
        "OpenCode",
        &["tool.execute.before", "tool.execute.after", "session.idle"],
    ),
    (
        "antigravity",
        "Antigravity",
        &["PreInvocation", "PreToolUse", "PostToolUse", "Stop"],
    ),
];

/// The markdown row of `table_start`'s table whose first cell is `label` (or `` `label` ``).
fn row<'a>(doc: &'a str, table_start: &str, label: &str) -> Option<&'a str> {
    let at = doc.find(table_start)?;
    doc[at..]
        .lines()
        .skip(1)
        .take_while(|l| l.starts_with('|') || l.trim().is_empty())
        .find(|l| {
            let first = l
                .trim_start_matches('|')
                .split('|')
                .next()
                .unwrap_or("")
                .trim();
            first == label
                || first == format!("`{label}`")
                || first.starts_with(&format!("{label} "))
        })
}

fn get_path<'a>(v: &'a Value, path: &str) -> Option<&'a Value> {
    path.split('.').try_fold(v, |cur, k| cur.get(k))
}

/// For every observed host: a payload file for each mapped native event; each field path the
/// recording says the mapping reads exists in the payload and is named in the host's 03 § 16 row;
/// the deny (pre-tool) and block (stop) outputs were observed to take effect and are the bytes the
/// 03 § 16 *Hook output* row gives. Unobserved hosts carry `unverified.json` with a reason.
#[test]
fn wp_101__sec_03_16__payloads_recorded_for_mapped_events() {
    let spec = read("spec/03-formats.md").expect("spec/03-formats.md");
    let mut problems = Vec::new();
    let mut observed = 0;
    for (host, _, events) in HOSTS {
        let dir = format!("{PAYLOADS}/{host}");
        let Some(m) = json(&format!("{dir}/manifest.json")) else {
            match json(&format!("{dir}/unverified.json")) {
                Some(u)
                    if u.get("reason")
                        .and_then(Value::as_str)
                        .is_some_and(|r| r.len() >= 10) => {}
                _ => problems.push(format!(
                    "{dir}: neither manifest.json (observed) nor unverified.json with a reason"
                )),
            }
            continue;
        };
        observed += 1;
        for k in ["host", "hostVersion", "observedOn", "os"] {
            if m.get(k).and_then(Value::as_str).is_none_or(str::is_empty) {
                problems.push(format!("{dir}/manifest.json: `{k}` missing"));
            }
        }
        let map_row = row(&spec, "**Host mappings**", host).unwrap_or("");
        let out_row = row(&spec, "**Hook output**", host).unwrap_or("");
        if map_row.is_empty() || out_row.is_empty() {
            problems.push(format!(
                "03 § 16: no mapping or hook-output row for `{host}`"
            ));
        }
        let recs = m
            .get("events")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();
        for ev in *events {
            if !recs
                .iter()
                .any(|r| r.get("event").and_then(Value::as_str) == Some(ev))
            {
                problems.push(format!("{dir}: no recorded payload for event `{ev}`"));
            }
            if !map_row.contains(ev) {
                problems.push(format!("03 § 16 `{host}` row doesn't name event `{ev}`"));
            }
        }
        for r in &recs {
            let file = r.get("file").and_then(Value::as_str).unwrap_or("");
            let Some(payload) = json(&format!("{dir}/{file}")) else {
                problems.push(format!("{dir}/{file}: missing or not JSON"));
                continue;
            };
            for f in r
                .get("fields")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default()
            {
                let f = f.as_str().unwrap_or("");
                if get_path(&payload, f).is_none() {
                    problems.push(format!(
                        "{dir}/{file}: field `{f}` the mapping reads is absent"
                    ));
                }
                let leaf = f.rsplit('.').next().unwrap_or(f);
                if !map_row.contains(leaf) {
                    problems.push(format!(
                        "03 § 16 `{host}` row doesn't name field `{f}` observed in {file}"
                    ));
                }
            }
        }
        let blocks = m
            .get("blockChecks")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();
        for kind in ["deny", "block"] {
            let Some(b) = blocks
                .iter()
                .find(|b| b.get("kind").and_then(Value::as_str) == Some(kind))
            else {
                problems.push(format!("{dir}: no `{kind}` block check recorded"));
                continue;
            };
            if b.get("effect").and_then(Value::as_str) != Some("took-effect") {
                problems.push(format!(
                    "{dir}: `{kind}` output was not observed to take effect"
                ));
            }
            for key in b
                .get("outputKeys")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default()
            {
                let key = key.as_str().unwrap_or("");
                if !out_row.contains(key) {
                    problems.push(format!("03 § 16 hook-output row `{host}` doesn't contain `{key}` from the observed `{kind}` output"));
                }
            }
        }
    }
    if observed == 0 {
        problems.push(
            "no host was observed live (claude-code at least is installed on the build machine)"
                .into(),
        );
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

/// 05 § 3.3: a host row says `verified <observedOn> (<hostVersion>)` exactly when a recording
/// exists; otherwise it says `reduced enforcement` and why. The git row stays reduced enforcement.
#[test]
fn wp_101__sec_05_3_3__statuses_match_evidence() {
    let spec = read("spec/05-integrations.md").expect("spec/05-integrations.md");
    let mut problems = Vec::new();
    for (host, label, _) in HOSTS {
        let Some(r) = row(&spec, "| Host | Config | Events used |", label) else {
            problems.push(format!("05 § 3.3: no row for {label}"));
            continue;
        };
        let status = r
            .trim_end_matches('|')
            .rsplit('|')
            .next()
            .unwrap_or("")
            .trim()
            .to_string();
        match json(&format!("{PAYLOADS}/{host}/manifest.json")) {
            Some(m) => {
                let want = format!(
                    "verified {} ({})",
                    m.get("observedOn").and_then(Value::as_str).unwrap_or("?"),
                    m.get("hostVersion").and_then(Value::as_str).unwrap_or("?")
                );
                if !status.starts_with(&want) {
                    problems.push(format!(
                        "05 § 3.3 {label}: status must start `{want}`, is `{status}`"
                    ));
                }
            }
            None => {
                if !status.contains("reduced enforcement") {
                    problems.push(format!("05 § 3.3 {label}: not observed, so the status must say `reduced enforcement` and why, is `{status}`"));
                }
            }
        }
    }
    match row(
        &spec,
        "| Host | Config | Events used |",
        "Other / none (`git`)",
    ) {
        Some(r) if r.contains("reduced enforcement") => {}
        _ => problems.push("05 § 3.3: the git row must stay `reduced enforcement`".into()),
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

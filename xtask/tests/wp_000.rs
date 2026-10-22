//! WP-000 acceptance tests (BUILD_MAP § 5 *Acceptance tests for work packages without ledger
//! slices*). trace-check finds them by name in the nextest JUnit file, so the names must stay
//! exactly `wp_000__<name>`; the double underscore is the separator trace-check matches.
#![allow(non_snake_case)]

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root")
        .to_path_buf()
}

/// Reads a repo file with `\r\n` normalised, so a CRLF checkout (core.autocrlf) reads the same.
fn read(rel: &str) -> String {
    fs::read_to_string(root().join(rel))
        .unwrap_or_else(|e| panic!("{rel}: {e}"))
        .replace("\r\n", "\n")
}

/// The crate names BUILD_MAP § 3 lists under `crates\`.
fn build_map_crates() -> Vec<String> {
    let map = read("BUILD_MAP.md");
    let start = map.find("## 3. Repository layout").expect("BUILD_MAP § 3");
    let end = map[start..]
        .find("## 4.")
        .map(|e| start + e)
        .expect("BUILD_MAP § 4");
    map[start..end]
        .lines()
        .filter_map(|l| l.split_whitespace().next())
        .filter(|w| w.starts_with("sg-"))
        .map(str::to_string)
        .collect()
}

fn cargo() -> Command {
    let mut c = Command::new(std::env::var("CARGO").unwrap_or_else(|_| "cargo".into()));
    c.current_dir(root());
    c
}

fn assert_ok(what: &str, out: std::process::Output) {
    assert!(
        out.status.success(),
        "{what} failed ({}):\n{}\n{}",
        out.status,
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
}

/// Every crate of BUILD_MAP § 3 is a workspace member with the workspace lints; the no-stub lints
/// are denied; `cargo fmt` and `cargo clippy -D warnings` pass on the whole workspace; stub-scan
/// is clean; the cargo-deny policy is the spec 05 § 8 licence list.
#[test]
fn wp_000__workspace_builds_and_lints() {
    let crates = build_map_crates();
    assert!(
        crates.len() >= 24,
        "BUILD_MAP § 3 lists {} crates",
        crates.len()
    );
    for name in &crates {
        let manifest = format!("crates/{name}/Cargo.toml");
        let toml = read(&manifest);
        assert!(
            toml.contains(&format!("name = \"{name}\"")),
            "{manifest}: wrong package name"
        );
        assert!(
            toml.contains("[lints]\nworkspace = true"),
            "{manifest}: must inherit the workspace lints"
        );
    }
    let ws = read("Cargo.toml");
    for lint in [
        "todo = \"deny\"",
        "unimplemented = \"deny\"",
        "dbg_macro = \"deny\"",
    ] {
        assert!(
            ws.contains(lint),
            "Cargo.toml [workspace.lints.clippy] lacks {lint}"
        );
    }
    assert!(
        read("crates/sg-packs/src/lib.rs").contains("#![deny(clippy::panic)]"),
        "sg-packs must deny clippy::panic"
    );
    assert!(
        read("crates/sg-cli/Cargo.toml").contains("name = \"shipgate\""),
        "sg-cli must build the `shipgate` binary"
    );

    assert_ok(
        "cargo fmt --check",
        cargo()
            .args(["fmt", "--all", "--check"])
            .output()
            .expect("run cargo fmt"),
    );
    // A separate target directory, so this doesn't contend with the build that runs the test.
    let target = PathBuf::from(env!("CARGO_TARGET_TMPDIR")).join("wp000-clippy");
    assert_ok(
        "cargo clippy -D warnings",
        cargo()
            .args([
                "clippy",
                "--workspace",
                "--all-targets",
                "--quiet",
                "--target-dir",
            ])
            .arg(&target)
            .args(["--", "-D", "warnings"])
            .output()
            .expect("run cargo clippy"),
    );

    let hits = xtask::stub_scan(&root()).expect("stub-scan");
    assert!(hits.is_empty(), "stub-scan hits: {hits:?}");

    let deny = read("deny.toml");
    for lic in [
        "\"MIT\"",
        "\"Apache-2.0\"",
        "\"BSD-2-Clause\"",
        "\"BSD-3-Clause\"",
        "\"ISC\"",
        "\"Zlib\"",
        "\"Unicode-3.0\"",
        "\"PostgreSQL\"",
    ] {
        assert!(
            deny.contains(lic),
            "deny.toml allow-list lacks {lic} (spec 05 § 8)"
        );
    }
    for copyleft in ["GPL", "AGPL", "LGPL", "MPL", "SSPL", "EUPL"] {
        assert!(
            !deny
                .lines()
                .any(|l| l.trim_start().starts_with(&format!("\"{copyleft}"))),
            "deny.toml allows {copyleft}"
        );
    }
}

/// Position of `needle` in `hay`, or a failure naming it.
fn pos(hay: &str, needle: &str, file: &str) -> usize {
    hay.find(needle)
        .unwrap_or_else(|| panic!("{file} doesn't run `{needle}`"))
}

/// CI runs the § 4.1 pipeline in order (spec-lint → self-tests → merge-gate on PRs → trace-check of
/// the claims) plus the Rust gates on all three OSes; the Stop hook and the contract files exist.
#[test]
fn wp_000__ci_runs_trace_gates() {
    let f = ".github/workflows/ci.yml";
    let ci = read(f);
    let order = [
        "node tools/trace/spec-lint.mjs",
        "node tools/trace/spec-lint.test.mjs",
        "node tools/trace/trace-check.test.mjs",
        "node tools/trace/stop-gate.test.mjs",
        "node tools/trace/merge-gate.test.mjs",
        "node tools/trace/wp-card.test.mjs",
        "node tools/trace/merge-gate.mjs",
        "node tools/trace/trace-check.mjs --claimed BUILD_STATE.md",
    ];
    let mut last = 0;
    for step in order {
        let at = pos(&ci, step, f);
        assert!(at >= last, "{f}: `{step}` runs out of order");
        last = at;
    }
    assert!(
        ci.contains("if: github.event_name == 'pull_request'"),
        "{f}: merge-gate must run on pull requests"
    );
    for step in [
        "cargo fmt --all --check",
        "cargo clippy --workspace --all-targets -- -D warnings",
        "cargo xtask stub-scan",
        "cargo nextest run --profile ci",
        "cargo deny check",
    ] {
        pos(&ci, step, f);
    }
    for os in ["windows-latest", "macos-latest", "ubuntu-latest"] {
        pos(&ci, os, f);
    }

    let nextest = read(".config/nextest.toml");
    assert!(
        nextest.contains("[profile.ci.junit]") && nextest.contains("path = \"junit.xml\""),
        "nextest ci profile must write junit.xml"
    );
    let settings = read(".claude/settings.json");
    assert!(
        settings.contains("tools/trace/stop-gate.mjs"),
        ".claude/settings.json must run the Stop gate"
    );
    for file in [
        "BUILD_STATE.md",
        "DECISIONS.md",
        "spec/CHANGES.md",
        "corpus/FIXTURES.lock",
        "trace/deferred.tsv",
        "rust-toolchain.toml",
        "deny.toml",
    ] {
        assert!(Path::new(&root().join(file)).is_file(), "{file} missing");
    }
    let deferred = read("trace/deferred.tsv");
    assert!(
        deferred
            .lines()
            .all(|l| l.trim().is_empty() || l.starts_with('#')),
        "trace/deferred.tsv must start empty"
    );
}

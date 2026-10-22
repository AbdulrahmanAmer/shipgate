//! WP-102 acceptance test (owned section 03 § 19). Written by the orchestrator before the build.
//! WP-102 sources every managed tool and data snapshot and writes the draft toolchain manifest
//! `toolchain/manifest.json` (03 § 19 shape). A (component, platform) pair with no build is listed
//! in `toolchain/unavailable.json` with the spec fallback that applies, never silently dropped.
#![allow(non_snake_case)]

use serde_json::Value;
use std::collections::BTreeSet;
use std::fs;
use std::path::PathBuf;

fn root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root")
        .to_path_buf()
}

fn json(rel: &str) -> Result<Value, String> {
    let t = fs::read_to_string(root().join(rel)).map_err(|e| format!("{rel}: {e}"))?;
    serde_json::from_str(t.trim_start_matches('\u{feff}'))
        .map_err(|e| format!("{rel}: not JSON: {e}"))
}

/// 03 § 19 platform ids other than `any`.
const PLATFORMS: &[&str] = &[
    "windows-x64",
    "windows-arm64",
    "macos-arm64",
    "macos-x64",
    "linux-x64-gnu",
    "linux-arm64-gnu",
    "linux-x64-musl",
    "linux-arm64-musl",
];

/// Components that are binaries per platform (TR-001, 03 § 19 list).
const NATIVE: &[&str] = &[
    "node",
    "chromium",
    "firefox",
    "webkit",
    "osv-scanner",
    "postgresql",
    "mysql",
    "postgrest",
    "supabase-auth",
    "jre",
];

/// Components with one platform-independent artifact (`platform: "any"`): npm packages fetched by
/// exact version (05 § 8), the Supabase schema DDL, the Firebase emulator jars, and data snapshots.
const ANY: &[&str] = &[
    "playwright",
    "lighthouse",
    "axe-core",
    "web-vitals",
    "supabase-schema-ddl",
    "firebase-emulators",
    "osv-db",
    "npm-deprecations",
    "registry-publish-times",
    "wordpress-vulnerabilities",
    "eol-dates",
    "public-suffix-list",
    "hunspell-dictionaries",
];

#[test]
fn wp_102__sec_03_19__draft_manifest_complete() {
    let mut problems = Vec::new();
    let m = match json("toolchain/manifest.json") {
        Ok(m) => m,
        Err(e) => panic!("{e}"),
    };
    if m.get("formatVersion").and_then(Value::as_u64) != Some(1) {
        problems.push("manifest: formatVersion must be 1".to_string());
    }
    let items = m
        .get("items")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    let names: BTreeSet<String> = items
        .iter()
        .filter_map(|i| i.get("name").and_then(Value::as_str).map(String::from))
        .collect();
    let mut have = BTreeSet::new();
    for (n, it) in items.iter().enumerate() {
        let s = |k: &str| it.get(k).and_then(Value::as_str).unwrap_or("").to_string();
        let name = s("name");
        let at = format!("items[{n}] `{name}`");
        let plat = s("platform");
        if name.is_empty() || s("version").is_empty() || s("licence").is_empty() {
            problems.push(format!("{at}: name, version and licence are required"));
        }
        if !PLATFORMS.contains(&plat.as_str()) && plat != "any" {
            problems.push(format!("{at}: platform `{plat}` is not a 03 § 19 id"));
        }
        if !s("url").starts_with("https://") {
            problems.push(format!("{at}: url must be https"));
        }
        let sha = s("sha256");
        if sha.len() != 64
            || !sha
                .chars()
                .all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase())
        {
            problems.push(format!("{at}: sha256 must be 64 lowercase hex characters"));
        }
        if it
            .get("size")
            .and_then(Value::as_u64)
            .is_none_or(|z| z == 0)
        {
            problems.push(format!(
                "{at}: size must be a positive integer (bytes of the download)"
            ));
        }
        let purpose = s("purpose");
        if !["tool", "browser", "database", "grammar", "data"].contains(&purpose.as_str()) {
            problems.push(format!("{at}: purpose `{purpose}` is not a 03 § 19 value"));
        }
        if let Some(r) = it.get("refresh")
            && (r.as_str() != Some("fetch") || purpose != "data")
        {
            problems.push(format!(
                "{at}: `refresh` is only `fetch`, and only on purpose data"
            ));
        }
        if purpose == "data" && it.get("refresh").is_none() {
            problems.push(format!("{at}: data snapshots carry `refresh: \"fetch\"`"));
        }
        let unpack = s("unpackTo");
        if unpack.is_empty()
            || unpack.starts_with('/')
            || unpack.contains(':')
            || unpack.split(['/', '\\']).any(|p| p == "..")
        {
            problems.push(format!(
                "{at}: unpackTo must be a relative path inside the cache"
            ));
        }
        for r in it
            .get("requires")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default()
        {
            if !r.as_str().is_some_and(|r| names.contains(r)) {
                problems.push(format!("{at}: requires `{r}`, which no item names"));
            }
        }
        if purpose == "database"
            && name == "postgresql"
            && it.get("extensions").and_then(Value::as_array).is_none()
        {
            problems.push(format!(
                "{at}: PostgreSQL builds list their `extensions` (03 § 19)"
            ));
        }
        have.insert((name, plat));
    }
    let unavailable = json("toolchain/unavailable.json")
        .ok()
        .and_then(|u| u.get("items").and_then(Value::as_array).cloned())
        .unwrap_or_default();
    let excused = |name: &str, plat: &str| {
        unavailable.iter().any(|u| {
            u.get("name").and_then(Value::as_str) == Some(name)
                && u.get("platform").and_then(Value::as_str) == Some(plat)
                && u.get("reason")
                    .and_then(Value::as_str)
                    .is_some_and(|r| r.len() >= 10)
                && u.get("fallback")
                    .and_then(Value::as_str)
                    .is_some_and(|f| f.contains('§'))
        })
    };
    for name in NATIVE {
        for plat in PLATFORMS {
            if !have.contains(&(name.to_string(), plat.to_string())) && !excused(name, plat) {
                problems.push(format!("`{name}` has no `{plat}` item and no unavailable.json entry (reason + spec fallback §)"));
            }
        }
    }
    for name in ANY {
        if !have.contains(&(name.to_string(), "any".to_string())) && !excused(name, "any") {
            problems.push(format!(
                "`{name}` has no `platform: \"any\"` item and no unavailable.json entry"
            ));
        }
    }
    if !items
        .iter()
        .any(|i| i.get("purpose").and_then(Value::as_str) == Some("grammar"))
        && !excused("tree-sitter-grammars", "any")
    {
        problems.push("no tree-sitter grammar items (03 § 19 lists them), and no unavailable.json entry saying they're compiled in instead".into());
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

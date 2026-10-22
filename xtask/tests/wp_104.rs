//! WP-104 acceptance tests (BUILD_MAP § 5). Written by the orchestrator before the build; the file
//! list is every ruleset data file the spec cites (`ruleset `x``, `x.json`), plus the files BUILD_MAP
//! WP-104 names in prose. Typed shape validation of each file is WP-206's typed loaders; this test
//! proves existence, parsing, non-emptiness, locale coverage (DECISIONS D-010) and provenance.
#![allow(non_snake_case)]

use serde_json::Value;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

fn rules() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("repo root")
        .join("rules")
}

/// The first ruleset's locale set (DECISIONS D-010). Per-locale files cover every one.
const LOCALES: &[&str] = &[
    "ar", "cs", "da", "de", "en", "es", "fi", "fr", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro",
    "ru", "sv", "tr", "zh",
];

/// Per-locale ruleset files: top-level object keyed by BCP 47 tag (04 § 15 *Page locale*).
const PER_LOCALE: &[&str] = &[
    "a11y-statement-phrases",
    "add-to-cart-labels",
    "advice-patterns",
    "affiliate-disclosure-phrases",
    "ai-addressed-phrases",
    "attribution-phrases",
    "bool-labels",
    "cancel-labels",
    "carousel-controls",
    "claimPatterns",
    "claimPhrases",
    "clickbait-patterns",
    "comparison-patterns",
    "country-of-origin-labels",
    "date-labels",
    "dmca-phrases",
    "dsa-contact-phrases",
    "dsa-terms-phrases",
    "evergreen-words",
    "extend-session-labels",
    "generic-anchors",
    "generic-green-claims",
    "generic-titles",
    "gsc-indexed-states",
    "incentive-disclosure-phrases",
    "load-more-labels",
    "logo-wall-headings",
    "marketing-consent-phrases",
    "marketing-optin-labels",
    "marketing-signup-markers",
    "no-results-phrases",
    "order-button-labels",
    "osa-terms-phrases",
    "pagination-labels",
    "password-reset-labels",
    "password-reset-paths",
    "placeholders",
    "prior-price-phrases",
    "privacy-notice-elements",
    "prop65-link-labels",
    "purpose-phrases",
    "ratingPatterns",
    "regulated-claims",
    "renewal-terms-phrases",
    "report-content-labels",
    "required-labels",
    "review-verification-phrases",
    "safety-info-labels",
    "same-as-labels",
    "sct-labels",
    "shipping-cost-phrases",
    "sms-consent-phrases",
    "sms-markers",
    "soft-404-phrases",
    "stock-count-phrases",
    "stock-phrases",
    "stop-words",
    "term-patterns",
    "terms-acceptance-phrases",
    "tida-phrases",
    "transfer-mechanism-phrases",
    "unit-quantity-patterns",
    "unsubscribe-labels",
    "vat-phrases",
    "verbs",
    "withdrawal-confirm-labels",
    "withdrawal-info-phrases",
    "withdrawal-labels",
];

/// Ruleset files that are not keyed by locale.
const OTHER_JSON: &[&str] = &[
    "a11y-overlays",
    "agentic-feeds",
    "ai-agents",
    "analytics-vendors",
    "attribution-licences",
    "auth-bypass-headers",
    "autoIdPatterns",
    "autocomplete-map",
    "baseline-js-syntax",
    "bfcache-harness-reasons",
    "cache-hit-headers",
    "campaign-params",
    "carousel-markers",
    "challenge-fields",
    "china-blocked-hosts",
    "chrome-state-classes",
    "ci-hardening",
    "classNameFunctions",
    "consent-models",
    "content-signals",
    "countdown-markers",
    "csp-bypass-hosts",
    "csrf-token-names",
    "debug-paths",
    "default-documents",
    "default-emails",
    "digital-product-types",
    "drag-libraries",
    "engine-crawlers",
    "eol-products",
    "error-pages",
    "error-reporting-providers",
    "exposed-paths",
    "fetch-tools",
    "file-params",
    "geo-headers",
    "google-certified-cmps",
    "google-tags",
    "install-script-flags",
    "iso4217",
    "lighthouse-audit-renames",
    "live-key-prefixes",
    "local-listing-sources",
    "market-signals",
    "mass-assignment-fields",
    "model-hosts",
    "object-storage-hosts",
    "password-columns",
    "password-hash-patterns",
    "payment-amounts",
    "payment-id-shapes",
    "payment-test-markers",
    "placeholder-handles",
    "placeholder-tracking-ids",
    "postal-patterns",
    "provider-id-by-country",
    "publishable-keys",
    "quantity-fields",
    "rating-widget-markers",
    "registries",
    "regulated-product-regimes",
    "required-legal-pages",
    "runtime-pins",
    "safe-type-changes",
    "scaffold-routes",
    "schemaorg",
    "search-agents",
    "secret-patterns",
    "sensitive-properties",
    "session-lifetimes",
    "social-agents",
    "social-hosts",
    "social-proof-widgets",
    "sri-hosts",
    "ssrf-params",
    "stock-preview-hosts",
    "takeover-fingerprints",
    "tcf-ad-vendors",
    "testimonial-markers",
    "tracking-param-expansions",
    "transfer-adequacy",
    "traversal-payloads",
    "trust-marks",
    "us-opt-out-states",
    "user-tables",
    "weak-hash-apis",
    "web-features",
    "webhook-schemes",
    "wp-lockout-signatures",
    "write-apis",
    "xss-payloads",
];

/// Countries with a `gazetteer/<cc>.json` (the regions of LOCALES plus the largest other markets).
const GAZETTEER: &[&str] = &[
    "ae", "at", "au", "be", "br", "ca", "ch", "cn", "cz", "de", "dk", "eg", "es", "fi", "fr", "gb",
    "ie", "in", "it", "jp", "kr", "mx", "nl", "no", "nz", "pl", "pt", "ro", "ru", "sa", "se", "tr",
    "tw", "us",
];

/// Ecosystems with a `popular-packages/<ecosystem>.txt` (SEC-053 `typosquat`: top 10,000 names).
const ECOSYSTEMS: &[&str] = &[
    "npm", "pypi", "cargo", "go", "composer", "rubygems", "maven", "nuget",
];

/// Built-in framework adapters (02 § 5) with a foundation recipe file (04 § 7 `brief --stage start`).
const RECIPE_ADAPTERS: &[&str] = &[
    "static-html",
    "next-app",
    "next-pages",
    "vite-spa",
    "tanstack-start",
    "react-router",
    "astro",
    "nuxt",
    "sveltekit",
    "django",
    "fastapi",
    "flask",
    "rails",
    "laravel",
    "wordpress",
    "spring",
    "aspnet",
    "go-http",
    "rust-http",
];

fn json(rel: &str) -> Value {
    let p = rules().join(rel);
    let text = fs::read_to_string(&p).unwrap_or_else(|e| panic!("rules/{rel}: {e}"));
    serde_json::from_str::<Value>(text.trim_start_matches('\u{feff}'))
        .unwrap_or_else(|e| panic!("rules/{rel}: not JSON: {e}"))
}

fn every_file() -> Vec<String> {
    let mut v: Vec<String> = PER_LOCALE
        .iter()
        .chain(OTHER_JSON)
        .map(|n| format!("{n}.json"))
        .collect();
    v.extend(GAZETTEER.iter().map(|c| format!("gazetteer/{c}.json")));
    v.extend(
        ECOSYSTEMS
            .iter()
            .map(|e| format!("popular-packages/{e}.txt")),
    );
    v.extend(RECIPE_ADAPTERS.iter().map(|a| format!("recipes/{a}.json")));
    v.extend(
        [
            "breached-passwords.txt",
            "features/google.json",
            "features/bing.json",
            "features/naver.json",
        ]
        .map(String::from),
    );
    v
}

#[test]
fn wp_104__named_ruleset_files_exist_and_parse() {
    let mut problems = Vec::new();
    for rel in every_file() {
        let p = rules().join(&rel);
        let Ok(text) = fs::read_to_string(&p) else {
            problems.push(format!("missing rules/{rel}"));
            continue;
        };
        if rel.ends_with(".txt") {
            let lines: Vec<&str> = text.lines().filter(|l| !l.trim().is_empty()).collect();
            let min = if rel.starts_with("popular-packages/") {
                10_000
            } else {
                1
            };
            if lines.len() < min {
                problems.push(format!("rules/{rel}: {} lines, needs ≥ {min}", lines.len()));
            }
            if rel == "breached-passwords.txt"
                && lines
                    .iter()
                    .filter(|l| (15..=64).contains(&l.chars().count()))
                    .count()
                    < 100
            {
                problems.push(
                    "rules/breached-passwords.txt: needs ≥ 100 entries of length 15–64 (SEC-018)"
                        .into(),
                );
            }
            continue;
        }
        match serde_json::from_str::<Value>(text.trim_start_matches('\u{feff}')) {
            Err(e) => problems.push(format!("rules/{rel}: not JSON: {e}")),
            Ok(v) if is_empty(&v) => problems.push(format!("rules/{rel}: empty")),
            Ok(v) => {
                let name = rel.trim_end_matches(".json");
                if PER_LOCALE.contains(&name) {
                    for loc in LOCALES {
                        if v.get(loc).is_none() {
                            problems.push(format!("rules/{rel}: no `{loc}` entry (D-010)"));
                        }
                    }
                }
            }
        }
    }
    let prov = match fs::read_to_string(rules().join("provenance.json")) {
        Ok(t) => {
            serde_json::from_str::<Value>(t.trim_start_matches('\u{feff}')).unwrap_or_else(|e| {
                problems.push(format!("rules/provenance.json: not JSON: {e}"));
                Value::Null
            })
        }
        Err(_) => {
            problems.push("missing rules/provenance.json".to_string());
            Value::Null
        }
    };
    for rel in every_file() {
        match prov.get(&rel) {
            None => problems.push(format!("rules/provenance.json: no entry for {rel}")),
            Some(e) => {
                let src_ok = e
                    .get("source")
                    .map(|s| {
                        s.as_array()
                            .map(|a| {
                                !a.is_empty()
                                    && a.iter().all(|x| {
                                        x.as_str().is_some_and(|s| {
                                            s.starts_with("https://") || s.starts_with("spec:")
                                        })
                                    })
                            })
                            .unwrap_or(false)
                    })
                    .unwrap_or(false);
                let date_ok = e
                    .get("retrieved")
                    .and_then(|d| d.as_str())
                    .is_some_and(is_date);
                let lic_ok = e
                    .get("licence")
                    .and_then(|d| d.as_str())
                    .is_some_and(|s| !s.trim().is_empty());
                if !(src_ok && date_ok && lic_ok) {
                    problems.push(format!("rules/provenance.json[{rel}]: needs source (https:// or spec: refs), retrieved YYYY-MM-DD and licence"));
                }
            }
        }
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

fn is_empty(v: &Value) -> bool {
    match v {
        Value::Array(a) => a.is_empty(),
        Value::Object(m) => m.is_empty(),
        Value::String(s) => s.is_empty(),
        Value::Null => true,
        _ => false,
    }
}

fn is_date(s: &str) -> bool {
    let b = s.as_bytes();
    b.len() == 10
        && b[4] == b'-'
        && b[7] == b'-'
        && s.chars()
            .enumerate()
            .all(|(i, c)| i == 4 || i == 7 || c.is_ascii_digit())
}

#[test]
fn wp_104__feature_tables_have_source_dates() {
    // search-engines `features` example list plus the deprecated features SE-101 names.
    let google_features = [
        "article",
        "product",
        "merchant-listing",
        "event",
        "job-posting",
        "video",
        "image-metadata",
        "local-business",
        "organization",
        "breadcrumb",
        "review-snippet",
        "recipe",
        "course-list",
        "discussion-forum",
        "profile-page",
        "paywalled-content",
        "dataset",
        "faq",
        "howto",
        "sitelinks-searchbox",
        "practice-problems",
        "course-info",
        "estimated-salary",
        "learning-video",
        "special-announcement",
        "vehicle-listing",
    ];
    let mut problems = Vec::new();
    for engine in ["google", "bing", "naver"] {
        let rel = format!("features/{engine}.json");
        let rows = json(&rel);
        let Some(rows) = rows.as_array() else {
            problems.push(format!("rules/{rel}: must be an array of feature rows"));
            continue;
        };
        if rows.is_empty() {
            problems.push(format!("rules/{rel}: no rows"));
        }
        let mut seen = BTreeMap::new();
        for r in rows {
            let feature = r
                .get("feature")
                .and_then(|f| f.as_str())
                .unwrap_or("")
                .to_string();
            let ok = !feature.is_empty()
                && r.get("schemaTypes").and_then(|x| x.as_array()).is_some()
                && r.get("required").and_then(|x| x.as_array()).is_some()
                && r.get("recommended").and_then(|x| x.as_array()).is_some()
                && r.get("status")
                    .and_then(|x| x.as_str())
                    .is_some_and(|s| s == "active" || s == "deprecated")
                && r.get("docUrl")
                    .and_then(|x| x.as_str())
                    .is_some_and(|s| s.starts_with("https://"))
                && r.get("checkedOn")
                    .and_then(|x| x.as_str())
                    .is_some_and(is_date);
            if !ok {
                problems.push(format!("rules/{rel}: row `{feature}` lacks feature/schemaTypes/required/recommended/status/docUrl/checkedOn (search-engines § 4)"));
            }
            seen.insert(feature, ());
        }
        if engine == "google" {
            for f in google_features {
                if !seen.contains_key(f) {
                    problems.push(format!("rules/features/google.json: no row for `{f}`"));
                }
            }
        }
    }
    assert!(
        problems.is_empty(),
        "{} problem(s):\n{}",
        problems.len(),
        problems.join("\n")
    );
}

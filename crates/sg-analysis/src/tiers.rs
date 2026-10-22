//! `rules/grammar-tiers.json`: which grammar backs each language, whether it is maintained, and
//! the tier cap that follows (02 § 2 / § 4). The file is embedded into the binary at build time,
//! so the engine a build uses is always the one its recorded measurements describe.

use crate::lang::LangId;
use serde::Deserialize;
use std::collections::BTreeMap;
use std::sync::OnceLock;

/// The embedded `rules/grammar-tiers.json`.
const EMBEDDED: &str = include_str!("../../../rules/grammar-tiers.json");

/// A declared regex sink pattern for a template language (03 § 6 `regexSinks`).
#[derive(Clone, Debug, Deserialize, PartialEq)]
pub struct RegexSinkSpec {
    /// A Rust `regex` pattern, matched against the whole file. A match on a line is a sink.
    pub pattern: String,
    /// Declared precision, 0 to 1: reported in the finding that this pattern produces.
    pub precision: f64,
}

/// One language's entry in `rules/grammar-tiers.json`.
#[derive(Clone, Debug, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TierEntry {
    /// The crate (or vendored repository) that provides the grammar.
    pub grammar: String,
    /// The pinned version of `grammar`.
    pub version: String,
    /// SPDX licence of the grammar.
    pub licence: String,
    /// True when the grammar is maintained and usable (see the entry's `notes` for the evidence).
    pub maintained: bool,
    /// `full` or `structural`: the highest coverage level this language can reach (02 § 2).
    pub tier_cap: String,
    /// `pass` when `ast-grep-core` embeds the grammar (parses the sample with no ERROR nodes and
    /// finds its raw-HTML sinks), else `fail`.
    pub embedding: String,
    /// Regex fallback for languages without a maintained, embedding grammar.
    #[serde(default)]
    pub regex_sinks: Vec<RegexSinkSpec>,
    /// Where the grammar lives, how it is maintained, what was tried.
    pub notes: String,
    /// Source repository, when known.
    #[serde(default)]
    pub repository: Option<String>,
}

/// Which engine analyses a language.
#[derive(Clone, Copy, Debug, PartialEq, Eq, serde::Serialize)]
pub enum Engine {
    /// A tree-sitter grammar through `ast-grep-core`.
    #[serde(rename = "tree-sitter")]
    TreeSitter,
    /// The declared `regexSinks` (coverage at most `structural`, 02 § 4).
    #[serde(rename = "regex")]
    Regex,
}

impl Engine {
    /// The id used in probe output.
    pub const fn as_str(self) -> &'static str {
        match self {
            Engine::TreeSitter => "tree-sitter",
            Engine::Regex => "regex",
        }
    }
}

/// The parsed `rules/grammar-tiers.json`.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct Tiers {
    entries: BTreeMap<String, TierEntry>,
}

impl Tiers {
    /// Parses a `grammar-tiers.json` document: a JSON object whose language-id keys hold
    /// [`TierEntry`] objects (non-object members such as `formatVersion` are ignored).
    pub fn from_json(text: &str) -> Result<Tiers, String> {
        let doc: serde_json::Value =
            serde_json::from_str(text.trim_start_matches('\u{feff}')).map_err(|e| e.to_string())?;
        let obj = doc
            .as_object()
            .ok_or_else(|| "grammar-tiers.json must be a JSON object".to_string())?;
        let mut entries = BTreeMap::new();
        for (key, value) in obj {
            if !value.is_object() {
                continue;
            }
            let entry: TierEntry = serde_json::from_value(value.clone())
                .map_err(|e| format!("grammar-tiers.json `{key}`: {e}"))?;
            entries.insert(key.clone(), entry);
        }
        Ok(Tiers { entries })
    }

    /// The tiers file embedded in this build.
    ///
    /// # Panics
    /// Never in a released build: `rules/grammar-tiers.json` is validated by this crate's tests.
    pub fn embedded() -> &'static Tiers {
        static TIERS: OnceLock<Tiers> = OnceLock::new();
        TIERS.get_or_init(|| match Tiers::from_json(EMBEDDED) {
            Ok(t) => t,
            Err(e) => panic!("embedded rules/grammar-tiers.json is invalid: {e}"),
        })
    }

    /// The entry for a language id.
    pub fn entry(&self, lang: LangId) -> Option<&TierEntry> {
        self.entries.get(lang.as_str())
    }

    /// All entries, by language id.
    pub fn entries(&self) -> impl Iterator<Item = (&str, &TierEntry)> {
        self.entries.iter().map(|(k, v)| (k.as_str(), v))
    }

    /// The engine that analyses `lang`: a template language uses its tree-sitter grammar only when
    /// the file records it as maintained and embedding; everything else analyses with tree-sitter.
    pub fn engine_for(&self, lang: LangId) -> Engine {
        if !lang.is_template() {
            return Engine::TreeSitter;
        }
        match self.entry(lang) {
            Some(e) if e.maintained && e.embedding == "pass" => Engine::TreeSitter,
            _ => Engine::Regex,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const DOC: &str = r#"{
        "formatVersion": 1,
        "twig": {
            "grammar": "g", "version": "1", "licence": "MIT", "maintained": false,
            "tierCap": "structural", "embedding": "fail",
            "regexSinks": [{ "pattern": "x", "precision": 0.5 }],
            "notes": "no grammar"
        },
        "vue": {
            "grammar": "g", "version": "1", "licence": "MIT", "maintained": true,
            "tierCap": "full", "embedding": "pass", "notes": "ok"
        }
    }"#;

    #[test]
    fn engine_follows_the_recorded_maintenance() {
        let t = Tiers::from_json(DOC).expect("parses");
        assert_eq!(t.engine_for(LangId::Twig), Engine::Regex);
        assert_eq!(t.engine_for(LangId::Vue), Engine::TreeSitter);
        // A template language without an entry has no recorded grammar.
        assert_eq!(t.engine_for(LangId::Blade), Engine::Regex);
        // Structural languages never use the regex engine.
        assert_eq!(t.engine_for(LangId::Python), Engine::TreeSitter);
    }

    #[test]
    fn a_grammar_that_does_not_embed_is_not_used() {
        let doc = DOC.replace(r#""embedding": "pass""#, r#""embedding": "fail""#);
        let t = Tiers::from_json(&doc).expect("parses");
        assert_eq!(t.engine_for(LangId::Vue), Engine::Regex);
    }

    #[test]
    fn malformed_entries_are_reported_with_their_key() {
        let err = Tiers::from_json(r#"{ "vue": { "grammar": 1 } }"#).expect_err("invalid");
        assert!(err.contains("`vue`"), "{err}");
        assert!(Tiers::from_json("[]").is_err());
    }

    #[test]
    fn the_embedded_file_parses_and_covers_every_language() {
        let t = Tiers::embedded();
        for lang in LangId::ALL {
            assert!(t.entry(lang).is_some(), "no entry for {lang}");
        }
    }
}

//! The grammar probe behind `shipgate dev grammar-probe` (05 § 1): parse one file with the
//! source-analysis engine of 02 § 4 for its language, count the syntax errors, list the raw-HTML
//! sinks. WP-103's grammar-maturity check runs it over a sample per language.

use crate::lang::LangId;
use crate::sinks::{self, Root, Sink, SinkError, SinkHints};
use crate::tiers::{Engine, Tiers};
use ast_grep_core::AstGrep;
use serde::Serialize;
use std::fmt;

/// Version of the probe output shape.
pub const FORMAT_VERSION: u32 = 1;

/// A sink as the probe prints it: `{ line, text }`, lines 1-based.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ProbeSink {
    /// 1-based line.
    pub line: usize,
    /// The matched source text.
    pub text: String,
}

/// The probe result, serialised as `{ formatVersion, lang, engine, parsed, errorNodes, sinks }`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeReport {
    /// Version of this shape.
    pub format_version: u32,
    /// Canonical language id.
    pub lang: String,
    /// `tree-sitter` or `regex`.
    pub engine: &'static str,
    /// True when a syntax tree was produced. Always false for the `regex` engine, which parses
    /// nothing.
    pub parsed: bool,
    /// Number of ERROR and MISSING nodes in the tree (0 for the `regex` engine).
    pub error_nodes: usize,
    /// The raw-HTML sinks, by line.
    pub sinks: Vec<ProbeSink>,
}

/// Why a probe could not run.
#[derive(Debug)]
pub enum ProbeError {
    /// `--lang` names no language shipgate knows.
    UnknownLanguage(String),
    /// The grammar produced no tree (tree-sitter gave up).
    Parse {
        /// The language.
        lang: LangId,
        /// The reason.
        reason: String,
    },
    /// The regex engine is selected but `rules/grammar-tiers.json` declares no `regexSinks`.
    NoRegexSinks(LangId),
    /// A detector could not run.
    Sinks(SinkError),
}

impl fmt::Display for ProbeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ProbeError::UnknownLanguage(l) => write!(f, "unknown language `{l}`"),
            ProbeError::Parse { lang, reason } => write!(f, "cannot parse {lang}: {reason}"),
            ProbeError::NoRegexSinks(l) => write!(
                f,
                "{l} is analysed by regexSinks but rules/grammar-tiers.json declares none"
            ),
            ProbeError::Sinks(e) => write!(f, "{e}"),
        }
    }
}

impl std::error::Error for ProbeError {}

impl From<SinkError> for ProbeError {
    fn from(e: SinkError) -> Self {
        ProbeError::Sinks(e)
    }
}

/// Counts the ERROR and MISSING nodes of a parsed file (named and anonymous nodes alike: a MISSING
/// node is usually an anonymous token such as a closing bracket).
pub fn count_error_nodes(root: &Root) -> usize {
    root.root()
        .dfs()
        .filter(|n| n.is_error() || n.is_missing())
        .count()
}

/// Parses `source` as `lang`.
pub fn parse(lang: LangId, source: &str) -> Result<Root, ProbeError> {
    AstGrep::try_new(source, lang).map_err(|reason| ProbeError::Parse { lang, reason })
}

/// Probes `source` as language `lang_id` with the tiers embedded in this build.
///
/// `file_name` is only a hint (it tells EJS from ERB).
pub fn probe(
    lang_id: &str,
    source: &str,
    file_name: Option<&str>,
) -> Result<ProbeReport, ProbeError> {
    probe_with(Tiers::embedded(), lang_id, source, file_name)
}

/// [`probe`] against explicit tiers (tests use this to exercise the regex engine).
pub fn probe_with(
    tiers: &Tiers,
    lang_id: &str,
    source: &str,
    file_name: Option<&str>,
) -> Result<ProbeReport, ProbeError> {
    let lang =
        LangId::parse(lang_id).ok_or_else(|| ProbeError::UnknownLanguage(lang_id.to_string()))?;
    let engine = tiers.engine_for(lang);
    let (parsed, error_nodes, found) = match engine {
        Engine::TreeSitter => {
            let root = parse(lang, source)?;
            let found = sinks::find_sinks(&root, SinkHints { file_name })?;
            (true, count_error_nodes(&root), found)
        }
        Engine::Regex => {
            let specs = tiers
                .entry(lang)
                .map(|e| e.regex_sinks.as_slice())
                .unwrap_or_default();
            if specs.is_empty() {
                return Err(ProbeError::NoRegexSinks(lang));
            }
            (false, 0, sinks::find_regex_sinks(source, specs)?)
        }
    };
    Ok(ProbeReport {
        format_version: FORMAT_VERSION,
        lang: lang.as_str().to_string(),
        engine: engine.as_str(),
        parsed,
        error_nodes,
        sinks: found.into_iter().map(into_probe_sink).collect(),
    })
}

fn into_probe_sink(s: Sink) -> ProbeSink {
    ProbeSink {
        line: s.line,
        text: s.text,
    }
}

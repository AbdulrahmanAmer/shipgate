//! sg-analysis: ast-grep-core integration, oxc semantics and module graph, template grammars, SQL parsing.
//!
//! WP-103 built the first layer: every language shipgate parses (02 § 4) as one [`LangId`] that
//! plugs its tree-sitter grammar into `ast-grep-core`, the raw-HTML sink detectors of the template
//! languages (SEC-001), the `rules/grammar-tiers.json` loader, and the grammar probe behind
//! `shipgate dev grammar-probe`. WP-303 builds the structural-rule engine on top of it.

pub mod lang;
pub mod probe;
pub mod sinks;
pub mod tiers;

pub use lang::LangId;
pub use probe::{
    FORMAT_VERSION, ProbeError, ProbeReport, ProbeSink, count_error_nodes, parse, probe, probe_with,
};
pub use sinks::{Root, Sink, SinkError, SinkHints, find_regex_sinks, find_sinks};
pub use tiers::{Engine, RegexSinkSpec, TierEntry, Tiers};

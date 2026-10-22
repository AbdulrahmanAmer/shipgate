//! Twig language support for the tree-sitter parsing library.
//!
//! The grammar is `gbprod/tree-sitter-twig`, vendored verbatim (generated `src/parser.c` plus
//! headers); only this binding, `build.rs` and `Cargo.toml` are ours. See `VENDORED.md`.

use tree_sitter_language::LanguageFn;

extern "C" {
    fn tree_sitter_twig() -> *const ();
}

/// The tree-sitter [`LanguageFn`] for the Twig grammar.
pub const LANGUAGE: LanguageFn = unsafe { LanguageFn::from_raw(tree_sitter_twig) };

/// The content of the grammar's `node-types.json`.
pub const NODE_TYPES: &str = include_str!("src/node-types.json");

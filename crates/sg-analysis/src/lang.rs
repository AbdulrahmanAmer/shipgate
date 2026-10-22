//! The languages shipgate parses with `ast-grep-core`, each on its tree-sitter grammar (02 § 4).
//!
//! [`LangId`] is the one type that plugs a grammar into the ast-grep engine: it implements
//! [`ast_grep_core::Language`] and [`ast_grep_core::tree_sitter::LanguageExt`], so every
//! ast-grep matcher (`Pattern`, `KindMatcher`, composites) works on every language below.

use ast_grep_core::language::Language;
use ast_grep_core::matcher::{Pattern, PatternBuilder, PatternError};
use ast_grep_core::tree_sitter::{LanguageExt, StrDoc, TSLanguage};
use std::borrow::Cow;
use std::path::Path;

/// A language shipgate can parse. The canonical id (`as_str`) is the id used in
/// `rules/grammar-tiers.json`, adapter manifests (`templateLanguages`, 03 § 6) and
/// `shipgate dev grammar-probe --lang`.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub enum LangId {
    TypeScript,
    Tsx,
    JavaScript,
    Python,
    Ruby,
    Php,
    Go,
    Java,
    Kotlin,
    CSharp,
    Rust,
    Html,
    Css,
    Vue,
    Svelte,
    Astro,
    EmbeddedTemplate,
    Twig,
    Blade,
    Jinja2,
}

impl LangId {
    /// Every language, structural languages first, then the template languages.
    pub const ALL: [LangId; 20] = [
        LangId::TypeScript,
        LangId::Tsx,
        LangId::JavaScript,
        LangId::Python,
        LangId::Ruby,
        LangId::Php,
        LangId::Go,
        LangId::Java,
        LangId::Kotlin,
        LangId::CSharp,
        LangId::Rust,
        LangId::Html,
        LangId::Css,
        LangId::Vue,
        LangId::Svelte,
        LangId::Astro,
        LangId::EmbeddedTemplate,
        LangId::Twig,
        LangId::Blade,
        LangId::Jinja2,
    ];

    /// The canonical id.
    pub const fn as_str(self) -> &'static str {
        match self {
            LangId::TypeScript => "typescript",
            LangId::Tsx => "tsx",
            LangId::JavaScript => "javascript",
            LangId::Python => "python",
            LangId::Ruby => "ruby",
            LangId::Php => "php",
            LangId::Go => "go",
            LangId::Java => "java",
            LangId::Kotlin => "kotlin",
            LangId::CSharp => "csharp",
            LangId::Rust => "rust",
            LangId::Html => "html",
            LangId::Css => "css",
            LangId::Vue => "vue",
            LangId::Svelte => "svelte",
            LangId::Astro => "astro",
            LangId::EmbeddedTemplate => "embedded-template",
            LangId::Twig => "twig",
            LangId::Blade => "blade",
            LangId::Jinja2 => "jinja2",
        }
    }

    /// Parses a language id: the canonical id, or a common alias (`ts`, `js`, `jsx`, `py`, `rb`,
    /// `kt`, `cs`, `rs`, `erb`, `ejs`, `jinja`). Case-insensitive. `None` for an unknown id.
    pub fn parse(id: &str) -> Option<LangId> {
        let id = id.trim().to_ascii_lowercase();
        Some(match id.as_str() {
            "typescript" | "ts" => LangId::TypeScript,
            "tsx" => LangId::Tsx,
            "javascript" | "js" | "jsx" => LangId::JavaScript,
            "python" | "py" => LangId::Python,
            "ruby" | "rb" => LangId::Ruby,
            "php" => LangId::Php,
            "go" => LangId::Go,
            "java" => LangId::Java,
            "kotlin" | "kt" => LangId::Kotlin,
            "csharp" | "c-sharp" | "cs" => LangId::CSharp,
            "rust" | "rs" => LangId::Rust,
            "html" => LangId::Html,
            "css" => LangId::Css,
            "vue" => LangId::Vue,
            "svelte" => LangId::Svelte,
            "astro" => LangId::Astro,
            "embedded-template" | "erb" | "ejs" => LangId::EmbeddedTemplate,
            "twig" => LangId::Twig,
            "blade" => LangId::Blade,
            "jinja2" | "jinja" => LangId::Jinja2,
            _ => return None,
        })
    }

    /// The language of a file, by its name (`x.blade.php` is Blade, not PHP; `x.html.erb` is
    /// ERB). `None` when the extension is not one shipgate analyses.
    pub fn from_file_name(name: &str) -> Option<LangId> {
        let lower = name.to_ascii_lowercase();
        let ends = |suffix: &str| lower.ends_with(suffix);
        Some(if ends(".blade.php") {
            LangId::Blade
        } else if ends(".tsx") {
            LangId::Tsx
        } else if ends(".ts") || ends(".mts") || ends(".cts") {
            LangId::TypeScript
        } else if ends(".js") || ends(".jsx") || ends(".mjs") || ends(".cjs") {
            LangId::JavaScript
        } else if ends(".py") || ends(".pyi") {
            LangId::Python
        } else if ends(".rb") || ends(".rake") || ends(".gemspec") {
            LangId::Ruby
        } else if ends(".php") {
            LangId::Php
        } else if ends(".go") {
            LangId::Go
        } else if ends(".java") {
            LangId::Java
        } else if ends(".kt") || ends(".kts") {
            LangId::Kotlin
        } else if ends(".cs") {
            LangId::CSharp
        } else if ends(".rs") {
            LangId::Rust
        } else if ends(".html") || ends(".htm") {
            LangId::Html
        } else if ends(".css") {
            LangId::Css
        } else if ends(".vue") {
            LangId::Vue
        } else if ends(".svelte") {
            LangId::Svelte
        } else if ends(".astro") {
            LangId::Astro
        } else if ends(".erb") || ends(".ejs") {
            LangId::EmbeddedTemplate
        } else if ends(".twig") {
            LangId::Twig
        } else if ends(".j2") || ends(".jinja") || ends(".jinja2") {
            LangId::Jinja2
        } else {
            return None;
        })
    }

    /// True for the seven template languages of 02 § 4 (`templateLanguages`, 03 § 6).
    pub const fn is_template(self) -> bool {
        matches!(
            self,
            LangId::Vue
                | LangId::Svelte
                | LangId::Astro
                | LangId::EmbeddedTemplate
                | LangId::Twig
                | LangId::Blade
                | LangId::Jinja2
        )
    }

    /// The tree-sitter grammar behind this language.
    pub fn ts_language(self) -> TSLanguage {
        match self {
            LangId::TypeScript => tree_sitter_typescript::LANGUAGE_TYPESCRIPT.into(),
            LangId::Tsx => tree_sitter_typescript::LANGUAGE_TSX.into(),
            LangId::JavaScript => tree_sitter_javascript::LANGUAGE.into(),
            LangId::Python => tree_sitter_python::LANGUAGE.into(),
            LangId::Ruby => tree_sitter_ruby::LANGUAGE.into(),
            LangId::Php => tree_sitter_php::LANGUAGE_PHP.into(),
            LangId::Go => tree_sitter_go::LANGUAGE.into(),
            LangId::Java => tree_sitter_java::LANGUAGE.into(),
            LangId::Kotlin => tree_sitter_kotlin_sg::LANGUAGE.into(),
            LangId::CSharp => tree_sitter_c_sharp::LANGUAGE.into(),
            LangId::Rust => tree_sitter_rust::LANGUAGE.into(),
            LangId::Html => tree_sitter_html::LANGUAGE.into(),
            LangId::Css => tree_sitter_css::LANGUAGE.into(),
            LangId::Vue => tree_sitter_vue_next::LANGUAGE.into(),
            LangId::Svelte => tree_sitter_svelte_next::LANGUAGE.into(),
            LangId::Astro => tree_sitter_astro_next::LANGUAGE.into(),
            LangId::EmbeddedTemplate => tree_sitter_embedded_template::LANGUAGE.into(),
            LangId::Twig => tree_sitter_twig::LANGUAGE.into(),
            LangId::Blade => tree_sitter_blade::LANGUAGE.into(),
            LangId::Jinja2 => tree_sitter_jinja::language(),
        }
    }
}

impl std::fmt::Display for LangId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Rewrites ast-grep meta variables (`$A`, `$$$B`) in a pattern so a grammar that does not accept
/// `$` in identifiers can parse the pattern: `$` followed by an upper-case letter or `_`, and the
/// anonymous multi-match `$$$`, become `expando`. Same rule as `ast-grep-language`.
fn expand_meta_vars(expando: char, query: &str) -> Cow<'_, str> {
    let mut out = String::with_capacity(query.len());
    let mut dollars = 0usize;
    let push_sigils = |out: &mut String, dollars: usize, replace: bool| {
        let sigil = if replace { expando } else { '$' };
        out.extend(std::iter::repeat_n(sigil, dollars));
    };
    for c in query.chars() {
        if c == '$' {
            dollars += 1;
            continue;
        }
        let replace = matches!(c, 'A'..='Z' | '_') || dollars == 3;
        push_sigils(&mut out, dollars, replace);
        dollars = 0;
        out.push(c);
    }
    push_sigils(&mut out, dollars, dollars == 3);
    Cow::Owned(out)
}

impl Language for LangId {
    /// The character the grammar accepts where ast-grep wants `$` (see `expand_meta_vars`).
    /// TypeScript, TSX and JavaScript accept `$` in identifiers; the others need a stand-in.
    fn expando_char(&self) -> char {
        match self {
            LangId::TypeScript | LangId::Tsx | LangId::JavaScript => '$',
            LangId::Css => '_',
            // tree-sitter-html's tag-name scanner is locale dependent, so only ASCII works.
            LangId::Html | LangId::Vue | LangId::Svelte | LangId::Astro => 'z',
            _ => 'µ',
        }
    }

    fn pre_process_pattern<'q>(&self, query: &'q str) -> Cow<'q, str> {
        match self.expando_char() {
            '$' => Cow::Borrowed(query),
            expando => expand_meta_vars(expando, query),
        }
    }

    fn from_path<P: AsRef<Path>>(path: P) -> Option<Self> {
        let name = path.as_ref().file_name()?.to_str()?;
        LangId::from_file_name(name)
    }

    fn kind_to_id(&self, kind: &str) -> u16 {
        self.ts_language().id_for_node_kind(kind, true)
    }

    fn field_to_id(&self, field: &str) -> Option<u16> {
        self.ts_language()
            .field_id_for_name(field)
            .map(|id| id.get())
    }

    fn build_pattern(&self, builder: &PatternBuilder) -> Result<Pattern, PatternError> {
        builder.build(|src| StrDoc::try_new(src, *self))
    }
}

impl LanguageExt for LangId {
    fn get_ts_language(&self) -> TSLanguage {
        self.ts_language()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_canonical_id_round_trips() {
        for lang in LangId::ALL {
            assert_eq!(LangId::parse(lang.as_str()), Some(lang), "{lang}");
        }
        assert_eq!(LangId::parse("COBOL"), None);
        assert_eq!(LangId::parse(""), None);
    }

    #[test]
    fn exactly_the_seven_template_languages_are_templates() {
        let templates: Vec<&str> = LangId::ALL
            .iter()
            .filter(|l| l.is_template())
            .map(|l| l.as_str())
            .collect();
        assert_eq!(
            templates,
            [
                "vue",
                "svelte",
                "astro",
                "embedded-template",
                "twig",
                "blade",
                "jinja2"
            ]
        );
    }

    #[test]
    fn file_names_map_to_languages() {
        let cases = [
            ("a.blade.php", LangId::Blade),
            ("a.php", LangId::Php),
            ("a.html.erb", LangId::EmbeddedTemplate),
            ("a.html.twig", LangId::Twig),
            ("a.html.j2", LangId::Jinja2),
            ("A.vue", LangId::Vue),
            ("a.tsx", LangId::Tsx),
            ("a.ts", LangId::TypeScript),
            ("a.jsx", LangId::JavaScript),
            ("Sample.cs", LangId::CSharp),
        ];
        for (name, lang) in cases {
            assert_eq!(LangId::from_file_name(name), Some(lang), "{name}");
        }
        assert_eq!(LangId::from_file_name("a.txt"), None);
        assert_eq!(
            <LangId as Language>::from_path("dir/x.svelte"),
            Some(LangId::Svelte)
        );
    }

    #[test]
    fn meta_variables_are_expanded_only_where_needed() {
        assert_eq!(expand_meta_vars('µ', "$A + $$$B"), "µA + µµµB");
        assert_eq!(expand_meta_vars('µ', "$ x $1 $$$"), "$ x $1 µµµ");
        assert_eq!(LangId::Tsx.pre_process_pattern("$A + $B"), "$A + $B");
        assert_eq!(LangId::Python.pre_process_pattern("$A + $B"), "µA + µB");
    }
}

//! Raw-HTML sinks (SEC-001): the places a template or JSX element renders content without the
//! framework's escaping. One detector per language, built from ast-grep matchers on the language's
//! tree-sitter grammar, plus the regex fallback of 03 § 6 (`regexSinks`) for languages without a
//! maintained grammar.
//!
//! | Language | Sink |
//! |---|---|
//! | `tsx`, `javascript` (JSX) | `dangerouslySetInnerHTML` attribute, or the same key in an object |
//! | `vue` | `v-html` directive |
//! | `svelte` | `{@html …}` |
//! | `astro` | `set:html` attribute |
//! | `embedded-template` | ERB `<%==`, `raw(…)`, `.html_safe` (the ERB code parsed as Ruby); EJS `<%-` |
//! | `twig` | `\|raw` filter, `{% autoescape false %}` |
//! | `blade` | `{!! … !!}` |
//! | `jinja2` | `\|safe` filter, `{% autoescape false %}` |
//!
//! Every other language has no raw-HTML sink of this kind: the result is empty.

use crate::lang::LangId;
use crate::tiers::RegexSinkSpec;
use ast_grep_core::matcher::{KindMatcher, Pattern};
use ast_grep_core::tree_sitter::StrDoc;
use ast_grep_core::{AstGrep, Matcher, Node};
use regex::Regex;
use std::fmt;

/// A parsed document of any [`LangId`].
pub type Doc = StrDoc<LangId>;
/// A parsed source file.
pub type Root = AstGrep<Doc>;

/// Longest `text` a [`Sink`] carries; longer matches are cut and end in `...`.
pub const MAX_SINK_TEXT: usize = 200;

/// One raw-HTML sink.
#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Sink {
    /// 1-based line of the sink.
    pub line: usize,
    /// The matched source text (cut at [`MAX_SINK_TEXT`] characters).
    pub text: String,
    /// The detector that found it, for example `v-html`.
    pub rule: &'static str,
}

/// Facts about the file that the grammar cannot tell (the file name picks EJS vs ERB).
#[derive(Clone, Copy, Debug, Default)]
pub struct SinkHints<'a> {
    /// The file's name or path, when known.
    pub file_name: Option<&'a str>,
}

impl SinkHints<'_> {
    fn is_ejs(&self) -> bool {
        self.file_name
            .is_some_and(|n| n.to_ascii_lowercase().ends_with(".ejs"))
    }
}

/// A sink detector that could not run. Always a defect in the detector or a grammar drift (a node
/// kind renamed by a grammar update), never a property of the file under analysis: a detector that
/// cannot run must not silently report "no sinks".
#[derive(Debug)]
pub enum SinkError {
    /// The grammar of `lang` has no node kind `kind`.
    UnknownKind {
        /// The language whose grammar was asked.
        lang: LangId,
        /// The kind that does not exist.
        kind: &'static str,
    },
    /// An ast-grep pattern did not build.
    Pattern {
        /// The language the pattern is for.
        lang: LangId,
        /// The pattern text.
        pattern: &'static str,
        /// The reason.
        reason: String,
    },
    /// The combined embedded code of a template did not parse as its host language at all.
    Embedded {
        /// The host language, for example `ruby`.
        lang: LangId,
        /// The reason.
        reason: String,
    },
    /// A declared regex sink is not a valid regular expression.
    Regex {
        /// The pattern.
        pattern: String,
        /// The reason.
        reason: String,
    },
}

impl fmt::Display for SinkError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SinkError::UnknownKind { lang, kind } => {
                write!(f, "the {lang} grammar has no node kind `{kind}`")
            }
            SinkError::Pattern {
                lang,
                pattern,
                reason,
            } => write!(f, "{lang} pattern `{pattern}` does not build: {reason}"),
            SinkError::Embedded { lang, reason } => {
                write!(f, "embedded {lang} code does not parse: {reason}")
            }
            SinkError::Regex { pattern, reason } => {
                write!(f, "regex sink `{pattern}` is not valid: {reason}")
            }
        }
    }
}

impl std::error::Error for SinkError {}

/// Cuts `text` to [`MAX_SINK_TEXT`] characters.
fn shorten(text: &str) -> String {
    match text.char_indices().nth(MAX_SINK_TEXT) {
        Some((cut, _)) => format!("{}...", &text[..cut]),
        None => text.to_string(),
    }
}

fn line_of(node: &Node<'_, Doc>) -> usize {
    node.start_pos().line() + 1
}

fn sink_for(rule: &'static str, at: &Node<'_, Doc>, shown: &Node<'_, Doc>) -> Sink {
    Sink {
        line: line_of(at),
        text: shorten(&shown.text()),
        rule,
    }
}

fn kind(lang: LangId, name: &'static str) -> Result<KindMatcher, SinkError> {
    KindMatcher::try_new(name, lang).map_err(|_| SinkError::UnknownKind { lang, kind: name })
}

fn contextual(lang: LangId, context: &'static str, selector: &str) -> Result<Pattern, SinkError> {
    Pattern::contextual(context, selector, lang).map_err(|e| SinkError::Pattern {
        lang,
        pattern: context,
        reason: e.to_string(),
    })
}

fn plain(lang: LangId, pattern: &'static str) -> Result<Pattern, SinkError> {
    Pattern::try_new(pattern, lang).map_err(|e| SinkError::Pattern {
        lang,
        pattern,
        reason: e.to_string(),
    })
}

/// Runs `matcher` over `root`, adding a sink per match that `accept` keeps. `accept` returns the
/// node to show (and the node whose line is reported) or `None` to drop the match.
fn collect<'r, M, F>(root: &'r Root, matcher: M, rule: &'static str, accept: F, out: &mut Vec<Sink>)
where
    M: Matcher,
    F: Fn(&Node<'r, Doc>) -> Option<Node<'r, Doc>>,
{
    for found in root.root().find_all(matcher) {
        let node: Node<'r, Doc> = (*found).clone();
        if let Some(shown) = accept(&node) {
            out.push(sink_for(rule, &node, &shown));
        }
    }
}

/// The text of the first child of `node` whose kind is `child_kind`.
fn child_text(node: &Node<'_, Doc>, child_kind: &str) -> Option<String> {
    node.children()
        .find(|c| c.kind() == child_kind)
        .map(|c| c.text().to_string())
}

/// Finds the raw-HTML sinks of `root` with the ast-grep detectors of its language.
///
/// The result is sorted by line, then text, without duplicates.
pub fn find_sinks(root: &Root, hints: SinkHints<'_>) -> Result<Vec<Sink>, SinkError> {
    let lang = *root.lang();
    let mut out = Vec::new();
    match lang {
        LangId::Tsx | LangId::JavaScript => jsx_sinks(root, lang, &mut out)?,
        LangId::Vue => vue_sinks(root, lang, &mut out)?,
        LangId::Svelte => svelte_sinks(root, lang, &mut out)?,
        LangId::Astro => astro_sinks(root, lang, &mut out)?,
        LangId::EmbeddedTemplate => erb_sinks(root, lang, hints, &mut out)?,
        LangId::Twig => twig_sinks(root, lang, &mut out)?,
        LangId::Blade => blade_sinks(root, lang, &mut out)?,
        LangId::Jinja2 => jinja_sinks(root, lang, &mut out)?,
        LangId::TypeScript
        | LangId::Python
        | LangId::Ruby
        | LangId::Php
        | LangId::Go
        | LangId::Java
        | LangId::Kotlin
        | LangId::CSharp
        | LangId::Rust
        | LangId::Html
        | LangId::Css => {}
    }
    out.sort();
    out.dedup();
    Ok(out)
}

/// JSX: `<div dangerouslySetInnerHTML={…} />`, and the prop in a plain object
/// (`React.createElement(tag, { dangerouslySetInnerHTML: … })`, spread props).
fn jsx_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    let attribute = contextual(
        lang,
        "<div dangerouslySetInnerHTML={$HTML} />",
        "jsx_attribute",
    )?;
    collect(
        root,
        attribute,
        "dangerouslySetInnerHTML",
        |n| Some(n.clone()),
        out,
    );
    let prop = contextual(lang, "({ dangerouslySetInnerHTML: $HTML })", "pair")?;
    collect(
        root,
        prop,
        "dangerouslySetInnerHTML",
        |n| Some(n.clone()),
        out,
    );
    Ok(())
}

/// Vue: the `v-html` directive on any element.
fn vue_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "directive_attribute")?,
        "v-html",
        |n| (child_text(n, "directive_name").as_deref() == Some("v-html")).then(|| n.clone()),
        out,
    );
    // `<div v-html>` (no value) is a plain attribute in the grammar.
    collect(
        root,
        kind(lang, "attribute")?,
        "v-html",
        |n| (child_text(n, "attribute_name").as_deref() == Some("v-html")).then(|| n.clone()),
        out,
    );
    Ok(())
}

/// Svelte: `{@html expression}`.
fn svelte_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "html_tag")?,
        "{@html}",
        |n| Some(n.clone()),
        out,
    );
    Ok(())
}

/// Astro: the `set:html` directive on an element or component.
fn astro_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "attribute")?,
        "set:html",
        |n| (child_text(n, "attribute_name").as_deref() == Some("set:html")).then(|| n.clone()),
        out,
    );
    Ok(())
}

/// ERB / EJS: `<%==` (Erubi raw output), `raw(…)` and `.html_safe` in the embedded Ruby, and, for
/// `.ejs` files, `<%-` (EJS unescaped output; in ERB the same token is the whitespace-trim marker,
/// so the grammar cannot tell them apart and the file name decides).
fn erb_sinks(
    root: &Root,
    lang: LangId,
    hints: SinkHints<'_>,
    out: &mut Vec<Sink>,
) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "output_directive")?,
        "<%==",
        |n| {
            let text = n.text();
            (text.starts_with("<%==") || text.starts_with("<%|==")).then(|| n.clone())
        },
        out,
    );
    if hints.is_ejs() {
        collect(
            root,
            kind(lang, "output_directive")?,
            "<%-",
            |n| n.text().starts_with("<%-").then(|| n.clone()),
            out,
        );
    }
    erb_ruby_sinks(root, lang, out)
}

/// Parses the `code` of every directive as one Ruby document (the tree-sitter "combined
/// injection"): everything outside the code is blanked to spaces, so line numbers stay those of
/// the template. Then looks for `raw(…)` and `.html_safe`.
fn erb_ruby_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    let source = root.get_text();
    let mut masked = vec![b' '; source.len()];
    for (i, b) in source.bytes().enumerate() {
        if b == b'\n' {
            masked[i] = b'\n';
        }
    }
    let mut any = false;
    for code in root.root().find_all(kind(lang, "code")?) {
        any = true;
        let range = code.range();
        masked[range.clone()].copy_from_slice(&source.as_bytes()[range]);
    }
    if !any {
        return Ok(());
    }
    let masked = String::from_utf8(masked).map_err(|e| SinkError::Embedded {
        lang: LangId::Ruby,
        reason: e.to_string(),
    })?;
    let ruby = AstGrep::try_new(&masked, LangId::Ruby).map_err(|reason| SinkError::Embedded {
        lang: LangId::Ruby,
        reason,
    })?;
    let rules: [(&'static str, &'static str); 3] = [
        ("raw()", "raw($$$ARGS)"),
        ("raw()", "$RECEIVER.raw($$$ARGS)"),
        (".html_safe", "$VALUE.html_safe"),
    ];
    for (rule, pattern) in rules {
        let matcher = plain(LangId::Ruby, pattern)?;
        for found in ruby.root().find_all(matcher) {
            out.push(Sink {
                line: found.start_pos().line() + 1,
                text: shorten(&found.text()),
                rule,
            });
        }
    }
    Ok(())
}

/// Twig: the `raw` filter, and `{% autoescape false %}`.
fn twig_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "filter")?,
        "|raw",
        |n| {
            if child_text(n, "filter_identifier").as_deref() != Some("raw") {
                return None;
            }
            // Show `{{ value|raw }}` when the filter sits directly in an output directive.
            Some(match n.parent() {
                Some(p) if p.kind() == "output_directive" => p,
                _ => n.clone(),
            })
        },
        out,
    );
    collect(
        root,
        kind(lang, "tag_statement")?,
        "autoescape false",
        |n| {
            let is_autoescape = child_text(n, "tag").as_deref() == Some("autoescape");
            let is_false =
                child_text(n, "boolean").is_some_and(|b| b.eq_ignore_ascii_case("false"));
            (is_autoescape && is_false).then(|| n.clone())
        },
        out,
    );
    Ok(())
}

/// Blade: `{!! … !!}`.
fn blade_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "php_statement")?,
        "{!! !!}",
        |n| n.text().starts_with("{!!").then(|| n.clone()),
        out,
    );
    Ok(())
}

/// Jinja2: the `safe` filter, and `{% autoescape false %}`.
///
/// The grammar models a filter application `value|name` as a `binary_expression` whose operator is
/// `|` (children: value, `binary_operator`, name); `|safe` is such an expression whose right
/// operand is exactly `safe`.
fn jinja_sinks(root: &Root, lang: LangId, out: &mut Vec<Sink>) -> Result<(), SinkError> {
    collect(
        root,
        kind(lang, "binary_expression")?,
        "|safe",
        |n| {
            let mut children = n.children();
            let applies_safe = children
                .by_ref()
                .any(|c| c.kind() == "binary_operator" && c.text() == "|")
                && children
                    .next()
                    .is_some_and(|operand| operand.text() == "safe");
            applies_safe.then(|| n.clone())
        },
        out,
    );
    collect(
        root,
        kind(lang, "autoescape_statement")?,
        "autoescape false",
        |n| {
            let flag = n.children().find(|c| c.kind() == "boolean_literal")?;
            flag.text().eq_ignore_ascii_case("false").then(|| n.clone())
        },
        out,
    );
    Ok(())
}

/// The regex fallback (03 § 6 `regexSinks`): every match of every declared pattern is a sink at the
/// line where the match starts. The patterns see the whole file, so they may span lines.
pub fn find_regex_sinks(source: &str, specs: &[RegexSinkSpec]) -> Result<Vec<Sink>, SinkError> {
    let mut out = Vec::new();
    for spec in specs {
        let re = Regex::new(&spec.pattern).map_err(|e| SinkError::Regex {
            pattern: spec.pattern.clone(),
            reason: e.to_string(),
        })?;
        for m in re.find_iter(source) {
            let line = source[..m.start()].bytes().filter(|b| *b == b'\n').count() + 1;
            out.push(Sink {
                line,
                text: shorten(m.as_str()),
                rule: "regexSinks",
            });
        }
    }
    out.sort();
    out.dedup();
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lines(lang: LangId, src: &str) -> Vec<usize> {
        lines_hinted(lang, src, SinkHints::default())
    }

    fn lines_hinted(lang: LangId, src: &str, hints: SinkHints<'_>) -> Vec<usize> {
        let root = AstGrep::try_new(src, lang).expect("parses");
        let sinks = find_sinks(&root, hints).expect("detectors run");
        let mut l: Vec<usize> = sinks.iter().map(|s| s.line).collect();
        l.dedup();
        l
    }

    #[test]
    fn jsx_attribute_and_object_prop() {
        let src = "const a = <div dangerouslySetInnerHTML={{ __html: h }} />;\n\
                   const b = <p>{h}</p>;\n\
                   const c = React.createElement('div', { dangerouslySetInnerHTML: { __html: h } });\n\
                   const d = <section {...{ dangerouslySetInnerHTML: x }} />;\n";
        assert_eq!(lines(LangId::Tsx, src), [1, 3, 4]);
        assert_eq!(lines(LangId::JavaScript, src), [1, 3, 4]);
        // The TypeScript grammar has no JSX and finds nothing.
        assert!(
            lines(
                LangId::TypeScript,
                "const a = { dangerouslySetInnerHTML: x };"
            )
            .is_empty()
        );
    }

    #[test]
    fn vue_v_html_only() {
        let src = "<template>\n<div v-html=\"a\"></div>\n<p :title=\"b\">{{ c }}</p>\n<i v-text=\"d\" />\n<b v-html></b>\n</template>\n";
        assert_eq!(lines(LangId::Vue, src), [2, 5]);
    }

    #[test]
    fn svelte_html_tag_only() {
        let src = "<p>{a}</p>\n{@html b}\n{@const c = 1}\n";
        assert_eq!(lines(LangId::Svelte, src), [2]);
    }

    #[test]
    fn astro_set_html_only() {
        let src = "---\nconst a = 1;\n---\n<Fragment set:html={a} />\n<p set:text={a}></p>\n<div set:html={a} class=\"x\"></div>\n";
        assert_eq!(lines(LangId::Astro, src), [4, 6]);
    }

    #[test]
    fn erb_double_equals_raw_and_html_safe() {
        let src = "<%= a %>\n<%== b %>\n<%= raw(c) %>\n<%= d.html_safe %>\n<%= helpers.raw(e) %>\n<%# raw(f) %>\n<%= sanitize(g) %>\n";
        assert_eq!(lines(LangId::EmbeddedTemplate, src), [2, 3, 4, 5]);
    }

    #[test]
    fn ejs_unescaped_output_needs_an_ejs_file_name() {
        let src = "<%= a %>\n<%- b %>\n<% if (c) { %>x<% } %>\n";
        assert!(lines(LangId::EmbeddedTemplate, src).is_empty());
        let ejs = SinkHints {
            file_name: Some("views/index.ejs"),
        };
        assert_eq!(lines_hinted(LangId::EmbeddedTemplate, src, ejs), [2]);
    }

    #[test]
    fn twig_raw_filter_and_autoescape_false() {
        let src = "{{ a }}\n{{ b|raw }}\n{{ c|escape|raw }}\n{{ d|upper }}\n{% autoescape false %}{{ e }}{% endautoescape %}\n{% autoescape 'html' %}{% endautoescape %}\n";
        assert_eq!(lines(LangId::Twig, src), [2, 3, 5]);
    }

    #[test]
    fn blade_unescaped_echo_only() {
        let src =
            "{{ $a }}\n{!! $b !!}\n<p>{{ $c }}</p>\n<i>{!! $d !!}</i>\n{{-- {!! $e !!} --}}\n";
        let got = lines(LangId::Blade, src);
        assert_eq!(got[..2], [2, 4]);
    }

    #[test]
    fn jinja_safe_filter_and_autoescape_false() {
        let src = "{{ a }}\n{{ b|safe }}\n{{ c|default('')|safe }}\n{{ d|e }}\n{% autoescape false %}{{ e }}{% endautoescape %}\n{% autoescape true %}{% endautoescape %}\n";
        assert_eq!(lines(LangId::Jinja2, src), [2, 3, 5]);
    }

    #[test]
    fn languages_without_template_sinks_report_none() {
        assert!(lines(LangId::Python, "x = 1\n").is_empty());
        assert!(lines(LangId::Html, "<div onclick=\"x\">y</div>").is_empty());
    }

    #[test]
    fn regex_sinks_report_the_line_a_match_starts_on() {
        let specs = [RegexSinkSpec {
            pattern: r"\{!!".to_string(),
            precision: 0.9,
        }];
        let sinks = find_regex_sinks("a\n{!! b !!}\nc {!! d !!}\n", &specs).expect("valid");
        assert_eq!(sinks.iter().map(|s| s.line).collect::<Vec<_>>(), [2, 3]);
        assert!(
            find_regex_sinks(
                "x",
                &[RegexSinkSpec {
                    pattern: "(".to_string(),
                    precision: 1.0,
                }]
            )
            .is_err()
        );
    }

    #[test]
    fn long_matches_are_cut() {
        let long = "x".repeat(300);
        let cut = shorten(&long);
        assert_eq!(cut.len(), MAX_SINK_TEXT + 3);
        assert!(cut.ends_with("..."));
        assert_eq!(shorten("short"), "short");
    }

    #[test]
    fn every_detector_kind_exists_in_its_grammar() {
        // A grammar update that renames a node kind must fail here, not silently find nothing.
        let probes: [(LangId, &[&str]); 8] = [
            (LangId::Vue, &["directive_attribute", "attribute"]),
            (LangId::Svelte, &["html_tag"]),
            (LangId::Astro, &["attribute"]),
            (LangId::EmbeddedTemplate, &["output_directive", "code"]),
            (LangId::Twig, &["filter", "tag_statement"]),
            (LangId::Blade, &["php_statement"]),
            (
                LangId::Jinja2,
                &[
                    "binary_expression",
                    "autoescape_statement",
                    "boolean_literal",
                ],
            ),
            (LangId::Tsx, &["jsx_attribute", "pair"]),
        ];
        for (lang, kinds) in probes {
            for k in kinds {
                assert!(kind(lang, k).is_ok(), "{lang} has no kind `{k}`");
            }
        }
        assert!(kind(LangId::Vue, "no_such_kind").is_err());
    }
}

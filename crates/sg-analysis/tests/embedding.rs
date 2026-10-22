//! Does `ast-grep-core` really embed each grammar? One smoke case per language: parse a snippet,
//! match a node kind, and (where the grammar allows a pattern to parse on its own) match an
//! ast-grep pattern with meta variables. These are the measurements behind the `embedding` field
//! of `rules/grammar-tiers.json`.

use ast_grep_core::matcher::{KindMatcher, Pattern};
use ast_grep_core::tree_sitter::LanguageExt;
use sg_analysis::{LangId, count_error_nodes, parse};

/// One language's smoke case.
struct Case {
    lang: LangId,
    source: &'static str,
    /// A named node kind that must occur in the parse of `source`.
    kind: &'static str,
    /// An ast-grep pattern (with `$META` variables) that must match `source` exactly `matches`
    /// times, or `None` where the grammar cannot parse a bare pattern.
    pattern: Option<(&'static str, usize)>,
}

const CASES: &[Case] = &[
    Case {
        lang: LangId::TypeScript,
        source: "export function add(a: number, b: number): number { return a + b; }\n",
        kind: "function_declaration",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::Tsx,
        source: "export const Card = ({ a, b }: P) => <div>{a + b}</div>;\n",
        kind: "jsx_element",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::JavaScript,
        source: "const sum = (a, b) => a + b;\n",
        kind: "arrow_function",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::Python,
        source: "def add(a, b):\n    return a + b\n",
        kind: "function_definition",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::Ruby,
        source: "def add(a, b)\n  a + b\nend\n",
        kind: "method",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::Php,
        source: "<?php\nfunction add(int $a, int $b): int { return $a + $b; }\n",
        kind: "function_definition",
        pattern: None,
    },
    Case {
        lang: LangId::Go,
        source: "package p\n\nfunc add(a, b int) int { return a + b }\n",
        kind: "function_declaration",
        pattern: Some(("return $A + $B", 1)),
    },
    Case {
        lang: LangId::Java,
        source: "class A { int add(int a, int b) { return a + b; } }\n",
        kind: "method_declaration",
        pattern: Some(("return $A + $B;", 1)),
    },
    Case {
        lang: LangId::Kotlin,
        source: "fun add(a: Int, b: Int): Int = a + b\n",
        kind: "function_declaration",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::CSharp,
        source: "class A { int Add(int a, int b) { return a + b; } }\n",
        kind: "method_declaration",
        pattern: Some(("return $A + $B;", 1)),
    },
    Case {
        lang: LangId::Rust,
        source: "fn add(a: i32, b: i32) -> i32 { a + b }\n",
        kind: "function_item",
        pattern: Some(("$A + $B", 1)),
    },
    Case {
        lang: LangId::Html,
        source: "<!doctype html><html><body><main><h1>x</h1></main></body></html>\n",
        kind: "element",
        pattern: Some(("<h1>$A</h1>", 1)),
    },
    Case {
        lang: LangId::Css,
        source: "a { color: red; }\n",
        kind: "rule_set",
        pattern: Some(("a { color: $A; }", 1)),
    },
    Case {
        lang: LangId::Vue,
        source: "<template>\n  <div v-html=\"body\"></div>\n</template>\n",
        kind: "directive_attribute",
        pattern: None,
    },
    Case {
        lang: LangId::Svelte,
        source: "<h1>{title}</h1>\n{@html body}\n",
        kind: "html_tag",
        pattern: None,
    },
    Case {
        lang: LangId::Astro,
        source: "---\nconst a = 1;\n---\n<Fragment set:html={a} />\n",
        kind: "frontmatter",
        pattern: None,
    },
    Case {
        lang: LangId::EmbeddedTemplate,
        source: "<h1><%= @title %></h1>\n<%== @body %>\n",
        kind: "output_directive",
        pattern: None,
    },
    Case {
        lang: LangId::Twig,
        source: "<h1>{{ title }}</h1>\n{{ body|raw }}\n",
        kind: "filter",
        pattern: None,
    },
    Case {
        lang: LangId::Blade,
        source: "<h1>{{ $title }}</h1>\n{!! $body !!}\n",
        kind: "php_statement",
        pattern: None,
    },
    Case {
        lang: LangId::Jinja2,
        source: "<h1>{{ title }}</h1>\n{{ body|safe }}\n",
        kind: "render_expression",
        pattern: None,
    },
];

#[test]
fn every_language_has_a_smoke_case() {
    for lang in LangId::ALL {
        assert!(CASES.iter().any(|c| c.lang == lang), "no case for {lang}");
    }
    assert_eq!(CASES.len(), LangId::ALL.len());
}

#[test]
fn every_grammar_parses_without_errors_and_matches_by_kind() {
    let mut problems = Vec::new();
    for case in CASES {
        let root = match parse(case.lang, case.source) {
            Ok(r) => r,
            Err(e) => {
                problems.push(format!("{}: {e}", case.lang));
                continue;
            }
        };
        let errors = count_error_nodes(&root);
        if errors != 0 {
            problems.push(format!(
                "{}: {errors} ERROR/MISSING nodes in the smoke snippet",
                case.lang
            ));
        }
        match KindMatcher::try_new(case.kind, case.lang) {
            Ok(matcher) => {
                if root.root().find_all(matcher).next().is_none() {
                    problems.push(format!("{}: no `{}` node found", case.lang, case.kind));
                }
            }
            Err(_) => problems.push(format!(
                "{}: grammar has no kind `{}`",
                case.lang, case.kind
            )),
        }
    }
    assert!(problems.is_empty(), "{}", problems.join("\n"));
}

#[test]
fn ast_grep_patterns_with_meta_variables_match_where_the_grammar_allows() {
    let mut problems = Vec::new();
    for case in CASES {
        let Some((pattern, want)) = case.pattern else {
            continue;
        };
        let root = match parse(case.lang, case.source) {
            Ok(r) => r,
            Err(e) => {
                problems.push(format!("{}: {e}", case.lang));
                continue;
            }
        };
        match Pattern::try_new(pattern, case.lang) {
            Ok(p) => {
                let got = root.root().find_all(p).count();
                if got != want {
                    problems.push(format!(
                        "{}: pattern `{pattern}` matched {got} times, wanted {want}",
                        case.lang
                    ));
                }
            }
            Err(e) => problems.push(format!(
                "{}: pattern `{pattern}` does not build: {e}",
                case.lang
            )),
        }
    }
    assert!(problems.is_empty(), "{}", problems.join("\n"));
}

#[test]
fn broken_source_is_counted_as_errors() {
    // The probe's error count must see ERROR and MISSING nodes, or "0 errors" proves nothing.
    let broken: &[(LangId, &str)] = &[
        (LangId::TypeScript, "function add(a: number { return ; \n"),
        (LangId::Python, "def add(a, b:\n  return a +\n"),
        (LangId::Ruby, "def add(a, b\n  a +\n"),
        (LangId::Go, "package p\nfunc add( { return\n"),
        (LangId::Rust, "fn add(a: i32 -> { a +\n"),
        (LangId::Html, "<div><p></div></p><\n"),
        (LangId::Css, "a { color: ; ;} }}\n"),
        (LangId::Vue, "<template><div v-html=\"</template>\n"),
        (LangId::Svelte, "{#if a}<p>{/each}\n"),
        (LangId::Twig, "{% for %}{{ a| }}{% endif %}\n"),
        (LangId::Blade, "@foreach($a as\n{!! $b\n"),
    ];
    for (lang, src) in broken {
        let root = parse(*lang, src).expect("tree-sitter always returns a tree");
        assert!(
            count_error_nodes(&root) > 0,
            "{lang}: broken source counted clean"
        );
    }
}

#[test]
fn each_language_is_backed_by_its_own_grammar() {
    // Several grammar crates export the same C symbol (`tree_sitter_vue`, `tree_sitter_jinja`, ...);
    // when two are linked, both names silently resolve to one grammar. The grammar's own name
    // (ABI 15 metadata) proves the right one is behind each id.
    let expected: &[(LangId, &str)] = &[
        (LangId::TypeScript, "typescript"),
        (LangId::Tsx, "tsx"),
        (LangId::JavaScript, "javascript"),
        (LangId::Python, "python"),
        (LangId::Ruby, "ruby"),
        (LangId::Go, "go"),
        (LangId::Java, "java"),
        (LangId::Rust, "rust"),
        (LangId::Html, "html"),
        (LangId::Css, "css"),
        (LangId::Vue, "vue"),
        (LangId::Svelte, "svelte"),
        (LangId::Astro, "astro"),
        (LangId::EmbeddedTemplate, "embedded_template"),
        (LangId::Twig, "twig"),
        (LangId::Blade, "blade"),
    ];
    let mut named = 0;
    for (lang, name) in expected {
        // Grammars generated before ABI 15 metadata carry no name; the others must match.
        if let Some(actual) = lang.get_ts_language().name() {
            assert_eq!(actual, *name, "{lang}");
            named += 1;
        }
    }
    assert!(
        named > 0,
        "no grammar reported a name: the check measures nothing"
    );
}

//! Repository tasks behind `cargo xtask` (alias in `.cargo/config.toml`).
//!
//! `stub-scan` implements BUILD_MAP § 4.1 item 7: unfinished-work markers in comments, `todo!` and
//! `unimplemented!` calls, and `#[ignore]` without a reason fail the build. String literals and
//! data values are not scanned for marker words, because the MET-008 leak scan (spec 04 § 12) must
//! list them.

use regex::Regex;
use std::fs;
use std::io;
use std::path::{Path, PathBuf};

/// Directories scanned, relative to the repository root.
pub const SCANNED_DIRS: &[&str] = &["crates", "sidecar/src", "rules", "adapters"];

/// One stub-scan hit.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Hit {
    /// Path relative to the scanned root, with `/` separators.
    pub path: String,
    /// 1-based line number.
    pub line: usize,
    /// What was found.
    pub what: String,
}

/// The comment syntax of a scanned file, decided by its extension.
#[derive(Clone, Copy)]
enum Syntax {
    /// `//` and `/* … */` comments (Rust, TypeScript, JavaScript).
    Slashes,
    /// `#` comments (YAML, TOML).
    Hash,
    /// No comments (JSON); only nothing is scanned.
    None,
}

fn syntax_of(path: &Path) -> Option<Syntax> {
    let ext = path.extension()?.to_str()?.to_ascii_lowercase();
    match ext.as_str() {
        "rs" | "ts" | "tsx" | "mts" | "cts" | "js" | "mjs" | "cjs" | "jsx" => Some(Syntax::Slashes),
        "yml" | "yaml" | "toml" => Some(Syntax::Hash),
        "json" | "jsonl" => Some(Syntax::None),
        _ => None,
    }
}

struct Patterns {
    marker: Regex,
    macro_call: Regex,
}

impl Patterns {
    fn new() -> Self {
        Self {
            marker: Regex::new(r"(?i:\bnot yet implemented\b)|\bTODO\b|\bFIXME\b|\bXXX\b|\bunimplemented\b|(?i:^\W*stub\b)").expect("static regex"),
            macro_call: Regex::new(r"\b(todo|unimplemented)!\s*\(").expect("static regex"),
        }
    }
}

/// Returns the comment text of `line`, given whether a `/* … */` block is open at its start, and
/// whether one is still open at its end. Quotes are tracked so that `//` inside a string literal
/// doesn't start a comment.
fn comment_text(line: &str, syntax: Syntax, mut in_block: bool) -> (String, bool) {
    let mut out = String::new();
    match syntax {
        Syntax::None => return (out, false),
        Syntax::Hash => {
            // A YAML/TOML comment starts at a `#` at line start or after whitespace, outside a
            // double-quoted string (an even number of unescaped `"` before it).
            let mut quotes = 0usize;
            let mut prev: Option<char> = None;
            for (i, c) in line.char_indices() {
                if c == '"' && prev != Some('\\') {
                    quotes += 1;
                } else if c == '#'
                    && quotes.is_multiple_of(2)
                    && prev.is_none_or(char::is_whitespace)
                {
                    out.push_str(&line[i + 1..]);
                    break;
                }
                prev = Some(c);
            }
            return (out, false);
        }
        Syntax::Slashes => {}
    }
    let bytes = line.as_bytes();
    let mut i = 0;
    let mut quote: Option<u8> = None;
    while i < bytes.len() {
        if in_block {
            if bytes[i..].starts_with(b"*/") {
                in_block = false;
                out.push(' ');
                i += 2;
            } else {
                let ch = line[i..].chars().next().unwrap_or(' ');
                out.push(ch);
                i += ch.len_utf8();
            }
            continue;
        }
        let b = bytes[i];
        if let Some(q) = quote {
            if b == b'\\' {
                i += 2;
                continue;
            }
            if b == q {
                quote = None;
            }
            i += 1;
            continue;
        }
        if b == b'"' || b == b'`' {
            quote = Some(b);
        } else if bytes[i..].starts_with(b"//") {
            out.push_str(&line[i + 2..]);
            break;
        } else if bytes[i..].starts_with(b"/*") {
            in_block = true;
            i += 2;
            continue;
        }
        i += 1;
    }
    (out, in_block)
}

fn scan_text(rel: &str, text: &str, syntax: Syntax, pats: &Patterns, hits: &mut Vec<Hit>) {
    let mut in_block = false;
    let mut prev = "";
    let rust_like = matches!(syntax, Syntax::Slashes);
    for (n, line) in text.lines().enumerate() {
        let (comment, still_open) = comment_text(line, syntax, in_block);
        in_block = still_open;
        if let Some(m) = pats.marker.find(&comment) {
            let word = m
                .as_str()
                .trim_start_matches(|c: char| !c.is_alphanumeric());
            hits.push(Hit {
                path: rel.to_string(),
                line: n + 1,
                what: format!("marker `{word}` in a comment"),
            });
        }
        if rust_like {
            let code = match line.find("//") {
                Some(k) => &line[..k],
                None => line,
            };
            if let Some(m) = pats.macro_call.find(code) {
                hits.push(Hit {
                    path: rel.to_string(),
                    line: n + 1,
                    what: format!("`{}` call", m.as_str().trim_end_matches(['(', ' '])),
                });
            }
            if code.contains("#[ignore")
                && !line.contains("// ignore-reason:")
                && !prev.contains("// ignore-reason:")
            {
                hits.push(Hit {
                    path: rel.to_string(),
                    line: n + 1,
                    what: "`#[ignore]` without an `// ignore-reason:` comment".to_string(),
                });
            }
        }
        prev = line;
    }
}

fn walk(dir: &Path, out: &mut Vec<PathBuf>) -> io::Result<()> {
    if !dir.is_dir() {
        return Ok(());
    }
    let mut entries: Vec<_> = fs::read_dir(dir)?.collect::<Result<_, _>>()?;
    entries.sort_by_key(|e| e.file_name());
    for e in entries {
        let p = e.path();
        if e.file_type()?.is_dir() {
            if e.file_name() == "target" || e.file_name() == "node_modules" {
                continue;
            }
            walk(&p, out)?;
        } else {
            out.push(p);
        }
    }
    Ok(())
}

/// Scans `SCANNED_DIRS` under `root` and returns every hit, in path and line order.
pub fn stub_scan(root: &Path) -> io::Result<Vec<Hit>> {
    let pats = Patterns::new();
    let mut hits = Vec::new();
    for d in SCANNED_DIRS {
        let mut files = Vec::new();
        walk(&root.join(d), &mut files)?;
        for f in files {
            let Some(syntax) = syntax_of(&f) else {
                continue;
            };
            let Ok(text) = fs::read_to_string(&f) else {
                continue;
            };
            let rel = f
                .strip_prefix(root)
                .unwrap_or(&f)
                .to_string_lossy()
                .replace('\\', "/");
            scan_text(&rel, &text, syntax, &pats, &mut hits);
        }
    }
    Ok(hits)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn scan(name: &str, text: &str) -> Vec<Hit> {
        let syntax = syntax_of(Path::new(name)).expect("known extension");
        let mut hits = Vec::new();
        scan_text(name, text, syntax, &Patterns::new(), &mut hits);
        hits
    }

    #[test]
    fn comment_markers_are_hits() {
        assert_eq!(scan("a.rs", "fn f() {} // TODO finish\n").len(), 1);
        assert_eq!(scan("a.rs", "/* FIXME */ fn f() {}\n").len(), 1);
        assert_eq!(scan("a.rs", "/*\n not yet implemented\n*/\n").len(), 1);
        assert_eq!(scan("a.rs", "// stub\nfn f() {}\n").len(), 1);
        assert_eq!(scan("a.ts", "const x = 1; // XXX\n").len(), 1);
        assert_eq!(scan("a.yml", "id: X # TODO\n").len(), 1);
    }

    #[test]
    fn strings_data_and_identifiers_are_not_hits() {
        assert!(
            scan(
                "a.rs",
                "const WORDS: &[&str] = &[\"TODO\", \"FIXME\", \"undefined\"];\n"
            )
            .is_empty()
        );
        assert!(scan("a.rs", "let url = \"https://x.test/TODO\";\n").is_empty());
        assert!(scan("a.rs", "let egressStubs = 1; // the stubs table\n").is_empty());
        assert!(scan("a.json", "{\"words\": [\"TODO\", \"FIXME\"]}\n").is_empty());
        assert!(scan("a.yml", "words: [\"TODO # not a comment\"]\n").is_empty());
    }

    #[test]
    fn macro_calls_are_hits() {
        assert_eq!(scan("a.rs", "fn f() { todo!() }\n").len(), 1);
        assert_eq!(scan("a.rs", "fn f() { unimplemented!(\"x\") }\n").len(), 1);
    }

    #[test]
    fn ignore_needs_a_reason() {
        assert_eq!(scan("a.rs", "#[test]\n#[ignore]\nfn t() {}\n").len(), 1);
        assert!(
            scan(
                "a.rs",
                "#[test]\n// ignore-reason: needs a browser\n#[ignore]\nfn t() {}\n"
            )
            .is_empty()
        );
        assert!(scan("a.rs", "#[ignore] // ignore-reason: slow\nfn t() {}\n").is_empty());
    }

    #[test]
    fn scan_walks_only_scanned_dirs() {
        let dir = std::env::temp_dir().join(format!("sg-stub-scan-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(dir.join("crates/a/src")).expect("mkdir");
        fs::create_dir_all(dir.join("docs")).expect("mkdir");
        fs::write(dir.join("crates/a/src/lib.rs"), "// TODO\n").expect("write");
        fs::write(dir.join("docs/x.rs"), "// TODO\n").expect("write");
        let hits = stub_scan(&dir).expect("scan");
        fs::remove_dir_all(&dir).expect("cleanup");
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].path, "crates/a/src/lib.rs");
    }
}

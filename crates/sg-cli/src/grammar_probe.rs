//! `shipgate dev grammar-probe --lang <id> --file <path> [--json]` (spec/05 § 1, hidden).
//!
//! Parses one file with the source-analysis engine of 02 § 4 for the language and prints
//! `{ formatVersion, lang, engine, parsed, errorNodes, sinks: [{ line, text }] }`. Writes nothing.
//! Exit 0, or 3 for an unknown language, an unreadable file or a bad argument.

use crate::EXIT_TOOL_ERROR;
use sg_analysis::{ProbeReport, probe};
use std::process::ExitCode;

/// What the command line asked for.
#[derive(Debug, PartialEq, Eq)]
struct Args {
    lang: String,
    file: String,
    json: bool,
}

/// Reads `--lang`, `--file`, `--json` and `--format text|json` (any order, `--flag=value` too).
fn parse_args(rest: &[&str]) -> Result<Args, String> {
    let mut lang = None;
    let mut file = None;
    let mut format: Option<&str> = None;
    let mut json_flag = false;
    let mut i = 0;
    while i < rest.len() {
        let word = rest[i];
        let (name, inline) = match word.split_once('=') {
            Some((n, v)) if n.starts_with("--") => (n, Some(v)),
            _ => (word, None),
        };
        let mut value = |what: &str| -> Result<&str, String> {
            if let Some(v) = inline {
                return Ok(v);
            }
            i += 1;
            rest.get(i)
                .copied()
                .ok_or_else(|| format!("{what} needs a value"))
        };
        match name {
            "--lang" => lang = Some(value("--lang")?.to_string()),
            "--file" => file = Some(value("--file")?.to_string()),
            "--format" => format = Some(value("--format")?),
            "--json" => json_flag = true,
            "--quiet" | "--no-color" | "--no-cache" => {}
            other => return Err(format!("unknown argument `{other}`")),
        }
        i += 1;
    }
    if json_flag && format.is_some_and(|f| f != "json") {
        return Err("--json and --format disagree".to_string());
    }
    let json = match (json_flag, format) {
        (true, _) | (false, Some("json")) => true,
        (false, None | Some("text")) => false,
        (false, Some(other)) => {
            return Err(format!("unsupported --format `{other}` (text or json)"));
        }
    };
    Ok(Args {
        lang: lang.ok_or("--lang <id> is required")?,
        file: file.ok_or("--file <path> is required")?,
        json,
    })
}

/// Decodes file bytes: lossy UTF-8 (a stray byte must not hide the rest of the file) without a
/// leading byte-order mark, which the grammars would report as an error.
fn decode(bytes: &[u8]) -> String {
    let text = String::from_utf8_lossy(bytes);
    text.strip_prefix('\u{feff}').unwrap_or(&text).to_string()
}

fn print_text(report: &ProbeReport) {
    println!("lang: {}", report.lang);
    println!("engine: {}", report.engine);
    println!("parsed: {}", report.parsed);
    println!("errorNodes: {}", report.error_nodes);
    println!("sinks: {}", report.sinks.len());
    for sink in &report.sinks {
        println!("  line {}: {}", sink.line, sink.text);
    }
}

/// Runs the command; `rest` is everything after `dev grammar-probe`.
pub fn run(rest: &[&str]) -> ExitCode {
    let args = match parse_args(rest) {
        Ok(a) => a,
        Err(e) => {
            eprintln!("shipgate dev grammar-probe: {e}");
            return ExitCode::from(EXIT_TOOL_ERROR);
        }
    };
    let bytes = match std::fs::read(&args.file) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("shipgate dev grammar-probe: cannot read {}: {e}", args.file);
            return ExitCode::from(EXIT_TOOL_ERROR);
        }
    };
    let file_name = std::path::Path::new(&args.file)
        .file_name()
        .and_then(|n| n.to_str());
    let report = match probe(&args.lang, &decode(&bytes), file_name) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("shipgate dev grammar-probe: {e}");
            return ExitCode::from(EXIT_TOOL_ERROR);
        }
    };
    if args.json {
        match serde_json::to_string(&report) {
            Ok(text) => println!("{text}"),
            Err(e) => {
                eprintln!("shipgate dev grammar-probe: cannot serialise the report: {e}");
                return ExitCode::from(EXIT_TOOL_ERROR);
            }
        }
    } else {
        print_text(&report);
    }
    ExitCode::SUCCESS
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flags_in_any_order_and_both_spellings() {
        let a = parse_args(&["--file", "x.vue", "--json", "--lang", "vue"]).expect("valid");
        assert_eq!(
            a,
            Args {
                lang: "vue".into(),
                file: "x.vue".into(),
                json: true
            }
        );
        let b = parse_args(&["--lang=twig", "--file=a.twig", "--format=json"]).expect("valid");
        assert!(b.json && b.lang == "twig" && b.file == "a.twig");
        assert!(
            !parse_args(&["--lang", "go", "--file", "a.go"])
                .expect("valid")
                .json
        );
    }

    #[test]
    fn bad_arguments_are_refused() {
        assert!(parse_args(&["--file", "a"]).is_err());
        assert!(parse_args(&["--lang", "go"]).is_err());
        assert!(parse_args(&["--lang"]).is_err());
        assert!(parse_args(&["--lang", "go", "--file", "a", "--bogus"]).is_err());
        assert!(
            parse_args(&["--lang", "go", "--file", "a", "--json", "--format", "text"]).is_err()
        );
        assert!(parse_args(&["--lang", "go", "--file", "a", "--format", "sarif"]).is_err());
    }

    #[test]
    fn a_byte_order_mark_is_dropped() {
        assert_eq!(decode(b"\xEF\xBB\xBFabc"), "abc");
        assert_eq!(decode(b"a\xFFb"), "a\u{fffd}b");
    }
}

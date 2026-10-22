//! `shipgate` binary. WP-000 shipped what the build's own gates need: `version` and the registry
//! export `rule --list --json` (BUILD_MAP § 4.1 item 5), which lists the rules this binary
//! implements — none yet. WP-103 adds the hidden `dev grammar-probe` (spec/05 § 1). The full
//! command tree of spec/05 § 1 is WP-208.

mod grammar_probe;

use std::process::ExitCode;

/// Exit code for a tool error (spec/05 § 1).
pub(crate) const EXIT_TOOL_ERROR: u8 = 3;

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let words: Vec<&str> = args.iter().map(String::as_str).collect();
    match words.as_slice() {
        ["version"] | ["--version"] => {
            println!("shipgate {}", env!("CARGO_PKG_VERSION"));
            ExitCode::SUCCESS
        }
        ["rule", "--list", "--json"]
        | ["--json", "rule", "--list"]
        | ["rule", "--json", "--list"] => {
            // spec/05 § 1 machine-readable shape; no ruleset is embedded until WP-206.
            println!(r#"{{"formatVersion":1,"ruleset":null,"rules":[]}}"#);
            ExitCode::SUCCESS
        }
        ["rule", "--list"] => {
            println!("no rules are implemented in this build");
            ExitCode::SUCCESS
        }
        ["dev", "grammar-probe", rest @ ..] => grammar_probe::run(rest),
        _ => {
            eprintln!(
                "shipgate: unknown command `{}` in this build",
                words.join(" ")
            );
            ExitCode::from(EXIT_TOOL_ERROR)
        }
    }
}

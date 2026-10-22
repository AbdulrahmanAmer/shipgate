//! `cargo xtask <task>`. Tasks: `stub-scan` (BUILD_MAP § 4.1 item 7). Later WPs add `corpus`
//! (WP-209), schema generation (WP-202), feature-table refresh (WP-104), release and notices.

use std::path::PathBuf;
use std::process::ExitCode;

fn repo_root() -> PathBuf {
    // xtask/ sits directly under the repository root.
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .map(PathBuf::from)
        .unwrap_or_default()
}

fn main() -> ExitCode {
    let task = std::env::args().nth(1).unwrap_or_default();
    match task.as_str() {
        "stub-scan" => match xtask::stub_scan(&repo_root()) {
            Ok(hits) if hits.is_empty() => {
                println!("stub-scan: clean ({})", xtask::SCANNED_DIRS.join(", "));
                ExitCode::SUCCESS
            }
            Ok(hits) => {
                for h in &hits {
                    println!("{}:{}: {}", h.path, h.line, h.what);
                }
                println!("stub-scan: {} hit(s)", hits.len());
                ExitCode::FAILURE
            }
            Err(e) => {
                eprintln!("stub-scan: {e}");
                ExitCode::from(3)
            }
        },
        other => {
            eprintln!("xtask: unknown task `{other}` (known: stub-scan)");
            ExitCode::from(2)
        }
    }
}

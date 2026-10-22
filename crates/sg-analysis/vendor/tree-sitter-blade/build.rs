//! Compiles the vendored, generated Blade parser (`src/parser.c`) and its external scanner.

fn main() {
    let src_dir = std::path::Path::new("src");
    let parser = src_dir.join("parser.c");
    let scanner = src_dir.join("scanner.c");

    let mut build = cc::Build::new();
    build.std("c11").include(src_dir).warnings(false);
    #[cfg(target_env = "msvc")]
    build.flag("-utf-8");
    build.file(&parser);
    build.file(&scanner);
    build.compile("tree-sitter-blade");

    println!("cargo:rerun-if-changed={}", parser.display());
    println!("cargo:rerun-if-changed={}", scanner.display());
}

//! Compiles the vendored, generated Twig parser (`src/parser.c`).

fn main() {
    let src_dir = std::path::Path::new("src");
    let parser = src_dir.join("parser.c");

    let mut build = cc::Build::new();
    build.include(src_dir).warnings(false);
    #[cfg(target_env = "msvc")]
    build.flag("-utf-8");
    build.file(&parser);
    build.compile("tree-sitter-twig");

    println!("cargo:rerun-if-changed={}", parser.display());
}

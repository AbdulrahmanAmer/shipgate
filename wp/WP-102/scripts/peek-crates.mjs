// crates.io lookups: for each crate name print newest non-yanked version, licence, update date and downloads;
// for each "q:<text>" argument print the top search hits. Uses the crates.io API (needs a User-Agent).
import { getJson } from "./lib.mjs";
for (const a of process.argv.slice(2)) {
  try {
    if (a.startsWith("q:")) {
      const r = await getJson(`https://crates.io/api/v1/crates?q=${encodeURIComponent(a.slice(2))}&per_page=8&sort=relevance`);
      console.log("== search", a.slice(2));
      for (const c of r.crates) console.log("  ", c.name, c.max_stable_version ?? c.max_version, "dl", c.downloads, "upd", c.updated_at.slice(0, 10), "|", (c.description ?? "").slice(0, 80));
    } else {
      const r = await getJson(`https://crates.io/api/v1/crates/${a}`);
      const v = r.versions.find((x) => !x.yanked && !x.num.includes("-"));
      console.log(a, v.num, "licence:", v.license, "published", v.created_at.slice(0, 10), "dl", r.crate.downloads, "repo", r.crate.repository, "rust", v.rust_version);
    }
  } catch (e) {
    console.log(a, "ERR", e.message);
  }
}

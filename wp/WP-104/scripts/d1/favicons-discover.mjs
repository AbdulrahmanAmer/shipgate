// WP-104 part d1: discover the default favicon / touch-icon files of framework starters and hash them.
// Usage: node favicons-discover.mjs <outFile.json>
// For each repo it lists the tree at the default branch, keeps files whose path matches `pick`, then
// walks the file's commit history (`maxHistory` newest commits) and SHA-256-hashes each distinct version.
// Needs the GitHub CLI (`gh`) logged in (rate limit) - all network access goes through `gh api`.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";

const out = process.argv[2];
if (!out) throw new Error("usage: favicons-discover.mjs <outFile.json>");

const gh = (args) => execFileSync("gh", ["api", ...args], { maxBuffer: 1 << 29 });
const ghJson = (args) => JSON.parse(gh(args).toString("utf8"));

const targets = [
  { repo: "vercel/next.js", pick: /^packages\/create-next-app\/templates\/.*(favicon\.ico|vercel\.svg|next\.svg)$/, label: "Create Next App" },
  {
    repo: "vitejs/vite",
    pick: /^packages\/create-vite\/template-[^/]+\/public\/(vite|favicon)\.svg$/,
    extraPaths: ["react", "react-ts", "vue", "vue-ts", "vanilla", "vanilla-ts", "svelte", "svelte-ts", "preact", "preact-ts", "lit", "lit-ts", "solid", "solid-ts"].map((t) => `packages/create-vite/template-${t}/public/vite.svg`),
    label: "Vite create-vite",
  },
  { repo: "withastro/astro", pick: /^examples\/(basics|minimal|blog|portfolio|starlog)\/public\/favicon\.(svg|ico)$/, label: "Astro examples" },
  { repo: "nuxt/starter", ref: "v3", pick: /^public\/favicon\.ico$/, label: "Nuxt starter (v3 branch)" },
  { repo: "sveltejs/cli", pick: /^packages\/sv\/src\/create\/templates\/(minimal|demo|library)\/.*favicon\.(svg|png|ico)$/, label: "SvelteKit sv create" },
  { repo: "sveltejs/kit", pick: /^$/, extraPaths: ["packages/create-svelte/templates/default/static/favicon.png", "packages/create-svelte/templates/skeleton/static/favicon.png", "packages/create-svelte/templates/skeletonlib/static/favicon.png"], label: "create-svelte (legacy)" },
  { repo: "facebook/create-react-app", pick: /^packages\/cra-template(-typescript)?\/template\/public\/(favicon\.ico|logo192\.png|logo512\.png)$/, label: "Create React App" },
  { repo: "vuejs/create-vue", pick: /^template\/base\/public\/favicon\.ico$/, label: "create-vue" },
  { repo: "angular/angular-cli", pick: /^packages\/schematics\/angular\/application\/files\/.*favicon\.ico(\.template)?$/, extraPaths: ["packages/schematics/angular/application/files/src/favicon.ico", "packages/schematics/angular/application/files/src/favicon.ico.template"], label: "Angular CLI" },
  { repo: "remix-run/react-router-templates", pick: /^default\/public\/favicon\.ico$/, label: "React Router template" },
  { repo: "TanStack/router", pick: /^examples\/react\/start-basic\/public\/(favicon\.ico|favicon-16x16\.png|favicon-32x32\.png|apple-touch-icon\.png)$/, label: "TanStack Start basic" },
  { repo: "gatsbyjs/gatsby-starter-default", pick: /^src\/images\/gatsby-icon\.png$/, label: "Gatsby default starter" },
  { repo: "facebook/docusaurus", pick: /^packages\/create-docusaurus\/templates\/shared\/static\/img\/(favicon\.ico|docusaurus\.png)$/, extraPaths: ["packages/create-docusaurus/templates/classic/static/img/favicon.ico"], label: "Docusaurus classic" },
  { repo: "rails/rails", pick: /^railties\/lib\/rails\/generators\/rails\/app\/templates\/public\/icon\.(png|svg)$/, label: "Rails new app" },
  { repo: "laravel/laravel", pick: /^public\/favicon\.ico$/, label: "Laravel" },
];

const maxHistory = 25;
const result = [];
const onlyRepo = process.argv[3]; // optional: restrict to targets whose repo contains this substring
for (const t of targets) {
  if (onlyRepo && !t.repo.includes(onlyRepo)) continue;
  const repoInfo = ghJson([`repos/${t.repo}`]);
  const branch = t.ref ?? repoInfo.default_branch;
  const tree = ghJson([`repos/${t.repo}/git/trees/${branch}?recursive=1`]);
  const files = tree.tree.filter((e) => e.type === "blob" && t.pick.test(e.path));
  for (const p of t.extraPaths ?? []) if (!files.some((f) => f.path === p)) files.push({ path: p, sha: null });
  console.error(`${t.repo}@${branch}: ${files.length} file(s)${tree.truncated ? " (TREE TRUNCATED)" : ""}`);
  for (const f of files) {
    const commits = ghJson([`repos/${t.repo}/commits?path=${encodeURIComponent(f.path)}&per_page=${maxHistory}&sha=${branch}`]);
    const seen = new Map();
    for (const c of commits) {
      let buf;
      try {
        const j = ghJson([`repos/${t.repo}/contents/${f.path.split("/").map(encodeURIComponent).join("/")}?ref=${c.sha}`]);
        buf = Buffer.from(j.content, "base64");
      } catch {
        continue; // file absent at that commit (rename/delete)
      }
      const sha = crypto.createHash("sha256").update(buf).digest("hex");
      if (!seen.has(sha)) seen.set(sha, { sha256: sha, bytes: buf.length, commit: c.sha, date: c.commit.committer.date });
    }
    result.push({
      label: t.label,
      repo: t.repo,
      branch,
      path: f.path,
      currentBlob: f.sha,
      historyScanned: commits.length,
      versions: [...seen.values()],
    });
  }
}
fs.writeFileSync(out, JSON.stringify(result, null, 1));
console.error(`wrote ${out}`);

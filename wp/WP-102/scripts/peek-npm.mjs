// Print latest version, licence, engines, deps and peerDeps for npm packages (arguments).
import { getJson } from "./lib.mjs";
for (const p of process.argv.slice(2)) {
  const m = await getJson(`https://registry.npmjs.org/${p.replace("/", "%2F")}/latest`);
  const pack = await getJson(`https://registry.npmjs.org/${p.replace("/", "%2F")}`);
  console.log(p, m.version, "licence:", JSON.stringify(m.license), "engines:", JSON.stringify(m.engines), "published:", pack.time?.[m.version]);
  console.log("  deps:", Object.keys(m.dependencies ?? {}).length, "peer:", JSON.stringify(m.peerDependencies), "optional:", JSON.stringify(m.optionalDependencies ?? {}).slice(0, 100));
}

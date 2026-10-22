// npm registry tarball -> manifest item. The registry publishes sha512 (`dist.integrity`) and sha1, never sha256, so the
// tarball is streamed through SHA-256 here and the registry's sha512 is re-checked against the same bytes.
import { getJson, hashUrl, head } from "./lib.mjs";

export async function npmItem(pkg, version, over) {
  const meta = await getJson(`https://registry.npmjs.org/${pkg.replace("/", "%2F")}/${version}`);
  const url = meta.dist.tarball;
  const r = await hashUrl(url);
  const integrity = meta.dist.integrity;
  if (!integrity?.startsWith("sha512-")) throw new Error(`${pkg}@${version}: no sha512 integrity in registry metadata`);
  if (integrity.slice(7) !== r.sha512b64) throw new Error(`${pkg}@${version}: registry sha512 does not match downloaded bytes`);
  const h = await head(url);
  if (h.size && h.size !== r.size) throw new Error(`${pkg}@${version}: HEAD size ${h.size} != GET ${r.size}`);
  const lic = typeof meta.license === "string" ? meta.license : meta.license?.type ?? meta.licenses?.map((l) => l.type).join(" OR ") ?? "UNKNOWN";
  return {
    name: over.name ?? pkg, version, platform: "any", url, sha256: r.sha256, size: r.size, licence: over.licence ?? lic,
    purpose: over.purpose ?? "tool", unpackTo: over.unpackTo, requires: over.requires ?? [],
    _source: `registry.npmjs.org/${pkg}/${version}: tarball URL from dist.tarball; sha256 computed over the downloaded tarball, which matched the registry's dist.integrity sha512 (${integrity.slice(0, 20)}...); size = bytes downloaded (= HEAD Content-Length); licence field of the registry metadata: ${JSON.stringify(meta.license ?? meta.licenses ?? null)}`,
    _deps: meta.dependencies ?? {},
    _engines: meta.engines ?? null,
  };
}

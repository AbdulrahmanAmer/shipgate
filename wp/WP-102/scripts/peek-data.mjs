// Probe candidate data sources (status, size, type) with a 40 s timeout each. No payload kept.
const urls = process.argv.slice(2);
for (const u of urls) {
  try {
    const r = await fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(40000), headers: { range: "bytes=0-2047", "user-agent": "shipgate-wp102-sourcing/1.0" } });
    const buf = Buffer.from(await r.arrayBuffer());
    console.log(r.status, u, "| len", r.headers.get("content-length"), "| range", r.headers.get("content-range"), "|", r.headers.get("content-type"), "| etag", r.headers.get("etag"));
    if (process.env.SHOW) console.log(buf.toString("utf8").slice(0, Number(process.env.SHOW)));
  } catch (e) {
    console.log("ERR", u, String(e.cause?.code ?? e.message));
  }
}

// List Adoptium Temurin JRE assets (os/arch/libc, size, vendor-published sha256) for a feature version.
import { getJson } from "./lib.mjs";
const info = await getJson("https://api.adoptium.net/v3/info/available_releases");
console.log(JSON.stringify(info));
for (const v of process.argv.slice(2)) {
  const a = await getJson(`https://api.adoptium.net/v3/assets/latest/${v}/hotspot?image_type=jre&vendor=eclipse`);
  console.log("== feature", v, a.length);
  for (const x of a) {
    console.log(x.binary.os, x.binary.architecture, x.binary.image_type, x.binary.package.name, x.binary.package.size, x.binary.package.checksum?.slice(0, 12), x.release_name, x.binary.updated_at);
  }
}

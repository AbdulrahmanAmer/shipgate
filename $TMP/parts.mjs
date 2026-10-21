import fs from "fs";
import { extractParts, partChannels } from "file:///D:/internal%20building%20pipeline%20for%20making%20sure%20that%20all%20websites%20we%20make%20real%20enterprise%20grade%20on%20search%20engines/shipgate/tools/trace/lib.mjs";
const t = fs.readFileSync("spec/packs/ux.md","utf8").split("\n");
let cur=null, body={};
for (const l of t){ const m=l.match(/^- \*\*(UX-\d{3})\*\*/); if(m){cur=m[1];body[cur]=l+"\n";} else if(cur && /^\s/.test(l)) body[cur]+=l+"\n"; else if(!/^\s*$/.test(l)) cur=null; }
for (const id of ["UX-001","UX-003","UX-004","UX-020","UX-023","UX-024","UX-012"]) console.log(id, extractParts(id, body[id]), JSON.stringify(partChannels(body[id])));

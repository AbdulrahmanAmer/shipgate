// Report what kind of executable a file is: ELF (machine, interpreter, dynamic section), Mach-O (cpu), PE (machine).
// Usage: node binkind.mjs <file>...
import { openSync, readSync, closeSync, statSync } from "node:fs";

const ELF_MACHINE = { 0x3e: "x86-64", 0xb7: "aarch64", 0x03: "x86", 0x28: "arm" };
const PE_MACHINE = { 0x8664: "x64", 0xaa64: "arm64", 0x14c: "x86" };
const MACHO_CPU = { 0x01000007: "x86_64", 0x0100000c: "arm64" };

export function binKind(path) {
  const fd = openSync(path, "r");
  try {
    const size = statSync(path).size;
    const head = Buffer.alloc(64);
    readSync(fd, head, 0, 64, 0);
    if (head.readUInt32BE(0) === 0x7f454c46) {
      const is64 = head[4] === 2;
      const le = head[5] === 1;
      if (!is64 || !le) return { kind: "elf", note: `unsupported class/endian ${head[4]}/${head[5]}` };
      const machine = head.readUInt16LE(18);
      const phoff = Number(head.readBigUInt64LE(32));
      const phentsize = head.readUInt16LE(54);
      const phnum = head.readUInt16LE(56);
      const ph = Buffer.alloc(phentsize * phnum);
      readSync(fd, ph, 0, ph.length, phoff);
      let interp = null;
      let dynamic = false;
      for (let i = 0; i < phnum; i++) {
        const type = ph.readUInt32LE(i * phentsize);
        if (type === 3) {
          const off = Number(ph.readBigUInt64LE(i * phentsize + 8));
          const fsz = Number(ph.readBigUInt64LE(i * phentsize + 32));
          const b = Buffer.alloc(fsz);
          readSync(fd, b, 0, fsz, off);
          interp = b.toString("utf8").replace(/\0.*$/, "");
        }
        if (type === 2) dynamic = true;
      }
      return { kind: "elf", machine: ELF_MACHINE[machine] ?? machine, interp, dynamicSection: dynamic, staticallyLinked: !interp && !dynamic, size };
    }
    const m = head.readUInt32LE(0);
    if (m === 0xfeedfacf) return { kind: "mach-o", cpu: MACHO_CPU[head.readUInt32LE(4)] ?? head.readUInt32LE(4), size };
    if (head.readUInt32BE(0) === 0xcafebabe) return { kind: "mach-o-universal", size };
    if (head[0] === 0x4d && head[1] === 0x5a) {
      const peoff = head.readUInt32LE(60);
      const pe = Buffer.alloc(8);
      readSync(fd, pe, 0, 8, peoff);
      return { kind: "pe", machine: PE_MACHINE[pe.readUInt16LE(4)] ?? pe.readUInt16LE(4), size };
    }
    return { kind: "unknown", magic: head.subarray(0, 8).toString("hex"), size };
  } finally {
    closeSync(fd);
  }
}

if (process.argv[1].endsWith("binkind.mjs")) {
  for (const f of process.argv.slice(2)) console.log(f, JSON.stringify(binKind(f)));
}

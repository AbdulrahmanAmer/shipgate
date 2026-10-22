// WP-101 OpenCode probe plugin: records what the host hands a plugin, and applies the 03 section 16 deny / block outputs.
import fs from "node:fs";
import path from "node:path";

const BASE = "C:/Users/DELL/AppData/Local/Temp/claude/D--internal-building-pipeline-for-making-sure-that-all-websites-we-make-real-enterprise-grade-on-search-engines-shipgate/c8b35d6c-3ff9-4834-b145-88b68feb46d7/scratchpad/wp101/oc";
const LOG = BASE + "/.hooklogs";
const CTL = BASE + "/ctl.json";

function ctl() {
  try {
    return JSON.parse(fs.readFileSync(CTL, "utf8"));
  } catch {
    return {};
  }
}
function note(line) {
  fs.mkdirSync(LOG, { recursive: true });
  fs.appendFileSync(path.join(LOG, "calls.jsonl"), JSON.stringify({ t: new Date().toISOString(), ...line }) + "\n");
}
function save(event, tool, obj) {
  fs.mkdirSync(LOG, { recursive: true });
  let n = 1;
  const base = `${event}__${tool || "none"}__`;
  while (fs.existsSync(path.join(LOG, `${base}${n}.json`))) n++;
  const file = `${base}${n}.json`;
  fs.writeFileSync(path.join(LOG, file), JSON.stringify(obj, null, 2));
  return file;
}

export const ShipgateProbe = async ({ client, directory }) => {
  const argsByCall = new Map();
  note({ kind: "plugin-loaded", directory });
  return {
    "tool.execute.before": async (input, output) => {
      argsByCall.set(input.callID, output.args);
      const file = save("tool.execute.before", input.tool, {
        event: "tool.execute.before",
        tool: input.tool,
        args: output.args,
        output: null,
        sessionID: input.sessionID,
        raw: { input, output },
      });
      const c = ctl();
      const cmd = output.args && output.args.command;
      if (c.denyContains && typeof cmd === "string" && cmd.includes(c.denyContains)) {
        note({ kind: "deny", file, thrown: "shipgate WP-101 deny test" });
        throw new Error("shipgate WP-101 deny test");
      }
      note({ kind: "before", tool: input.tool, file });
    },
    "tool.execute.after": async (input, output) => {
      const file = save("tool.execute.after", input.tool, {
        event: "tool.execute.after",
        tool: input.tool,
        args: input.args ?? argsByCall.get(input.callID) ?? null,
        output: output.output,
        sessionID: input.sessionID,
        raw: { input, output },
      });
      note({ kind: "after", tool: input.tool, file });
    },
    event: async ({ event }) => {
      note({ kind: "event", type: event.type });
      if (event.type === "session.idle") {
        const sessionID = event.properties && event.properties.sessionID;
        const file = save("session.idle", "none", {
          event: "session.idle",
          tool: null,
          args: null,
          output: null,
          sessionID,
          raw: event,
        });
        const c = ctl();
        const flag = path.join(LOG, "stop-blocked.flag");
        if (c.blockStopOnce && !fs.existsSync(flag)) {
          fs.writeFileSync(flag, "1");
          const text = "shipgate WP-101 block test: also create the file after-block.txt containing ok";
          note({ kind: "idle-followup-sent", file, text });
          try {
            const r = await client.session.promptAsync({ path: { id: sessionID }, body: { parts: [{ type: "text", text }] } });
            note({ kind: "idle-followup-result", ok: true, status: r && r.response && r.response.status });
          } catch (e) {
            note({ kind: "idle-followup-result", ok: false, error: String(e) });
          }
        }
      }
    },
  };
};

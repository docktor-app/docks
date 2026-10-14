<script setup lang="ts">
// Each cell is [mark, note]: "y" built in, "p" partial or paid, "n" not built in.
// Sources: each project's README and docs, checked in October 2026. Re-check
// before a release; these tools change quickly.
type Mark = "y" | "p" | "n";
type Cell = [Mark, string];

const tools = ["Docktor", "Portainer CE", "Dockhand", "Dockge", "Komodo"];

const rows: { label: string; cells: Cell[] }[] = [
  {
    label: "Several hosts",
    cells: [["n", "One host, by design"], ["y", "Agent per host"], ["y", "Socket, agent or TCP"], ["y", "Agents, since 1.4"], ["y", "Periphery agent"]],
  },
  {
    label: "Backups of stack data",
    cells: [["y", "restic, scheduled"], ["n", "Not in CE"], ["y", "restic, scheduled"], ["n", ""], ["n", ""]],
  },
  {
    label: "Reverse proxy & Let's Encrypt",
    cells: [["y", "Built in"], ["n", ""], ["n", ""], ["n", ""], ["n", ""]],
  },
  {
    label: "Image update checks",
    cells: [["y", "Apply when you choose"], ["p", "Business edition"], ["y", "Tracked per image"], ["p", "Manual pull"], ["y", "Scheduled"]],
  },
  {
    label: "Adopt running Compose projects",
    cells: [["y", "Adopt or migrate"], ["p", "Limited control"], ["p", "Read-only"], ["p", "Move into stacks dir"], ["p", "Set up per stack"]],
  },
  {
    label: "HTTP health probes & uptime",
    cells: [["y", "With incident history"], ["n", ""], ["n", ""], ["n", ""], ["n", ""]],
  },
  {
    label: "No paid tier",
    cells: [["y", "MIT"], ["p", "zlib, paid Business"], ["p", "BSL 1.1, paid for business use"], ["y", "MIT"], ["y", "GPL-3.0"]],
  },
];

const markLabel: Record<Mark, string> = { y: "Yes", p: "Partly", n: "No" };
</script>

<template>
  <section class="dl-section compare">
    <div class="dl-wrap">
      <p class="dl-eyebrow">Second opinion</p>
      <h2>How Docktor compares to Portainer, Dockhand, Dockge and Komodo.</h2>
      <p class="dl-sub">
        They're all good tools with different specialties. Docktor sees one host and treats the whole stack:
        files, backups, domains, health checks and updates.
      </p>

      <div class="report">
        <header>
          <strong>Comparative report</strong>
          <span>Ref. DKT-0.1.0 · Oct 2026</span>
        </header>
        <div class="scroll">
          <table>
            <thead>
              <tr>
                <th scope="col"><span class="sr">Capability</span></th>
                <th v-for="(t, i) in tools" :key="t" scope="col" :class="{ us: i === 0 }">{{ t }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in rows" :key="r.label">
                <th scope="row">{{ r.label }}</th>
                <td v-for="(c, i) in r.cells" :key="i" :class="{ us: i === 0 }">
                  <span class="mark" :data-m="c[0]" :aria-label="markLabel[c[0]]" />
                  <span class="note">{{ c[1] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer>
          <p class="dx">
            <b>Diagnosis.</b> If you run several hosts, or need Swarm or Kubernetes, Portainer or Komodo is the right
            specialist. If you run one server and want backups, domains and health checks without wiring
            them up yourself, Docktor fits.
          </p>
          <p class="fine">
            Based on each project's public documentation as of October 2026.
            Spotted an error? <a href="https://github.com/docktor-app/docks/issues">Open an issue</a>.
          </p>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped>
.compare {
  background-color: var(--surface);
}
.report {
  margin-top: 48px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-top: 6px solid var(--mint);
  border-radius: 6px;
  box-shadow: 0 24px 50px -36px rgba(15, 26, 31, 0.6);
}
.report header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  padding: 18px 24px;
  border-bottom: 2px solid var(--ink);
  font-family: var(--f-mono);
  font-size: 12.5px;
  color: var(--muted);
}
.report header strong {
  font-family: var(--f-display);
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink);
}

.scroll { overflow-x: auto; }
table {
  display: table;
  width: 100%;
  min-width: 820px;
  margin: 0;
  border-collapse: collapse;
}
tr { background: none !important; border: 0; }
th, td {
  border: 0;
  border-bottom: 1px solid var(--line);
  padding: 14px 16px;
  text-align: left;
  vertical-align: top;
  background: none;
  font-size: 14px;
}
thead th {
  font-family: var(--f-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
tbody th {
  width: 22%;
  font-family: var(--f-display);
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink);
}
td.us, th.us { background: color-mix(in srgb, var(--mint) 9%, transparent); }
thead th.us { color: var(--brand-deep); }
tbody tr:last-child > * { border-bottom: 0; }

td { white-space: nowrap; }
.mark {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 8px;
  vertical-align: -2px;
  border-radius: 50%;
  border: 2px solid var(--muted);
}
.mark[data-m="y"] { background: var(--ok); border-color: var(--ok); }
.mark[data-m="p"] { border-color: var(--warn); background: linear-gradient(90deg, var(--warn) 50%, transparent 50%); }
.mark[data-m="n"] { opacity: 0.45; }
.note { color: var(--muted); font-size: 13px; }
td.us .note { color: var(--ink); }

.report footer {
  display: grid;
  gap: 10px;
  padding: 20px 24px 22px;
  border-top: 2px solid var(--ink);
}
.dx { margin: 0; line-height: 1.65; font-size: 15.5px; max-width: 820px; }
.dx b { font-family: var(--f-display); font-size: 16.5px; }
.fine { margin: 0; font-family: var(--f-mono); font-size: 12px; color: var(--muted); }
.fine a { color: var(--brand-deep); }

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>

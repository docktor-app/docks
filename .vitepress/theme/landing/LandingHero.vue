<script setup lang="ts">
import { withBase } from "vitepress";

const REPO = "https://github.com/docktor-app/docktor";

// One heartbeat per 200 units: baseline, P wave, QRS spike, T wave.
const beat = (x: number) =>
  `L${x + 60} 60 q8 -8 16 0 L${x + 92} 60 l6 6 l10 -50 l10 62 l6 -18 L${x + 140} 60 q12 -14 24 0 L${x + 200} 60`;
const trace = "M0 60 " + Array.from({ length: 14 }, (_, i) => beat(i * 200)).join(" ");

const chart = [
  { name: "nextcloud", state: "ok", label: "STABLE", note: "3 svc · up 41d" },
  { name: "vaultwarden", state: "ok", label: "STABLE", note: "1 svc · up 12d" },
  { name: "gitea", state: "warn", label: "UPDATE DUE", note: "newer image" },
  { name: "grafana", state: "bad", label: "CRITICAL", note: "probe failing" },
];
</script>

<template>
  <section class="hero">
    <svg class="hero-trace" viewBox="0 0 2800 120" preserveAspectRatio="xMinYMid slice" aria-hidden="true">
      <path :d="trace" pathLength="1" />
    </svg>

    <div class="dl-wrap hero-grid">
      <div class="hero-copy">
        <p class="plate">
          <img class="plate-mark on-ink" :src="withBase('/brand/docktor-mark-light.svg')" alt="" />
          <img class="plate-mark on-mist" :src="withBase('/brand/docktor-mark.svg')" alt="" />
          <span>Outpatient clinic</span>
          <span class="plate-sep">/</span>
          <span>Dept. of self-hosting</span>
        </p>
        <h1>Your server's<br />family <span>doctor.</span></h1>
        <p class="lead">
          Docktor deploys, monitors, backs up and updates the Docker Compose stacks on one server,
          from your browser. You don't need an SSH session.
        </p>
        <div class="actions">
          <a class="dl-btn dl-btn-primary" :href="withBase('/guide/get-started')">Book a check-up <span aria-hidden="true">→</span></a>
          <a class="dl-btn dl-btn-ghost" :href="withBase('/guide/introduction')">Read the intake form</a>
          <a class="gh" :href="REPO">GitHub ↗</a>
        </div>

        <div class="band" aria-label="Docktor at a glance">
          <span class="band-code" aria-hidden="true" />
          <dl>
            <div><dt>PT</dt><dd>one Linux host</dd></div>
            <div><dt>ARCH</dt><dd>amd64 · arm64</dd></div>
            <div><dt>ALLERGY</dt><dd>clusters</dd></div>
          </dl>
        </div>
      </div>

      <div class="board" aria-hidden="true">
        <div class="clip" />
        <div class="sheet">
          <header>
            <span class="sheet-title">
              <img class="sheet-mark light" :src="withBase('/brand/docktor-mark.svg')" alt="" />
              <img class="sheet-mark dark" :src="withBase('/brand/docktor-mark-light.svg')" alt="" />
              <strong>Admission chart</strong>
            </span>
            <span>No. 0001</span>
          </header>
          <dl class="meta">
            <div><dt>Patient</dt><dd>homelab-01</dd></div>
            <div><dt>Ward</dt><dd>/opt/docktor/stacks</dd></div>
            <div><dt>Attending</dt><dd>Docktor v0.1.0</dd></div>
          </dl>
          <table>
            <thead><tr><th>Stack</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              <tr v-for="r in chart" :key="r.name">
                <td>{{ r.name }}</td>
                <td><span class="st" :data-s="r.state">{{ r.label }}</span></td>
                <td>{{ r.note }}</td>
              </tr>
            </tbody>
          </table>
          <footer>
            <span>Obs. continuous</span>
            <span class="sig">Dr. D.</span>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Light: Mist chart paper with a mint grid. Dark: a bedside monitor in
   Docktor Ink, like the brand's social preview. */
.hero {
  --h-bg: #f3f7f8;
  --h-grid: rgba(11, 127, 94, 0.13);
  --h-fine: rgba(11, 127, 94, 0.05);
  --h-halo: rgba(47, 209, 160, 0.18);
  --h-text: #0f1a1f;
  --h-muted: #4f5f66;
  --h-accent: #0b7f5e;
  --h-trace: #1fb98a;
  --h-glow: none;
  --h-plate-bg: #0f1a1f;
  --h-plate-text: #e8eef0;
  --h-ghost-border: #c9d5d9;
  position: relative;
  overflow: hidden;
  padding: 80px 0 96px;
  color: var(--h-text);
  background-color: var(--h-bg);
  background-image:
    radial-gradient(700px 360px at 80% 20%, var(--h-halo), transparent 70%),
    linear-gradient(var(--h-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--h-grid) 1px, transparent 1px),
    linear-gradient(var(--h-fine) 1px, transparent 1px),
    linear-gradient(90deg, var(--h-fine) 1px, transparent 1px);
  background-size: auto, 40px 40px, 40px 40px, 8px 8px, 8px 8px;
}
.hero { border-bottom: 1px solid var(--line); }
.dark .hero {
  --h-bg: #0a1316;
  --h-grid: rgba(47, 209, 160, 0.11);
  --h-fine: rgba(47, 209, 160, 0.04);
  --h-halo: rgba(47, 209, 160, 0.12);
  --h-text: #ffffff;
  --h-muted: #9db0b7;
  --h-accent: #2fd1a0;
  --h-trace: #2fd1a0;
  --h-glow: drop-shadow(0 0 6px #2fd1a0);
  --h-plate-bg: #e8eef0;
  --h-plate-text: #0f1a1f;
  --h-ghost-border: rgba(232, 238, 240, 0.28);
}

.hero-trace {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 28px;
  width: 100%;
  height: 120px;
  pointer-events: none;
}
.hero-trace path {
  fill: none;
  stroke: var(--h-trace);
  stroke-width: 2.4;
  stroke-linejoin: round;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 7s linear infinite;
  opacity: 0.85;
  filter: var(--h-glow);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 64px;
  align-items: center;
}

.plate {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 28px;
  padding: 7px 14px 7px 7px;
  background: var(--h-plate-bg);
  color: var(--h-plate-text);
  border-radius: 8px;
  font-family: var(--f-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.plate-sep { opacity: 0.4; }
.plate-mark { width: 26px; height: 26px; }
/* Mist containers on the Ink plate in light mode, Ink containers on Mist in dark. */
.plate-mark.on-mist, .dark .plate-mark.on-ink { display: none; }
.dark .plate-mark.on-mist { display: block; }

.hero h1 {
  font-size: clamp(48px, 7vw, 88px);
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.025em;
}
.hero h1 span {
  color: var(--h-accent);
}

.lead {
  margin: 26px 0 34px;
  max-width: 520px;
  font-size: 18.5px;
  line-height: 1.6;
  color: var(--h-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.hero .dl-btn-ghost {
  background: transparent;
  border-color: var(--h-ghost-border);
  color: var(--h-text) !important;
}
.hero .dl-btn-ghost:hover { border-color: var(--mint); }
.gh {
  padding: 0 10px;
  font-family: var(--f-mono);
  font-size: 14px;
  color: var(--h-muted);
  text-decoration: none;
}
.gh:hover { color: var(--mint); }

/* Patient wristband */
.band {
  display: inline-flex;
  align-items: stretch;
  margin-top: 40px;
  max-width: 100%;
  color: var(--ink);
  background: var(--paper);
  border: 1px solid var(--line);
  border-left: 6px solid var(--mint);
  border-radius: 999px;
  box-shadow: 0 10px 24px -14px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.band-code {
  flex: none;
  width: 54px;
  background: repeating-linear-gradient(90deg, var(--ink) 0 2px, transparent 2px 4px, var(--ink) 4px 5px, transparent 5px 8px);
  border-right: 1px dashed var(--line);
  margin: 8px 0 8px 16px;
  opacity: 0.8;
}
.band dl {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
  margin: 0;
  padding: 10px 22px 10px 14px;
  font-family: var(--f-mono);
  font-size: 12.5px;
}
.band dl div { display: flex; gap: 6px; }
.band dt { color: var(--muted); }
.band dd { margin: 0; font-weight: 500; }

/* Clipboard */
.board {
  position: relative;
  padding: 26px 14px 14px;
  background: linear-gradient(160deg, #7a8f96, #5b6f76);
  border-radius: 14px;
  transform: rotate(1.5deg);
  box-shadow: 0 30px 60px -24px rgba(0, 0, 0, 0.7);
}
.dark .board { background: linear-gradient(160deg, #2a3b42, #1b2a30); }
.clip {
  position: absolute;
  top: -14px;
  left: 50%;
  width: 120px;
  height: 34px;
  transform: translateX(-50%);
  border-radius: 8px 8px 12px 12px;
  background: linear-gradient(180deg, #e8eef0, #a9b6bb 60%, #8a989d);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 #fff;
}
.sheet {
  padding: 22px 22px 16px;
  background: var(--paper);
  border-radius: 4px;
  font-family: var(--f-mono);
  font-size: 12.5px;
  color: var(--ink);
}
.sheet header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--ink);
}
.sheet-title { display: inline-flex; align-items: center; gap: 10px; }
.sheet-mark { width: 22px; height: 22px; }
.sheet-mark.dark, .dark .sheet-mark.light { display: none; }
.dark .sheet-mark.dark { display: block; }
.sheet header strong {
  font-family: var(--f-display);
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.sheet header span { color: var(--muted); }
.meta { margin: 12px 0 14px; }
.meta div { display: grid; grid-template-columns: 90px 1fr; padding: 3px 0; border-bottom: 1px dotted var(--line); }
.meta dt { color: var(--muted); }
.meta dd { margin: 0; }
.sheet table { display: table; width: 100%; margin: 0; border-collapse: collapse; font-size: 12px; }
.sheet th, .sheet td { border: 0; padding: 7px 4px; text-align: left; background: none; }
.sheet tr { background: none !important; border-top: 1px solid var(--line); }
.sheet th { color: var(--muted); font-weight: 400; text-transform: uppercase; font-size: 11px; letter-spacing: 0.06em; }
.sheet td:last-child { color: var(--muted); }
.st { font-weight: 500; white-space: nowrap; }
.st::before { content: "● "; }
.st[data-s="ok"] { color: var(--ok); }
.st[data-s="warn"] { color: var(--warn); }
.st[data-s="bad"] { color: var(--bad); }
.sheet footer {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  color: var(--muted);
}
.sig {
  font-family: "Brush Script MT", "Segoe Script", cursive;
  font-size: 22px;
  color: var(--brand-deep);
  transform: rotate(-6deg);
}

@keyframes draw {
  0% { stroke-dashoffset: 1; opacity: 0.85; }
  80% { stroke-dashoffset: 0; opacity: 0.85; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-trace path { animation: none; stroke-dashoffset: 0; }
}

@media (max-width: 960px) {
  .hero-grid { grid-template-columns: 1fr; gap: 56px; }
  .board { transform: none; }
}
@media (max-width: 560px) {
  .hero { padding: 48px 0 72px; }
  .plate { font-size: 11px; }
  .band { border-radius: 14px; }
  .sheet { padding: 16px 12px 12px; }
  .sheet td:last-child, .sheet th:last-child { display: none; }
}
</style>

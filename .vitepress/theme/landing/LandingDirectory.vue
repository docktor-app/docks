<script setup lang="ts">
import { withBase } from "vitepress";

// Wings are colour-coded like hospital wayfinding: A runs stacks, B protects
// them, C keeps them current, D watches them.
const departments = [
  { code: "A1", wing: "a", title: "Stacks", text: "Paste a compose file, review the diff, deploy with live status.", link: "/features/stacks" },
  { code: "A2", wing: "a", title: "Templates", text: "Start a stack from a template repository instead of a blank file.", link: "/features/templates" },
  { code: "B1", wing: "b", title: "Backups & restore", text: "restic, on a schedule or on demand, with a run history.", link: "/features/backups" },
  { code: "B2", wing: "b", title: "Proxy & TLS", text: "A domain per service with automatic Let's Encrypt.", link: "/features/proxy" },
  { code: "C1", wing: "c", title: "Brownfield import", text: "Adopt Compose projects already running on the host.", link: "/features/import" },
  { code: "C2", wing: "c", title: "Update checks", text: "Know when a newer image exists, apply it when you choose.", link: "/features/updates" },
  { code: "D1", wing: "d", title: "Health & uptime", text: "HTTP probes, incident history, disk usage, email alerts.", link: "/features/health" },
  { code: "D2", wing: "d", title: "Account security", text: "Authenticator app, recovery codes, sign-in limits.", link: "/features/account-security" },
];

const pathway = [
  { title: "Admission", text: "Start Docktor with one compose file and finish the setup wizard." },
  { title: "Examination", text: "Scan the host for running Compose projects, or deploy a new stack." },
  { title: "Treatment", text: "Edit, update, back up and put a domain in front of each stack." },
];
</script>

<template>
  <section class="dl-section">
    <div class="dl-wrap">
      <p class="dl-eyebrow">Directory</p>
      <h2>Every department your containers need, under one roof.</h2>

      <nav class="directory" aria-label="Features">
        <a v-for="d in departments" :key="d.code" class="row" :data-wing="d.wing" :href="withBase(d.link)">
          <span class="code">{{ d.code }}</span>
          <span class="body">
            <strong>{{ d.title }}</strong>
            <small>{{ d.text }}</small>
          </span>
          <span class="arrow" aria-hidden="true">→</span>
        </a>
      </nav>
    </div>
  </section>

  <section class="dl-section path-section">
    <div class="dl-wrap">
      <p class="dl-eyebrow">Patient pathway</p>
      <h2>Follow the line on the floor.</h2>
      <ol class="path">
        <li v-for="(s, i) in pathway" :key="s.title">
          <span class="stop">{{ i + 1 }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.directory {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  margin-top: 48px;
  padding: 2px;
  background: #22323a;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 50px -30px rgba(15, 26, 31, 0.7);
}
.dark .directory { background: #22323a; }

.row {
  --wing: #2fd1a0;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 18px 22px 18px 18px;
  background: #0f1a1f;
  color: #f2f7f8;
  text-decoration: none !important;
  transition: background 0.2s;
}
.row[data-wing="b"] { --wing: #3b82f6; }
.row[data-wing="c"] { --wing: #e0a21b; }
.row[data-wing="d"] { --wing: #e5484d; }
.row:hover { background: #16262d; }
.dark .row { background: #142229; }
.dark .row:hover { background: #1a2c34; }

.code {
  display: grid;
  place-items: center;
  height: 52px;
  border-radius: 6px;
  background: var(--wing);
  color: #fff;
  font-family: var(--f-display);
  font-size: 22px;
  font-weight: 700;
}
.row[data-wing="a"] .code,
.row[data-wing="c"] .code { color: #0f1a1f; }

.body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.body strong {
  font-family: var(--f-display);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.body small { font-size: 14px; line-height: 1.45; color: #9db0b7; }

.arrow {
  font-family: var(--f-display);
  font-size: 26px;
  color: var(--wing);
  transition: transform 0.2s;
}
.row:hover .arrow { transform: translateX(4px); }

/* Pathway: a guide line painted on the floor */
.path-section { background: var(--tint); border-block: 1px solid var(--line); }
.path {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin: 56px 0 0;
  padding: 0;
  list-style: none;
}
.path::before {
  content: "";
  position: absolute;
  top: 22px;
  left: 22px;
  right: 0;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--mint) 0 80%, transparent);
}
.path li { position: relative; margin: 0; padding-right: 12px; }
.stop {
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 22px;
  border-radius: 50%;
  background: var(--paper);
  border: 6px solid var(--mint);
  font-family: var(--f-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}
.path h3 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
.path p { margin: 0; color: var(--muted); line-height: 1.6; font-size: 16px; }

@media (max-width: 860px) {
  .directory { grid-template-columns: 1fr; }
  .path { grid-template-columns: 1fr; gap: 28px; }
  .path::before { top: 0; bottom: 0; left: 22px; right: auto; width: 8px; height: auto; background: linear-gradient(180deg, var(--mint) 0 85%, transparent); }
  .path li { padding-left: 76px; }
  .stop { position: absolute; left: 0; top: 0; }
}
@media (max-width: 480px) {
  .row { grid-template-columns: 48px 1fr; gap: 14px; padding: 16px; }
  .code { height: 44px; font-size: 18px; }
  .arrow { display: none; }
}
</style>

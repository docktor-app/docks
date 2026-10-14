<script setup lang="ts">
import { withBase } from "vitepress";
</script>

<template>
  <section class="dl-section">
    <div class="dl-wrap rx-grid">
      <div>
        <p class="dl-eyebrow">Prescription</p>
        <h2>Two containers, taken once.</h2>
        <p class="dl-sub">
          Docktor runs as the app and a bundled Postgres database, from a published image for
          <code>amd64</code> and <code>arm64</code>. You don't build anything or install a database. Your compose files stay on disk
          as the source of truth.
        </p>
        <a class="dl-btn dl-btn-primary go" :href="withBase('/guide/get-started')">Full dosage instructions <span aria-hidden="true">→</span></a>
      </div>

      <div class="pad">
        <header>
          <span class="rx" aria-hidden="true">℞</span>
          <div>
            <strong>Docktor clinic</strong>
            <small>Dept. of self-hosting</small>
          </div>
        </header>
        <p class="line"><span>Patient</span> one Linux host, Docker Engine, Compose v2</p>
        <pre><code><span class="c"># fetch docker-compose.yml and .env, fill in CHANGE_ME</span>
<span class="p">$</span> docker compose up -d
<span class="p">$</span> docker compose logs -f docktor</code></pre>
        <p class="line"><span>Sig.</span> Once. Repeat <code>docker compose pull</code> to upgrade.</p>
        <p class="line"><span>Refills</span> unlimited · MIT licence</p>
      </div>
    </div>
  </section>

  <section class="dl-wrap leaflet-wrap">
    <aside class="leaflet">
      <p class="leaflet-head">Package leaflet · read before use</p>
      <p>
        <b>Side effects.</b> Docktor drives the host's Docker daemon through the Docker socket, which gives it the
        same access as root on the host. Limit who can reach port 3000, and read <a :href="withBase('/security')">Security</a> before you deploy.
      </p>
    </aside>
  </section>
</template>

<style scoped>
.rx-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.go { margin-top: 28px; }

.pad {
  padding: 26px 28px 22px;
  background:
    repeating-linear-gradient(var(--paper) 0 31px, color-mix(in srgb, var(--mint) 18%, transparent) 31px 32px);
  background-color: var(--paper);
  border: 1px solid var(--line);
  border-left: 6px solid var(--mint);
  border-radius: 4px;
  transform: rotate(-1deg);
  box-shadow: 0 24px 50px -30px rgba(15, 26, 31, 0.6);
}
.pad header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--ink);
}
.rx {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 46px;
  line-height: 1;
  color: var(--brand-deep);
}
.pad header div { display: flex; flex-direction: column; }
.pad header strong {
  font-family: var(--f-display);
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pad header small { font-family: var(--f-mono); font-size: 12px; color: var(--muted); }

.line {
  margin: 10px 0;
  font-family: var(--f-mono);
  font-size: 13px;
  line-height: 1.6;
}
.line > span {
  display: inline-block;
  min-width: 72px;
  color: var(--muted);
  text-transform: uppercase;
  font-size: 11.5px;
  letter-spacing: 0.06em;
}
.pad pre {
  margin: 14px 0;
  padding: 18px 20px;
  border-radius: 6px;
  background: #0f1a1f;
  color: #e8eef0;
  font-family: var(--f-mono);
  font-size: 13.5px;
  line-height: 1.8;
  overflow-x: auto;
}
.dark .pad pre { background: #0a1316; }
.pad pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
.pad pre .c { color: #8a9ca3; }
.pad pre .p { color: #2fd1a0; }

.leaflet-wrap { padding-bottom: 96px; }
.leaflet {
  padding: 20px 24px;
  border: 1.5px dashed color-mix(in srgb, var(--warn) 60%, var(--line));
  border-radius: 8px;
  background: color-mix(in srgb, var(--warn) 7%, var(--paper));
}
.leaflet-head {
  margin: 0 0 6px;
  font-family: var(--f-mono);
  font-size: 11.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--warn);
}
.leaflet p:last-child { margin: 0; font-size: 15px; line-height: 1.65; }
.leaflet b { font-family: var(--f-display); font-size: 16px; }
.leaflet a { color: var(--brand-deep); }

@media (max-width: 960px) {
  .rx-grid { grid-template-columns: 1fr; gap: 48px; }
  .pad { transform: none; }
}
@media (max-width: 560px) {
  .pad { padding: 20px 16px 16px; }
  .leaflet-wrap { padding-bottom: 64px; }
}
</style>

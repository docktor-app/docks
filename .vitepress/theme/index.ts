import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import HomeLanding from "./HomeLanding.vue";
// Fonts are bundled from npm rather than loaded from a font CDN, so visitors'
// browsers never contact a third party.
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "home-hero-before": () => h(HomeLanding),
    });
  },
} satisfies Theme;

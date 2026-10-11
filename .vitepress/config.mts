import { defineConfig } from "vitepress";

// Everything that names the project, its repositories or the place the site is
// published lives in this block, so a rename or a move to a real domain is a
// one-place change.
const PROJECT_NAME = "Docktor";
const PROJECT_REPO = "https://github.com/docktor-app/docktor";
const DOCS_REPO = "https://github.com/docktor-app/docks";
const COPYRIGHT = "Copyright (c) 2026 Docktor contributors";
// Public URL the built site is served from, without a trailing slash (for
// example "https://docs.example.com" or "https://example.com/docktor"). Leave
// it empty until the site is hosted: pages are then linked through the GitHub
// source view and the sitemap is not generated.
const DOCS_SITE_URL = "";

const siteBase = DOCS_SITE_URL ? `${new URL(DOCS_SITE_URL).pathname.replace(/\/$/, "")}/` : "/";

export default defineConfig({
  title: PROJECT_NAME,
  description:
    "Documentation for Docktor, a browser UI for deploying, monitoring and managing Docker Compose stacks on one server.",
  lang: "en-US",
  base: siteBase,
  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ["README.md"],
  sitemap: DOCS_SITE_URL ? { hostname: DOCS_SITE_URL } : undefined,

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Features", link: "/features/stacks" },
      { text: "Security", link: "/security" },
      { text: "Reference", link: "/reference/deployment" },
      { text: "GitHub", link: PROJECT_REPO },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Get started", link: "/guide/get-started" },
        ],
      },
      {
        text: "Features",
        items: [{ text: "Stacks", link: "/features/stacks" }],
      },
      {
        text: "Reference",
        items: [
          { text: "Deployment and environment", link: "/reference/deployment" },
          { text: "Templates", link: "/reference/templates" },
        ],
      },
      { text: "Security", link: "/security" },
    ],

    socialLinks: [{ icon: "github", link: PROJECT_REPO }],

    search: { provider: "local" },

    editLink: {
      pattern: `${DOCS_REPO}/edit/main/:path`,
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: COPYRIGHT,
    },
  },
});

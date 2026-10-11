# Docktor documentation

Source of the [Docktor](https://github.com/docktor-app/docktor) documentation site, built with [VitePress](https://vitepress.dev) 1.6.4. The build output is a folder of static files that any web server can serve.

## Build

Requires Node.js 18 or newer (the CI workflow uses 22).

```bash
npm ci
npm run docs:dev      # local development server with hot reload
npm run docs:build    # static site written to .vitepress/dist
npm run docs:preview  # serve the production build locally
```

`docs:build` fails on dead internal links, so a broken link is caught before it is published.

## Serve the built site

Copy the contents of `.vitepress/dist` to the web root of any static web server. The site uses clean URLs (`/guide/get-started` instead of `/guide/get-started.html`), so the server must try the `.html` file when the exact path does not exist.

nginx:

```nginx
location / {
    root /var/www/docktor-docs;
    try_files $uri $uri.html $uri/ =404;
}
```

Caddy:

```caddyfile
docs.example.com {
    root * /var/www/docktor-docs
    try_files {path} {path}.html
    file_server
}
```

If you serve the site below a path such as `https://example.com/docktor/`, set `DOCS_SITE_URL` at the top of `.vitepress/config.mts` to the full public URL before building. It sets the base path and enables the sitemap. While it is empty the site is built for the domain root and is linked through the GitHub source view.

## Structure

| Path | Content |
|---|---|
| `index.md` | Home page |
| `guide/` | Get started |
| `reference/` | Deployment and environment reference, template repository format |
| `.vitepress/config.mts` | Site title, navigation, sidebar, search and footer |

The names, repository URLs and the public site URL are constants at the top of `.vitepress/config.mts`, so renaming the project or moving the site is a change in one place.

## Contributing

Pull requests are welcome. Use the same commit message format as the main repository, `type(scope): description` (for example `docs(reference): document a new variable`), and run `npm run docs:build` before opening a pull request. The GitHub Actions workflow builds the site on every push to `main` and on every pull request; it does not deploy anything.

## License

MIT. See [LICENSE](LICENSE).

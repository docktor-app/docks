# Templates

A template is a ready-made stack: a compose file, and usually a starting `.env`, for an application such as Nextcloud or Vaultwarden. Instead of writing a compose file from scratch, you pick a template, adjust the values and create the stack.

Templates are not hosted by Docktor and there is no marketplace. Docktor reads them from plain git repositories. The default source is the official repository, `github.com/docktor-app/templates`, and you can add your own.

## Creating a stack from a template

1. Go to **Stacks**, choose **Create Stack**, then choose **Start from Template**. This opens **Start from a Template**.
2. Browse the cards, or narrow them down with **Search templates** (matches name, description and category) and the **Category** list.
3. Choose **Use Template** on a card.
   - If the template has one configuration, you go straight to the next step.
   - If it has several (a card shows "2 variants", for example, such as one with and one without a database cache), a dialog titled "Choose a configuration for *the template*" lets you pick one.
4. The Create Stack form opens, already filled in: **Name** is the template's name, and the **Docker Compose File** and **Environment Variables** come from the chosen variant. If the variant has usage notes, such as first-login steps or where to find a generated password, they are shown above the form.
5. Change what you need. The values to review are in **Environment Variables**: set passwords, domains and ports there rather than leaving the defaults. You can edit the compose file too; it is yours from this point.
6. Choose **Create Stack**.

Creating the stack works exactly like creating one from a pasted compose file. Docktor runs its [compose checks](/features/stacks#compose-checks) and, if any warn, shows a review dialog first. The stack is then created as a **Draft**, and nothing runs until you choose **Deploy**.

No stack exists until you choose **Create Stack**; **Cancel** returns you to the stack list.

## Template updates

A stack remembers which template variant it was created from, and a fingerprint of that variant's content at the time. When the template repository later changes that variant, the stack's header shows a blue **template updated** badge. Hover it to see which template it refers to.

The badge is informational only. Docktor never changes an existing stack because its template changed; your compose file and `.env` stay exactly as you left them. If you want the new version, compare it with your stack yourself and edit the stack on its **Config** tab.

## Template repositories

Manage sources under **Settings**, **Stacks**, **Template Repositories**.

- The official repository is listed with an **Official** badge.
- To add another source, enter its address in **Repository URL** (for example `https://github.com/you/templates`) and choose **Add Repository**. Docktor tries to sync it straight away and tells you if that fails. Adding the same address twice is refused.
- Each repository shows its state: **Synced** with the time of the last sync, **Sync failed** with the reason, or **Not synced yet**. **Sync now** refreshes a repository on demand.
- When some templates in a repository are invalid, Docktor skips just those and the rest still load. The repository shows how many were skipped, and "Show skipped templates" lists each with the reason.

Docktor syncs on its own too: every 30 minutes it re-syncs any repository whose last sync is more than six hours old. If a repository cannot be reached while you browse, the **Start from a Template** page shows an alert naming it with a **Retry** button, while templates from other repositories keep working.

Repository addresses must be reachable over `https://`, `git://` or `ssh://` without credentials in the URL. A private repository that needs credentials embedded in its address is not supported.

### Using only your own templates

The official repository is read from the address in the `DOCKTOR_DEFAULT_TEMPLATE_REPO_URL` environment variable. Set it to an empty string to turn the built-in source off, for example on a host with no internet access. See the [Deployment reference](/reference/deployment#environment-variables).

## Writing your own templates

A template repository is a normal git repository with a fixed folder layout: a `templates/` folder, one subfolder per template, and one subfolder per variant inside it. The [Templates reference](/reference/templates) describes the layout, the `template.yml` and `variant.yml` files and every limit.

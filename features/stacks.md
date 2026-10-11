# Stacks and compose editing

A stack is one Docker Compose application: a `docker-compose.yml`, an optional `.env`, and the data its services keep. Everything about a stack is managed from **Stacks** in the sidebar.

Each stack lives in its own folder under the stacks directory (`/opt/docktor/stacks` by default):

```text
/opt/docktor/stacks/<stack-name>/
├── docker-compose.yml
├── .env
├── volumes/      # service data, as bind mounts
└── logs/         # Docktor's deploy, backup and migration output
```

The folder name is the stack name you chose, lower-cased and made URL-safe (for example "My Nextcloud" becomes `my-nextcloud`). Two stacks cannot share a name.

## Creating a stack

There are three ways to get a stack into Docktor:

- **Paste a compose file.** On **Stacks**, choose **Create Stack**. Fill in **Name**, an optional **Description**, the **Docker Compose File** and, optionally, the **Environment Variables**, then choose **Create Stack**.
- **Start from a template.** On the Create Stack page, choose **Start from Template** to pick a ready-made stack and have the form filled in for you. See Templates.
- **Import an existing project.** On **Stacks**, choose **Import Existing Stack** to bring a compose project that already runs on the host under Docktor's management. See Brownfield import.

Creating a stack writes its files and registers it with the status **Draft**. Nothing runs until you deploy it.

Before a new stack is created, Docktor runs its [compose checks](#compose-checks). If any of them fire, a review dialog lists the warnings and you choose **Confirm & Apply** to create the stack anyway, or **Keep Editing** to go back. If the compose file is not valid YAML, the dialog says so.

## The stack page

Open a stack from the list to get its page. The header shows the stack name, a status badge, and the actions. Under it are five tabs:

| Tab | What it shows |
|---|---|
| **Overview** | An uptime summary, the **Services** table, an incident list and an **Activity** timeline. |
| **Config** | The **Compose File** editor, **HTTP Health Probes**, and the **Environment Variables** editor. |
| **Logs** | Live log output for one service or all of them. |
| **Backups** | Backup summary, schedule and history for this stack. See Backups and restore. |
| **Proxy** | Domains and TLS for this stack's services. See Proxy and TLS. |

### Overview

The **Services** table lists each service with its status, image, tag and published ports. Each row has buttons to view that service's logs and to expand its health history. When a newer image version is known, the row shows an update badge and an upgrade button; see Update checks.

The **Activity** timeline merges deployments, status changes and events (such as a configuration change or an available update) into one list. Use the filter to show **All activity**, **Deployments**, **Status changes** or **Events**.

### Logs

The **Logs** tab streams output live. Pick **All services** or a single service, and use the toggles for **Auto-scroll**, **Timestamps** and **Wrap**, or **Clear** to empty the view. A connection indicator shows whether the stream is live, and it reconnects on its own if it drops. From the Services table, the log button jumps here with that service preselected.

## Editing compose and `.env`

Open the **Config** tab. The compose file opens in a code editor; environment variables open in a table with a **Raw text mode** switch for editing the file as plain text. The two have separate **Save** buttons.

Saving does not write the file straight away. Docktor first shows a review dialog titled "Review changes to *your stack*", with a GitHub-style diff of what you changed and how many lines were added and removed. The dialog is also where compose-check warnings appear, next to the lines that caused them.

- **Confirm & Apply** writes the change.
- **Keep Editing** closes the dialog and leaves your edit in the editor.
- In an `.env` diff, values of keys that look like secrets are hidden until you choose **Show secret values**.

If you try to leave the page with unsaved edits, Docktor asks before discarding them.

A compose file with a YAML error can still be saved, but the review dialog warns that the stack cannot be deployed until it is fixed.

### Compose checks

Docktor looks for risky or unconventional configuration when you save, when you create a stack, and again just before every deploy. A check only ever warns; it never blocks you.

| Check | Always on? | Flags |
|---|---|---|
| Privileged container | Yes | A service with `privileged: true`. |
| Docker socket mounted | Yes | A service that mounts the Docker socket. |
| Bind mount outside stack directory | Yes | A bind mount that points outside the stack's own folder, which backups and migrations do not capture. |
| Named volume | Configurable | A named Docker volume instead of a bind mount under `./volumes/`. |
| Inline environment variable | Configurable | A variable value written directly in the compose file instead of `.env`. |
| `.env` not referenced | Configurable | A service with no `env_file` entry, so `.env` is not passed to its container. |

Under **Settings**, **Stacks**, the **Compose Checks** card lets you switch the three configurable checks off. The same card has a switch to skip the review step for edits. With it on, changes apply immediately, except that an edit which newly introduces a compose-check warning still opens the review.

## Deploying and managing a stack

The **Deploy** button in the header runs `docker compose up -d` for the stack. When the stack is already running it reads **Redeploy**; use it to apply compose or `.env` changes. The actions menu (the "Stack actions" button) holds the rest:

| Action | What it does | Available when the stack is |
|---|---|---|
| **Stop** | `docker compose stop` | Running, Healthy, Unhealthy or Error |
| **Restart** | `docker compose restart` | Running, Healthy or Unhealthy |
| **Update Images** | Pulls newer images and recreates the containers. See Update checks. | Not busy |
| **Backup Now** | Starts a backup. See Backups and restore. | Not already backing up |
| **Delete** | Removes the stack. | Draft, Stopped or Error |

Restart restarts the existing containers; it does not re-read a changed compose file. Use **Redeploy** for that.

::: danger Deleting a stack deletes its data
**Delete** runs `docker compose down -v` and then removes the stack's folder, including everything under `volumes/`. After you confirm, there is no undo. Take a backup first if the data matters.
:::

Before a deploy, restart or image update, Docktor also checks whether the host ports the stack asks for are already taken, by another stack, another container or, where Docktor can see it, another process. A conflict is shown as a **Pre-deploy warnings** banner on the stack page and never blocks the deploy; Docker's own port binding has the final say.

### Status

The badge in the header follows the stack through its lifecycle and updates live, without a page refresh:

| Status | Meaning |
|---|---|
| **Draft** | Created but never deployed. |
| **Deploying**, **Updating** | A deploy or image update is in progress. |
| **Running** | Containers are up. |
| **Healthy**, **Unhealthy** | The services' health checks pass, or at least one fails. |
| **Stopped** | Containers are stopped. |
| **Error** | The last operation failed. |
| **Backing Up**, **Restoring**, **Migrating** | A backup, restore or import migration is in progress. |

While a stack is Deploying, Backing Up or Restoring, the Deploy button is disabled.

## Editing the files by hand

The compose file on disk is the source of truth, so you may also edit `docker-compose.yml` and `.env` directly on the host. Docktor watches the stack folders and reacts:

- After an edit that changes the stack, the stack page shows "Configuration has changed since last deployment. Re-deploy to apply changes." Redeploy to apply it.
- If the edited compose file cannot be parsed, the page shows "Configuration file has an error", with the reason, until you fix the file.

If detection seems to lag on a Docker Desktop host, see `DOCKTOR_FS_POLLING` in the [Deployment reference](/reference/deployment#environment-variables).

# Deployment and environment reference

This page is the reference for running Docktor with Docker Compose: every environment variable the server reads, what it checks at start-up, which image tags exist, and how to operate the parts that need care (sign-in protection, the stacks directory, the database schema, backups). For a first install, follow [Get started](/guide/get-started) and come back here for details.

## Requirements

- A Linux host (or a Linux VM) with Docker Engine and the Docker Compose plugin (`docker compose version` prints a v2.x version).
- An `amd64` or `arm64` CPU. The published image is multi-architecture.
- Access to `/var/run/docker.sock`. Docktor manages containers by driving the host's own Docker daemon from inside its container (Docker-outside-of-Docker). This grants the Docktor container host-root-equivalent reach: anyone who can exec into it can control every container on the host, including ones Docktor does not manage.
- Read-only access to the host's root filesystem, mounted by the compose file at `/host`. Docktor reads it to discover existing compose projects and to measure the host's real disk usage. It grants read access to the entire host disk.
- A directory on the host for the stacks Docktor manages. The default is `/opt/docktor/stacks`; see [Stacks directory path](#stacks-directory-path) before changing it.
- Nothing else. Postgres is bundled in `docker-compose.yml`, so there is no database to install.

## Environment variables

Every variable the server reads, plus the two that only `docker-compose.yml` reads. Set them in the `.env` file next to `docker-compose.yml`. The filename must be exactly `.env`: Docker Compose only uses that file for the `${VAR}` interpolation that builds the stacks volume mapping.

Where a default is listed as "image", the published image presets it, so you only set it to change it.

| Variable | Required? | Default | What it does |
|---|---|---|---|
| `DATABASE_URL` | Required | none | Postgres connection string. In the bundled setup the host is the compose service name `db`, not `localhost`. The password must equal `POSTGRES_PASSWORD`. |
| `POSTGRES_PASSWORD` | Required by the compose file | none | Not read by Docktor itself. The `db` service reads it from `.env` as the Postgres superuser password, and Postgres refuses to start without it rather than using a guessable default. Set it to the same password you put in `DATABASE_URL`. The `.env.example` template carries it as `POSTGRES_PASSWORD=CHANGE_ME_DB_PASSWORD`. |
| `BETTER_AUTH_SECRET` | Required | none | Secret that signs sessions. It also encrypts every enrolled two-factor secret and recovery code, so rotating it makes all enrolled authenticators unusable (see [Sign-in protection](#sign-in-protection)). Generate it with `openssl rand -hex 32`. |
| `BETTER_AUTH_URL` | Required | none | The externally reachable URL of this instance, for example `http://192.0.2.10:3000` or `https://docktor.example.com`. It is the base URL for sign-in and the first trusted origin. Its scheme also decides whether session cookies are `Secure`. A wrong value does not crash Docktor; it makes sign-in fail with "invalid origin". |
| `ENCRYPTION_KEY` | Required | none | Encrypts SMTP passwords, SFTP keys, S3 secrets and the restic repository password at rest. Must be exactly 64 hex characters (32 bytes). Generate it with `openssl rand -hex 32`. |
| `NODE_ENV` | Set by the image | `production` (image) | Must be `production` in a container. It turns on serving the built web UI; any other value gives a backend-only instance with no frontend. |
| `PORT` | Optional | `3000` | Port the server listens on inside the container. If you change it, change the published port in `docker-compose.yml` too. |
| `HOST` | Optional | `0.0.0.0` | Interface the server binds to inside the container. Leave it as is for Compose. |
| `CLIENT_DIST_PATH` | Optional | `./client-dist` (image) | Path to the built web UI, used only when `NODE_ENV=production`. You should not need to set it. |
| `TRUST_PROXY` | Optional | unset (trust no proxy headers) | How many reverse proxies sit in front of Docktor, so it sees each user's real IP for the sign-in rate limit. A hop count such as `1` is recommended; `true` or a comma-separated list of proxy IPs or CIDRs also work. Leave it unset when users connect directly. See [Sign-in protection](#sign-in-protection). |
| `DOCKTOR_STACKS_DIR` | Optional | `/opt/docktor/stacks` (image) | Container-side path of the stacks directory. The compose file sets it from `DOCKTOR_STACKS_HOST_DIR`, so the two cannot drift apart. See [Stacks directory path](#stacks-directory-path). |
| `DOCKTOR_STACKS_HOST_DIR` | Optional | `/opt/docktor/stacks` (compose) | Host-side path of the same directory. The compose file uses it for both sides of the stacks volume. Change this variable, not the compose file, to relocate the directory. |
| `DOCKTOR_STACKS_MOUNT_CHECK` | Optional | enabled | At boot Docktor verifies that the stacks directory is backed by a real mount and refuses to start on positive evidence of ephemeral storage. `false` turns the refusal into a warning. See [Stacks directory persistence](#stacks-directory-persistence). |
| `DOCKTOR_FS_POLLING` | Optional | `true` (image) | Makes the stacks-directory file watcher poll once a second instead of using native file events. The image presets `true` because the stacks volume may sit on a virtualised Docker Desktop filesystem that does not deliver file events. Set `false` only on a native Linux host. Run outside the image, the default is polling on Windows only. |
| `DOCKTOR_DB_AUTO_MIGRATE` | Optional | `true` (image) | Applies pending database migrations when the container starts. `false` skips the step. See [Database schema](#database-schema). |
| `DOCKTOR_DB_AUTO_PUSH` | Optional | `true` (image) | Deprecated alias for `DOCKTOR_DB_AUTO_MIGRATE`, honoured only when that variable is unset. The image presets `DOCKTOR_DB_AUTO_MIGRATE`, so in the image the alias has no effect; use `DOCKTOR_DB_AUTO_MIGRATE=false`. |
| `DOCKER_DATA_PATH` | Optional | `/var/lib/docker` | Filesystem path the disk-space check measures. Inside the container that default measures the container's own small filesystem, so set it to `/host/var/lib/docker`, which is the read-only host mount from `docker-compose.yml`. `.env.example` already does. |
| `RESTIC_BINARY` | Optional | `restic` | Path of the restic binary. The image installs a pinned, checksum-verified restic at `/usr/local/bin/restic`, already on `PATH`. |
| `DOCKTOR_DEFAULT_TEMPLATE_REPO_URL` | Optional | `https://github.com/docktor-app/templates` | The built-in template source. Docktor contacts this git remote the first time you browse templates and periodically afterwards. An empty string disables the built-in source, for example on an air-gapped host. An invalid URL is logged and treated as "no default repository". See the [Templates reference](/reference/templates) for the repository format. |
| `DOCKTOR_TEMPLATE_CACHE_DIR` | Optional | `docktor-template-cache` in the OS temp directory | Disposable clone cache for template repositories. The parsed index lives in the database, so a lost cache is re-cloned on the next sync. |

## Startup checks

Docktor checks its environment before it touches the database, the stacks directory or the web server. Nothing the checks print ever includes a variable's value, because container logs are readable by anyone who can run `docker logs`.

### What blocks startup

Docktor refuses to start, prints one report and exits with code 1 when any of these is wrong. The report lists every problem at once, so you fix them in one pass.

- `DATABASE_URL` is missing or blank.
- `BETTER_AUTH_SECRET` is missing or blank.
- `BETTER_AUTH_URL` is missing or blank.
- `ENCRYPTION_KEY` is missing, blank, or not exactly 64 hex characters. A key that is still the `.env.example` template value is called out in the message.

The report looks like this (here with all four variables missing):

```text
[env] Docktor cannot start: 4 environment problem(s) must be fixed first.
  DATABASE_URL        is required. Set the Postgres connection string, e.g. postgresql://docktor:PASSWORD@db:5432/docktor
  BETTER_AUTH_SECRET  is required. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  BETTER_AUTH_URL     is required. Set the URL users open Docktor at, e.g. http://SERVER-IP:3000
  ENCRYPTION_KEY      is required. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
See .env.example for every variable and how to set it.
```

Read it with `docker compose logs docktor`.

### What warns

These do not stop Docktor. Each is logged once at start-up as `[env] WARNING VARIABLE message (CODE)`, and every signed-in user sees them in a yellow "Configuration warnings" banner above the pages of the app. The banner can be dismissed per browser; a dismissed warning stays hidden in that browser only.

| Code | Variable | Raised when | Fix |
|---|---|---|---|
| `TRUST_PROXY_UNSET_BEHIND_HTTPS` | `TRUST_PROXY` | `BETTER_AUTH_URL` starts with `https://` and `TRUST_PROXY` is unset or blank. | Set `TRUST_PROXY` to the number of reverse proxies in front of Docktor, normally `1`. Otherwise every client shares one sign-in rate-limit bucket. |
| `TRUST_PROXY_TRUSTS_ALL` | `TRUST_PROXY` | `TRUST_PROXY` is `true`. | Use the hop count (normally `1`) or a list of proxy IPs or CIDRs. `true` trusts every hop, so a client can forge its own IP address and dodge the rate limit. |
| `DOCKER_DATA_PATH_NOT_HOST_MOUNT` | `DOCKER_DATA_PATH` | Running in a container and `DOCKER_DATA_PATH` is unset or `/var/lib/docker`. | Set `DOCKER_DATA_PATH=/host/var/lib/docker`. A custom path is never flagged. |
| `NODE_ENV_NOT_PRODUCTION_IN_CONTAINER` | `NODE_ENV` | Running in a container and `NODE_ENV` is not `production`. | Set `NODE_ENV=production`. The web UI is only served in production mode. |
| `STACKS_HOST_DIR_UNSET` | `DOCKTOR_STACKS_HOST_DIR` | Running in a container and `DOCKTOR_STACKS_HOST_DIR` is unset or blank. | Set it to the host path of the stacks volume. Without it Docktor cannot check that the host and container paths match. |
| `STACKS_MOUNT_CHECK_DISABLED` | `DOCKTOR_STACKS_MOUNT_CHECK` | `DOCKTOR_STACKS_MOUNT_CHECK` is exactly `false`. | Remove the line once the stacks volume is mounted, so the persistence check runs again. |
| `TEMPLATE_SECRET_IN_PRODUCTION` | `BETTER_AUTH_SECRET` or `DATABASE_URL` (one warning each) | `NODE_ENV=production` and the value contains `CHANGE_ME`. | Generate a real value and restart. A `CHANGE_ME` `ENCRYPTION_KEY` blocks startup instead, because it is not valid hex. |
| `DATABASE_URL_NOT_POSTGRES` | `DATABASE_URL` | `DATABASE_URL` is set but does not start with `postgres://` or `postgresql://`. | Docktor only supports PostgreSQL. Correct the connection string. |
| `BETTER_AUTH_URL_NOT_HTTP` | `BETTER_AUTH_URL` | `BETTER_AUTH_URL` is set but is not a valid `http://` or `https://` URL. | Set it to the full URL users open, including the scheme and port. |

The database password is not checked beyond `CHANGE_ME` in `DATABASE_URL`. Keep `POSTGRES_PASSWORD` equal to the password inside `DATABASE_URL` yourself.

## Image tags

Docktor is published as a multi-architecture image (`linux/amd64` and `linux/arm64`) at `ghcr.io/docktor-app/docktor`.

| Tag | Moves when | Use it for |
|---|---|---|
| `X.Y.Z` (for example `0.1.0`) | Never; it names one release. | Production. You choose when to upgrade. |
| `X.Y` (for example `0.1`) | Each patch release of that minor version. | Following patch fixes automatically. |
| `X` (for example `1`) | Each release of that major version. Not published while the major version is `0`. | Following a stable major version. |
| `latest` | Each stable release. Prereleases never move it. | Trying Docktor out. |
| `edge` | Each push to the `main` branch. | Testing unreleased changes. Not for production. |
| `sha-<short>` | Never; it names one `main` commit. | Reproducing a specific build. |

A prerelease such as `0.1.0-rc.1` publishes only its full version tag.

The compose file uses `ghcr.io/docktor-app/docktor:latest`. For production, change the `image:` line to an `X.Y.Z` tag so an upgrade happens when you decide it should, then raise the tag deliberately.

## Building from source

To run your own build instead of the published image, clone the repository and start the stack with the build override:

```bash
git clone https://github.com/docktor-app/docktor.git
cd docktor
cp .env.example .env   # then fill in the CHANGE_ME values
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

`docker-compose.build.yml` replaces the `docktor` service's image with a local build tagged `docktor:local`. The distinct tag keeps a from-source build from shadowing `ghcr.io/docktor-app/docktor:latest`, so a later plain `docker compose up` still uses the published image. Everything else, including the database and volumes, comes from `docker-compose.yml`. The Dockerfile builds for the architecture of the machine running the build.

## Upgrading

```bash
docker compose pull
docker compose up -d
```

The new container applies any pending database migrations as it starts, unless you set `DOCKTOR_DB_AUTO_MIGRATE=false` (see [Database schema](#database-schema)). Stacks that Docktor manages keep running during the upgrade; they are separate containers on the host. If you follow `latest`, pulling picks up the newest stable release; if you pin a version tag, edit the tag first (see [Image tags](#image-tags)).

## Sign-in protection

**Rate limits.** Sign-in, two-factor code entry and the password-confirmed account actions (enabling or disabling two-factor, regenerating recovery codes, changing the password) allow 5 attempts per 15 minutes per client IP. Every other auth request allows 100 per minute. Limits are counted per IP and path, not per account, and successful attempts count too. The counters live in the database, so restarting Docktor does not reset them. Over the limit, the sign-in page shows "Too many attempts. Try again in N minutes."

**`TRUST_PROXY`.** By default Docktor trusts no proxy headers, so the client IP is the address of whoever connected to it. Behind a reverse proxy (Traefik, nginx, Nginx Proxy Manager) that address is the proxy's, so every user shares one rate-limit bucket and a single attacker can lock everyone out of sign-in for 15 minutes. Set `TRUST_PROXY=1` (the number of proxies in front of Docktor, normally 1) so Docktor reads the real client from `X-Forwarded-For`. `true` trusts every hop, which lets a client choose its own IP whenever the proxy appends to `X-Forwarded-For` instead of overwriting it; prefer the hop count or a list of proxy IPs or CIDRs. Leave it unset when users connect to Docktor directly. Whether Docker's published ports keep the client IP depends on the host; check that sign-in failures from two machines do not share a limit.

**Cookies.** Session cookies are HttpOnly and SameSite=Lax. They are Secure exactly when `BETTER_AUTH_URL` starts with `https://` (their names then carry the `__Secure-` prefix); `NODE_ENV` plays no part, so a plain-http LAN install keeps its session. Changing the scheme renames the cookie, so everyone signs in again. The Base URL in Settings does not change the Secure flag, because the cookie options are read once at start-up.

**Cross-site requests.** State-changing requests (POST, PUT, PATCH, DELETE) from another origin are refused with 403 "Cross-origin request blocked", also when the other origin is a different port on the same host. Docktor trusts `BETTER_AUTH_URL`, the Base URL in Settings and the address the request itself arrived on, so `BETTER_AUTH_URL` must be the URL users actually open. Scripts that send no `Origin` header (curl) are not affected.

**Two-factor authentication.** Authenticator codes are accepted for about 30 seconds either side of the current time, and there is no replay store, so a code can be reused within that window. Rotating `BETTER_AUTH_SECRET` makes every enrolled authenticator and recovery code unusable; reset two-factor for each user afterwards (see [Resetting two-factor authentication](#resetting-two-factor-authentication)) and have them enrol again. Password reset by email is not available: the reset endpoints are disabled until it is built (tracked in [#79](https://github.com/docktor-app/docktor/issues/79)).

## Resetting two-factor authentication

Use this when a user has lost both their authenticator and their recovery codes. It needs shell access to the host, which is the authorisation: there is no web page, no email flow, and you can only name the account by its email.

```bash
docker compose exec docktor node dist/server/scripts/reset-two-factor.js <email>
```

In one transaction it deletes the user's two-factor secret and recovery codes, turns two-factor off for the account, signs the user out of every session, and forgets their trusted devices and any half-finished sign-in. Afterwards the user signs in with the password alone. If two-factor is mandatory for the instance they are asked to enrol straight away; otherwise they can enrol again from their account settings. An unknown email exits with status 1 and a message; a missing argument exits with status 2 and the usage line.

If the Docktor container cannot start, the same change can be made in SQL. Run `docker compose exec db psql -U <user> <database>` (the user and database are the `POSTGRES_USER` and `POSTGRES_DB` of the `db` service, both `docktor` in the shipped compose file) and execute, with the user's email in place of `<email>`:

```sql
BEGIN;
DELETE FROM "TwoFactor" WHERE "userId" = (SELECT id FROM "User" WHERE email = '<email>');
DELETE FROM "Session" WHERE "userId" = (SELECT id FROM "User" WHERE email = '<email>');
DELETE FROM "Verification"
  WHERE value = (SELECT id FROM "User" WHERE email = '<email>')
    AND (identifier LIKE 'trust-device-%' OR identifier LIKE '2fa-%');
UPDATE "User" SET "twoFactorEnabled" = false WHERE email = '<email>';
COMMIT;
```

## Stacks directory path

Docktor runs Docker-outside-of-Docker: it drives the **host's** Docker daemon over the mounted socket, not its own. When a managed stack's compose file declares a relative bind mount (for example `./volumes/data:/var/opt/app`), the `docker compose` CLI running inside the Docktor container resolves that relative path against `DOCKTOR_STACKS_DIR`, its own filesystem view, and then sends the resulting **absolute path** to the host daemon over the socket.

If `DOCKTOR_STACKS_HOST_DIR` (the real path on the host's disk) does not equal `DOCKTOR_STACKS_DIR` (the path inside the Docktor container), the host daemon receives an absolute path that does not exist on the host. It does not error. It silently creates a new, empty directory tree at that stray path and writes the managed stack's data there instead of into the real stack directory. The data is not just misplaced; it is lost the next time the container is recreated, because the stray path was never on any volume.

**This pair of variables must be byte-identical.** `docker-compose.yml` and `.env.example` are wired so that setting `DOCKTOR_STACKS_HOST_DIR` alone keeps both sides in sync. You should not need to edit `docker-compose.yml`, only change the value in your `.env`.

If you do get this wrong, you do not get a silent failure: Docktor checks the pair before the server starts and **refuses to boot**, naming both paths, whenever `DOCKTOR_STACKS_HOST_DIR` is set but does not match `DOCKTOR_STACKS_DIR`. The check cannot run when `DOCKTOR_STACKS_HOST_DIR` is unset, which is why `.env.example` sets it by default and why the `STACKS_HOST_DIR_UNSET` warning exists (see [Startup checks](#startup-checks)).

### Stacks directory persistence

A matching pair proves the two paths agree. It does not prove the stacks volume actually mounted. Creating the directory inside the container succeeds whether or not the bind mount attached, and Docker's short-syntax bind-mount auto-creation is legacy and best-effort, so a mount that never attached leaves an ordinary directory in the container's own writable layer. Everything Docktor writes there, every managed stack's `docker-compose.yml`, `.env` and relative bind-mount data, is then silently discarded the next time the container is recreated, with no error at any earlier boot.

To catch this, Docktor reads `/proc/self/mountinfo` right after creating the directory and finds the mount that covers the stacks path. It **refuses to boot** only on positive evidence of ephemeral storage:

- The covering mount's filesystem type is `overlay`, `overlayfs`, `tmpfs` or `ramfs`.
- The covering mount is the container's own root (`/`) while `DOCKTOR_STACKS_HOST_DIR` is set **and** the process can confirm it runs inside a container (it checks for `/.dockerenv`, which Docker creates in every container). This catches a never-attached volume even on a storage driver such as btrfs, zfs or xfs that the filesystem-type rule would pass. The `/.dockerenv` guard exists because "root mount plus `DOCKTOR_STACKS_HOST_DIR` set" alone also describes an ordinary bare-metal or VM install with a single-partition layout, which is not evidence of ephemeral storage.

It **warns and starts normally** whenever it cannot tell: there is no readable `/proc/self/mountinfo` (a non-Linux development host, or a hardened runtime restricting `/proc`), or no mount covers the path at all. Inability to verify never blocks a boot.

Set `DOCKTOR_STACKS_MOUNT_CHECK=false` to skip the check deliberately, for example when running on ephemeral storage on purpose. The skip is never silent: it logs a warning naming the variable, and raises the `STACKS_MOUNT_CHECK_DISABLED` startup warning.

## Database schema

The container applies the project's Prisma migrations on startup, before the HTTP server starts listening. The step has these safeguards:

- It is skipped entirely if `DOCKTOR_DB_AUTO_MIGRATE=false`.
- It retries reaching the database for roughly a minute before giving up, so it tolerates Postgres still starting.
- It takes a Postgres advisory lock first, so two Docktor replicas starting at the same time cannot both apply migrations.
- It applies only recorded, reviewed migrations. It never passes a data-loss-acceptance or database-reset flag.
- It never blocks the server from starting, even if it fails. A failed schema sync is logged, not fatal, so you can still reach the instance to investigate. Most routes will then fail with a missing-table or missing-column error until you resolve the cause and restart.

A fresh, empty database records no baseline; the initial migration is simply applied.

**Installs created before migrations existed.** If your database already has Docktor's tables but no `_prisma_migrations` history table, because an earlier build created it with a schemaless `db push` step, the startup step detects this and records the baseline migration `0_init` as already applied, then applies anything newer. No operator action is needed. Immediately afterwards it compares the live schema with the shipped schema and reports any difference loudly in the `[schema-sync]` log lines. A difference means the database was already behind the shipped schema when it was baselined, and there is no automatic repair by design. If you see one:

1. Read the reported diff to see which tables or columns are missing.
2. Apply the missing changes deliberately, by hand or by re-running `prisma migrate deploy` after fixing the cause, or
3. Set `DOCKTOR_DB_AUTO_MIGRATE=false` and manage the schema yourself from then on.

**To disable the step** (for example once you manage migrations outside the container), set `DOCKTOR_DB_AUTO_MIGRATE=false` in your `.env`.

## Backups

Backup settings (the restic password, the repository type, schedules and retention) are configured in the app itself, under Settings, Backup, and stored encrypted in the database. They are not environment variables and need no volume.

In v0.1.0 every backup is written to a restic repository in the `backups/` folder inside the stack's own folder, below the stacks directory. That directory is already bind-mounted from the host, so there is no backup volume in `docker-compose.yml` and none to add. Local is the only repository type in v0.1.0 (SFTP and S3-compatible storage are planned), so copy the `backups/` folders off the host yourself if you need an off-site copy. See [Backups and restore](/features/backups) for the full behaviour.

## Troubleshooting

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | The `docktor` container exits right after `docker compose up -d`, and `docker compose logs docktor` shows `[env] Docktor cannot start: N environment problem(s) must be fixed first.` | One or more required variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ENCRYPTION_KEY`) is missing, blank or malformed. | Fix every variable the report lists in `.env`; each line says what is wrong and how to generate a value. Then run `docker compose up -d` again. See [Startup checks](#startup-checks). |
| 2 | The app looks like a backend-only install: the API responds, but the root URL shows nothing resembling a frontend. | `NODE_ENV` was not exactly `production`. | Set `NODE_ENV=production` in `.env`. Docktor also raises the `NODE_ENV_NOT_PRODUCTION_IN_CONTAINER` warning for this. |
| 3 | The `docktor-db` container exits and its log says the superuser password is not specified. | `POSTGRES_PASSWORD` is missing from `.env`. | Add `POSTGRES_PASSWORD` to `.env`, set to the password inside `DATABASE_URL`. |
| 4 | Docktor's log shows `password authentication failed` for the database user. | `DATABASE_URL` and `POSTGRES_PASSWORD` differ, or you changed `POSTGRES_PASSWORD` after the database was first initialised. Postgres only applies the password when it creates the data directory. | Make `DATABASE_URL` use the password the database was created with. To change the password of an existing database, change it inside Postgres (`ALTER USER`), then update both variables. |
| 5 | A fresh start against an empty database crashes with `The table 'public.Backup' does not exist` (or `Setting`, or another table). | The database schema was not applied. | Make sure `DOCKTOR_DB_AUTO_MIGRATE` is not `false` unless you apply migrations yourself. See [Database schema](#database-schema). |
| 6 | Sign-in fails with an "invalid origin" error, although the app itself loads. | `BETTER_AUTH_URL` does not match the URL in the browser. It feeds both the base URL and the trusted origins. | Set `BETTER_AUTH_URL` to the exact URL you open Docktor at (protocol, host and port) and restart. |
| 7 | A stack you created never shows up in the host directory you expected, or its data disappears after the Docktor container is recreated. | `DOCKTOR_STACKS_DIR` and `DOCKTOR_STACKS_HOST_DIR` do not match. | Read [Stacks directory path](#stacks-directory-path). Both default to the same value, and Docktor refuses to boot on a mismatch whenever `DOCKTOR_STACKS_HOST_DIR` is set. |
| 8 | A managed stack's relative bind mount (for example `./volumes/data:/var/opt/app`) writes its data somewhere unexpected on the host, although the two variables match. | The Docktor container hands the host daemon an absolute path. If the pair does not match, that path does not exist on the host. | Same fix as row 7. This is the mechanism the pairing exists to prevent. |
| 9 | Docktor refuses to boot and says the stacks directory is not on a persistent filesystem. | The stacks volume never attached, so the directory lives in the container's writable layer. | Check that the stacks volume is present in `docker-compose.yml` and that `DOCKTOR_STACKS_HOST_DIR` equals `DOCKTOR_STACKS_DIR`. Inspect the mounts with `docker exec docktor cat /proc/self/mountinfo`. Use `DOCKTOR_STACKS_MOUNT_CHECK=false` only when ephemeral storage is intentional. |
| 10 | After Docktor was stopped abruptly, `docker start docktor` (or the restart policy) fails with `network <name> not found` and the container stays exited. | HTTP health probes briefly connect Docktor's own container to the probed stack's network. Docker saves that attachment and re-attaches it on every start. If the network was removed or re-created while Docktor was down, Docker refuses to start the container before any Docktor code can run. Docktor disconnects on a normal stop, so this only follows a crash, SIGKILL, out-of-memory kill, daemon crash or power loss. | Run `docker inspect docktor` and look in `NetworkSettings.Networks` for the entry whose `Aliases` contain `docktor-health-probe` and whose network no longer exists. Disconnect it by network **name**, not ID: `docker network disconnect <network-NAME> docktor`, then `docker start docktor`. Alternatively `docker rm docktor` followed by `docker compose up -d` recreates the container with no saved attachments; your data lives in volumes and the database, not in the container. |
| 11 | Everyone is told "Too many attempts. Try again in N minutes." at the same time, after a few failed sign-ins by one person. | Docktor sits behind a reverse proxy and `TRUST_PROXY` is unset, so every user shares the proxy's IP and one rate-limit bucket. | Set `TRUST_PROXY=1` (one proxy in front) in `.env` and restart. See [Sign-in protection](#sign-in-protection). |
| 12 | Saving or deploying fails with 403 "Cross-origin request blocked". | The page was opened from an address Docktor does not trust: `BETTER_AUTH_URL` and the Base URL in Settings do not match the URL in the browser. | Set `BETTER_AUTH_URL` to the exact URL users open and restart. See [Sign-in protection](#sign-in-protection). |
| 13 | A user lost their authenticator app and their recovery codes and cannot sign in. | Two-factor needs one of the two, and neither can be recovered. | An operator with shell access resets two-factor for that user. See [Resetting two-factor authentication](#resetting-two-factor-authentication). |

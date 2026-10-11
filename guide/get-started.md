# Get started

This page takes you from an empty Linux host to the Docktor setup wizard. Docktor runs as two containers, the app and a bundled Postgres database, started with Docker Compose from a published image. You do not build anything and you do not install a database.

## Requirements

- A Linux host (or a Linux VM) with Docker Engine and the Docker Compose plugin. `docker compose version` must print a v2.x version.
- An `amd64` or `arm64` CPU. The published image supports both.
- Port `3000` free on the host. Docktor listens there; put a reverse proxy in front of it for HTTPS.
- Access to `/var/run/docker.sock` on that host. Docktor manages containers by driving the host's own Docker daemon from inside its container.

::: warning The Docker socket is host-root access
Mounting the Docker socket gives the Docktor container the reach of root on the host: anyone who can control Docktor, or open a shell in its container, can control every container on the host, including ones Docktor does not manage. The compose file also mounts the host's root filesystem read-only at `/host` so Docktor can scan for existing compose projects and measure disk usage. Understand both before you deploy Docktor on a host you do not fully trust, and restrict who can reach port 3000. The [Security](/security) page explains both and how to harden a deployment.
:::

## 1. Create the directories

Docktor keeps the stacks it manages in one directory on the host. This guide uses `/opt/docktor/stacks`, which is also the default in the compose file. The compose file and its `.env` live next to it in `/opt/docktor`.

```bash
sudo mkdir -p /opt/docktor/stacks
cd /opt/docktor
```

## 2. Fetch the compose file and the environment template

```bash
curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/docktor-app/docktor/v0.1.0/docker-compose.yml
curl -fsSL -o .env https://raw.githubusercontent.com/docktor-app/docktor/v0.1.0/.env.example
```

The second command saves the template under the name `.env`. That filename is load-bearing, not a convention: Docker Compose only reads a project-root file named exactly `.env` for the `${VAR}` interpolation that computes the stacks volume mapping. A differently named file still reaches the container, but the volume would silently fall back to its default path while the app sees your custom value. Do not rename it.

Both files come from the `v0.1.0` tag, so they match the image version this guide describes.

## 3. Fill in the values marked CHANGE_ME

Open `.env` in an editor and change every value the template marks `CHANGE_ME`. Generate each secret on the host; never reuse an example value.

| Variable | What to set |
|---|---|
| `BETTER_AUTH_SECRET` | A random secret that signs sessions. Generate it with `openssl rand -hex 32`, or `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `ENCRYPTION_KEY` | A different random value, generated the same way. It must be exactly 64 hex characters. It encrypts SMTP, SFTP, S3 and restic credentials stored by Docktor. |
| `DATABASE_URL` | Replace `CHANGE_ME_DB_PASSWORD` with a database password. A value from `openssl rand -hex 24` is safe inside a URL. |
| `POSTGRES_PASSWORD` | The same password you just put in `DATABASE_URL`. The bundled database reads it from this file; if the two differ, Docktor cannot connect. |
| `BETTER_AUTH_URL` | The URL people will open Docktor at, for example `http://192.0.2.10:3000` or `https://docktor.example.com`. A wrong value does not crash the server; it makes sign-in fail with an "invalid origin" error. |

Leave `DOCKTOR_STACKS_DIR` and `DOCKTOR_STACKS_HOST_DIR` at `/opt/docktor/stacks` unless you have a reason to move the stacks directory. The two must always be identical.

::: tip Back up these two secrets
Keep a copy of `.env` somewhere safe. Without `ENCRYPTION_KEY` the stored credentials cannot be decrypted, and changing `BETTER_AUTH_SECRET` invalidates every enrolled two-factor authenticator.
:::

## 4. Start Docktor

```bash
docker compose up -d
```

This pulls `ghcr.io/docktor-app/docktor:latest` and `postgres:18` and starts both containers. Docktor waits for the database to become healthy and applies its database schema automatically on first boot, so there is no separate migration step. Follow the start-up with:

```bash
docker compose logs -f docktor
```

If the `docktor` container exits right away, run `docker compose logs docktor`. Docktor checks its environment before it does anything else, and when a required variable is missing or malformed it prints one report naming every variable to fix, then stops. Fix the listed values in `.env` and run `docker compose up -d` again. The [Startup checks](/reference/deployment#startup-checks) section of the Deployment reference lists the checks and what each one means.

## 5. Open the setup wizard

Visit the URL you set in `BETTER_AUTH_URL`. A fresh instance with no users redirects to `/setup`. Create your admin account there and follow the remaining steps: instance settings, optional backup and notification configuration, and an optional scan for existing compose projects on the host.

Once you are signed in, turn on two-factor authentication for your account in the account settings. Docktor controls the host's containers, so the admin account deserves a second factor.

## Upgrading

Pull the newer image and recreate the container:

```bash
docker compose pull
docker compose up -d
```

Database migrations are applied automatically when the new container starts. The compose file follows `latest`, which moves only when a release is published. For production, edit the `image:` line in `docker-compose.yml` to a version tag such as `ghcr.io/docktor-app/docktor:0.1.0`, so an upgrade happens when you choose it. The [Image tags](/reference/deployment#image-tags) section of the Deployment reference lists the available tags.

## Next steps

- [Introduction](/guide/introduction) explains what Docktor is, who it is for and how it works.
- [Stacks](/features/stacks) shows how to create, edit and deploy your first stack.
- [Security](/security) explains what the Docker socket means for your host and how to run Docktor safely. Read it before you expose Docktor beyond your own network.

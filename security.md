# Security and the Docker socket

Docktor manages containers on your host, and that comes with real power. This page explains what you are granting when you run it, and what to do about it. Read it before you put Docktor on a machine you care about.

To report a vulnerability, see [Reporting a vulnerability](#reporting-a-vulnerability) at the end of this page.

## The Docker socket

To start, stop and inspect containers, Docktor mounts the host's Docker socket (`/var/run/docker.sock`) into its own container. Access to that socket is **equivalent to root on the host**. Anyone who can use it can start a container that mounts any host directory, read or change any file, and see or stop every container on the machine, including containers Docktor does not manage.

In practice this means:

- Anyone who can sign in to Docktor can deploy a stack with any compose file, and so has root-equivalent control of the host.
- Anyone who can open a shell in the Docktor container, or who can run Docker commands on the host, has the same reach.
- A vulnerability in Docktor, or a stolen Docktor session, is therefore as serious as a stolen root login.

What to do:

- Run Docktor on a machine where you accept that trade-off, not on a host you share with people you do not trust.
- Limit who can reach Docktor at all: put it on a private network or behind a VPN, or at least behind a TLS reverse proxy with the protections below.
- Keep the account to people you would trust with root, and protect it with [two-factor authentication](#accounts).
- Treat the compose files you deploy as code you are choosing to run as root. Docktor's compose checks warn about `privileged: true` and Docker-socket mounts in stacks, but they warn only; they do not stop you.

## The host filesystem mount

The shipped `docker-compose.yml` also mounts the host's root filesystem, read-only, at `/host`. Docktor uses it for two things: scanning for existing compose projects during import, and measuring the host's real disk usage. It is read-only, but it still gives the Docktor container **read access to the entire host disk**, including files you would not expect it to need.

Both features depend on this mount. If you do not need them, you can remove that line from `docker-compose.yml`, at the cost of import scanning and real host disk figures (disk monitoring would then measure only the container's own filesystem). See the [Deployment reference](/reference/deployment#environment-variables) for `DOCKER_DATA_PATH`, which points disk monitoring at the mount.

## Network exposure

The compose file publishes Docktor on port `3000` on all of the host's interfaces. Do not expose that port directly to the internet. It speaks plain HTTP, so passwords and session cookies would cross the network unencrypted.

Instead:

1. Put a TLS-terminating reverse proxy (for example Caddy, Traefik or nginx) in front of Docktor and serve it only over HTTPS.
2. Set `BETTER_AUTH_URL` to the `https://` address people open. Session cookies are then marked `Secure`, and Docktor only accepts changes sent from that origin.
3. Set `TRUST_PROXY` to the number of proxies in front of Docktor, normally `1`. Without it, every user behind the proxy shares one sign-in rate-limit bucket, so one person's failed attempts can lock everyone out for 15 minutes. Docktor warns about this at start-up when `BETTER_AUTH_URL` is `https://` and `TRUST_PROXY` is unset. See [Sign-in protection](/reference/deployment#sign-in-protection).
4. If the proxy runs on the same host, consider publishing Docktor only on the loopback address by changing the compose `ports:` entry to `127.0.0.1:3000:3000`, so the proxy is the only way in.

Avoid `TRUST_PROXY=true`, which trusts every hop and lets a client pick its own IP address.

## Accounts

- **First account.** The setup wizard creates the first account. After that, self-registration is closed.
- **Two-factor authentication.** Any user can protect their account with an authenticator app (TOTP) and single-use recovery codes. Because Docktor controls the host, turn it on for your own account straight after setup. An instance can also require it: with **Require two-factor for all users** switched on, anyone without it must enrol before they can use Docktor.
- **Rate limiting.** Sign-in, two-factor code entry and the password-confirmed account actions allow 5 attempts per 15 minutes per client IP, counted in the database so a restart does not reset them.
- **Cross-site requests.** Requests that change data (POST, PUT, PATCH, DELETE) from an origin Docktor does not trust are refused with 403. Docktor trusts `BETTER_AUTH_URL` and the Base URL in Settings, so `BETTER_AUTH_URL` must be the URL people actually open. Session cookies are HttpOnly and SameSite=Lax.
- **Lost authenticator.** There is no email reset. An operator with shell access on the host can reset two-factor for a user; see [Resetting two-factor authentication](/reference/deployment#resetting-two-factor-authentication).

## Secrets at rest

Docktor needs two secrets, generated once on your host and kept in `.env`:

| Secret | What it protects |
|---|---|
| `ENCRYPTION_KEY` | Encrypts the credentials Docktor stores in its database: SMTP passwords, SFTP keys, S3 secrets and the restic repository password. It must be exactly 64 hex characters. |
| `BETTER_AUTH_SECRET` | Signs sessions, and encrypts every user's two-factor secret and recovery codes. |

Both are required. Docktor refuses to start when either is missing, and refuses an `ENCRYPTION_KEY` that is not valid; see [Startup checks](/reference/deployment#startup-checks).

Keep these in mind:

- Generate real random values. Never reuse an example value or a value from a tutorial. Anyone who has your `ENCRYPTION_KEY` and a copy of your database can read the stored credentials.
- Back up `.env` somewhere safe and separate from the database. Without `ENCRYPTION_KEY` the stored credentials cannot be decrypted, and you would need to enter them again.
- Changing `BETTER_AUTH_SECRET` signs everyone out and makes every enrolled authenticator and recovery code unusable, so each user must have two-factor reset and enrol again. Changing `ENCRYPTION_KEY` makes the stored credentials unreadable until you re-enter them in Settings. Rotate only deliberately.
- The `.env` file of each stack you manage is a plain file on disk in that stack's folder, and so is its compose file. Docktor does not encrypt them. Protect the host's filesystem accordingly; a backup of a stack includes these files too.
- When you review an `.env` change, Docktor hides values of keys that look like secrets until you choose to show them. That hides them from over-the-shoulder viewing only; it is not encryption.

## Images and updates

- Docktor is published at `ghcr.io/docktor-app/docktor` for `amd64` and `arm64`.
- For production, pin an exact version tag such as `0.1.0` instead of `latest`, so an upgrade happens when you choose it. `latest` moves only when a stable release is published; prereleases never move it. The `edge` tag follows the `main` branch and is for testing, not production.
- The image bundles restic, the Docker command line and the Compose plugin. They are downloaded at build time and checked against checksums, so a tampered download fails the build.
- To upgrade, pull the new image and recreate the container. See [Image tags](/reference/deployment#image-tags) for the full tag list and [Upgrading](/reference/deployment#upgrading).

## Reporting a vulnerability

Please do not open a public issue, discussion or pull request for a security problem. Use GitHub private vulnerability reporting, or the email address given in the policy:

[SECURITY.md in the Docktor repository](https://github.com/docktor-app/docktor/blob/main/SECURITY.md)

That page also lists which versions are supported and what kinds of reports are in scope. The Docker socket design described above is deliberate and is documented here, so it is not by itself a vulnerability report.

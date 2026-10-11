# Introduction

## What Docktor is

Docktor is a self-hosting management platform for Docker Compose applications. It gives you a browser UI for deploying, updating, monitoring and backing up the applications you run on your own server, so you do not need an SSH session or the Docker command line for day-to-day work. You paste or pick a compose file, press Deploy, and Docktor shows the status of every service live.

Docktor itself runs as a single container (plus a bundled Postgres database) started with Docker Compose. Everything else you run with it is an ordinary Docker Compose stack on the same host.

## Who it is for

Docktor is for people who run a single VPS, a home server or a lab machine and want to self-host applications such as Nextcloud, Vaultwarden or Gitea without becoming Docker experts. It suits you if:

- you already use, or want to use, Docker Compose files for your applications,
- you want to see what is running, restart it, read its logs and get warned when something breaks, from a browser,
- you want backups and HTTPS domains without writing the glue yourself.

It is less suited to teams that need multi-user roles, or to people who want an orchestrator for a fleet of machines; see [What Docktor is not](#what-docktor-is-not).

## Principles

- **The compose file on disk is the source of truth.** Each stack is a folder containing a `docker-compose.yml` and an optional `.env`. Docktor's database holds only derived metadata (status, history, settings), so you can edit the files by hand and Docktor notices.
- **Bind mounts in the stack folder.** A stack's data lives under `volumes/` inside its own folder, which keeps a stack self-contained, easy to back up and easy to move.
- **One host, by design.** One server, one Docktor instance. There is no clustering.
- **It does not restrict what Docker allows.** Docktor makes common tasks easier. Where a compose file does something risky, such as running a privileged container, Docktor warns you and lets you decide; it does not block you.

## What Docktor is not

- It is not a cluster orchestrator. It manages the Docker daemon of the one machine it runs on.
- It is not a platform-as-a-service. It does not build your application from source or give you a git-push deployment flow. You bring a compose file (or pick a template) that uses existing images.
- It is not a hardened sandbox. To manage containers it needs the Docker socket, which is host-root access. Read [Security](/security) before you decide where to run it.

## How it works

One Docktor container runs the web UI, the API and the background jobs together. It talks to the host's Docker daemon through the mounted Docker socket and runs `docker compose` against each stack's folder. A bundled Postgres container stores the derived metadata.

Background jobs keep the picture current without you refreshing: container state arrives from Docker's event stream and is reconciled on a timer, a file watcher notices when you edit a compose file by hand, and update checks look for newer images. Changes reach your browser live, including log output.

Optional parts build on that core: [restic](https://restic.net) backups, an nginx-based reverse proxy with Let's Encrypt for your stacks' domains, HTTP health probes, and email notifications.

## Next steps

- [Get started](/guide/get-started) walks you from an empty host to the setup wizard.
- [Stacks](/features/stacks) explains creating, editing and deploying stacks.
- [Security](/security) explains what the Docker socket means and how to run Docktor safely.

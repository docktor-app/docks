# Brownfield import

If you already run Docker Compose projects on the host, Docktor can find them and bring them under its management, so you do not have to recreate them by hand. This is called brownfield import. It works in two ways: **adopt** a project where it is, or **migrate** it into Docktor's stacks directory.

You can do it in the optional last step of the first-run setup wizard, or later from **Stacks**, **Import Existing Stack**. Both use the same screen.

## Scanning for projects

1. Open **Import Existing Stacks** (**Stacks**, **Import Existing Stack**).
2. Under **Directories to Scan**, enter one or more paths separated by commas, then choose **Scan**.

Docktor searches those directories, and everything below them, for `docker-compose.yml`, `docker-compose.yaml`, `compose.yaml` and `compose.yml` files. It skips `/proc`, `/sys` and `/dev`, and directories it is not allowed to read; the result says how many were skipped ("permission denied"). It never scans the whole disk on its own, so you choose where to look.

::: tip Use the `/host` paths
The paths you enter are paths **inside the Docktor container**. The shipped `docker-compose.yml` mounts the host's root filesystem, read-only, at `/host`, so to scan the host's `/home` enter `/host/home`, and for `/srv` enter `/host/srv`. The hint text in the field (`/home, /opt, /srv`) is only an example of the format. If you removed the `/host` mount, scanning can only see what is inside the container. See [Security](/security#the-host-filesystem-mount) for what that mount exposes.
:::

## Reading the results

The results table lists each project's **Directory**, its number of **Services** and a **Compatibility** badge. Hover a badge for the reason.

| Badge | Meaning |
|---|---|
| **Ready** | The project uses only relative bind mounts. It can be adopted in place. |
| **Migration Recommended** | It has named volumes, absolute bind mounts or inline environment variables. Migrating is recommended so that backups cover its data. |
| **Unsupported** | It uses Compose features Docktor does not support (for example `configs`, `secrets`, complex `depends_on`, or external networks beyond a plain `external: true`). The badge lists the issues. |

## Adopt: manage a project where it is

Choose **Adopt** on a row. Docktor reads the compose file and registers the project as a stack that points at its current folder. Nothing is moved or rewritten and no container is restarted, so there is no downtime, and the stack appears in your list with its live status. A message offers **View stack**.

Adopting suits **Ready** projects that already live inside the stacks directory, where the path Docktor sees is the same path the host's Docker daemon uses. For a project elsewhere on the host, Docktor records the container's `/host/...` view of its folder, which the host's Docker daemon does not know, and that mount is read-only. Relative bind mounts can then resolve to the wrong place, and edits in Docktor cannot be saved. Migrate such projects instead.

## Migrate: move a project into the stacks directory

Choose **Migrate** on a row. A two-step dialog guides you.

**Select Data to Migrate.**

- **Stack Name**: the name of the new stack. Its folder in the stacks directory is made from it.
- **Named Volumes**: Docker volumes the project uses. A checked volume is copied into the new stack's `volumes/` folder and the compose file is changed to use it as a bind mount. An unchecked volume stays a Docker volume, with the warning "This volume will remain a Docker volume (not backed up)".
- **Absolute Bind Mounts**: host paths outside the project. A checked path is copied into `volumes/`. Each carries the warning "Absolute path - not recommended for Docktor".
- If the compose file has inline environment variables, a notice says they will be extracted to a `.env` file.

**Review Changes.** Docktor shows the original compose file next to the migrated one, and the new `.env` file. Choose **Back** to change your selections, or **Confirm & Migrate** to start.

The migration then runs in the background, with a "Migrating..." message and, when it ends, "Migration complete!" with **View stack**. In order, Docktor:

1. copies the original folder to a temporary backup,
2. stops the project's containers (`docker compose stop`),
3. creates the new stack folder and copies the selected data into `volumes/`,
4. writes the rewritten `docker-compose.yml` and a `.env` (an existing `.env` is kept, and extracted values are appended to it),
5. registers the stack and deploys it,
6. deletes the temporary backup.

The original folder is left where it was; delete it yourself once you are satisfied. If a step fails, Docktor removes the half-built stack, restores the original files, restarts the original containers and reports "Migration failed: ... Rollback complete."

A few things to know before you migrate:

- **Relative bind mounts are not copied.** The dialog lists only named volumes and absolute bind mounts. A path such as `./data` stays relative in the rewritten compose file, so it points at the new stack folder, where nothing was copied. If your project keeps its data in relative folders, adopt it instead, or copy those folders into the new stack folder yourself and redeploy.
- **Keep your own backup of important data** before migrating. Migration stops the running project and copies files; if something goes wrong after the temporary backup is deleted, the original folder is your safety net.
- Unchecked items are tracked but not backed up, because backups only cover the stack folder.

After either route, the stack behaves like any other: see [Stacks and compose editing](/features/stacks).

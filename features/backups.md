# Backups and restore

Docktor backs up a stack with [restic](https://restic.net): encrypted, deduplicated, versioned snapshots. You can run a backup by hand or on a schedule, see every run in a history, and restore any snapshot from the same screen. The restic program is bundled in the Docktor image; you do not install it.

## What a backup contains and where it goes

A backup captures the whole stack folder: `docker-compose.yml`, `.env` and everything under `volumes/`. It leaves out the folder's `logs/` and `backups/` subfolders.

Every backup is written to a restic repository inside the stack's own folder, in `backups/`, encrypted with the restic password you set. Each stack has its own repository, so the stack and its snapshots travel together.

::: warning Backups live on the same disk as the data
In v0.1.0 every backup is stored in the stack's own `backups/` folder. **Local** is the only repository type you can choose; SFTP and S3-compatible storage are planned but not available yet, so there is no built-in off-site copy. If you need one, copy each stack's `backups/` folder to another machine yourself, for example with `rsync`. Deleting a stack removes its folder, and its backups with it.
:::

Backups run while the stack keeps running; Docktor does not stop it. Files that change mid-backup are captured as they are, so for databases use a pre-backup hook that creates a consistent dump (see [Hooks](#hooks)).

Data outside the stack folder is not backed up. Bind mounts that point elsewhere on the host are listed in an alert on the stack's **Backups** tab: "The following volumes are outside the stack directory and will not be included in this backup".

## Setting up

1. Go to **Settings**, **Backup**, and find **Backup Repository**.
2. Choose a **Repository type**. Choose **Local**: the card then explains that backups are stored in a `backups/` subdirectory within each stack's directory, so no repository path is needed. It is the only choice in v0.1.0; the dropdown stays because more targets are planned.
3. Enter a **Restic password** and choose **Save repository settings**. The password is stored encrypted. The card shows "(password saved)" afterwards.

No backup can run until a repository is configured; trying gives "No backup repository is configured". If the card shows "restic is not installed on this host", the image you run does not include restic; use the published image.

::: danger Keep the restic password
Anyone with the restic password and access to a stack's `backups/` folder can read its backups, and you cannot restore without the password. Keep a copy somewhere safe outside Docktor. Restic can only open a repository with the password it was created with, so do not change the password once backups exist.
:::

You can also set the repository during the first-run setup wizard, as an optional step.

For where a local repository lives and how it relates to Docker mounts, see [Backups](/reference/deployment#backups) in the Deployment reference.

## Schedules and retention

Under **Settings**, **Backup**, the **Default Backup Settings** card has:

- **Default schedule**: a 5-field cron expression (minute, hour, day, month, weekday), for example `0 3 * * *` for every day at 03:00.
- **Keep daily**, **Keep weekly**, **Keep monthly**: how many snapshots to keep.

Save them with **Save defaults**.

For one stack, open its **Backups** tab. **Backup Configuration** shows its **Schedule** and **Retention**; choose **Edit Schedule** to open "Edit Backup Schedule". There you can switch off **Use global schedule** and enter the stack's own schedule, switch off **Use global retention** and enter its own **Keep daily**, **Keep weekly** and **Keep monthly** numbers, and set the hooks. Choose **Save Schedule** to apply.

How these behave in v0.1.0:

- A stack's own schedule takes effect as soon as you save it.
- The default schedule is registered for stacks without their own schedule when Docktor starts. After you change the default schedule, restart Docktor (`docker compose restart docktor`) for it to apply.
- Old snapshots are pruned only after **scheduled** backups, not after manual ones.
- Pruning uses the stack's own retention numbers. Without them it keeps 7 daily, 4 weekly and 12 monthly snapshots. The **Keep** numbers in **Default Backup Settings** are not used for pruning, so set a stack's own retention if you want other numbers.

## Hooks

On the same dialog you can set a **Pre-backup hook** and a **Post-backup hook**: a shell command run from the stack's folder before and after the backup. A typical use is dumping a database to a file under `volumes/` before the backup, so the snapshot holds a consistent copy. A hook that exits with an error is logged but does not stop the backup.

## Running a backup now

Choose **Backup Now**, either on the **Backups** tab or in the stack's actions menu. A "Backup started" message offers **View progress**, which opens the backup's page (**Backup #...**) with its live **Output**. While it runs, the stack shows **Backing Up**, and when it finishes it returns to its previous status. If the backup fails, the page shows the error and the stack's status becomes **Error**; fix the cause and run it again.

## History and snapshots

The **Backups** tab keeps two lists.

**History** has one row per run, with its **Status** (In Progress, Completed or Failed), **Trigger** (Manual, Scheduled or Restore), **Started**, **Duration** and **Size**. **View details** opens the run's output. A backup that was running when Docktor restarted is marked failed with "Server restarted during backup".

**Snapshots** lists the snapshots in the repository, with the ID, date and tags of each. **Refresh** reloads the list. The list is not shown while a backup is running.

## Restoring a snapshot

1. On the **Backups** tab, find the snapshot under **Snapshots** and choose **Restore**.
2. Read the confirmation, "Restore *stack* from snapshot *id*?". Restoring stops the stack, overwrites its files with the snapshot's contents, and redeploys it. It cannot be undone.
3. Type the stack's name to unlock **Restore snapshot**, then choose it. (**Keep stack** cancels.)

A "Restore started" message offers **View progress**. The restore appears in the history with the trigger **Restore**. When it finishes, the stack is running again with the restored files. If it fails, the stack's status becomes **Error** and the run's page says so; you can retry from the Backups tab, or pick a different snapshot. Docktor does not roll back automatically.

To keep today's state, run a backup first and then restore the older snapshot.

## Notifications

To be emailed when a backup fails, set up SMTP under **Settings**, **Notifications**, and turn on **Backup Failure** under **Notification Triggers**. The message names the stack and the error.

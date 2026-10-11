# Health and uptime

Docktor shows whether your stacks are healthy right now, how often they were healthy over time, how much disk they use, and it can email you when something is wrong.

## Live status

The status of every stack and service updates on its own, without refreshing the page. Docktor follows Docker's container events and reconciles them with a regular check, so a container that stops or crashes shows up within moments.

A stack's status (**Running**, **Healthy**, **Unhealthy**, **Error** and so on, see [Stacks](/features/stacks#status)) is worked out from its services. A service shows its container state and, where it has a health check, **healthy** or **unhealthy**.

By default a service's health comes from the Docker `healthcheck` in its compose file, if it has one. For services without one, or where you want a different check, you can add an HTTP probe.

## HTTP health probes

An HTTP probe makes Docktor request a URL on the service every 30 seconds and judge the answer.

Set one up on the stack's **Config** tab, in the **HTTP Health Probes** section, which lists the stack's services:

1. Switch on the toggle next to the service's name.
2. Enter the **Probe URL**, for example `http://localhost:8080/health`. Use the port the application listens on **inside** its container, not a published host port. The host part must be `localhost`, `127.0.0.1` or `[::1]`: Docktor probes the container itself, not other machines, and replaces `localhost` with the container's address on its network.
3. Optionally change **Timeout (seconds)**, 1 to 30, default 5.
4. Save the compose file with the **Save** button of the **Compose File** section. The probe is stored in the compose file, so it goes through the usual review dialog like any other edit.

In the compose file the form writes this:

```yaml
services:
  web:
    image: example/web:1.0
    x-docktor:
      health-probe:
        url: http://localhost:8080/health
        timeout: 5
```

The rules are fixed:

- An answer with status 200 to 399 is healthy. Anything else, a timeout, or no connection is a failed probe.
- A service becomes **unhealthy** after 3 failed probes in a row. One successful probe makes it healthy again.
- For 60 seconds after a container starts, failures are ignored, so slow-starting applications are not flagged.
- If a probe cannot run at all (for example Docktor cannot work out the container's address), it counts as failed.
- When a service has both a probe and a Docker `healthcheck`, the probe wins. It is then the only signal for that service's status.
- A service on a Docker network marked `internal: true` cannot be reached by the probe and will show as unhealthy.

Services with a probe show an **HTTP probe** badge in the Services table. To probe a container Docktor briefly attaches its own container to the stack's network. If Docktor is killed at that moment, Docker can refuse to restart it; the fix is in the [Deployment reference troubleshooting](/reference/deployment#troubleshooting).

## Uptime and incidents

Open a stack's **Overview** tab.

- The first card shows the **uptime percentage** over the retention window, for example "Uptime (last 30 days)", or "Uptime (since *date*)" when the stack is newer than the window. Time spent **Unhealthy** or in **Error** counts as down. Time spent Stopped, Draft or in a transitional state such as Deploying counts as neither up nor down, so planned maintenance does not lower the number. With no data in the window, the card reads "No data in this window".
- **Incidents (last N days)** counts the stretches where the stack was unhealthy or in error.
- **Disk Used (volumes)** shows how much space the stack's `volumes/` folder takes.
- Under **Incidents**, a table lists each one with **Started**, **Ended**, **Duration** and **Cause**. An incident that has not recovered yet is marked **Ongoing**.

In the **Services** table, the history button on each row ("Show health history for *service*") expands a timeline of that service's health changes, showing whether each change came from the Docker health check or an HTTP probe.

The **Uptime** column in the stack lists on the dashboard and on **Stacks** shows the same percentage per stack.

### Retention

History is kept for a window of 30 days by default. Change it under **Settings**, **Stacks**, **Health History**, field **Retention (days)** (1 to 365), and choose **Save Health Settings**. Uptime, incidents and health history are all calculated over this window, and records older than it are deleted daily. Docktor asks you to confirm before you shorten the window, because older records are removed.

## Storage

**Storage** in the sidebar shows where your disk space goes. It is measured once a day, shortly after midnight, and the page shows when it was last measured. If the figures are stale, an alert says "Disk usage is out of date".

- At the top: **Total Disk Used**, **Stack Volumes** and **Local Backups**.
- **Stacks**: a table you can sort by **Stack** or **Size**. Expand a row to see the size of each folder under that stack's `volumes/`.
- **Backups**: the size of each stack's local restic repository (its `backups/` folder), which also counts toward the total. See [Backups and restore](/features/backups).

Low host disk space is a separate check, described next.

## Email alerts

Docktor can notify you about three things. Set them up under **Settings**, **Notifications**.

1. **SMTP.** Enter the **SMTP Host**, **Port**, **Encryption**, **From Address**, and a **Username** and **Password** if your server needs them, then choose **Save SMTP Settings**. **Send Test Email** checks that it works. The password is stored encrypted.
2. **Notification Triggers.** Switch on what you want:
   - **Stack Error / Unhealthy**: an alert when a stack enters Error, or stays Unhealthy for more than two minutes. You get one alert per incident, and the next one only after the stack has recovered.
   - **Disk Space Warning**: an alert when free disk space on the host falls below **Threshold (%)** (default 10) or **Threshold (bytes)** (default 2 GB). The check runs once a day at midnight, on the disk holding Docker's data. In the container this only sees the host's disk when `DOCKER_DATA_PATH` points at the `/host` mount, which the shipped `.env.example` does; see the [Deployment reference](/reference/deployment#environment-variables).
   - **Backup Failure**: an alert when a scheduled or manual backup fails.
3. **Notification Log.** Every alert is recorded here with its type, stack, message and time. The **Email** column says **Sent** if it was emailed or **UI only** if it was only recorded, for example when SMTP is not set up.

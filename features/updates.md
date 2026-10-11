# Update checks

Docktor watches the container images your stacks use and tells you when a newer version is available. It only tells you. It never pulls an image, changes a compose file or restarts anything until you ask it to.

## How checks work

In the background, Docktor looks at the registry for every distinct image your stacks use. It does not check them all at once: it looks at one image at a time, a few minutes apart, and checks a new image first. This keeps the load on registries low and stays within their rate limits. The results are stored, so the pages that show them do not contact a registry.

What "update available" means depends on the tag the service uses:

- **A version tag** such as `16.2` or `1.27.3-alpine`. Docktor reads the image's tag list from the registry and looks for a newer version that has the same shape. A plain `1.27` is only compared with other plain version numbers, and `1.27-alpine` only with other `-alpine` versions. Flavour tags such as `alpine3.24` are never suggested as an upgrade. Date tags such as `2024-06-01` are compared as dates. The newest match is the version you are offered.
- **A moving tag**: `latest`, `edge`, `stable`, `main`, `master` or `nightly`. These have no version order, since they always point at whatever was pushed last. Docktor compares the digest of the image the registry serves now with the digest of the image you have locally, and flags the service when they differ.

Checks work with Docker Hub and with other registries that speak the standard registry API and allow anonymous access to public images. A private image that needs a login cannot be checked, and a registry that rate-limits Docktor is skipped until the next round.

## Where you see it

- A blue **update available** badge next to a stack on the dashboard and in the stack list, and in the stack page's header, when any of its services has an update.
- In the **Services** table on the stack's **Overview** tab, a badge on the image: **Update available → 16.3** when there is a newer version tag, or **Content updated** when a moving tag has a new image behind it.

If a check fails (the registry is unreachable, rate-limited, or needs a login), Docktor does not show an error in the interface in v0.1.0. The service simply gets no badge. The reason is written to the Docktor log; run `docker compose logs docktor` and look for lines starting with `[UpdateChecker]`.

## Applying an update

Nothing is applied automatically. You choose one of two actions.

**Upgrade one service to a version.** In the Services table, a service with an update has an upgrade button (an up-arrow). It opens "Upgrade *service*":

- For a version tag, pick a **Target version** from the newer versions Docktor found, then choose **Upgrade**. Docktor changes that service's `image:` tag in the stack's compose file to the version you picked and redeploys the stack. A "*service* upgraded to *tag*" message confirms it.
- For a moving tag, the dialog explains that the tag always points at the newest image, so there is no version to choose, and the **Upgrade** button stays off. Use **Update Images** instead.
- If the service is already on the newest version Docktor knows of, the dialog says so. If the image has not been checked yet, it says checks run on a staggered schedule and to check back later.

The upgrade button is disabled while the stack is busy (for example Deploying, Updating or Backing Up).

**Update Images for the whole stack.** In the stack's actions menu, **Update Images** pulls the newest image for every service and recreates the containers (`docker compose pull`, then `docker compose up -d`). It works for both kinds of tag and keeps your tags as they are, so it is the way to take a new image behind a moving tag. When nothing changed, Docktor reports "Images are already up to date"; otherwise "Images updated successfully". The same button is in the upgrade dialog.

Both actions put the stack through the **Updating** status and run the usual pre-deploy checks, which only warn. If they fail, the stack's status becomes **Error** and the output tells you why.

::: tip Take a backup first
An update restarts containers on a newer image, and some applications migrate their data on first start. For anything you cannot afford to lose, run **Backup Now** before you update. See [Backups and restore](/features/backups).
:::

## When something does not look right

- **No badge although you know a newer version exists.** The service may use a tag shape Docktor cannot rank (for example one with no leading version number), a private image, or its next check may not have happened yet. Use **Update Images** to pull the newest image for that tag directly.
- **The dialog says the image has not been checked yet.** Checks are staggered, so check back later, or look in the log for `[UpdateChecker]` messages about that image.

# Proxy and TLS

Docktor can give your stacks their own domain names with HTTPS. It does this by running a reverse proxy for you, so you do not install or configure one.

## What the proxy is

The managed proxy is a stack called **Docktor Proxy**, made of two containers:

- [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy), which listens on ports 80 and 443 of the host and routes each domain to the right container.
- [acme-companion](https://github.com/nginx-proxy/acme-companion), which requests and renews free Let's Encrypt certificates for the domains you assign.

Like every stack, it lives in a folder (`docktor-proxy`) under the stacks directory (see [Stacks directory path](/reference/deployment#stacks-directory-path)); certificates are kept in its `volumes/certs` folder. Both containers read the Docker socket to notice which containers want to be proxied. Domains are assigned to services of stacks that Docktor manages. Docktor's own web interface is not one of them, so serve Docktor itself over HTTPS with a reverse proxy of your own; see [Security](/security#network-exposure).

## Before you start

- A DNS record for each domain (an `A` or `AAAA` record) that points at your server.
- Ports 80 and 443 of the host free. If another program or container already publishes either port, Docktor cannot deploy the proxy and says so. Free the ports and try again; Docktor never falls back to other ports.
- Ports 80 and 443 reachable from the internet if you want Let's Encrypt certificates, because the certificate authority checks your domain over HTTP. For a purely internal domain, use your own certificate instead (see [Using your own certificate](#using-your-own-certificate)).

## Deploying the proxy

1. Go to **Settings**, **Proxy**.
2. Enter an **ACME Email**. Let's Encrypt uses it for expiry notices and account recovery.
3. Choose **Save Proxy Settings**, then **Deploy Proxy Stack**. Deploy uses the saved email, so save first.

You can also do this in the first-run setup wizard, as an optional step. The card then shows the proxy stack's status. Changing the ACME email later redeploys the proxy so the new address takes effect.

The switch **Show the proxy stack in the dashboard** controls whether Docktor Proxy appears in the dashboard's stack list. Either way, it is a protected stack: Stop, Restart and Delete are disabled for it, with a tooltip saying that Docktor manages it.

## Assigning a domain to a service

1. Open the stack, then its **Proxy** tab. If you see "Proxy stack not deployed", deploy the proxy first, as above.
2. Choose **Assign Domain**.
3. Fill in the dialog:
   - **Service**: the service that should receive the traffic.
   - **Domain**: for example `cloud.example.com`.
   - **Internal Port**: the port the service listens on inside its container.
   - **Enable TLS**: serve the domain over HTTPS.
   - **Certificate Source**: **Automatic (Let's Encrypt)** or **One of my certificates**.
4. Choose **Save Domain**.

What Docktor does when you save: it adds proxy settings to that service in the stack's `docker-compose.yml` (the `VIRTUAL_HOST`, `VIRTUAL_PORT` and, for automatic TLS, `LETSENCRYPT_HOST` environment variables, and the shared `docktor_proxy` network), then redeploys the stack so the proxy picks them up. The change is visible in the Config tab like any other compose edit. Because the stack is redeployed, expect a brief restart of its containers.

Good to know:

- A service can have several domains. They all route to the same internal port; changing the port on one changes it for the service's other domains.
- A domain can belong to only one service across Docktor.
- If the service already publishes a port directly on the host, the dialog warns that the direct binding stays active alongside the proxy. Docktor does not remove it.
- Domains you wrote into `VIRTUAL_HOST` by hand are picked up the next time you assign a domain to that service, so they are not lost.

The domains table shows each domain with its service, internal port, TLS state, **Certificate** status and **Source** (Automatic or Custom certificate). Use the pencil button to edit a domain (its name is fixed; change the port, TLS or certificate) and the bin button to remove it. **Remove domain** deletes the routing and TLS configuration for that domain and redeploys the service.

## Certificate status

For each domain the table shows one of:

| Status | Meaning |
|---|---|
| **Cert pending** | Not issued yet, or Docktor has not checked yet. A first issuance can take a minute or two. |
| **Secured** | A valid certificate is in place. |
| **Expiring soon** | A certificate is still serving traffic but is close to expiry. |
| **Cert failed** | Issuance failed. The most recent message from the certificate companion is shown under the badge. |

Status updates live on the page.

## Using your own certificate

If you have a certificate from your own authority, or a wildcard certificate, upload it and use it instead of Let's Encrypt.

1. Under **Settings**, **Proxy**, in **Certificates**, enter a **Domain Pattern** such as `*.example.com`, choose the **Certificate File** and the **Private Key File**, optionally a **CA Bundle (optional)**, and choose **Upload Certificate**.
2. When assigning or editing a domain, set **Certificate Source** to **One of my certificates** and pick the certificate.

For a domain that uses one of your certificates, Docktor does not ask Let's Encrypt for a certificate. The **Certificates** list shows each certificate's expiry and marks those expiring within 30 days with **Expiring soon**; renewing means uploading a new one. **Delete** removes a certificate from the list so it can no longer be chosen.

## Troubleshooting

- **"Could not deploy the proxy stack — ports 80/443 are already in use."** Another process or container holds one of the ports. Stop it (or move its ports) and choose **Deploy Proxy Stack** again.
- **A domain stays on Cert pending.** Check that its DNS record points at this server, that ports 80 and 443 are reachable from the internet, and that the ACME email is set. Then look at the output of the proxy: open the **Docktor Proxy** stack (visible when "Show the proxy stack in the dashboard" is on) and read its **Logs** tab for the `acme-companion` service.
- **Cert failed.** Read the message under the badge. Let's Encrypt limits how often certificates can be requested for the same domain, so repeated failed attempts can lock you out for a while; fix the cause before retrying.
- **The domain opens a different site, or a 503 page.** Check that **Internal Port** matches the port the service really listens on, and that the stack is running.

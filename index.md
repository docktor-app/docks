---
layout: home

hero:
  name: Docktor
  text: Docker Compose, managed from your browser
  tagline: Deploy, monitor and manage Docker Compose stacks on one server from a browser UI, with no SSH session needed.
  actions:
    - theme: brand
      text: Get started
      link: /guide/get-started
    - theme: alt
      text: GitHub
      link: https://github.com/docktor-app/docktor

features:
  - title: Stacks and compose editing
    details: Create stacks from pasted compose files, edit compose and .env content in the browser, review the change before it is applied, and deploy, stop or restart with live status.
    link: /features/stacks
    linkText: Read the guide
  - title: Templates
    details: Start a new stack from a template repository instead of a blank file. Any git repository with the template layout works as a source.
    link: /features/templates
    linkText: Read the guide
  - title: Backups with restic
    details: Back up each stack with restic, on a schedule or on demand, see every run in a history, and restore a snapshot from the same screen.
    link: /features/backups
    linkText: Read the guide
  - title: Proxy and TLS
    details: Give a service its own domain with automatic Let's Encrypt certificates, or upload your own certificate, through a reverse proxy Docktor runs for you.
    link: /features/proxy
    linkText: Read the guide
  - title: Brownfield import
    details: Scan the host for Compose projects that already run, then adopt them in place or migrate them into Docktor's stacks directory.
    link: /features/import
    linkText: Read the guide
  - title: Update checks
    details: Find out when a newer image version is available for the images your stacks use, and apply it when you choose to.
    link: /features/updates
    linkText: Read the guide
  - title: Health, uptime and storage
    details: Optional HTTP health probes, uptime and incident history per stack, a disk usage view, and email alerts for errors and low disk space.
    link: /features/health
    linkText: Read the guide
  - title: Two-factor authentication
    details: Protect the account that controls your host with an authenticator app and recovery codes, optionally required for everyone, with a limit on sign-in attempts.
    link: /features/account-security
    linkText: Read the guide
---

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
  - title: Templates
    details: Start a new stack from a template repository instead of a blank file. Any git repository with the template layout works as a source.
  - title: Backups with restic
    details: Back up stack data to a local path, SFTP or S3 with restic, on a schedule or on demand, and restore a snapshot from the same screen.
  - title: Health, uptime and update checks
    details: See service health and uptime per stack, and find out when a newer image version is available for the images your stacks use.
---

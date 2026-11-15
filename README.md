# Minimal Express server with TypeScript

This is a learning project to understand how an **Express** server is set up, in **TypeScript**, by building a small JSON REST API.

The full build log, step by step, is in [NOTES.md](NOTES.md).

> **Authorship note:** Planned by me, implemented with Claude Code. Content by me, wording by Claude.

<br>

## Technical details

| Item             | Version         |
| ---------------- | --------------- |
| Operating system | Linux Mint 21.2 |
| Node.js          | v24.14.0        |
| npm              | 11.9.0          |
| Volta            | 1.1.1           |
| TypeScript       | 6.0.3           |
| Express          | 5.3.0           |

<br>

## Evolution roadmap

The planned evolution roadmap of the repo. Each version is built in phases: see the [backend roadmap](docs/claude/evolution_roadmap_backend.md) and the [frontend roadmap](docs/claude/evolution_roadmap_frontend.md).

- v1: API endpoint development with in-memory storage, tested through the REST Client extension in VS Code (`blog.http`)
- v2: PostgreSQL integration
- v3: simple frontend with React

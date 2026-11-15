# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. General working rules live in `.claude/rules/`.

<br>

## Project context

- **Purpose:** a learning project to understand how an **Express** server is set up, in **TypeScript**, by building a small JSON REST API, and to add a **React** frontend that calls it.
- **Scope:** Express, TypeScript and PostgreSQL in `backend`; React, Vite, React Router and Tailwind CSS in `frontend`. PostgreSQL runs in a Docker container (`docker-compose.yaml`); the backend runs on the host with Node.js and reaches the database with `pg` and plain SQL. There is no ORM.
- **Local demo:** it runs locally and is never deployed.

<br>

## Repository layout

Update this tree whenever a file or folder is added.

```text
.
├── .claude/
│   ├── rules/           # engineer, error handling, maintainer, ui, validation, writer rules
│   ├── skills/          # /commit
│   └── settings.json    # permissions
├── db/
│   ├── init/            # 01-schema.sql, 02-seed.sql: run by the container when the volume is empty
│   └── seed/            # CSV files loaded with COPY; the source of truth for the data
├── docs/
│   ├── claude/          # additional files for Claude used in .claude/rules/
│   │   └── assets/      # page mock-ups
│   └── notes/           # set-up manuals and decision notes linked from NOTES.md
│       ├── info_db_setup.md  # database client, Docker and .env decisions
│       └── manual_coding_guidelines.md  # Prettier, ESLint, Husky and lint-staged set-up
├── .husky/
│   ├── pre-commit       # runs lint-staged
│   └── prepare-commit-msg  # conventional merge messages
├── src/
│   ├── controllers/
│   │   └── postController.ts  # the handlers of the /api/blog endpoints
│   ├── data/
│   │   └── posts.ts     # Post interface: the shape of one post row
│   ├── db/
│   │   └── pool.ts      # the shared pg.Pool, built from DATABASE_URL
│   ├── middleware/
│   │   └── errorHandlers.ts  # notFoundHandler (JSON 404) and errorHandler (JSON 400 and 500)
│   ├── routes/
│   │   └── postRoutes.ts  # postRouter: maps each /api/blog path and method to a handler
│   ├── app.ts           # the Express app: routes, later middleware
│   └── server.ts        # checks the database, then starts the app on port 8000
├── .env.example         # variable names; copy to .env, which is never committed
├── .gitignore
├── .prettierignore
├── .prettierrc.json     # Prettier options and plugins
├── blog.http            # REST Client requests for the /api/blog endpoints
├── CLAUDE.md
├── docker-compose.yaml  # the PostgreSQL 18 container
├── eslint.config.js     # ESLint rules for TypeScript and Node.js
├── NOTES.md             # build log: commands, files, checks, in build order
├── package-lock.json
├── package.json         # scripts, dev dependencies, Volta pin
├── README.md            # purpose, tool versions, local Git set-up
└── tsconfig.json        # type check settings for Node.js type stripping
```

- **`brainstorming/`:** the maintainer's local notes; listed in `.gitignore`, so never committed. Claude reads them but never edits them, except `brainstorming/claude/` (see `writer_docs.md`).

<br>

## Project docs

Read the matching file before you work on that layer. The rules in `.claude/rules/` link to the same files.

| Work on                                    | Read                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend phases**                         | [evolution_roadmap_backend.md](docs/claude/evolution_roadmap_backend.md)                                                                                                                                             |
| **API routes and responses**               | [api_endpoints.md](docs/claude/api_endpoints.md), [create_post_example.md](docs/claude/create_post_example.md)                                                                                                       |
| **Frontend phases**                        | [evolution_roadmap_frontend.md](docs/claude/evolution_roadmap_frontend.md)                                                                                                                                           |
| **Frontend pages, components and styling** | [ui_specifications.md](docs/claude/ui_specifications.md), [ui_visual_identity.md](.claude/rules/ui_visual_identity.md), [brand_style_guide.md](docs/claude/brand_style_guide.md)                                     |
| **Database schema and seed data**          | [01-schema.sql](db/init/01-schema.sql), [db/seed/](db/seed/) (the source of truth); [mock_schema.sql](docs/claude/mock_schema.sql) and [mock_data.js](docs/claude/mock_data.js) are a subset for the in-memory phase |

<br>

## Documentation

- [Express 5 API reference](https://expressjs.com/en/5x/api.html)
- [Express: writing middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Express: routing](https://expressjs.com/en/guide/routing.html)
- [Express: error handling](https://expressjs.com/en/guide/error-handling.html)
- [Node.js](https://nodejs.org/docs/latest/api/)
- [node-postgres (pg)](https://node-postgres.com/)
- [PostgreSQL](https://www.postgresql.org/docs/current/)
- [PostgreSQL Docker image](https://hub.docker.com/_/postgres)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [React](https://react.dev/reference/react)
- [Vite](https://vite.dev/guide/)
- [React Router](https://reactrouter.com/home)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MDN: HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Conventional Commits](https://gist.github.com/qoomon/5dfcdf8eec66a051ecd85625518cfd13)
- [Conventional Branch](https://conventionalbranch.org/)

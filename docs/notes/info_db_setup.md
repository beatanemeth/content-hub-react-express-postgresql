# Database setup

<br>

## Set-up decisions

| Decision         | Choice                                       | Reason                                                                                |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- |
| Database client  | `pg` with `@types/pg`                        | You write the SQL yourself, so you see every query that runs.                         |
| What Docker runs | PostgreSQL only                              | The app still runs with `npm run dev`, so Docker and Express stay separate topics.    |
| Settings         | A `.env` file read by `node --env-file=.env` | Node.js 20.6 and later read the file natively, so the `dotenv` package is not needed. |

<br>

## Choosing a database client

The main Node.js clients for PostgreSQL, compared with Python:

| Client                   | Kind                                                             | Python equivalent |
| ------------------------ | ---------------------------------------------------------------- | ----------------- |
| **`pg`** (node-postgres) | Driver: you write SQL, it returns rows                           | `psycopg`         |
| **Kysely**               | Type-safe query builder that runs on top of `pg`                 | SQLAlchemy Core   |
| **Drizzle**              | Lightweight ORM that reads like SQL, with its own migration tool | SQLAlchemy ORM    |
| **Prisma**               | Full ORM with its own schema language                            | Django ORM        |

- **No single best practice:** each team chooses the level of abstraction it wants. A common TypeScript pattern is a driver underneath and a type-safe layer on top (Kysely or Drizzle). Both can run on `pg`, so knowing `pg` is useful in either case.

**Choose `pg` when:**

- **You want to see the SQL:** each handler runs one readable query, such as `SELECT ... WHERE id = $1`. An ORM generates the SQL, so you learn the ORM's API instead of the SQL.
- **The schema lives in SQL files:** PostgreSQL creates the tables and loads CSV seed data with `COPY`, without any Node.js code. Prisma and Drizzle define the tables in their own schema files and create them with their migration tools.
- **You may add a layer later:** Kysely runs on the same `pg` pool, so the existing set-up is kept.

**Trade-off:** `pg` does not check queries against the tables. TypeScript cannot detect a wrong column name, so you write each row type (for example, `Post`) by hand.

<br>

## Habits for any client

- **Parameterised queries:** pass values as `$1, $2`, never by joining strings. This prevents SQL injection.
- **One shared pool:** create the connection pool once in a module and import it wherever it is needed.
- **Connection settings from the environment:** a `DATABASE_URL` in `.env`, never in the code.
- **Schema in SQL files under version control:** never only typed by hand in `psql`.

<br>

## Key lines in `docker-compose.yaml`

| Line                         | Reason                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `image: postgres:18`         | The major version is pinned, so a new PostgreSQL release cannot change the database unexpectedly.                                |
| `${POSTGRES_USER:?...}`      | Compose reads the value from `.env`. The `:?` part stops start-up with an error message when the value is missing.               |
| `'127.0.0.1:5432:5432'`      | Only your machine can connect. Without `127.0.0.1`, Docker opens the port to the network and bypasses the host firewall.         |
| `pgdata:/var/lib/postgresql` | A named volume keeps the data outside the container. Version 18 uses this path; earlier versions use `/var/lib/postgresql/data`. |

import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

/* Without this check, pg falls back to its own defaults and fails later with a less clear error. */
if (!connectionString) {
  throw new Error('DATABASE_URL is not set; add it to .env (see .env.example)');
}

/* A date column has no time of day: keep it as text ('2020-12-28'), not a Date at local midnight. */
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

/* One pool for the whole app: it opens connections when queries need them and reuses them. */
export const pool = new pg.Pool({ connectionString });

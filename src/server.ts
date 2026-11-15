import { app } from './app.ts';
import { pool } from './db/pool.ts';

const PORT = 8000;

/* Stop at start-up, not on the first request, when the database cannot be reached. */
await pool.query('SELECT 1');

app.listen(PORT, (error) => {
  /* Express 5 passes start-up errors (for example, the port is in use) to this callback. */
  if (error) {
    throw error;
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});

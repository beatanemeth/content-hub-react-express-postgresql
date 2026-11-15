import { app } from './app.ts';

const PORT = 8000;

app.listen(PORT, (error) => {
  /* Express 5 passes start-up errors (for example, the port is in use) to this callback. */
  if (error) {
    throw error;
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});

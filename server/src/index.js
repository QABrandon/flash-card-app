import { createApp } from './app.js';
import { createDb, DEFAULT_DB_PATH } from './db.js';

const PORT = process.env.PORT ?? 3001;

const db = createDb(DEFAULT_DB_PATH);
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import { createApp } from './app.js';
import { createDb, DEFAULT_DB_PATH } from './db.js';
import { seed } from './seed.js';

const PORT = process.env.PORT ?? 3001;

const db = createDb(DEFAULT_DB_PATH);
seed(db);
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

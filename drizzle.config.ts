import type { Config } from 'drizzle-kit';
import { resolve } from 'path';

// Get absolute path to database
const dbPath = resolve('./data/sqlite.db');

export default {
  schema: './src/db/schema/*.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  verbose: true,
  dbCredentials: {
    url: `file:${dbPath}` // SQLite connection URL
  }
} satisfies Config; 
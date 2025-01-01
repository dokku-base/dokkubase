import type { Config } from 'drizzle-kit';
import { resolve } from 'path';

// Get absolute path to database
const dbPath = resolve('./data/sqlite.db');

export default {
  schema: './src/lib/auth/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  verbose: true,
  dbCredentials: {
    url: `file:${dbPath}` // SQLite connection URL
  }
} satisfies Config; 
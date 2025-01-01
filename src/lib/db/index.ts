import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Use environment variable or default to data/sqlite.db
const DB_PATH = process.env.DB_PATH || 'data/sqlite.db';

// Ensure data directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';
mkdirSync(dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema }); 
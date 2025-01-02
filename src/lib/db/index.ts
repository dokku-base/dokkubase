import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../auth/schema';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

// Use the same path as in drizzle.config.ts
const DB_PATH = resolve('./data/sqlite.db');

// Ensure data directory exists
mkdirSync(resolve('./data'), { recursive: true });

// Initialize database
const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema });

// Validate database connection
export async function validateDb() {
    try {
        const result = await db.select().from(schema.users);
        return true;
    } catch (error) {
        console.error('Database validation error:', error);
        return false;
    }
}
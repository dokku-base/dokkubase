import Database from 'better-sqlite3';
import { join } from 'path';

// Ścieżka do bazy danych
const dbPath = join(process.cwd(), 'db.sqlite');

console.log('🚀 Enabling WAL mode for SQLite database...');

try {
  // Otwórz połączenie
  const db = new Database(dbPath);

  // Włącz WAL mode
  db.pragma('journal_mode = WAL');
  
  // Sprawdź czy się udało
  const mode = db.pragma('journal_mode', { simple: true });
  
  if (mode === 'wal') {
    console.log('✅ WAL mode enabled successfully!');
  } else {
    console.error('❌ Failed to enable WAL mode');
    process.exit(1);
  }

  // Zamknij połączenie
  db.close();
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

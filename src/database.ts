
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(__dirname, '..', 'salary.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      country TEXT NOT NULL,
      salary REAL NOT NULL
    );
  `);
  console.log('Database initialized.');
}

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Cache the db connection
let db: Database | null = null;

export async function getDbConnection() {
  if (db) {
    return db;
  }
  
  const dbPath = path.resolve(process.cwd(), 'data.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Initialize table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      jobTitle TEXT,
      empCode TEXT,
      department TEXT,
      phone TEXT,
      issueDate TEXT,
      address TEXT,
      image TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Safely add new company columns if they don't exist
  const newColumns = ['companyAddress', 'companyPhone', 'companyEmail', 'companyWeb', 'signature'];
  for (const col of newColumns) {
    try {
      await db.exec(`ALTER TABLE employees ADD COLUMN ${col} TEXT`);
    } catch (error) {
      // Column already exists, ignore
    }
  }

  return db;
}

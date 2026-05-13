import { sql } from '@vercel/postgres';

export async function initDb() {
  try {
    // Initialize table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name TEXT,
        jobTitle TEXT,
        empCode TEXT,
        department TEXT,
        phone TEXT,
        issueDate TEXT,
        address TEXT,
        image TEXT,
        companyAddress TEXT,
        companyPhone TEXT,
        companyEmail TEXT,
        companyWeb TEXT,
        signature TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Helper to ensure db is ready
export async function getDb() {
  // In Postgres, we don't need to return a connection object like in SQLite
  // the 'sql' import from @vercel/postgres handles pooling and connections.
  return sql;
}

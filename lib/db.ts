import { Client } from 'pg';

export async function initDb() {
  const client = new Client({
    connectionString: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  try {
    // Initialize table if it doesn't exist
    await client.query(`
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
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Helper to ensure db is ready
export async function getDb() {
  // Using standard pg Client to support direct connection strings over raw TCP without proxy routing.
  // Note: Callers should call await client.end() after finishing their queries.
  const client = new Client({
    connectionString: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  return client;
}

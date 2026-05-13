'use server';

import { Client } from 'pg';
import os from 'os';

export interface Employee {
  id: number;
  name: string;
  jobTitle: string;
  empCode: string;
  department: string;
  phone: string;
  issueDate: string;
  address: string;
  image: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWeb?: string;
  signature?: string;
  createdAt: string;
}

// Helper function to execute queries using a pure direct TCP client connection
async function executeQuery<T>(callback: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({
    connectionString: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

// Function to initialize the table if it doesn't exist
async function ensureTableExists(client: Client) {
  try {
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
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

export async function saveEmployeeData(formData: any) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;

      const result = await client.query(`
        INSERT INTO employees (name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature]);

      return { success: true, id: result.rows[0].id, error: undefined };
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, id: undefined, error: error.message || "Failed to save data to the database." };
  }
}

export async function getAllEmployees(searchQuery?: string) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      let employees;
      
      if (searchQuery) {
        const likeQuery = `%${searchQuery}%`;
        employees = await client.query(`
          SELECT * FROM employees 
          WHERE name ILIKE $1 OR empCode ILIKE $1 OR department ILIKE $1 
          ORDER BY createdAt DESC
        `, [likeQuery]);
      } else {
        employees = await client.query(`SELECT * FROM employees ORDER BY createdAt DESC`);
      }

      return { success: true, data: employees.rows as Employee[], error: undefined };
    });
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, data: [] as Employee[], error: error.message || "Failed to fetch employees." };
  }
}

export async function getEmployeeById(id: string | number) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      const employee = await client.query(`SELECT * FROM employees WHERE id = $1`, [id]);
      
      if (employee.rows.length === 0) {
        return { success: false, data: undefined, error: "Employee not found." };
      }
      
      return { success: true, data: employee.rows[0] as Employee, error: undefined };
    });
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, data: undefined, error: error.message || "Failed to fetch employee details." };
  }
}

export async function deleteEmployee(id: number) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      await client.query(`DELETE FROM employees WHERE id = $1`, [id]);
      return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message || "Failed to delete employee." };
  }
}

export async function updateEmployee(id: number, formData: any) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;
      
      await client.query(`
        UPDATE employees SET 
          name = $1, jobTitle = $2, empCode = $3, department = $4, phone = $5, 
          issueDate = $6, address = $7, image = $8, companyAddress = $9, 
          companyPhone = $10, companyEmail = $11, companyWeb = $12, signature = $13
        WHERE id = $14
      `, [name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature, id]);
      
      return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, error: error.message || "Failed to update employee." };
  }
}

export async function getNetworkBaseUrl() {
  const interfaces = os.networkInterfaces();
  let ip = 'localhost';
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip !== 'localhost') break;
  }
  
  return ip;
}

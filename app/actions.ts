'use server';

import { createClient } from '@vercel/postgres';
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

// Helper function to execute queries using a direct client connection
async function executeQuery<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = createClient({
    connectionString: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    return await callback(client);
  } finally {
    await client.end();
  }
}

// Function to initialize the table if it doesn't exist
async function ensureTableExists(client: any) {
  try {
    await client.sql`
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
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

export async function saveEmployeeData(formData: any) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;

      const result = await client.sql`
        INSERT INTO employees (name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature)
        VALUES (${name}, ${jobTitle}, ${empCode}, ${department}, ${phone}, ${issueDate}, ${address}, ${image}, ${companyAddress}, ${companyPhone}, ${companyEmail}, ${companyWeb}, ${signature})
        RETURNING id
      `;

      return { success: true, id: result.rows[0].id };
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, error: error.message || "Failed to save data to the database." };
  }
}

export async function getAllEmployees(searchQuery?: string) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      let employees;
      
      if (searchQuery) {
        const likeQuery = `%${searchQuery}%`;
        employees = await client.sql<Employee>`
          SELECT * FROM employees 
          WHERE name ILIKE ${likeQuery} OR empCode ILIKE ${likeQuery} OR department ILIKE ${likeQuery} 
          ORDER BY createdAt DESC
        `;
      } else {
        employees = await client.sql<Employee>`SELECT * FROM employees ORDER BY createdAt DESC`;
      }

      return { success: true, data: employees.rows };
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
      const employee = await client.sql<Employee>`SELECT * FROM employees WHERE id = ${id}`;
      
      if (employee.rows.length === 0) {
        return { success: false, error: "Employee not found." };
      }
      
      return { success: true, data: employee.rows[0] };
    });
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, error: error.message || "Failed to fetch employee details." };
  }
}

export async function deleteEmployee(id: number) {
  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      await client.sql`DELETE FROM employees WHERE id = ${id}`;
      return { success: true };
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
      
      await client.sql`
        UPDATE employees SET 
          name = ${name}, jobTitle = ${jobTitle}, empCode = ${empCode}, department = ${department}, phone = ${phone}, 
          issueDate = ${issueDate}, address = ${address}, image = ${image}, companyAddress = ${companyAddress}, 
          companyPhone = ${companyPhone}, companyEmail = ${companyEmail}, companyWeb = ${companyWeb}, signature = ${signature}
        WHERE id = ${id}
      `;
      
      return { success: true };
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

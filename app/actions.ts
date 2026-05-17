'use server';

import { Client } from 'pg';
import os from 'os';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'ishfaqnazir@gmail.com';
const ADMIN_PASSWORD = 'Ishfaqnazir123';

const SESSION_COOKIE = 'admin_session';

async function isAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === 'true';
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true };
}


export interface Employee {
  id: number;
  name: string;
  jobTitle: string;
  empCode: string;
  department: string;
  phone?: string;
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

// Function to initialize the table if it doesn't exist and ensure all schema columns are present
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

    // Safely add missing columns to previously created tables without dropping existing data
    const newColumns = [
      "companyAddress TEXT",
      "companyPhone TEXT",
      "companyEmail TEXT",
      "companyWeb TEXT",
      "signature TEXT"
    ];
    for (const col of newColumns) {
      try {
        const colName = col.split(" ")[0];
        await client.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS ${colName} ${col.split(" ")[1]}`);
      } catch (err) {
        // Ignore if column already exists or syntax is unsupported
      }
    }
  } catch (error) {
    console.error("Error creating table or updating schema:", error);
  }
}

export async function saveEmployeeData(formData: any) {
  if (!await isAdmin()) {
    return { success: false, error: "Unauthorized" };
  }

  // Basic Validation
  if (!formData.name || typeof formData.name !== 'string') return { success: false, error: "Invalid name" };
  if (!formData.empCode || typeof formData.empCode !== 'string') return { success: false, error: "Invalid Employee Code" };

  try {
    return await executeQuery(async (client) => {
      await ensureTableExists(client);
      const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;

      const result = await client.query(`
        INSERT INTO employees (name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        String(name).slice(0, 255), 
        String(jobTitle).slice(0, 255), 
        String(empCode).slice(0, 100), 
        String(department).slice(0, 255), 
        String(phone).slice(0, 50), 
        String(issueDate).slice(0, 50), 
        String(address).slice(0, 1000), 
        image, // Image might be a large base64 string
        String(companyAddress).slice(0, 1000), 
        String(companyPhone).slice(0, 50), 
        String(companyEmail).slice(0, 255), 
        String(companyWeb).slice(0, 255), 
        signature
      ]);

      return { success: true, id: result.rows[0].id, error: undefined };
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, id: undefined, error: "Failed to save data. Please try again." };
  }
}

function mapEmployeeRow(row: any): Employee {
  return {
    id: row.id,
    name: row.name || "",
    jobTitle: row.jobtitle || row.jobTitle || "",
    empCode: row.empcode || row.empCode || "",
    department: row.department || "",
    phone: row.phone || "",
    issueDate: row.issuedate || row.issueDate || "",
    address: row.address || "",
    image: row.image || "",
    companyAddress: row.companyaddress || row.companyAddress || "",
    companyPhone: row.companyphone || row.companyPhone || "",
    companyEmail: row.companyemail || row.companyEmail || "",
    companyWeb: row.companyweb || row.companyWeb || "",
    signature: row.signature || "",
    createdAt: row.createdat || row.createdAt || "",
  };
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

      const mappedData = employees.rows.map(mapEmployeeRow);
      return { success: true, data: mappedData, error: undefined };
    });
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, data: [] as Employee[], error: "Failed to fetch data." };
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
      
      return { success: true, data: mapEmployeeRow(employee.rows[0]), error: undefined };
    });
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, data: undefined, error: "Failed to fetch details." };
  }
}

export async function deleteEmployee(id: number) {
  if (!await isAdmin()) {
    return { success: false, error: "Unauthorized" };
  }
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
  if (!await isAdmin()) {
    return { success: false, error: "Unauthorized" };
  }

  // Basic Validation
  if (!formData.name || typeof formData.name !== 'string') return { success: false, error: "Invalid name" };
  if (!formData.empCode || typeof formData.empCode !== 'string') return { success: false, error: "Invalid Employee Code" };

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
      `, [
        String(name).slice(0, 255), 
        String(jobTitle).slice(0, 255), 
        String(empCode).slice(0, 100), 
        String(department).slice(0, 255), 
        String(phone).slice(0, 50), 
        String(issueDate).slice(0, 50), 
        String(address).slice(0, 1000), 
        image, 
        String(companyAddress).slice(0, 1000), 
        String(companyPhone).slice(0, 50), 
        String(companyEmail).slice(0, 255), 
        String(companyWeb).slice(0, 255), 
        signature,
        id
      ]);
      
      return { success: true, error: undefined };
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update employee details." };
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

'use server';

import { getDbConnection } from '@/lib/db';
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

export async function saveEmployeeData(formData: any) {
  try {
    const db = await getDbConnection();
    
    const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;

    const result = await db.run(
      `INSERT INTO employees (name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature]
    );

    return { success: true, id: result.lastID };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, error: error.message || "Failed to save data to the database." };
  }
}

export async function getAllEmployees(searchQuery?: string) {
  try {
    const db = await getDbConnection();
    
    let query = 'SELECT * FROM employees ORDER BY createdAt DESC';
    let params: any[] = [];
    
    if (searchQuery) {
      query = 'SELECT * FROM employees WHERE name LIKE ? OR empCode LIKE ? OR department LIKE ? ORDER BY createdAt DESC';
      const likeQuery = `%${searchQuery}%`;
      params = [likeQuery, likeQuery, likeQuery];
    }

    const employees = await db.all<Employee[]>(query, params);
    return { success: true, data: employees };
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, data: [] as Employee[], error: error.message || "Failed to fetch employees." };
  }
}

export async function getEmployeeById(id: string | number) {
  try {
    const db = await getDbConnection();
    const employee = await db.get<Employee>('SELECT * FROM employees WHERE id = ?', [id]);
    
    if (!employee) {
      return { success: false, error: "Employee not found." };
    }
    
    return { success: true, data: employee };
  } catch (error: any) {
    console.error("Fetch Error:", error);
    return { success: false, error: error.message || "Failed to fetch employee details." };
  }
}

export async function deleteEmployee(id: number) {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM employees WHERE id = ?', [id]);
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message || "Failed to delete employee." };
  }
}

export async function updateEmployee(id: number, formData: any) {
  try {
    const db = await getDbConnection();
    const { name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature } = formData;
    
    await db.run(
      `UPDATE employees SET 
        name = ?, jobTitle = ?, empCode = ?, department = ?, phone = ?, 
        issueDate = ?, address = ?, image = ?, companyAddress = ?, 
        companyPhone = ?, companyEmail = ?, companyWeb = ?, signature = ?
      WHERE id = ?`,
      [name, jobTitle, empCode, department, phone, issueDate, address, image, companyAddress, companyPhone, companyEmail, companyWeb, signature, id]
    );
    
    return { success: true };
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

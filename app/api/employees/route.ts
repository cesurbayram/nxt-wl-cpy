import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/types/employee.types";
import { NotificationService } from "@/utils/service/notification";

export async function GET(request: NextRequest) {
  try {
    const employeeDbResp = await dbPool.query(`
      SELECT 
        e.id,
        e.employee_code,
        e.name,
        e.last_name,
        e.email,
        e.phone,
        e.position,
        e.department,
        e.location,
        e.hire_date,
        e.employee_role_id,
        e.status,
        e.created_at,
        e.updated_at,
        er.name as employee_role_name,
        er.description as employee_role_description,
        u.id as user_id,
        u.name as user_name,
        u.last_name as user_last_name,
        u.email as user_email,
        u.role as user_role,
        u.user_name as user_username
      FROM employees e
      LEFT JOIN employee_roles er ON e.employee_role_id = er.id
      LEFT JOIN users u ON e.id = u.employee_id
      WHERE e.deleted_at IS NULL
      ORDER BY e.created_at DESC
    `);

    const employees: Employee[] = employeeDbResp.rows.map((row) => ({
      id: row.id,
      employee_code: row.employee_code,
      name: row.name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      position: row.position,
      department: row.department,
      location: row.location,
      hire_date: row.hire_date,
      employee_role_id: row.employee_role_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      employee_role: row.employee_role_name
        ? {
            id: row.employee_role_id,
            name: row.employee_role_name,
            description: row.employee_role_description,
            permissions: [],
            is_active: true,
          }
        : undefined,
      user: row.user_id
        ? {
            id: row.user_id,
            name: row.user_name,
            lastName: row.user_last_name,
            email: row.user_email,
            role: row.user_role,
            userName: row.user_username,
          }
        : undefined,
    }));

    return NextResponse.json(employees, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {
    employee_code,
    name,
    last_name,
    email,
    position,
    department,
    location,
    employee_role_id,
    status,
  }: CreateEmployeeRequest = await request.json();

  const client = await dbPool.connect();
  const newEmployeeId = uuidv4();

  try {
    const checkEmployee = await client.query(
      `SELECT * FROM employees WHERE employee_code = $1 AND deleted_at IS NULL`,
      [employee_code]
    );

    if (checkEmployee.rowCount && checkEmployee.rowCount > 0) {
      return NextResponse.json(
        { message: "Employee code already exists!" },
        { status: 409 }
      );
    }

    const checkEmail = await client.query(
      `SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );

    if (checkEmail.rowCount && checkEmail.rowCount > 0) {
      return NextResponse.json(
        { message: "Email already exists!" },
        { status: 409 }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO employees (
        id, employee_code, name, last_name, email, position, 
        department, location, employee_role_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newEmployeeId,
        employee_code,
        name,
        last_name,
        email,
        position,
        department,
        location,
        employee_role_id,
        status,
      ]
    );

    await client.query("COMMIT");

    try {
      await NotificationService.notifyEmployeeAdded(
        newEmployeeId,
        `${name} ${last_name}`,
        employee_code,
        department
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json(
      { message: "Employee created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const {
    id,
    employee_code,
    name,
    last_name,
    email,
    position,
    department,
    location,
    employee_role_id,
    status,
  }: UpdateEmployeeRequest = await request.json();

  const client = await dbPool.connect();

  try {
    const checkEmployee = await client.query(
      `SELECT * FROM employees WHERE employee_code = $1 AND id != $2 AND deleted_at IS NULL`,
      [employee_code, id]
    );

    if (checkEmployee.rowCount && checkEmployee.rowCount > 0) {
      return NextResponse.json(
        { message: "Employee code already exists!" },
        { status: 409 }
      );
    }

    const checkEmail = await client.query(
      `SELECT * FROM employees WHERE email = $1 AND id != $2 AND deleted_at IS NULL`,
      [email, id]
    );

    if (checkEmail.rowCount && checkEmail.rowCount > 0) {
      return NextResponse.json(
        { message: "Email already exists!" },
        { status: 409 }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE employees 
       SET employee_code = $1, name = $2, last_name = $3, email = $4, 
           position = $5, department = $6, location = $7, 
           employee_role_id = $8, status = $9, updated_at = now()
       WHERE id = $10`,
      [
        employee_code,
        name,
        last_name,
        email,
        position,
        department,
        location,
        employee_role_id,
        status,
        id,
      ]
    );

    await client.query("COMMIT");

    try {
      await NotificationService.notifyEmployeeUpdated(
        id,
        `${name} ${last_name}`,
        employee_code
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json(
      { message: "Employee updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

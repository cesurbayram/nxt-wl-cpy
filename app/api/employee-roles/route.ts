import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import {
  EmployeeRole,
  CreateEmployeeRoleRequest,
  UpdateEmployeeRoleRequest,
} from "@/types/employee.types";

export async function GET(request: NextRequest) {
  try {
    const roleDbResp = await dbPool.query(`
      SELECT 
        er.id,
        er.name,
        er.description,
        er.permissions,
        er.is_active,
        er.created_at,
        er.updated_at,
        COUNT(e.id) as employee_count
      FROM employee_roles er
      LEFT JOIN employees e ON er.id = e.employee_role_id AND e.deleted_at IS NULL
      WHERE er.deleted_at IS NULL
      GROUP BY er.id, er.name, er.description, er.permissions, er.is_active, er.created_at, er.updated_at
      ORDER BY er.created_at DESC
    `);

    const roles = roleDbResp.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      permissions: row.permissions || [],
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      employee_count: parseInt(row.employee_count),
    }));

    return NextResponse.json(roles, { status: 200 });
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
    name,
    description,
    permissions,
    is_active,
  }: CreateEmployeeRoleRequest = await request.json();

  const client = await dbPool.connect();
  const newRoleId = uuidv4();

  try {
    const checkRole = await client.query(
      `SELECT * FROM employee_roles WHERE name = $1 AND deleted_at IS NULL`,
      [name]
    );

    if (checkRole.rowCount && checkRole.rowCount > 0) {
      return NextResponse.json(
        { message: "Role name already exists!" },
        { status: 409 }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO employee_roles (id, name, description, permissions, is_active)
       VALUES ($1, $2, $3, $4, $5)`,
      [newRoleId, name, description, JSON.stringify(permissions), is_active]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Employee role created successfully" },
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
    name,
    description,
    permissions,
    is_active,
  }: UpdateEmployeeRoleRequest = await request.json();

  const client = await dbPool.connect();

  try {
    const checkRole = await client.query(
      `SELECT * FROM employee_roles WHERE name = $1 AND id != $2 AND deleted_at IS NULL`,
      [name, id]
    );

    if (checkRole.rowCount && checkRole.rowCount > 0) {
      return NextResponse.json(
        { message: "Role name already exists!" },
        { status: 409 }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE employee_roles 
       SET name = $1, description = $2, permissions = $3, is_active = $4, updated_at = now()
       WHERE id = $5`,
      [name, description, JSON.stringify(permissions), is_active, id]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Employee role updated successfully" },
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

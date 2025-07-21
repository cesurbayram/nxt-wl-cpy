import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT 
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
      WHERE er.id = $1 AND er.deleted_at IS NULL
      GROUP BY er.id, er.name, er.description, er.permissions, er.is_active, er.created_at, er.updated_at`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const role = dbRes.rows[0];
      const formattedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions || [],
        is_active: role.is_active,
        created_at: role.created_at,
        updated_at: role.updated_at,
        employee_count: parseInt(role.employee_count),
      };

      return NextResponse.json(formattedRole);
    }

    return NextResponse.json(
      { message: "Employee role not found" },
      { status: 404 }
    );
  } catch (error) {
    console.log("DB Error: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const checkAssignment = await client.query(
      `SELECT COUNT(*) as count FROM employees WHERE employee_role_id = $1 AND deleted_at IS NULL`,
      [params.id]
    );

    if (checkAssignment.rows[0].count > 0) {
      return NextResponse.json(
        { message: "Cannot delete role. It is assigned to employees." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE employee_roles 
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1`,
      [params.id]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Employee role deleted successfully" },
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

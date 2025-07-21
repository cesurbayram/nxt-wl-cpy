import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { NotificationService } from "@/utils/service/notification";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT 
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
        er.description as employee_role_description
      FROM employees e
      LEFT JOIN employee_roles er ON e.employee_role_id = er.id
      WHERE e.id = $1 AND e.deleted_at IS NULL`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const employee = dbRes.rows[0];
      const formattedEmployee = {
        id: employee.id,
        employee_code: employee.employee_code,
        name: employee.name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        location: employee.location,
        hire_date: employee.hire_date,
        employee_role_id: employee.employee_role_id,
        status: employee.status,
        created_at: employee.created_at,
        updated_at: employee.updated_at,
        employee_role: employee.employee_role_name
          ? {
              id: employee.employee_role_id,
              name: employee.employee_role_name,
              description: employee.employee_role_description,
              permissions: [],
              is_active: true,
            }
          : undefined,
      };

      return NextResponse.json(formattedEmployee);
    }

    return NextResponse.json(
      { message: "Employee not found" },
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
    await client.query("BEGIN");

    const employeeInfo = await client.query(
      `SELECT name, last_name, employee_code FROM employees WHERE id = $1`,
      [params.id]
    );

    await client.query(
      `UPDATE employees 
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1`,
      [params.id]
    );

    await client.query("COMMIT");

    if (employeeInfo.rows.length > 0) {
      const employee = employeeInfo.rows[0];
      try {
        await NotificationService.notifyEmployeeDeleted(
          `${employee.name} ${employee.last_name}`,
          employee.employee_code
        );
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }
    }

    return NextResponse.json(
      { message: "Employee deleted successfully" },
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

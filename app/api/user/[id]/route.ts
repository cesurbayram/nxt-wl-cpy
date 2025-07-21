import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT
                u.id,
                u.name,
                u.last_name AS "lastName",
                u.user_name AS "userName",
                u.email,
                u.role,
                u.code,
                u.position,
                u.location,
                u.employee_id,
                e.employee_code,
                e.name AS employee_name,
                e.last_name AS employee_last_name,
                e.department,
                e.hire_date,
                e.status AS employee_status               
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.id AND e.deleted_at IS NULL
            WHERE u.id = $1`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const user = dbRes.rows[0];
      const formattedUser = {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        role: user.role,
        code: user.code,
        position: user.position,
        location: user.location,
        employee_id: user.employee_id,
        employee: user.employee_code
          ? {
              id: user.employee_id,
              employee_code: user.employee_code,
              name: user.employee_name,
              last_name: user.employee_last_name,
              department: user.department,
              hire_date: user.hire_date,
              status: user.employee_status,
              email: "",
              phone: "",
              position: "",
              location: "",
              employee_role_id: "",
              permissions: [],
              is_active: true,
            }
          : undefined,
      };

      return NextResponse.json(formattedUser);
    }
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  } catch (error) {
    console.log("DB Error: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

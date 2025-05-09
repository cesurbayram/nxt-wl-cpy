import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { Shift } from "@/types/shift.types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: "Shift ID is required" },
      { status: 400 }
    );
  }

  try {
    const shiftDbResp = await dbPool.query(
      `
      SELECT 
        s.id, 
        s.name, 
        s.shift_start AS "shiftStart", 
        s.shift_end AS "shiftEnd", 
        s.shift_type AS "shiftType", 
        s.status, 
        s.location, 
        s.expected_product_count AS "expectedProductCount",
        s.created_at AS "createdAt", 
        s.updated_at AS "updatedAt" 
      FROM shift s
      WHERE s.id = $1 AND s.deleted_at IS NULL
      `,
      [id]
    );

    if (shiftDbResp.rows.length === 0) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    const shift: Shift = shiftDbResp.rows[0];
    return NextResponse.json(shift, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { message: "Shift ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await dbPool.query(
      `
      DELETE FROM "shift"
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Shift deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

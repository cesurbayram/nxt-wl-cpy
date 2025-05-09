import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { Shift } from "@/types/shift.types";

export async function GET(request: NextRequest) {
  try {
    const shiftDbResp = await dbPool.query(`
      SELECT 
        s.id, 
        s.name, 
        s.shift_start AS "shiftStart", 
        s.shift_end AS "shiftEnd", 
        s.created_at AS "createdAt", 
        s.updated_at AS "updatedAt" 
      FROM shift s
      WHERE s.deleted_at IS NULL
      ORDER BY s.created_at DESC
    `);

    const shifts: Shift[] = shiftDbResp.rows;
    return NextResponse.json(shifts, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { name, shiftStart, shiftEnd }: Shift = await request.json();
  const client = await dbPool.connect();
  const newShiftId = uuidv4();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO "shift" (id, name, shift_start, shift_end)
      VALUES ($1, $2, $3, $4)`,
      [newShiftId, name, shiftStart, shiftEnd]
    );

    await client.query("COMMIT");
    return NextResponse.json({ id: newShiftId }, { status: 201 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, shiftStart, shiftEnd }: Shift = await request.json();
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE "shift" SET 
        name = $1, 
        shift_start = $2, 
        shift_end = $3, 
        updated_at = NOW()
      WHERE id = $4`,
      [name, shiftStart, shiftEnd, id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ id }, { status: 200 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE "shift" SET 
        deleted_at = NOW() 
      WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

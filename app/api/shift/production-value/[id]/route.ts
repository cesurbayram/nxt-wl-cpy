import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const query = `
      SELECT 
        pv.id, 
        pv.controller_id AS "controllerId", 
        pv.shift_id AS "shiftId", 
        pv.job_id AS "jobId", 
        pv.produced_product_count AS "producedProductCount", 
        pv.note, 
        pv.created_at AS "createdAt", 
        pv.updated_at AS "updatedAt",
        c.name AS "controllerName",
        s.name AS "shiftName",
        j.name AS "jobName"
      FROM production_value pv
      LEFT JOIN controller c ON pv.controller_id = c.id
      LEFT JOIN shift s ON pv.shift_id = s.id
      LEFT JOIN job_select j ON pv.job_id = j.id
      WHERE pv.id = $1
    `;

    const result = await dbPool.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Production value not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0], { status: 200 });
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
  const id = params.id;
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    const checkResult = await client.query(
      "SELECT id FROM production_value WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Production value not found" },
        { status: 404 }
      );
    }

    await client.query("DELETE FROM production_value WHERE id = $1", [id]);

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

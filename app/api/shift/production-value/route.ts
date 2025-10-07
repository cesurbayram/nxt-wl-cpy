import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { ProductionValue } from "@/types/production-value.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const controllerId = searchParams.get("controllerId");
    const shiftId = searchParams.get("shiftId");
    const jobId = searchParams.get("jobId");

    let query = `
      SELECT 
        pv.id, 
        pv.controller_id AS "controllerId", 
        pv.shift_id AS "shiftId", 
        pv.job_id AS "jobId", 
        pv.produced_product_count AS "producedProductCount",
        pv.general_no AS "generalNo", 
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
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCounter = 1;

    if (controllerId) {
      query += ` AND pv.controller_id = $${paramCounter}`;
      queryParams.push(controllerId);
      paramCounter++;
    }

    if (shiftId) {
      query += ` AND pv.shift_id = $${paramCounter}`;
      queryParams.push(shiftId);
      paramCounter++;
    }

    if (jobId) {
      query += ` AND pv.job_id = $${paramCounter}`;
      queryParams.push(jobId);
      paramCounter++;
    }

    query += " ORDER BY pv.created_at DESC";

    const result = await dbPool.query(query, queryParams);
    const productionValues: ProductionValue[] = result.rows;

    return NextResponse.json(productionValues, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {
    controllerId,
    shiftId,
    jobId,
    producedProductCount,
    generalNo,
    note,
  }: ProductionValue = await request.json();
  const client = await dbPool.connect();
  const newId = uuidv4();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO production_value (id, controller_id, shift_id, job_id, produced_product_count, general_no, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [newId, controllerId, shiftId, jobId, producedProductCount, generalNo || null, note || ""]
    );

    await client.query("COMMIT");
    return NextResponse.json({ id: newId }, { status: 201 });
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
  const {
    id,
    controllerId,
    shiftId,
    jobId,
    producedProductCount,
    note,
  }: ProductionValue = await request.json();
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE production_value SET 
        controller_id = $1, 
        shift_id = $2, 
        job_id = $3, 
        produced_product_count = $4, 
        note = $5, 
        updated_at = NOW()
      WHERE id = $6`,
      [controllerId, shiftId, jobId, producedProductCount, note || "", id]
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

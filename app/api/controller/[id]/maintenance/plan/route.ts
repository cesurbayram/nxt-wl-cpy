import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export interface MaintenancePlan {
  id: string;
  controllerId: string;
  name: string;
  operationTime: string;
  overallTime?: string;
  lastMaintenance?: string;
  totalElapsedTime?: string;
  maxOperationTime: string;
  nextMaintenance?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await dbPool.connect();
    const result = await client.query(
      `SELECT * FROM maintenance_plan WHERE controller_id = $1`,
      [params.id]
    );
    client.release();
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();
  const { name, operationTime, maxOperationTime } = await request.json();
  const newPlanId = uuidv4();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO maintenance_plan (id, controller_id, name, operation_time, max_operation_time) 
       VALUES ($1, $2, $3, $4, $5)`,
      [newPlanId, params.id, name, operationTime, maxOperationTime]
    );
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance plan created successfully" },
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
  const client = await dbPool.connect();
  const {
    id,
    name,
    operationTime,
    overallTime,
    lastMaintenance,
    totalElapsedTime,
    maxOperationTime,
    nextMaintenance,
  } = await request.json();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE maintenance_plan
       SET name = $1, operation_time = $2, overall_time = $3, last_maintenance = $4, 
           total_elapsed_time = $5, max_operation_time = $6, next_maintenance = $7, updated_at = now()
       WHERE id = $8`,
      [
        name,
        operationTime,
        overallTime || null,
        lastMaintenance || null,
        totalElapsedTime || null,
        maxOperationTime,
        nextMaintenance || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Maintenance plan not found" },
        { status: 404 }
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance plan updated successfully" },
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

export async function DELETE(request: NextRequest) {
  const client = await dbPool.connect();
  const { id } = await request.json();

  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM maintenance_plan WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance plan deleted successfully" },
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

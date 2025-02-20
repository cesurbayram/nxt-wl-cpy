// app/api/controller/[id]/maintenance/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await dbPool.connect();
    const result = await client.query(
      `SELECT 
        id, controller_id as "controllerId", name,
        operation_time as "operationTime",
        company_name as "companyName",
        maintenance_date as "maintenanceDate",
        servo_power_time as "servoPowerTime",
        next_maintenance_time as "nextMaintenanceTime",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM maintenance_plan 
      WHERE controller_id = $1
      ORDER BY created_at DESC`,
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
  const {
    name,
    operationTime,
    companyName,
    maintenanceDate,
    servoPowerTime,
    nextMaintenanceTime,
  } = await request.json();
  const newPlanId = uuidv4();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO maintenance_plan (
        id, controller_id, name, operation_time, 
        company_name, maintenance_date, servo_power_time, 
        next_maintenance_time
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newPlanId,
        params.id,
        name,
        operationTime,
        companyName,
        maintenanceDate,
        servoPowerTime,
        nextMaintenanceTime,
      ]
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
    companyName,
    maintenanceDate,
    servoPowerTime,
    nextMaintenanceTime,
  } = await request.json();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE maintenance_plan
       SET name = $1, 
           operation_time = $2, 
           company_name = $3,
           maintenance_date = $4,
           servo_power_time = $5,
           next_maintenance_time = $6,
           updated_at = now()
       WHERE id = $7`,
      [
        name,
        operationTime,
        companyName,
        maintenanceDate,
        servoPowerTime,
        nextMaintenanceTime,
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

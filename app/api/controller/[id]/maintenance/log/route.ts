import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export interface MaintenanceLog {
  id: string;
  maintenanceId: string;
  maintenanceTime: string;
  technician: string;
  description?: string;
  createdAt?: string;
  plan_name?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await dbPool.connect();
    const result = await client.query(
      `SELECT 
        ml.*,
        mp.name as plan_name
      FROM maintenance_log ml
      INNER JOIN maintenance_plan mp ON ml.maintenance_id = mp.id
      WHERE mp.controller_id = $1
      ORDER BY ml.maintenance_time DESC`,
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

export async function POST(request: NextRequest) {
  const client = await dbPool.connect();
  const { maintenanceId, maintenanceTime, technician, description } =
    await request.json();
  const newLogId = uuidv4();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO maintenance_log (id, maintenance_id, maintenance_time, technician, description) 
       VALUES ($1, $2, $3, $4, $5)`,
      [newLogId, maintenanceId, maintenanceTime, technician, description]
    );

    await client.query(
      `UPDATE maintenance_plan 
       SET last_maintenance = $1,
           total_elapsed_time = 0
       WHERE id = $2`,
      [maintenanceTime, maintenanceId]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance log created successfully" },
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
  const { id, maintenanceId, maintenanceTime, technician, description } =
    await request.json();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE maintenance_log 
       SET maintenance_id = $1, maintenance_time = $2, technician = $3, description = $4 
       WHERE id = $5`,
      [maintenanceId, maintenanceTime, technician, description, id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Maintenance log not found" },
        { status: 404 }
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance log updated successfully" },
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
    await client.query(`DELETE FROM maintenance_log WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Maintenance log deleted successfully" },
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

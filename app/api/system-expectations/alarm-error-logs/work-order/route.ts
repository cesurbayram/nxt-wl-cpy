import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const {
      controllerId,
      alarmCode,
      description,
      priority = "MEDIUM",
      type = "CORRECTIVE",
    } = await request.json();

    if (!controllerId || !alarmCode || !description) {
      return NextResponse.json(
        { message: "Controller ID, alarm code, and description are required" },
        { status: 400 }
      );
    }

    const createdDate = new Date().toISOString();

    const workOrderId = uuidv4();

    const workOrder = await client.query(
      `INSERT INTO work_orders (
        id, controller_id, alarm_code, description, priority, status, created_date
      ) VALUES ($1, $2, $3, $4, $5, 'OPEN', $6)
      RETURNING *`,
      [workOrderId, controllerId, alarmCode, description, priority, createdDate]
    );

    return NextResponse.json(
      {
        message: "System work order created successfully",
        workOrder: workOrder.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

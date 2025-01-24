import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;
    console.log("API - Received Controller ID:", controllerId);

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("API - Request Body:", body);

    const controllerCheck = await dbPool.query(
      "SELECT id FROM controller WHERE id = $1",
      [controllerId]
    );

    if (controllerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: `Controller not found with ID: ${controllerId}` },
        { status: 404 }
      );
    }

    const query = `
      INSERT INTO backup_plans (
        id, controller_id, name, days, time, file_types
      )
      VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5
      )
      RETURNING *
    `;

    const result = await dbPool.query(query, [
      controllerId,
      body.name,
      body.days,
      body.time,
      body.file_types,
    ]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating backup plan:", error);
    return NextResponse.json(
      { error: "Failed to create backup plan", details: error },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;

    const query = `
      SELECT * FROM backup_plans
      WHERE controller_id = $1
      ORDER BY created_at DESC
    `;

    const result = await dbPool.query(query, [controllerId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching backup plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup plans" },
      { status: 500 }
    );
  }
}

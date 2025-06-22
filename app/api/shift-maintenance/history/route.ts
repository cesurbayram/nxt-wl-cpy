import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const controller_id = searchParams.get("controller_id");

    let query = `
      SELECT 
        mh.id,
        mh.controller_id,
        mh.maintenance_type,
        mh.maintenance_date,
        mh.servo_hours,
        mh.technician,
        mh.notes,
        mh.created_at,
        c.name as controller_name,
        c.model as controller_model
      FROM maintenance_history mh
      JOIN controller c ON mh.controller_id = c.id
    `;

    const params = [];
    if (controller_id) {
      query += ` WHERE mh.controller_id = $1`;
      params.push(controller_id);
    }

    query += ` ORDER BY mh.maintenance_date DESC`;

    const result = await dbPool.query(query, params);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching maintenance history:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance history" },
      { status: 500 }
    );
  }
}

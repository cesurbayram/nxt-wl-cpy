import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await dbPool.query(`
      SELECT 
        c.id,
        c.name,
        c.model,
        u.servo_power_time
      FROM controller c
      LEFT JOIN (
        SELECT 
          controller_id,
          servo_power_time,
          ROW_NUMBER() OVER (PARTITION BY controller_id ORDER BY created_at DESC) as rn
        FROM utilization_data
      ) u ON c.id = u.controller_id AND u.rn = 1
      ORDER BY c.name
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching controllers for maintenance:", error);
    return NextResponse.json(
      { error: "Failed to fetch controllers" },
      { status: 500 }
    );
  }
}

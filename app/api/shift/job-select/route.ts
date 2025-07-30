import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const controllerId = searchParams.get("controllerId");
    const shiftId = searchParams.get("shiftId");

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    let query: string;
    let queryParams: any[];

    if (shiftId) {
      query = `
        SELECT DISTINCT
          js.id,
          js.name,
          js.created_at,
          js.updated_at,
          CASE WHEN sj.job_id IS NOT NULL THEN true ELSE false END as assigned_to_shift
        FROM job_select js
        LEFT JOIN shift_job sj ON js.id = sj.job_id AND sj.shift_id = $2
        LEFT JOIN job_status jst ON js.id = jst.job_id 
          AND jst.controller_id = $1 
          AND jst.shift_id = $2
        ORDER BY js.name ASC
      `;
      queryParams = [controllerId, shiftId];
    } else {
      query = `
        SELECT 
          js.id,
          js.name,
          js.created_at,
          js.updated_at,
          false as assigned_to_shift
        FROM job_select js
        ORDER BY js.name ASC
      `;
      queryParams = [];
    }

    const result = await client.query(query, queryParams);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Job Select API Error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(request: NextRequest) {
  try {
    const jobDbResp = await dbPool.query(`
      SELECT 
        id, 
        name
      FROM job_select
      ORDER BY created_at DESC
    `);

    return NextResponse.json(jobDbResp.rows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);

    return NextResponse.json([], { status: 200 });
  }
}

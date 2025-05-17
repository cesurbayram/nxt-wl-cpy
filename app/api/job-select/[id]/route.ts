import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const jobDbResp = await dbPool.query(
      `
      SELECT 
        id, 
        name,
        created_at,
        updated_at
      FROM job_select
      WHERE id = $1
    `,
      [id]
    );

    if (jobDbResp.rows.length === 0) {
      return NextResponse.json(
        { error: "Job select not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(jobDbResp.rows[0], { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch job select" },
      { status: 500 }
    );
  }
}

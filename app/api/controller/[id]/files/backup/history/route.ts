import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");

    let query = `
      SELECT 
        id, controller_id, plan_id, start_date, end_date,
        status, total_files, success_files, error_files, created_at
      FROM backup_history
      WHERE controller_id = $1
    `;

    const queryParams = [id];
    if (date) {
      query += ` AND DATE(start_date) = DATE($2)`;
      queryParams.push(date);
    }

    query += ` ORDER BY start_date DESC`;

    const result = await dbPool.query(query, queryParams);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching backup history:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup history" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportTypeId = searchParams.get("report_type_id");

    if (!reportTypeId) {
      return NextResponse.json(
        { message: "report_type_id parameter is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT DISTINCT 
        report_name,
        COUNT(*) as usage_count,
        MAX(created_at) as last_used
      FROM generated_reports 
      WHERE report_type_id = $1 
        AND status = 'completed'
      GROUP BY report_name
      ORDER BY usage_count DESC, last_used DESC
      LIMIT 20
    `;

    const result = await dbPool.query(query, [reportTypeId]);

    const reportNames = result.rows.map((row) => ({
      name: row.report_name,
      usage_count: parseInt(row.usage_count),
      last_used: row.last_used,
    }));

    return NextResponse.json(reportNames, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching report names:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

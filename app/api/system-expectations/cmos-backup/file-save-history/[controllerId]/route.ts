import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { controllerId: string } }
) {
  try {
    const controllerId = params.controllerId;

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        gfsl.id,
        gfsl.controller_id,
        gfsl.ip_address,
        gfsl.file_name,
        gfsl.status,
        gfsl.created_at,
        c.name as controller_name,
        c.model as controller_model
      FROM general_file_save_log gfsl
      LEFT JOIN controller c ON gfsl.controller_id = c.id
      WHERE gfsl.controller_id = $1
      ORDER BY gfsl.created_at DESC
      LIMIT 50
    `;

    const result = await dbPool.query(query, [controllerId]);

    const transformedData = result.rows.map((row) => ({
      ...row,
      status_text: row.status ? "Success" : "Failed",
      status_icon: row.status ? "OK" : "NOT OK",
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching file save history:", error);
    return NextResponse.json(
      { error: "Failed to fetch file save history" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { BackupSessionWithController } from "@/types/backup.types";

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
        bs.id,
        bs.controller_id,
        bs.controller_ip,
        bs.session_start_time,
        bs.session_end_time,
        bs.total_files,
        bs.successful_files,
        bs.failed_files,
        bs.status,
        bs.created_at,
        c.name as controller_name
      FROM backup_sessions bs
      LEFT JOIN controller c ON bs.controller_id = c.id
      WHERE bs.controller_id = $1
      ORDER BY bs.session_start_time DESC
      LIMIT 50
    `;

    const result = await dbPool.query(query, [controllerId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching backup history:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup history" },
      { status: 500 }
    );
  }
}

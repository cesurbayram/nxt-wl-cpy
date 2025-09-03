import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { BackupFileDetail } from "@/types/backup.types";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        bfd.id,
        bfd.file_name,
        bfd.file_type,
        bfd.backup_status,
        bfd.backup_time,
        bfd.file_size_bytes,
        bfd.created_at
      FROM backup_file_details bfd
      WHERE bfd.session_id = $1
      ORDER BY bfd.backup_time ASC
    `;

    const result = await dbPool.query(query, [sessionId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching backup session details:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup session details" },
      { status: 500 }
    );
  }
}

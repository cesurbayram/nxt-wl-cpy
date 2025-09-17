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

export async function DELETE(
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

    const client = await dbPool.connect();

    try {
      await client.query("BEGIN");

      const deleteFilesQuery = `
        DELETE FROM backup_file_details 
        WHERE session_id = $1
      `;
      await client.query(deleteFilesQuery, [sessionId]);

      const deleteSessionQuery = `
        DELETE FROM backup_sessions 
        WHERE id = $1
      `;
      const result = await client.query(deleteSessionQuery, [sessionId]);

      if (result.rowCount === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Backup session not found" },
          { status: 404 }
        );
      }

      await client.query("COMMIT");

      return NextResponse.json(
        { success: true, message: "Backup session deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting backup session:", error);
    return NextResponse.json(
      { error: "Failed to delete backup session" },
      { status: 500 }
    );
  }
}

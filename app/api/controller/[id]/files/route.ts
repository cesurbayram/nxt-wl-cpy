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
        id, controller_id, plan_id, file_name, file_type,
        size, hash, path, backup_date, status, error_message, created_at
      FROM backup_files 
      WHERE controller_id = $1
    `;

    const queryParams = [id];
    if (date) {
      query += ` AND DATE(backup_date) = DATE($2)`;
      queryParams.push(date);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await dbPool.query(query, queryParams);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching backup files:", error);
    return NextResponse.json(
      { error: "Failed to fetch backup files" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const query = `
      DELETE FROM backup_files
      WHERE controller_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await dbPool.query(query, [id, fileId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting backup file:", error);
    return NextResponse.json(
      { error: "Failed to delete backup file" },
      { status: 500 }
    );
  }
}

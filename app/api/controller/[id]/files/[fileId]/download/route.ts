import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const { id, fileId } = params;

    const query = `
      SELECT path, file_name
      FROM backup_files
      WHERE controller_id = $1 AND id = $2
    `;

    const result = await dbPool.query(query, [id, fileId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = result.rows[0];
    const fileBuffer = await fs.readFile(file.path);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${file.file_name}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

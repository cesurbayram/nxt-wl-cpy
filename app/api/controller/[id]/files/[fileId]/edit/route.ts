import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs/promises";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const { id, fileId } = params;
    const { content } = await request.json();

    const query = `
      SELECT path, file_type
      FROM backup_files
      WHERE controller_id = $1 AND id = $2
    `;

    const result = await dbPool.query(query, [id, fileId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = result.rows[0];
    if (file.file_type !== ".jbi") {
      return NextResponse.json(
        { error: "Only .jbi files can be edited" },
        { status: 400 }
      );
    }

    await fs.writeFile(file.path, content);

    return NextResponse.json({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error editing file:", error);
    return NextResponse.json({ error: "Failed to edit file" }, { status: 500 });
  }
}

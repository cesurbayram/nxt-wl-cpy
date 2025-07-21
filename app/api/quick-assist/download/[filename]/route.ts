import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    const result = await dbPool.query(
      `
      SELECT file_path, file_name, file_type
      FROM quick_assist_documents
      WHERE file_path = $1 AND is_active = TRUE
    `,
      [`/uploads/${filename}`]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "File not found or access denied" },
        { status: 404 }
      );
    }

    const document = result.rows[0];

    const filePath = join(process.cwd(), "public", "uploads", filename);

    try {
      const fileBuffer = await readFile(filePath);

      const contentType = document.file_type || "application/octet-stream";

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${document.file_name}"`,
          "Content-Length": fileBuffer.length.toString(),
        },
      });
    } catch (error) {
      console.error("Error reading file:", error);
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

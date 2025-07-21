import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await dbPool.query(
      `
      SELECT id, title, description, content, category, file_path, file_name, 
             file_size, file_type, created_at, updated_at, is_active
      FROM quick_assist_documents
      WHERE id = $1 AND is_active = TRUE
    `,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error in GET /api/quick-assist/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    const existingResult = await dbPool.query(
      `
      SELECT file_path FROM quick_assist_documents WHERE id = $1 AND is_active = TRUE
    `,
      [params.id]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const existingDocument = existingResult.rows[0];
    let file_path = existingDocument.file_path;
    let file_name = null;
    let file_size = null;
    let file_type = null;

    if (file && file.size > 0) {
      try {
        if (existingDocument.file_path) {
          const oldFilePath = join(
            process.cwd(),
            "public",
            existingDocument.file_path
          );
          try {
            await unlink(oldFilePath);
          } catch (error) {
            console.warn("Could not delete old file:", error);
          }
        }

        const fileExtension = file.name.split(".").pop();
        const uniqueFileName = `${randomUUID()}.${fileExtension}`;
        const filePath = join(
          process.cwd(),
          "public",
          "uploads",
          uniqueFileName
        );

        await mkdir(join(process.cwd(), "public", "uploads"), {
          recursive: true,
        });

        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        await writeFile(filePath, buffer);

        file_path = `/uploads/${uniqueFileName}`;
        file_name = file.name;
        file_size = file.size;
        file_type = file.type;
      } catch (error) {
        console.error("Error saving file:", error);
        return NextResponse.json(
          { error: "Failed to save file" },
          { status: 500 }
        );
      }
    }

    const result = await dbPool.query(
      `
      UPDATE quick_assist_documents 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          content = COALESCE($4, content),
          category = COALESCE($5, category),
          file_path = COALESCE($6, file_path),
          file_name = COALESCE($7, file_name),
          file_size = COALESCE($8, file_size),
          file_type = COALESCE($9, file_type),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = TRUE
      RETURNING id, title, description, content, category, file_path, file_name, 
                file_size, file_type, created_at, updated_at, is_active
    `,
      [
        params.id,
        title,
        description,
        content,
        category,
        file_path,
        file_name,
        file_size,
        file_type,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error in PUT /api/quick-assist/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentResult = await dbPool.query(
      `
      SELECT file_path FROM quick_assist_documents WHERE id = $1 AND is_active = TRUE
    `,
      [params.id]
    );

    if (documentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const document = documentResult.rows[0];

    await dbPool.query(
      `
      UPDATE quick_assist_documents 
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = TRUE
    `,
      [params.id]
    );

    if (document.file_path) {
      const filePath = join(process.cwd(), "public", document.file_path);
      try {
        await unlink(filePath);
      } catch (error) {
        console.warn("Could not delete file:", error);
      }
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/quick-assist/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

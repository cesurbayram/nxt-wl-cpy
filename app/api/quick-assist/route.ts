import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { dbPool } from "@/utils/dbUtil";

let tablesInitialized = false;

async function initializeTables() {
  if (tablesInitialized) return;

  const client = await dbPool.connect();
  try {
    const tablesExist = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'quick_assist_categories'
      );
    `);

    if (!tablesExist.rows[0]?.exists) {
      await client.query(`
        CREATE TABLE quick_assist_categories (
          id TEXT PRIMARY KEY NOT NULL UNIQUE,
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE quick_assist_documents (
          id TEXT PRIMARY KEY NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          content TEXT,
          category TEXT NOT NULL,
          file_path TEXT,
          file_name TEXT,
          file_size INTEGER,
          file_type TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT TRUE,
          created_by TEXT DEFAULT 'system'
        );
      `);

      await client.query(
        `CREATE INDEX idx_quick_assist_documents_category ON quick_assist_documents(category);`
      );
      await client.query(
        `CREATE INDEX idx_quick_assist_documents_is_active ON quick_assist_documents(is_active);`
      );
      await client.query(
        `CREATE INDEX idx_quick_assist_documents_created_at ON quick_assist_documents(created_at);`
      );
      await client.query(
        `CREATE INDEX idx_quick_assist_categories_name ON quick_assist_categories(name);`
      );

      console.log("Quick Assist tables initialized successfully");
    }
    tablesInitialized = true;
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeTables();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");

    if (type === "categories") {
      const result = await dbPool.query(`
        SELECT id, name, description, created_at
        FROM quick_assist_categories
        ORDER BY name ASC
      `);
      return NextResponse.json(result.rows);
    }

    let query = `
      SELECT id, title, description, content, category, file_path, file_name, 
             file_size, file_type, created_at, updated_at, is_active
      FROM quick_assist_documents
      WHERE is_active = TRUE
    `;

    const params: any[] = [];

    if (category && category !== "all") {
      query += ` AND category = $1`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await dbPool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error in GET /api/quick-assist:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeTables();

    const formData = await request.formData();
    const type = formData.get("type") as string;

    if (type === "category") {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      if (!name) {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }

      try {
        const categoryId = randomUUID();
        const result = await dbPool.query(
          `
          INSERT INTO quick_assist_categories (id, name, description)
          VALUES ($1, $2, $3)
          RETURNING id, name, description, created_at
        `,
          [categoryId, name, description]
        );

        return NextResponse.json(result.rows[0]);
      } catch (error: any) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Category already exists" },
            { status: 400 }
          );
        }
        throw error;
      }
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    const documentId = randomUUID();
    let file_path = null;
    let file_name = null;
    let file_size = null;
    let file_type = null;

    if (file && file.size > 0) {
      try {
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
      INSERT INTO quick_assist_documents 
      (id, title, description, content, category, file_path, file_name, file_size, file_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, content, category, file_path, file_name, 
                file_size, file_type, created_at, updated_at, is_active
    `,
      [
        documentId,
        title,
        description,
        content || null,
        category,
        file_path,
        file_name,
        file_size,
        file_type,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error in POST /api/quick-assist:", error);
    return NextResponse.json(
      { error: "Failed to create document or category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initializeTables();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");

    if (type === "category" && categoryId) {
      const documentsCheck = await dbPool.query(
        `
        SELECT COUNT(*) as count FROM quick_assist_documents 
        WHERE category = (SELECT name FROM quick_assist_categories WHERE id = $1) 
        AND is_active = TRUE
      `,
        [categoryId]
      );

      const documentCount = parseInt(documentsCheck.rows[0].count);

      if (documentCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete category. It has ${documentCount} documents. Please move or delete them first.`,
          },
          { status: 400 }
        );
      }

      const result = await dbPool.query(
        `
        DELETE FROM quick_assist_categories 
        WHERE id = $1
        RETURNING name
      `,
        [categoryId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: `Category "${result.rows[0].name}" deleted successfully`,
      });
    }

    return NextResponse.json(
      { error: "Invalid delete request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in DELETE /api/quick-assist:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}

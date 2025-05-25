import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export interface Line {
  id: string;
  name: string;
  status: string;
  cellIds?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const lineDbResp = await dbPool.query(`
            SELECT 
                l.id,
                l.name,
                l.status,
                l.factory_id,
                ARRAY_AGG(c.id) FILTER (WHERE c.id IS NOT NULL) as "cellIds"
            FROM
                line l
                LEFT JOIN cell c ON l.id = c.line_id
            GROUP BY l.id, l.name, l.status, l.factory_id
        `);
    return NextResponse.json(lineDbResp.rows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { name, status, cellIds }: Line = await request.json();
  const client = await dbPool.connect();

  try {
    if (!cellIds || cellIds.length === 0) {
      return NextResponse.json(
        { message: "Cells are required" },
        { status: 500 }
      );
    }

    await client.query("BEGIN");
    const newLineId = uuidv4();
    await client.query(
      `
            INSERT INTO line (id, name, status, factory_id) VALUES ($1, $2, $3, $4)
        `,
      [newLineId, name, status, null]
    );

    await client.query(
      `
            UPDATE cell SET line_id = $1 WHERE id = ANY($2)
        `,
      [newLineId, cellIds]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Line created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const { id, name, status, cellIds }: Line = await request.json();

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
            UPDATE line SET name = $1, status = $2 WHERE id = $3    
        `,
      [name, status, id]
    );

    await client.query(
      ` 
            UPDATE cell SET line_id = $1 WHERE line_id = $2
        `,
      [null, id]
    );

    await client.query(
      `
            UPDATE cell SET line_id = $1 WHERE id = ANY($2)
        `,
      [id, cellIds]
    );

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Line updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const { id }: { id: string } = await request.json();
  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM line WHERE id = $1`, [id]);
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Line deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

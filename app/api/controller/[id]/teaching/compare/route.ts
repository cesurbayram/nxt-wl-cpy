// app/api/controllers/[id]/teaching/compare/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { ComparisonResult } from "@/types/teaching.types";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const body: ComparisonResult = await request.json();
    const {
      file1Name,
      file2Name,
      file1Format,
      file2Format,
      differences,
      statistics,
    } = body;

    if (!file1Name || !file2Name) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    const newComparisonId = uuidv4();
    const comparisonDate = new Date().toISOString();

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO teaching_comparisons (
        id,
        controller_id,
        file1_name,
        file2_name,
        file1_format,
        file2_format,
        comparison_date,
        statistics,
        differences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newComparisonId,
        params.id,
        file1Name,
        file2Name,
        file1Format,
        file2Format,
        comparisonDate,
        JSON.stringify(statistics),
        JSON.stringify(differences),
      ]
    );

    await client.query("COMMIT");

    const result: ComparisonResult = {
      id: newComparisonId,
      file1Name,
      file2Name,
      file1Format,
      file2Format,
      comparisonDate,
      differences,
      statistics,
    };

    return NextResponse.json(result, { status: 201 });
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; comparisonId: string } }
) {
  try {
    const client = await dbPool.connect();
    const result = await client.query(
      `SELECT 
        id,
        controller_id as "controllerId",
        file1_name as "file1Name",
        file2_name as "file2Name",
        file1_format as "file1Format",
        file2_format as "file2Format",
        comparison_date as "comparisonDate",
        statistics,
        differences
      FROM teaching_comparisons 
      WHERE id = $1 AND controller_id = $2`,
      [params.comparisonId, params.id]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Comparison not found" },
        { status: 404 }
      );
    }

    const comparison: ComparisonResult = {
      ...result.rows[0],
      statistics:
        typeof result.rows[0].statistics === "string"
          ? JSON.parse(result.rows[0].statistics)
          : result.rows[0].statistics,
      differences:
        typeof result.rows[0].differences === "string"
          ? JSON.parse(result.rows[0].differences)
          : result.rows[0].differences,
    };

    return NextResponse.json(comparison, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    // URL'den comparisonId'yi al
    const url = new URL(request.url);
    const comparisonId = url.searchParams.get("comparisonId");

    if (!comparisonId) {
      return NextResponse.json(
        { message: "ComparisonId is required" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM teaching_comparisons 
         WHERE id = $1 AND controller_id = $2`,
      [comparisonId, params.id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Comparison is not found" },
        { status: 404 }
      );
    }

    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Comparies is succesfull delete " },
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

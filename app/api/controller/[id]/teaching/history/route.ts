import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { ComparisonHistoryItem } from "@/types/teaching.types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await dbPool.connect();
    const result = await client.query(
      `SELECT 
        id,
        controller_id as "controllerId",
        file1_name as "file1Name",
        file2_name as "file2Name",
        comparison_date as "comparisonDate",
        statistics
      FROM teaching_comparisons 
      WHERE controller_id = $1 
      ORDER BY comparison_date DESC`,
      [params.id]
    );
    client.release();

    const formattedRows: ComparisonHistoryItem[] = result.rows.map((row) => ({
      id: row.id,
      file1Name: row.file1Name,
      file2Name: row.file2Name,
      comparisonDate: row.comparisonDate,
      statistics:
        typeof row.statistics === "string"
          ? JSON.parse(row.statistics)
          : row.statistics,
    }));

    return NextResponse.json(formattedRows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

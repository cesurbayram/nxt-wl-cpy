import { Line } from "@/types/line.types";
import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT
        l.id,
        l.name,
        l.status,
      COALESCE(array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL), '{}') AS "cellIds"
      FROM
      line l LEFT JOIN
        cell c ON l.id = c.line_id
      WHERE l.id = $1
      GROUP BY l.id`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const line: Line = dbRes.rows[0];
      return NextResponse.json({ ...line });
    }

    return NextResponse.json({ message: "Line not found" }, { status: 404 });
  } catch (error) {
    console.log("DB Error: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

const tableMap: { [key: string]: string } = {
  byte: "b_read",
  int: "i_read",
  double: "d_read",
  real: "r_read",
  string: "s_read",
//   position: "p_read", // Position türü için tablo adı
//   vardat: "v_read",   // Var.dat türü için tablo adı
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; types: string } }
) {
  const { id, types } = params;
  const tableName = tableMap[types];
  if (!tableName) {
    return NextResponse.json(
      { message: `Invalid variable type: ${types}` },
      { status: 400 }
    );
  }

  try {
    const dbRes = await dbPool.query(
      `
      SELECT no, name, value
      FROM ${tableName}
      WHERE controller_id = $1 ORDER BY CAST(no AS INTEGER) ASC
      `,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      return NextResponse.json(dbRes.rows);
    }

    return NextResponse.json(
      { message: "No variables found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

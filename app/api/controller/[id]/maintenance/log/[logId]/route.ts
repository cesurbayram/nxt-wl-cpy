import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT * FROM maintenance_log WHERE id = $1`,
      [params.logId]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const log = dbRes.rows[0];
      return NextResponse.json({ ...log });
    }

    return NextResponse.json({ message: "Log not found" }, { status: 404 });
  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

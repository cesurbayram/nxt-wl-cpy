import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT * FROM maintenance_plan WHERE id = $1`,
      [params.planId]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const plan = dbRes.rows[0];
      return NextResponse.json({ ...plan });
    }

    return NextResponse.json({ message: "Plan not found" }, { status: 404 });
  } catch (error) {
    console.error("DB ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

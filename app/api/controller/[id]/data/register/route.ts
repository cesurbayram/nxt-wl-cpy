import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: controllerId } = params;

  if (!controllerId) {
    return NextResponse.json(
      { message: "Controller ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await dbPool.query(
      `SELECT 
        id,
        controller_id,
        register_no,
        register_value
      FROM register
      WHERE controller_id = $1 
      ORDER BY register_no ASC`,
      [controllerId]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Database error:", error.message);
    return NextResponse.json(
      { message: "Failed to fetch register data", error: error.message },
      { status: 500 }
    );
  }
}

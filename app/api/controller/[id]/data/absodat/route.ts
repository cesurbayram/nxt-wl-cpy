import { NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;

    const absoData = await dbPool.query(
      `SELECT * FROM abso_data 
        WHERE controller_id = $1 
        ORDER BY timestamp DESC`,
      [controllerId]
    );

    return NextResponse.json(absoData.rows);
  } catch (error) {
    console.error("Error fetching abso data:", error);
    return NextResponse.json(
      { error: "Failed to fetch abso data" },
      { status: 500 }
    );
  }
}

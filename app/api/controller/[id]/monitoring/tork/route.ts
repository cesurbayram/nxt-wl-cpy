import { NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;

    const torkData = await dbPool.query(
      `SELECT * FROM tork_data 
       WHERE controller_id = $1 
       ORDER BY timestamp ASC`,
      [controllerId]
    );

    return NextResponse.json(torkData.rows);
  } catch (error) {
    console.error("Error fetching tork data:", error);
    return NextResponse.json(
      { error: "Failed to fetch tork data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;

    await dbPool.query(`DELETE FROM tork_data WHERE controller_id = $1`, [
      controllerId,
    ]);

    return NextResponse.json({ message: "Tork data cleared successfully" });
  } catch (error) {
    console.error("Error clearing tork data:", error);
    return NextResponse.json(
      { error: "Failed to clear tork data" },
      { status: 500 }
    );
  }
}

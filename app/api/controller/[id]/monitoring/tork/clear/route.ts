import { NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const controllerId = params.id;

    console.log(`Clearing tork data for controller: ${controllerId}`);

    await dbPool.query(`DELETE FROM tork_data WHERE controller_id = $1`, [
      controllerId,
    ]);

    return NextResponse.json({
      message: "Tork data cleared successfully",
      controllerId,
    });
  } catch (error) {
    console.error("Error clearing tork data:", error);
    return NextResponse.json(
      { error: "Failed to clear tork data" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const controllerId = searchParams.get("controllerId");

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    const result = await dbPool.query(
      `
      SELECT 
        teach,
        servo,
        operating,
        cycle,
        hold,
        alarm,
        error,
        stop,
        door_opened,
        c_backup,
        connection,
        update_at
      FROM controller_status
      WHERE controller_id = $1
      `,
      [controllerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Controller status not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching controller status:", error);
    return NextResponse.json(
      { error: "Failed to fetch controller status" },
      { status: 500 }
    );
  }
}


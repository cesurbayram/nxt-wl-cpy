import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT
            c.id,
            c.name,
            c.model,
            c.application,
            c.ip_address AS "ipAddress",
            c.status,
            c.serial_number AS "serialNumber",
            c.interval_ms AS "intervalMs",
            c.max_connection AS "maxConnection",
            c.location,
            json_build_object(
        'alarm', ct.alarm,
        'cycle', ct.cycle,
        'doorOpen', ct.door_opened,
        'error', ct.error,
        'hold', ct.hold,
        'operating', ct.operating,
        'servo', ct.servo,
        'stop', ct.stop,
        'teach', ct.teach
    ) AS "controllerStatus"           
            FROM controller c INNER JOIN controller_status ct ON c.id=ct.controller_id WHERE c.id = $1`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      const controller = dbRes.rows[0];
      return NextResponse.json({ ...controller });
    }
    return NextResponse.json(
      { message: "Controller not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.log("DB Error: ", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

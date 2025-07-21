import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "@/utils/service/notification";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const controllerId = params.id;
    const {
      code,
      text,
      alarm_type = "MAJOR",
      is_active = true,
    } = await request.json();

    if (!code || !text) {
      return NextResponse.json(
        { message: "Code and text are required" },
        { status: 400 }
      );
    }

    const alarmId = uuidv4();
    const originDate = new Date().toISOString();

    await client.query("BEGIN");

    // Insert into alarm table
    await client.query(
      `INSERT INTO alarm (id, controller_id, code, text, detected, origin_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [alarmId, controllerId, code, text, originDate, originDate, is_active]
    );

    await client.query(
      `INSERT INTO almhist (id, controller_id, code, name, origin_date, mode, type)
       VALUES ($1, $2, $3, $4, $5, 'DETECTED', $6)`,
      [uuidv4(), controllerId, code, text, originDate, alarm_type]
    );

    await client.query("COMMIT");

    try {
      const controllerInfo = await client.query(
        `SELECT name FROM controller WHERE id = $1`,
        [controllerId]
      );

      if (controllerInfo.rows.length > 0) {
        const controller = controllerInfo.rows[0];
        await NotificationService.notifyAlarmTriggered(
          controllerId,
          controller.name,
          alarm_type,
          text
        );
      }
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json(
      {
        message: "Alarm triggered successfully",
        alarm_id: alarmId,
        controller_id: controllerId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

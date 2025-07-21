import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "@/utils/service/notification";

export async function POST(request: NextRequest) {
  try {
    const {
      controller_id,
      maintenance_type,
      maintenance_date,
      servo_hours: provided_servo_hours,
      technician,
      notes,
    } = await request.json();

    const servo_hours = provided_servo_hours || 0;

    const maintenanceId = uuidv4();
    await dbPool.query(
      `
      INSERT INTO maintenance_history 
      (id, controller_id, maintenance_type, maintenance_date, servo_hours, technician, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        maintenanceId,
        controller_id,
        maintenance_type,
        maintenance_date,
        servo_hours,
        technician,
        notes,
      ]
    );

    try {
      const controllerInfo = await dbPool.query(
        `SELECT name FROM controller WHERE id = $1`,
        [controller_id]
      );

      if (controllerInfo.rows.length > 0) {
        const controller = controllerInfo.rows[0];
        await NotificationService.notifyMaintenanceScheduled(
          maintenanceId,
          controller.name,
          maintenance_type,
          technician,
          maintenance_date
        );
      }
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json({
      message: "Maintenance recorded successfully",
      id: maintenanceId,
    });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance" },
      { status: 500 }
    );
  }
}

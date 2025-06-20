import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

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

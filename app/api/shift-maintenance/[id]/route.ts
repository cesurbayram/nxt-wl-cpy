import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await dbPool.query("DELETE FROM maintenance_history WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Maintenance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { maintenance_type, maintenance_date, technician, notes } = body;

    const updateFields = [];
    const updateValues = [];

    let paramIndex = 1;
    if (maintenance_type) {
      updateFields.push(`maintenance_type = $${paramIndex++}`);
      updateValues.push(maintenance_type);
    }
    if (maintenance_date) {
      updateFields.push(`maintenance_date = $${paramIndex++}`);
      updateValues.push(maintenance_date);
    }
    if (technician) {
      updateFields.push(`technician = $${paramIndex++}`);
      updateValues.push(technician);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateValues.push(notes);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    updateValues.push(id);

    await dbPool.query(
      `UPDATE maintenance_history SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramIndex}`,
      updateValues
    );

    return NextResponse.json({
      success: true,
      message: "Maintenance record updated successfully",
    });
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance record" },
      { status: 500 }
    );
  }
}

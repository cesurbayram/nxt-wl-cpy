import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const { id, planId } = params;
    const updates = await request.json();

    const validFields = ["name", "days", "time", "file_types", "is_active"];
    const updateFields = Object.keys(updates)
      .filter((key) => validFields.includes(key))
      .map((key, index) => `${key} = $${index + 3}`);

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE backup_plans
      SET ${updateFields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE controller_id = $1 AND id = $2
      RETURNING *
    `;

    const values = [
      id,
      planId,
      ...Object.keys(updates)
        .filter((key) => validFields.includes(key))
        .map((key) => updates[key]),
    ];

    const result = await dbPool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Backup plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating backup plan:", error);
    return NextResponse.json(
      { error: "Failed to update backup plan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const { id, planId } = params;

    const query = `
      DELETE FROM backup_plans
      WHERE controller_id = $1 AND id = $2
      RETURNING *
    `;

    const result = await dbPool.query(query, [id, planId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Backup plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Backup plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting backup plan:", error);
    return NextResponse.json(
      { error: "Failed to delete backup plan" },
      { status: 500 }
    );
  }
}

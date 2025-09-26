import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbRes = await dbPool.query(
      `SELECT 
         id,
         controller_id,
         general_no,
         value,
         created_at
       FROM general_register_data
       WHERE controller_id = $1
       ORDER BY general_no ASC`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      return NextResponse.json(dbRes.rows);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.log("DB Error in general-register route: ", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { generalNo } = await request.json();
    const controllerId = params.id;

    if (!generalNo) {
      return NextResponse.json(
        { message: "General No is required" },
        { status: 400 }
      );
    }

    const existingRecord = await dbPool.query(
      `SELECT id FROM general_register_data WHERE controller_id = $1 AND general_no = $2`,
      [controllerId, generalNo]
    );

    if (existingRecord?.rowCount && existingRecord.rowCount > 0) {
      return NextResponse.json(
        { message: "General register already exists" },
        { status: 409 }
      );
    }


    await dbPool.query(
      `INSERT INTO general_register_data (id, controller_id, general_no, value, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [uuidv4(), controllerId, generalNo, "0"]
    );

    return NextResponse.json(
      { message: "General register created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("DB Error in general-register POST: ", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { generalNo } = await request.json();
    const controllerId = params.id;

    if (!generalNo) {
      return NextResponse.json(
        { message: "General No is required" },
        { status: 400 }
      );
    }

    // Delete the general register record
    const deleteResult = await dbPool.query(
      `DELETE FROM general_register_data WHERE controller_id = $1 AND general_no = $2`,
      [controllerId, generalNo]
    );

    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { message: "General register not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "General register deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("DB Error in general-register DELETE: ", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

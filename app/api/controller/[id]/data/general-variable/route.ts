import { dbPool } from "@/utils/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const variableType = searchParams.get("type");

    if (!variableType || !["byte", "int", "double", "real", "string"].includes(variableType)) {
      return NextResponse.json(
        { message: "Invalid or missing variable type. Must be one of: byte, int, double, real, string" },
        { status: 400 }
      );
    }


    const tableMap: { [key: string]: string } = {
      byte: "general_byte_data",
      int: "general_int_data",
      double: "general_double_data",
      real: "general_real_data",
      string: "general_string_data"
    };

    const tableName = tableMap[variableType];

    const dbRes = await dbPool.query(
      `SELECT 
         id,
         controller_id,
         general_no,
         value,
         '${variableType}' as variable_type,
         created_at
       FROM ${tableName}
       WHERE controller_id = $1
       ORDER BY general_no ASC`,
      [params.id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      return NextResponse.json(dbRes.rows);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.log("DB Error in general-variable route: ", error.message);
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
    const { generalNo, variableType } = await request.json();
    const controllerId = params.id;

    if (!generalNo || !variableType) {
      return NextResponse.json(
        { message: "General No and variable type are required" },
        { status: 400 }
      );
    }

    if (!["byte", "int", "double", "real", "string"].includes(variableType)) {
      return NextResponse.json(
        { message: "Invalid variable type. Must be one of: byte, int, double, real, string" },
        { status: 400 }
      );
    }


    const tableMap: { [key: string]: { table: string; defaultValue: any } } = {
      byte: { table: "general_byte_data", defaultValue: 0 },
      int: { table: "general_int_data", defaultValue: 0 },
      double: { table: "general_double_data", defaultValue: 0.0 },
      real: { table: "general_real_data", defaultValue: 0.0 },
      string: { table: "general_string_data", defaultValue: "" }
    };

    const { table, defaultValue } = tableMap[variableType];


    const existingRecord = await dbPool.query(
      `SELECT id FROM ${table} WHERE controller_id = $1 AND general_no = $2`,
      [controllerId, generalNo]
    );

    if (existingRecord?.rowCount && existingRecord.rowCount > 0) {
      return NextResponse.json(
        { message: `General ${variableType} variable already exists` },
        { status: 409 }
      );
    }


    await dbPool.query(
      `INSERT INTO ${table} (id, controller_id, general_no, value, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [uuidv4(), controllerId, generalNo, defaultValue]
    );

    return NextResponse.json(
      { message: `General ${variableType} variable created successfully` },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("DB Error in general-variable POST: ", error.message);
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
    const { generalNo, variableType } = await request.json();
    const controllerId = params.id;

    if (!generalNo || !variableType) {
      return NextResponse.json(
        { message: "General No and variable type are required" },
        { status: 400 }
      );
    }

    if (!["byte", "int", "double", "real", "string"].includes(variableType)) {
      return NextResponse.json(
        { message: "Invalid variable type. Must be one of: byte, int, double, real, string" },
        { status: 400 }
      );
    }

    // Map variable types to table names
    const tableMap: { [key: string]: string } = {
      byte: "general_byte_data",
      int: "general_int_data",
      double: "general_double_data",
      real: "general_real_data",
      string: "general_string_data"
    };

    const tableName = tableMap[variableType];

    // Delete the general variable record
    const deleteResult = await dbPool.query(
      `DELETE FROM ${tableName} WHERE controller_id = $1 AND general_no = $2`,
      [controllerId, generalNo]
    );

    if (deleteResult.rowCount === 0) {
      return NextResponse.json(
        { message: `General ${variableType} variable not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `General ${variableType} variable deleted successfully` },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("DB Error in general-variable DELETE: ", error.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

const alarmTableMap: { [key: string]: string } = {
  detected: "alarm",
  almhist: "almhist",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; types: string } }
) {
  const { id, types } = params;
  const tableName = alarmTableMap[types];

  if (!tableName) {
    return NextResponse.json(
      { message: `Invalid alarm type: ${types}` },
      { status: 400 }
    );
  }

  try {
    if (types === "almhist") {
      const { searchParams } = new URL(request.url);
      const alarmType = searchParams.get("type");

      if (!alarmType) {
        return NextResponse.json(
          { message: `Type is required for ALMHIST` },
          { status: 400 }
        );
      }

      const dbRes = await dbPool.query(
        `SELECT 
           code, 
           name, 
           origin_date AS "originDate",
           mode, 
           type
         FROM ${tableName}
         WHERE controller_id = $1 AND type = $2
         ORDER BY origin_date DESC`,
        [id, alarmType]
      );

      if (dbRes?.rowCount && dbRes.rowCount > 0) {
        return NextResponse.json(dbRes.rows);
      }

      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    const dbRes = await dbPool.query(
      `SELECT 
         code, 
         alarm, 
         detected, 
         removed, 
         text, 
         origin_date AS "originDate"
       FROM ${tableName}
       WHERE controller_id = $1
       ORDER BY origin_date DESC`,
      [id]
    );

    if (dbRes?.rowCount && dbRes.rowCount > 0) {
      return NextResponse.json(dbRes.rows);
    }

    return NextResponse.json({ message: "No alarms found" }, { status: 404 });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

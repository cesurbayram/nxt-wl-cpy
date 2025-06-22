import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d";

    let timeFilter;
    switch (timeRange) {
      case "30d":
        timeFilter = "AND timestamp >= NOW() - INTERVAL '30 days'";
        break;
      case "3m":
        timeFilter = "AND timestamp >= NOW() - INTERVAL '3 months'";
        break;
      default:
        timeFilter = "AND timestamp >= NOW() - INTERVAL '7 days'";
        break;
    }

    const client = await dbPool.connect();

    const query = `
      SELECT 
        timestamp,
        control_power_time,
        servo_power_time,
        playback_time,
        moving_time,
        operating_time
      FROM utilization_data 
      WHERE controller_id = $1 
      ${timeFilter}
      ORDER BY timestamp DESC
    `;

    const result = await client.query(query, [params.id]);
    client.release();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();
  const data = await request.json();

  try {
    await client.query("BEGIN");

    const newUtilizationId = uuidv4();

    const query = `
      INSERT INTO utilization_data 
      (id, controller_id, control_power_time, servo_power_time, playback_time, moving_time, operating_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      newUtilizationId,
      params.id,
      data.controlPowerTime,
      data.servoPowerTime,
      data.playbackTime,
      data.movingTime,
      data.operatingTime,
    ];

    const result = await client.query(query, values);
    await client.query("COMMIT");

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

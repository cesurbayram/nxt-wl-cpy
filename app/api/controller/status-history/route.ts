import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const controllerId = searchParams.get("controllerId");
    const shiftId = searchParams.get("shiftId");
    const date = searchParams.get("date"); // Format: YYYY-MM-DD
    const days = searchParams.get("days") || "1"; // Default 1 day

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    // Get shift details if provided
    let startTime = "00:00:00";
    let endTime = "23:59:59";

    if (shiftId) {
      const shiftQuery = await dbPool.query(
        `SELECT id, name, shift_start, shift_end FROM shift WHERE id = $1`,
        [shiftId]
      );

      if (shiftQuery.rows.length > 0) {
        startTime = shiftQuery.rows[0].shift_start;
        endTime = shiftQuery.rows[0].shift_end;
      }
    }

    // Determine date range
    const targetDate = date || new Date().toISOString().split("T")[0];
    const endDate = new Date(targetDate);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - parseInt(days) + 1);

    // Check if shift crosses midnight (e.g., 16:00:00-00:00:00)
    const shiftCrossesMidnight = startTime > endTime;
    
    
    // Query history data
    let historyQuery;
    if (shiftCrossesMidnight) {
      // For shifts that cross midnight (e.g., 16:00-00:00 or 23:00-07:00)
      // Each day: time >= startTime OR time <= endTime
      const queryParams = [
        controllerId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        startTime,
        endTime,
      ];
      
      historyQuery = await dbPool.query(
        `
        SELECT 
          id,
          controller_id,
          teach,
          servo,
          operating,
          cycle,
          hold,
          alarm,
          error,
          stop,
          door_opened,
          c_backup,
          connection,
          created_at
        FROM controller_status_history
        WHERE controller_id = $1
          AND created_at::date >= $2::date
          AND created_at::date <= $3::date
          AND (
            created_at::time >= $4::time
            OR
            created_at::time <= $5::time
          )
        ORDER BY created_at ASC
        `,
        queryParams
      );
    } else {
      // Normal shift (doesn't cross midnight)
      // Each day: time >= startTime AND time <= endTime
      const queryParams = [
        controllerId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        startTime,
        endTime,
      ];
      
      historyQuery = await dbPool.query(
        `
        SELECT 
          id,
          controller_id,
          teach,
          servo,
          operating,
          cycle,
          hold,
          alarm,
          error,
          stop,
          door_opened,
          c_backup,
          connection,
          created_at
        FROM controller_status_history
        WHERE controller_id = $1
          AND created_at::date >= $2::date
          AND created_at::date <= $3::date
          AND created_at::time >= $4::time
          AND created_at::time <= $5::time
        ORDER BY created_at ASC
        `,
        queryParams
      );
    }

    // Calculate status durations
    const records = historyQuery.rows;
    const statusDurations = {
      running: 0,
      energy_saving: 0,
      alarm: 0,
      idle: 0,
      disconnect: 0,
      servo_off: 0,
    };

    const hourlyData: { [hour: string]: typeof statusDurations } = {};
    const dailyData: { [day: string]: typeof statusDurations } = {};

    for (let i = 0; i < records.length - 1; i++) {
      const current = records[i];
      const next = records[i + 1];

      const duration =
        (new Date(next.created_at).getTime() -
          new Date(current.created_at).getTime()) /
        1000 / 60; // minutes

      // Determine status
      let status: keyof typeof statusDurations = "idle";
      if (!current.connection) {
        status = "disconnect";
      } else if (!current.servo) {
        status = "servo_off";
      } else if (current.alarm || current.error) {
        status = "alarm";
      } else if (current.operating) {
        status = "running";
      } else if (current.stop) {
        status = "energy_saving";
      }

      statusDurations[status] += duration;

      // Hourly breakdown
      // Note: DB stores timestamp without timezone, but PostgreSQL returns it as UTC
      // So we need to add 3 hours to convert to Turkey time
      const currentDate = new Date(current.created_at);
      const localDate = new Date(currentDate.getTime() + (3 * 60 * 60 * 1000));
      const hour = localDate.toISOString().slice(11, 13);
      if (!hourlyData[hour]) {
        hourlyData[hour] = {
          running: 0,
          energy_saving: 0,
          alarm: 0,
          idle: 0,
          disconnect: 0,
          servo_off: 0,
        };
      }
      hourlyData[hour][status] += duration;

      // Daily breakdown
      const day = localDate.toISOString().split("T")[0];
      if (!dailyData[day]) {
        dailyData[day] = {
          running: 0,
          energy_saving: 0,
          alarm: 0,
          idle: 0,
          disconnect: 0,
          servo_off: 0,
        };
      }
      dailyData[day][status] += duration;
    }

    // Calculate operating rate
    const totalTime = Object.values(statusDurations).reduce(
      (sum, val) => sum + val,
      0
    );
    const operatingRate =
      totalTime > 0 ? (statusDurations.running / totalTime) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        statusDurations,
        operatingRate: operatingRate.toFixed(2),
        hourlyData: Object.entries(hourlyData).map(([hour, durations]) => ({
          hour: `${hour}:00`,
          ...durations,
        })),
        dailyData: Object.entries(dailyData).map(([day, durations]) => ({
          date: day,
          ...durations,
        })),
        totalRecords: records.length,
      },
    });
  } catch (error) {
    console.error("Error fetching status history:", error);
    return NextResponse.json(
      { error: "Failed to fetch status history" },
      { status: 500 }
    );
  }
}


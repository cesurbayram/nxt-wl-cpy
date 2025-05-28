import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { JobStatus } from "@/types/job-status.types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const controllerId = searchParams.get("controllerId");
    const shiftId = searchParams.get("shiftId");
    const jobId = searchParams.get("jobId");

    let query = `
      SELECT 
        js.id, 
        js.shift_id AS "shiftId", 
        js.job_id AS "jobId", 
        js.controller_id AS "controllerId", 
        js.current_line AS "currentLine", 
        js.product_count AS "productCount", 
        js.content, 
        js.created_at AS "createdAt", 
        js.updated_at AS "updatedAt"
      FROM job_status js
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCounter = 1;

    if (controllerId) {
      query += ` AND js.controller_id = $${paramCounter}`;
      queryParams.push(controllerId);
      paramCounter++;
    }

    if (shiftId) {
      query += ` AND js.shift_id = $${paramCounter}`;
      queryParams.push(shiftId);
      paramCounter++;
    }

    if (jobId) {
      query += ` AND js.job_id = $${paramCounter}`;
      queryParams.push(jobId);
      paramCounter++;
    }

    query += " ORDER BY js.created_at DESC";

    const result = await dbPool.query(query, queryParams);
    const jobStatuses: JobStatus[] = result.rows;

    return NextResponse.json(jobStatuses, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

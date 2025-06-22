import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { ProductionComparison } from "@/types/job-status.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const controllerId = searchParams.get("controllerId");
    const shiftId = searchParams.get("shiftId");

    if (!controllerId || !shiftId) {
      return NextResponse.json(
        { message: "Controller ID and Shift ID are required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        pv.job_id AS "jobId",
        j.name AS "jobName",
        pv.produced_product_count AS "manualCount",
        COALESCE(js.product_count, 0) AS "systemCount",
        (pv.produced_product_count - COALESCE(js.product_count, 0)) AS "difference"
      FROM production_value pv
      LEFT JOIN job_select j ON pv.job_id = j.id
      LEFT JOIN job_status js ON pv.controller_id = js.controller_id 
        AND pv.shift_id = js.shift_id 
        AND pv.job_id = js.job_id
      WHERE pv.controller_id = $1 AND pv.shift_id = $2
      ORDER BY j.name
    `;

    const result = await dbPool.query(query, [controllerId, shiftId]);

    const comparisons: ProductionComparison[] = result.rows.map((row) => {
      const difference = row.difference;
      let status: "equal" | "manual_higher" | "system_higher";

      if (difference === 0) {
        status = "equal";
      } else if (difference > 0) {
        status = "manual_higher";
      } else {
        status = "system_higher";
      }

      return {
        jobId: row.jobId,
        jobName: row.jobName,
        manualCount: row.manualCount,
        systemCount: row.systemCount,
        difference: Math.abs(difference),
        status: status,
      };
    });

    return NextResponse.json(comparisons, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

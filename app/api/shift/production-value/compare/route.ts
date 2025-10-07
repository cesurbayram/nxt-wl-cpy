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

    // Manuel girilen production values'ları al (generalNo ile birlikte)
    const query = `
      SELECT 
        pv.job_id AS "jobId",
        j.name AS "jobName",
        pv.produced_product_count AS "manualCount",
        pv.general_no AS "generalNo"
      FROM production_value pv
      LEFT JOIN job_select j ON pv.job_id = j.id
      WHERE pv.controller_id = $1 AND pv.shift_id = $2
      ORDER BY j.name
    `;

    const result = await dbPool.query(query, [controllerId, shiftId]);

    // Her job için system count'u general_double_data'dan direkt çek
    const comparisons: ProductionComparison[] = await Promise.all(
      result.rows.map(async (row) => {
        let systemCount = 0;
        
        try {
          // Eğer generalNo varsa, general_double_data'dan değeri al
          if (row.generalNo) {
            const valueQuery = `
              SELECT value FROM general_double_data 
              WHERE controller_id = $1 AND general_no = $2 
              ORDER BY created_at DESC LIMIT 1
            `;
            
            const valueResult = await dbPool.query(valueQuery, [controllerId, row.generalNo]);
            systemCount = valueResult.rows[0]?.value || 0;
          }
        } catch (error) {
          console.error(`Error getting system count for job ${row.jobId}:`, error);
          systemCount = 0;
        }

        const difference = row.manualCount - systemCount;
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
          systemCount: systemCount,
          difference: Math.abs(difference),
          status: status,
        };
      })
    );

    return NextResponse.json(comparisons, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

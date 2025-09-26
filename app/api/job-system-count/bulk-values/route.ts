import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

// POST - Bulk job'lar için system count değerlerini al
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { controllerId, jobIds } = body;

    if (!controllerId || !Array.isArray(jobIds)) {
      return NextResponse.json(
        { message: "controllerId and jobIds array are required" },
        { status: 400 }
      );
    }

    const result: Record<string, number> = {};

    // Her job için system count değerini al
    for (const jobId of jobIds) {
      try {
        // Config'i al
        const configQuery = `
          SELECT general_no, variable_type 
          FROM job_system_count_config 
          WHERE job_id = $1 AND controller_id = $2 AND is_active = true
        `;
        
        const configResult = await dbPool.query(configQuery, [jobId, controllerId]);
        
        if (configResult.rows.length === 0) {
          result[jobId] = 0;
          continue;
        }

        const config = configResult.rows[0];
        const tableName = `general_${config.variable_type}_data`;
        
        // En son GeneralVariable değerini al
        const valueQuery = `
          SELECT value FROM ${tableName} 
          WHERE controller_id = $1 AND general_no = $2 
          ORDER BY created_at DESC LIMIT 1
        `;
        
        const valueResult = await dbPool.query(valueQuery, [controllerId, config.general_no]);
        result[jobId] = valueResult.rows[0]?.value || 0;
      } catch (error) {
        console.error(`Error getting system count for job ${jobId}:`, error);
        result[jobId] = 0;
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

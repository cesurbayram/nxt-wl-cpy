import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

// GET - Tek job için system count değerini al
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const controllerId = searchParams.get("controllerId");

    if (!jobId || !controllerId) {
      return NextResponse.json(
        { message: "jobId and controllerId are required" },
        { status: 400 }
      );
    }

    // Config'i al
    const configQuery = `
      SELECT general_no, variable_type 
      FROM job_system_count_config 
      WHERE job_id = $1 AND controller_id = $2 AND is_active = true
    `;
    
    const configResult = await dbPool.query(configQuery, [jobId, controllerId]);
    
    if (configResult.rows.length === 0) {
      return NextResponse.json({ value: 0 }, { status: 200 });
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
    const value = valueResult.rows[0]?.value || 0;

    return NextResponse.json({ value }, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

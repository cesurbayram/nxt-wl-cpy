import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { JobSystemCountConfig } from "@/types/job-system-count.types";

export const dynamic = "force-dynamic";

// GET - System Count Config'leri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const controllerId = searchParams.get("controllerId");

    let query = `
      SELECT 
        jscc.id,
        jscc.job_id AS "jobId",
        jscc.controller_id AS "controllerId", 
        jscc.general_no AS "generalNo",
        jscc.variable_type AS "variableType",
        jscc.is_active AS "isActive",
        jscc.created_at AS "createdAt",
        jscc.updated_at AS "updatedAt",
        j.name AS "jobName",
        c.name AS "controllerName"
      FROM job_system_count_config jscc
      LEFT JOIN job_select j ON jscc.job_id = j.id
      LEFT JOIN controller c ON jscc.controller_id = c.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCounter = 1;

    if (jobId) {
      query += ` AND jscc.job_id = $${paramCounter}`;
      queryParams.push(jobId);
      paramCounter++;
    }

    if (controllerId) {
      query += ` AND jscc.controller_id = $${paramCounter}`;
      queryParams.push(controllerId);
      paramCounter++;
    }

    query += " ORDER BY jscc.created_at DESC";

    const result = await dbPool.query(query, queryParams);
    const configs: JobSystemCountConfig[] = result.rows;

    return NextResponse.json(configs, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Yeni System Count Config oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, controllerId, generalNo, variableType = "double", isActive = true } = body;

    if (!jobId || !controllerId || !generalNo) {
      return NextResponse.json(
        { message: "jobId, controllerId and generalNo are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    
    const query = `
      INSERT INTO job_system_count_config (
        id, job_id, controller_id, general_no, variable_type, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (job_id, controller_id) 
      DO UPDATE SET 
        general_no = EXCLUDED.general_no,
        variable_type = EXCLUDED.variable_type,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        job_id AS "jobId",
        controller_id AS "controllerId",
        general_no AS "generalNo",
        variable_type AS "variableType",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    const result = await dbPool.query(query, [
      id,
      jobId,
      controllerId,
      generalNo,
      variableType,
      isActive
    ]);

    const config = result.rows[0];
    return NextResponse.json(config, { status: 201 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT - System Count Config güncelle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, generalNo, variableType, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Config ID is required" },
        { status: 400 }
      );
    }

    const query = `
      UPDATE job_system_count_config 
      SET 
        general_no = COALESCE($2, general_no),
        variable_type = COALESCE($3, variable_type),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id,
        job_id AS "jobId",
        controller_id AS "controllerId",
        general_no AS "generalNo",
        variable_type AS "variableType",
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    const result = await dbPool.query(query, [
      id,
      generalNo,
      variableType,
      isActive
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Config not found" },
        { status: 404 }
      );
    }

    const config = result.rows[0];
    return NextResponse.json(config, { status: 200 });
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - System Count Config sil
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Config ID is required" },
        { status: 400 }
      );
    }

    const query = `DELETE FROM job_system_count_config WHERE id = $1`;
    const result = await dbPool.query(query, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Config not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Config deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DB ERROR:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

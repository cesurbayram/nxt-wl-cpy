import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { TorkExaminationJob } from "@/types/tork-examination.types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const controllerId = params.id;

    const fetchJobsQuery = `
      SELECT id, job_name, controller_id
      FROM job_list 
      WHERE controller_id = $1
      ORDER BY job_name ASC
    `;

    const result = await client.query(fetchJobsQuery, [controllerId]);

    const formattedJobs = result.rows.map((job) => ({
      id: job.id,
      name: job.job_name,
      controller_id: job.controller_id,
    }));

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error("Jobs API - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const controllerId = params.id;

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    console.log("Job Name API: Fetching job name for ID:", jobId);

    const query = `
      SELECT job_name
      FROM job_list
      WHERE id = $1 AND controller_id = $2
    `;

    const result = await client.query(query, [jobId, controllerId]);

    if (result.rows.length === 0) {
      console.error("Job Name API: Job not found");
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = result.rows[0];
    console.log("Job Name API: Found job name:", job.job_name);

    return NextResponse.json({ job_name: job.job_name });
  } catch (error) {
    console.error("Job Name API: Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

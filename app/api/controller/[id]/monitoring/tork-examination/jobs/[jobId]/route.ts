import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string } }
) {
  const client = await dbPool.connect();

  try {
    const { id: controllerId, jobId } = params;

    const fetchJobNameQuery = `
      SELECT job_name
      FROM job_list
      WHERE controller_id = $1 AND id = $2
    `;

    const jobNameResult = await client.query(fetchJobNameQuery, [
      controllerId,
      jobId,
    ]);

    if (jobNameResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Job not found in job_list" },
        { status: 404 }
      );
    }

    const jobName = jobNameResult.rows[0].job_name;

    const fetchJobQuery = `
      SELECT id, name, job_content, controller_id, current_line, created_at, updated_at
      FROM tork_examination_jobs
      WHERE controller_id = $1 AND name = $2
    `;

    const result = await client.query(fetchJobQuery, [controllerId, jobName]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Job content not found in tork_examination_jobs" },
        { status: 404 }
      );
    }

    const job = result.rows[0];
    const jobContent = job.job_content;
    const lines = jobContent.split("\n");

    const signalUsages = [];
    let lineNumber = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      const onMatch = trimmedLine.match(/on\s+(\d+)/i);
      const offMatch = trimmedLine.match(/off\s+(\d+)/i);

      if (onMatch) {
        signalUsages.push({
          lineNumber,
          signalNumber: onMatch[1],
          action: "on",
        });
      } else if (offMatch) {
        signalUsages.push({
          lineNumber,
          signalNumber: offMatch[1],
          action: "off",
        });
      }

      lineNumber++;
    }

    job.signalUsages = signalUsages;

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

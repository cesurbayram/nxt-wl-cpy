import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { cancelMailJob, scheduleMailJob } from "@/utils/service/scheduler";
import { ScheduledMailJob } from "@/types/scheduled-mail.types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const jobId = params.id;

    const result = await client.query(
      `SELECT * FROM scheduled_mail_jobs WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Error fetching job:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const jobId = params.id;
    const body = await request.json();
    const {
      report_name,
      email_recipient,
      schedule_date,
      schedule_time,
      report_parameters,
      report_format,
      is_recurring,
      recurrence_pattern,
    } = body;

    const existingJobResult = await client.query(
      "SELECT * FROM scheduled_mail_jobs WHERE id = $1",
      [jobId]
    );

    if (existingJobResult.rows.length === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const existingJob = existingJobResult.rows[0];

    if (existingJob.status === "processing") {
      return NextResponse.json(
        { message: "Cannot update job while it's processing" },
        { status: 400 }
      );
    }

    cancelMailJob(jobId);

    await client.query("BEGIN");

    const updateQuery = `
      UPDATE scheduled_mail_jobs 
      SET 
        report_name = COALESCE($1, report_name),
        email_recipient = COALESCE($2, email_recipient),
        schedule_date = COALESCE($3, schedule_date),
        schedule_time = COALESCE($4, schedule_time),
        report_parameters = COALESCE($5, report_parameters),
        report_format = COALESCE($6, report_format),
        is_recurring = COALESCE($7, is_recurring),
        recurrence_pattern = COALESCE($8, recurrence_pattern),
        status = 'scheduled'
      WHERE id = $9
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      report_name,
      email_recipient,
      schedule_date,
      schedule_time,
      report_parameters ? JSON.stringify(report_parameters) : null,
      report_format,
      is_recurring,
      recurrence_pattern,
      jobId,
    ]);

    await client.query("COMMIT");

    const updatedJob: ScheduledMailJob = result.rows[0];

    const scheduled = scheduleMailJob(updatedJob);

    if (!scheduled) {
      return NextResponse.json(
        { message: "Job updated but failed to reschedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error updating job:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await dbPool.connect();

  try {
    const jobId = params.id;

    const existingJobResult = await client.query(
      "SELECT * FROM scheduled_mail_jobs WHERE id = $1",
      [jobId]
    );

    if (existingJobResult.rows.length === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const existingJob = existingJobResult.rows[0];

    if (existingJob.status === "processing") {
      return NextResponse.json(
        { message: "Cannot delete job while it's processing" },
        { status: 400 }
      );
    }

    cancelMailJob(jobId);

    await client.query("BEGIN");

    await client.query("DELETE FROM scheduled_mail_jobs WHERE id = $1", [
      jobId,
    ]);

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Job deleted successfully",
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error deleting job:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

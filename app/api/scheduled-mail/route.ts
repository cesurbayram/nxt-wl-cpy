import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import {
  scheduleMailJob,
  cancelMailJob,
  createCronExpression,
} from "@/utils/service/scheduler";
import {
  MailJobConfig,
  ScheduledMailJob,
  MailJobResponse,
} from "@/types/scheduled-mail.types";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");

    let query = `
      SELECT * FROM scheduled_mail_jobs 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    const offset = (page - 1) * pageSize;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    let countQuery = `
      SELECT COUNT(*) as total FROM scheduled_mail_jobs 
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const jobs = await dbPool.query(query, params);
    const countResult = await dbPool.query(countQuery, countParams);

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      jobs: jobs.rows as ScheduledMailJob[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching scheduled mail jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled mail jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MailJobConfig = await request.json();

    const jobId = uuidv4();

    const cronExpression = createCronExpression(
      body.schedule_date,
      body.schedule_time,
      body.is_recurring,
      body.recurrence_pattern
    );

    const insertQuery = `
      INSERT INTO scheduled_mail_jobs (
        id, report_type_id, report_name, email_recipient, 
        schedule_date, schedule_time, report_parameters, 
        report_format, status, is_recurring, recurrence_pattern, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'scheduled', $9, $10, NOW())
    `;

    await dbPool.query(insertQuery, [
      jobId,
      body.report_type_id,
      body.report_name,
      body.email_recipient,
      body.schedule_date,
      body.schedule_time,
      JSON.stringify(body.report_parameters || {}),
      body.report_format,
      body.is_recurring,
      body.recurrence_pattern || null,
    ]);

    const newJobResult = await dbPool.query(
      "SELECT * FROM scheduled_mail_jobs WHERE id = $1",
      [jobId]
    );

    const newJob = newJobResult.rows[0] as ScheduledMailJob;

    scheduleMailJob(newJob);

    return NextResponse.json(
      {
        job_id: newJob.id,
        status: "success",
        message: "Scheduled mail job created successfully",
        job: newJob,
      } as MailJobResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating scheduled mail job:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled mail job" },
      { status: 500 }
    );
  }
}

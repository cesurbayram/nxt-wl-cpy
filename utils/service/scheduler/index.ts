import * as cron from "node-cron";
import { ScheduledMailJob } from "@/types/scheduled-mail.types";
import { sendReportMail } from "@/utils/service/mail";
import { dbPool } from "@/utils/dbUtil";
import { collectReportData } from "@/utils/service/reports/data-collecter";
import { generateReportFile } from "@/utils/service/reports/report-genarator";
import { NotificationService } from "@/utils/service/notification";
import fs from "fs";

const activeCronJobs = new Map<string, cron.ScheduledTask>();

export const createCronExpression = (
  date: string,
  time: string,
  isRecurring: boolean = false,
  recurrencePattern?: string
): string => {
  const [hours, minutes] = time.split(":");
  const targetDate = new Date(date);

  if (!isRecurring) {
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;

    return `${minutes} ${hours} ${day} ${month} *`;
  }

  switch (recurrencePattern) {
    case "daily":
      return `${minutes} ${hours} * * *`;
    case "weekly":
      const dayOfWeek = targetDate.getDay();
      return `${minutes} ${hours} * * ${dayOfWeek}`;
    case "monthly":
      const dayOfMonth = targetDate.getDate();
      return `${minutes} ${hours} ${dayOfMonth} * *`;
    default:
      return `${minutes} ${hours} * * *`;
  }
};

export const executeMailJob = async (job: ScheduledMailJob): Promise<void> => {
  const client = await dbPool.connect();

  try {
    await client.query(
      "UPDATE scheduled_mail_jobs SET status = $1 WHERE id = $2",
      ["processing", job.id]
    );

    const reportTypeResult = await client.query(
      `SELECT rt.*, c.name as category_name 
       FROM report_types rt
       LEFT JOIN report_categories c ON rt.category_id = c.id
       WHERE rt.id = $1`,
      [job.report_type_id]
    );

    if (reportTypeResult.rows.length === 0) {
      throw new Error(`Report type not found: ${job.report_type_id}`);
    }

    const reportType = reportTypeResult.rows[0];

    let reportParameters = {};
    try {
      reportParameters =
        typeof job.report_parameters === "string"
          ? JSON.parse(job.report_parameters)
          : job.report_parameters || {};
    } catch (error) {
      console.error("Error parsing report parameters:", error);
      reportParameters = {};
    }

    const reportData = await collectReportData(
      reportType,
      reportParameters,
      `Scheduled report: ${job.report_name}`
    );

    const filePath = await generateReportFile(
      reportData,
      job.report_format,
      job.id
    );

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `${job.report_name}_${
      new Date().toISOString().split("T")[0]
    }.${job.report_format === "excel" ? "xlsx" : job.report_format}`;

    const emailSent = await sendReportMail(job, fileBuffer, fileName);

    if (!emailSent) {
      throw new Error("Failed to send email");
    }

    await client.query(
      "UPDATE scheduled_mail_jobs SET status = $1 WHERE id = $2",
      ["completed", job.id]
    );

    try {
      await NotificationService.notifyMailSent(
        job.id,
        job.report_name,
        job.email_recipient
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    try {
      fs.unlinkSync(filePath);
    } catch (cleanupError) {
      console.warn(`Failed to cleanup file: ${filePath}`, cleanupError);
    }

    if (!job.is_recurring) {
      cancelMailJob(job.id);
    }
  } catch (error) {
    console.error(`Mail job failed: ${job.id}`, error);

    try {
      await client.query(
        "UPDATE scheduled_mail_jobs SET status = $1 WHERE id = $2",
        ["failed", job.id]
      );

      // Send failure notification
      try {
        await NotificationService.notifyMailFailed(
          job.id,
          job.report_name,
          job.email_recipient,
          error instanceof Error ? error.message : String(error)
        );
      } catch (notificationError) {
        console.error("Failed to send notification:", notificationError);
      }
    } catch (updateError) {
      console.error("Failed to update job status to failed:", updateError);
    }
  } finally {
    client.release();
  }
};

export const scheduleMailJob = (job: ScheduledMailJob): boolean => {
  try {
    const cronExpression = createCronExpression(
      job.schedule_date,
      job.schedule_time,
      job.is_recurring,
      job.recurrence_pattern
    );

    if (!cron.validate(cronExpression)) {
      console.error(`Invalid cron expression: ${cronExpression}`);
      return false;
    }

    if (activeCronJobs.has(job.id)) {
      cancelMailJob(job.id);
    }

    const cronJob = cron.schedule(cronExpression, () => executeMailJob(job), {
      timezone: "Europe/Istanbul",
    });

    activeCronJobs.set(job.id, cronJob);

    return true;
  } catch (error) {
    console.error(`Failed to schedule mail job: ${job.id}`, error);
    return false;
  }
};

export const cancelMailJob = (jobId: string): boolean => {
  try {
    const cronJob = activeCronJobs.get(jobId);

    if (cronJob) {
      cronJob.stop();
      cronJob.destroy();
      activeCronJobs.delete(jobId);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to cancel mail job: ${jobId}`, error);
    return false;
  }
};

export const loadActiveJobs = async (): Promise<void> => {
  const client = await dbPool.connect();

  try {
    const result = await client.query(
      "SELECT * FROM scheduled_mail_jobs WHERE status = $1 ORDER BY created_at DESC",
      ["scheduled"]
    );

    const jobs = result.rows as ScheduledMailJob[];

    const activeJobs = jobs.filter((job: ScheduledMailJob) => {
      if (job.status !== "scheduled") return false;

      if (job.is_recurring) return true;

      const scheduledTime = new Date(
        `${job.schedule_date}T${job.schedule_time}`
      );
      return scheduledTime > new Date();
    });

    for (const job of activeJobs) {
      scheduleMailJob(job);
    }
  } catch (error) {
    console.error("Failed to load active jobs:", error);
  } finally {
    client.release();
  }
};

export const getActiveJobsCount = (): number => {
  return activeCronJobs.size;
};

export const getActiveJobIds = (): string[] => {
  return Array.from(activeCronJobs.keys());
};

export const rescheduleMailJob = (job: ScheduledMailJob): boolean => {
  cancelMailJob(job.id);
  return scheduleMailJob(job);
};

export const stopAllJobs = (): void => {
  const jobEntries = Array.from(activeCronJobs.entries());

  for (const [jobId, cronJob] of jobEntries) {
    try {
      cronJob.stop();
      cronJob.destroy();
    } catch (error) {
      console.error(`Failed to stop job: ${jobId}`, error);
    }
  }

  activeCronJobs.clear();
};

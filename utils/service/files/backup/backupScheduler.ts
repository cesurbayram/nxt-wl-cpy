import { scheduleJob, Job } from "node-schedule";
import { dbPool } from "@/utils/dbUtil";
import { performBackup } from "./backupService";
import { BackupPlan } from "@/types/files.types";

const activeJobs = new Map<string, Job>();

export async function initializeBackupScheduler() {
  try {
    clearExistingJobs();

    const plans = await dbPool.query<BackupPlan>(
      `SELECT 
        id, 
        controller_id, 
        name, 
        days, 
        time, 
        file_types, 
        is_active, 
        created_at, 
        updated_at 
       FROM backup_plans 
       WHERE is_active = true`
    );

    plans.rows.forEach((plan) => {
      scheduleBackupPlan(plan);
    });

    console.log(`Initialized ${plans.rowCount} backup plans`);
  } catch (error) {
    console.error("Failed to initialize backup scheduler:", error);
    throw error;
  }
}

function scheduleBackupPlan(plan: BackupPlan) {
  plan.days.forEach((day) => {
    const cronExpression = `0 ${plan.time.split(":")[1]} ${
      plan.time.split(":")[0]
    } * * ${day}`;

    const job = scheduleJob(cronExpression, async () => {
      try {
        console.log(`Starting backup for plan ${plan.id}`);
        await performBackup(plan);
        console.log(`Completed backup for plan ${plan.id}`);
      } catch (error) {
        console.error(`Backup failed for plan ${plan.id}:`, error);
        scheduleRetry(plan, 1);
      }
    });

    const jobKey = `${plan.id}_${day}`;
    activeJobs.set(jobKey, job);
  });
}

async function scheduleRetry(plan: BackupPlan, attemptCount: number) {
  if (attemptCount > 3) {
    console.error(`All retry attempts failed for plan ${plan.id}`);
    return;
  }

  console.log(`Scheduling retry ${attemptCount} for plan ${plan.id}`);

  setTimeout(async () => {
    try {
      await performBackup(plan);
      console.log(`Retry ${attemptCount} successful for plan ${plan.id}`);
    } catch (error) {
      console.error(`Retry ${attemptCount} failed for plan ${plan.id}:`, error);
      scheduleRetry(plan, attemptCount + 1);
    }
  }, 5 * 60 * 1000);
}

function clearExistingJobs() {
  activeJobs.forEach((job) => {
    job.cancel();
  });
  activeJobs.clear();
}

export async function updateBackupSchedule(plan: BackupPlan) {
  plan.days.forEach((day) => {
    const jobKey = `${plan.id}_${day}`;
    const existingJob = activeJobs.get(jobKey);
    if (existingJob) {
      existingJob.cancel();
      activeJobs.delete(jobKey);
    }
  });

  if (plan.is_active) {
    scheduleBackupPlan(plan);
  }
}

export async function removeBackupSchedule(planId: string) {
  activeJobs.forEach((job, key) => {
    if (key.startsWith(`${planId}_`)) {
      job.cancel();
      activeJobs.delete(key);
    }
  });
}

export function stopBackupScheduler() {
  clearExistingJobs();
}

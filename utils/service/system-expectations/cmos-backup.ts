import { BackupPlan } from "@/types/files.types";
import {
  BackupSessionWithController,
  BackupFileDetail,
  BackupHistoryResponse,
  BackupSessionDetailsResponse,
} from "@/types/backup.types";

interface InstantBackupResult {
  success: boolean;
  message?: string;
  backupId?: string;
  error?: string;
}

interface WeeklyPlanResult {
  success: boolean;
  message?: string;
  planId?: string;
  error?: string;
}

const performInstantBackup = async (
  controllerId: string,
  fileTypes: string[] = ["CMOS"]
): Promise<InstantBackupResult> => {
  try {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);

    const dayId = now.getDay() === 0 ? 7 : now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[now.getDay()];

    const instantPlan = {
      name: `CMOS Instant Backup ${dayName}`,
      days: [dayId],
      time: currentTime,
      file_types: fileTypes,
    };

    const response = await fetch(
      `/api/controller/${controllerId}/files/backup/plans`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instantPlan),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create instant backup plan");
    }

    const result: BackupPlan = await response.json();

    return {
      success: true,
      message: `CMOS Instant backup plan created for ${fileTypes.join(
        ", "
      )} - scheduled for ${currentTime}`,
      backupId: result.id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Instant backup failed: ${error}`,
    };
  }
};

// Create weekly backup plan - saves to database
const createWeeklyBackupPlan = async (
  controllerId: string,
  planName: string,
  weeklyPlan: {
    [key: string]: { enabled: boolean; time: string; fileTypes: string[] };
  }
): Promise<WeeklyPlanResult> => {
  try {
    // Extract enabled days and their configurations
    const enabledDays = Object.entries(weeklyPlan)
      .filter(([_, config]) => config.enabled)
      .map(([day, config]) => {
        const dayNumbers: { [key: string]: number } = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 7,
        };
        return {
          day: dayNumbers[day],
          time: config.time,
          fileTypes: config.fileTypes,
        };
      });

    if (enabledDays.length === 0) {
      throw new Error("No days selected for backup plan");
    }

    const planPromises = enabledDays.map(async (dayConfig) => {
      const plan = {
        name: `${planName} - ${
          Object.keys({
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
            7: "Sunday",
          })[dayConfig.day - 1]
        }`,
        days: [dayConfig.day],
        time: dayConfig.time,
        file_types: dayConfig.fileTypes,
      };

      const response = await fetch(
        `/api/controller/${controllerId}/files/backup/plans`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plan),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create plan for day ${dayConfig.day}`);
      }

      return response.json();
    });

    const results = await Promise.all(planPromises);

    return {
      success: true,
      message: `CMOS Weekly backup plan created for ${enabledDays.length} day(s)`,
      planId: results[0].id,
    };
  } catch (error) {
    return {
      success: false,
      error: `Weekly plan creation failed: ${error}`,
    };
  }
};

const getBackupHistory = async (
  controllerId: string
): Promise<BackupHistoryResponse> => {
  const res = await fetch(
    `/api/system-expectations/cmos-backup/backup-history/${controllerId}`
  );
  if (!res.ok) throw new Error("Backup history fetch failed");
  return res.json();
};

const getBackupSessionDetails = async (
  sessionId: string
): Promise<BackupSessionDetailsResponse> => {
  const res = await fetch(
    `/api/system-expectations/cmos-backup/backup-session/${sessionId}`
  );
  if (!res.ok) throw new Error("Session details fetch failed");
  return res.json();
};

export {
  performInstantBackup,
  createWeeklyBackupPlan,
  getBackupHistory,
  getBackupSessionDetails,
  type InstantBackupResult,
  type WeeklyPlanResult,
};

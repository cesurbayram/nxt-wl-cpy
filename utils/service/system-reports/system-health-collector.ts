import { dbPool } from "@/utils/dbUtil";
import {
  SystemHealthReportData,
  ControllerStatusData,
  PerformanceAnalysis,
  AlarmAnalysis,
  BackupStatus,
  ProductionSummary,
  MaintenanceData,
  LogAnalysis,
  SystemSummary,
} from "@/types/system-health-report.types";
import { readLogDataFile, analyzeLogEntries } from "./logdata-parser";

export async function collectSystemHealthData(): Promise<SystemHealthReportData> {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    controllers,
    performance,
    alarms,
    backups,
    production,
    maintenance,
    logs,
  ] = await Promise.all([
    collectControllerStatus(),
    collectPerformanceData(),
    collectAlarmData(),
    collectBackupStatus(),
    collectProductionData(),
    collectMaintenanceData(),
    collectLogData(),
  ]);

  const summary = generateSystemSummary(controllers, alarms, performance);

  return {
    metadata: {
      reportId: crypto.randomUUID(),
      generatedAt: now.toISOString(),
      dateRange: {
        from: yesterday.toISOString(),
        to: now.toISOString(),
      },
      totalControllers: controllers.length,
    },
    summary,
    controllers,
    performance,
    alarms,
    backups,
    production,
    maintenance,
    logs,
  };
}

/**
 * Generate system summary
 */
function generateSystemSummary(
  controllers: ControllerStatusData[],
  alarms: AlarmAnalysis,
  performance: PerformanceAnalysis
): SystemSummary {
  const onlineControllers = controllers.filter((c) => c.isOnline);
  const offlineControllers = controllers.filter((c) => !c.isOnline);

  // Find top performing robot
  const topRobot =
    performance.robotPerformances.length > 0
      ? performance.robotPerformances[0].controllerName
      : "N/A";

  // Find robot with most alarms
  const mostAlarmsRobot =
    alarms.alarmsByController.length > 0
      ? alarms.alarmsByController[0].controllerName
      : "N/A";

  return {
    totalRobots: controllers.length,
    onlineCount: onlineControllers.length,
    offlineCount: offlineControllers.length,
    avgServoTime: performance.currentPeriod.avgServoTime,
    totalAlarmsLast24h: alarms.totalLast24h,
    topPerformingRobot: topRobot,
    mostAlarmsRobot: mostAlarmsRobot,
  };
}


async function collectControllerStatus(): Promise<ControllerStatusData[]> {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.model,
        c.ip_address,
        c.location,
        '' as application,
        c.status,
        cs.servo,
        cs.operating,
        cs.teach,
        cs.alarm,
        cs.error,
        cs.hold,
        cs.stop as door_open,
        true as connection,
        cs.update_at as updated_at
      FROM controller c
      LEFT JOIN controller_status cs ON c.id = cs.controller_id
      ORDER BY c.name
    `;

    const result = await dbPool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      model: row.model || "Unknown",
      ipAddress: row.ip_address,
      location: row.location || "Unknown",
      application: row.application || "Unknown",
      status: row.status || "Unknown",
      isOnline: row.connection === true,
      servo: row.servo === true,
      operating: row.operating === true,
      teach: row.teach || "Unknown",
      alarm: row.alarm === true,
      error: row.error === true,
      hold: row.hold === true,
      doorOpen: row.door_open === true,
      connection: row.connection === true,
      lastUpdate: row.updated_at ? new Date(row.updated_at).toISOString() : "Never",
    }));
  } catch (error) {
    console.error("Error collecting controller status:", error);
    return [];
  }
}

/**
 * Collect performance data
 */
async function collectPerformanceData(): Promise<PerformanceAnalysis> {
  try {
    // Check if utilization table exists
    const tableCheck = await dbPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'utilization_data'
      );
    `);

    if (!tableCheck.rows[0]?.exists) {
      return {
        currentPeriod: {
          avgServoTime: 0,
          avgControlPowerTime: 0,
          avgPlaybackTime: 0,
          avgMovingTime: 0,
          avgOperatingTime: 0,
          totalRecords: 0,
        },
        previousPeriod: {
          avgServoTime: 0,
          avgControlPowerTime: 0,
          avgPlaybackTime: 0,
          avgMovingTime: 0,
          avgOperatingTime: 0,
          totalRecords: 0,
        },
        comparison: {
          servoTimeDiff: 0,
          servoTimeDiffPercent: 0,
          operatingTimeDiff: 0,
          operatingTimeDiffPercent: 0,
        },
        weeklyTrend: [],
        robotPerformances: [],
      };
    }

    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Current period (last 24 hours)
    const currentQuery = `
      SELECT 
        AVG(servo_power_time) as avg_servo_time,
        AVG(control_power_time) as avg_control_power_time,
        AVG(playback_time) as avg_playback_time,
        AVG(moving_time) as avg_moving_time,
        AVG(operating_time) as avg_operating_time,
        COUNT(*) as total_records
      FROM utilization_data
      WHERE timestamp >= $1 AND timestamp <= $2
    `;

    const currentResult = await dbPool.query(currentQuery, [oneDayAgo, now]);

    // Previous period (24-48 hours ago)
    const previousResult = await dbPool.query(currentQuery, [twoDaysAgo, oneDayAgo]);

    // Weekly trend
    const weeklyQuery = `
      SELECT 
        DATE(timestamp) as date,
        AVG(servo_power_time) as avg_servo_time,
        AVG(operating_time) as avg_operating_time
      FROM utilization_data
      WHERE timestamp >= $1
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    const weeklyResult = await dbPool.query(weeklyQuery, [oneWeekAgo]);

    // Robot performances
    const robotQuery = `
      SELECT 
        c.name as controller_name,
        AVG(u.servo_power_time) as servo_time,
        AVG(u.operating_time) as operating_time,
        (AVG(u.operating_time) / NULLIF(AVG(u.control_power_time), 0)) * 100 as efficiency
      FROM utilization_data u
      LEFT JOIN controller c ON u.controller_id = c.id
      WHERE u.timestamp >= $1
      GROUP BY c.name
      ORDER BY servo_time DESC
    `;

    const robotResult = await dbPool.query(robotQuery, [oneDayAgo]);

    const currentPeriod = {
      avgServoTime: parseFloat(currentResult.rows[0]?.avg_servo_time || "0"),
      avgControlPowerTime: parseFloat(currentResult.rows[0]?.avg_control_power_time || "0"),
      avgPlaybackTime: parseFloat(currentResult.rows[0]?.avg_playback_time || "0"),
      avgMovingTime: parseFloat(currentResult.rows[0]?.avg_moving_time || "0"),
      avgOperatingTime: parseFloat(currentResult.rows[0]?.avg_operating_time || "0"),
      totalRecords: parseInt(currentResult.rows[0]?.total_records || "0"),
    };

    const previousPeriod = {
      avgServoTime: parseFloat(previousResult.rows[0]?.avg_servo_time || "0"),
      avgControlPowerTime: parseFloat(previousResult.rows[0]?.avg_control_power_time || "0"),
      avgPlaybackTime: parseFloat(previousResult.rows[0]?.avg_playback_time || "0"),
      avgMovingTime: parseFloat(previousResult.rows[0]?.avg_moving_time || "0"),
      avgOperatingTime: parseFloat(previousResult.rows[0]?.avg_operating_time || "0"),
      totalRecords: parseInt(previousResult.rows[0]?.total_records || "0"),
    };

    const servoTimeDiff = currentPeriod.avgServoTime - previousPeriod.avgServoTime;
    const servoTimeDiffPercent =
      previousPeriod.avgServoTime > 0
        ? (servoTimeDiff / previousPeriod.avgServoTime) * 100
        : 0;

    const operatingTimeDiff = currentPeriod.avgOperatingTime - previousPeriod.avgOperatingTime;
    const operatingTimeDiffPercent =
      previousPeriod.avgOperatingTime > 0
        ? (operatingTimeDiff / previousPeriod.avgOperatingTime) * 100
        : 0;

    return {
      currentPeriod,
      previousPeriod,
      comparison: {
        servoTimeDiff,
        servoTimeDiffPercent,
        operatingTimeDiff,
        operatingTimeDiffPercent,
      },
      weeklyTrend: weeklyResult.rows.map((row) => ({
        date: row.date,
        avgServoTime: parseFloat(row.avg_servo_time || "0"),
        avgOperatingTime: parseFloat(row.avg_operating_time || "0"),
      })),
      robotPerformances: robotResult.rows.map((row) => ({
        controllerName: row.controller_name || "Unknown",
        servoTime: parseFloat(row.servo_time || "0"),
        efficiency: parseFloat(row.efficiency || "0"),
        operatingTime: parseFloat(row.operating_time || "0"),
      })),
    };
  } catch (error) {
    console.error("Error collecting performance data:", error);
    return {
      currentPeriod: {
        avgServoTime: 0,
        avgControlPowerTime: 0,
        avgPlaybackTime: 0,
        avgMovingTime: 0,
        avgOperatingTime: 0,
        totalRecords: 0,
      },
      previousPeriod: {
        avgServoTime: 0,
        avgControlPowerTime: 0,
        avgPlaybackTime: 0,
        avgMovingTime: 0,
        avgOperatingTime: 0,
        totalRecords: 0,
      },
      comparison: {
        servoTimeDiff: 0,
        servoTimeDiffPercent: 0,
        operatingTimeDiff: 0,
        operatingTimeDiffPercent: 0,
      },
      weeklyTrend: [],
      robotPerformances: [],
    };
  }
}

/**
 * Collect alarm data
 */
async function collectAlarmData(): Promise<AlarmAnalysis> {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Total alarms in last 24 hours
    const totalQuery = `
      SELECT COUNT(*) as count
      FROM alarm
      WHERE detected >= $1
    `;

    const totalResult = await dbPool.query(totalQuery, [oneDayAgo]);
    const totalLast24h = parseInt(totalResult.rows[0]?.count || "0");

    // Active alarms
    const activeQuery = `
      SELECT COUNT(*) as count
      FROM alarm
      WHERE removed IS NULL
    `;

    const activeResult = await dbPool.query(activeQuery);
    const activeAlarms = parseInt(activeResult.rows[0]?.count || "0");

    // ALL alarm codes (no limit)
    const topCodesQuery = `
      SELECT 
        code,
        text,
        priority as type,
        COUNT(*) as count
      FROM alarm
      WHERE detected >= $1
      GROUP BY code, text, priority
      ORDER BY count DESC
    `;

    const topCodesResult = await dbPool.query(topCodesQuery, [oneDayAgo]);

    // Severity distribution
    const severityQuery = `
      SELECT 
        priority as type,
        COUNT(*) as count
      FROM alarm
      WHERE detected >= $1
      GROUP BY priority
    `;

    const severityResult = await dbPool.query(severityQuery, [oneDayAgo]);

    let majorCount = 0;
    let minorCount = 0;
    severityResult.rows.forEach((row) => {
      if (row.type && row.type.toUpperCase().includes("MAJOR")) majorCount = parseInt(row.count);
      if (row.type && row.type.toUpperCase().includes("MINOR")) minorCount = parseInt(row.count);
    });

    // ALL recent alarms (no limit - will get ALL alarms from last 24h)
    const recentQuery = `
      SELECT 
        c.name as controller_name,
        a.code,
        a.text,
        a.detected,
        a.removed,
        a.priority as type,
        a.detected as origin_date
      FROM alarm a
      LEFT JOIN controller c ON a.controller_id = c.id
      WHERE a.detected >= $1
      ORDER BY a.detected DESC
    `;

    const recentResult = await dbPool.query(recentQuery, [oneDayAgo]);

    // Alarms by controller
    const byControllerQuery = `
      SELECT 
        c.name as controller_name,
        COUNT(a.id) as alarm_count
      FROM alarm a
      LEFT JOIN controller c ON a.controller_id = c.id
      WHERE a.detected >= $1
      GROUP BY c.name
      ORDER BY alarm_count DESC
    `;

    const byControllerResult = await dbPool.query(byControllerQuery, [oneDayAgo]);

    return {
      totalLast24h,
      activeAlarms,
      topAlarmCodes: topCodesResult.rows.map((row) => ({
        code: row.code || "Unknown",
        text: row.text || "No description",
        count: parseInt(row.count),
        severity: row.type || "Unknown",
      })),
      severityDistribution: {
        major: majorCount,
        minor: minorCount,
      },
      recentAlarms: recentResult.rows.map((row) => ({
        controllerName: row.controller_name || "Unknown",
        code: row.code || "Unknown",
        text: row.text || "No description",
        detected: row.detected ? new Date(row.detected).toISOString() : "Unknown",
        removed: row.removed ? new Date(row.removed).toISOString() : null,
        severity: row.type || "Unknown",
      })),
      alarmsByController: byControllerResult.rows.map((row) => ({
        controllerName: row.controller_name || "Unknown",
        alarmCount: parseInt(row.alarm_count),
      })),
    };
  } catch (error) {
    console.error("Error collecting alarm data:", error);
    return {
      totalLast24h: 0,
      activeAlarms: 0,
      topAlarmCodes: [],
      severityDistribution: { major: 0, minor: 0 },
      recentAlarms: [],
      alarmsByController: [],
    };
  }
}

/**
 * Collect backup status
 */
async function collectBackupStatus(): Promise<BackupStatus> {
  try {
    // backup_sessions tablosu yok, backup_plans var
    const query = `
      SELECT 
        c.id as controller_id,
        c.name as controller_name,
        bp.created_at as last_backup_date,
        bp.is_active as status
      FROM controller c
      LEFT JOIN backup_plans bp ON c.id = bp.controller_id
      ORDER BY c.name
    `;

    const result = await dbPool.query(query);

    const now = new Date();
    const backupDetails = result.rows.map((row) => {
      const lastBackupDate = row.last_backup_date ? new Date(row.last_backup_date) : null;
      const daysSinceLastBackup = lastBackupDate
        ? Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        controllerName: row.controller_name,
        lastBackupDate: lastBackupDate ? lastBackupDate.toISOString() : null,
        totalFiles: 0,
        successfulFiles: 0,
        failedFiles: 0,
        status: row.status ? "active" : "inactive",
        daysSinceLastBackup,
      };
    });

    const controllersWithBackup = backupDetails.filter((d) => d.lastBackupDate).length;
    const controllersWithoutBackup = backupDetails.filter((d) => !d.lastBackupDate).length;
    const totalSuccessful = backupDetails.reduce((sum, d) => sum + d.successfulFiles, 0);
    const totalFiles = backupDetails.reduce((sum, d) => sum + d.totalFiles, 0);
    const successRate = totalFiles > 0 ? (totalSuccessful / totalFiles) * 100 : 0;

    const missingBackups = backupDetails
      .filter((d) => !d.lastBackupDate || (d.daysSinceLastBackup && d.daysSinceLastBackup > 7))
      .map((d) => d.controllerName);

    return {
      controllersWithBackup,
      controllersWithoutBackup,
      totalBackupSessions: backupDetails.length,
      successRate,
      backupDetails,
      missingBackups,
    };
  } catch (error) {
    console.error("Error collecting backup status:", error);
    return {
      controllersWithBackup: 0,
      controllersWithoutBackup: 0,
      totalBackupSessions: 0,
      successRate: 0,
      backupDetails: [],
      missingBackups: [],
    };
  }
}

/**
 * Collect production data
 */
async function collectProductionData(): Promise<ProductionSummary> {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayStart);

    // Today's production
    const todayQuery = `
      SELECT COALESCE(SUM(produced_product_count), 0) as total
      FROM production_value
      WHERE created_at >= $1
    `;

    const todayResult = await dbPool.query(todayQuery, [todayStart]);
    const totalProductionToday = parseInt(todayResult.rows[0]?.total || "0");

    // Yesterday's production
    const yesterdayResult = await dbPool.query(
      `SELECT COALESCE(SUM(produced_product_count), 0) as total
       FROM production_value
       WHERE created_at >= $1 AND created_at < $2`,
      [yesterdayStart, yesterdayEnd]
    );

    const totalProductionYesterday = parseInt(yesterdayResult.rows[0]?.total || "0");

    const productionDiff = totalProductionToday - totalProductionYesterday;
    const productionDiffPercent =
      totalProductionYesterday > 0 ? (productionDiff / totalProductionYesterday) * 100 : 0;

    // Top job
    const topJobQuery = `
      SELECT 
        js.name as job_name,
        COUNT(*) as count
      FROM production_value pv
      LEFT JOIN job_select js ON pv.job_id = js.id
      WHERE pv.created_at >= $1
      GROUP BY js.name
      ORDER BY count DESC
      LIMIT 1
    `;

    const topJobResult = await dbPool.query(topJobQuery, [yesterdayStart]);
    const topJob = topJobResult.rows[0]?.job_name || null;
    const topJobCount = parseInt(topJobResult.rows[0]?.count || "0");

    // Shift production
    const shiftQuery = `
      SELECT 
        s.name as shift_name,
        COALESCE(SUM(pv.produced_product_count), 0) as total_production,
        COUNT(DISTINCT pv.controller_id) as controller_count
      FROM production_value pv
      LEFT JOIN shift s ON pv.shift_id = s.id
      WHERE pv.created_at >= $1
      GROUP BY s.name
      ORDER BY total_production DESC
    `;

    const shiftResult = await dbPool.query(shiftQuery, [todayStart]);

    // Production by controller
    const controllerQuery = `
      SELECT 
        c.name as controller_name,
        COALESCE(SUM(pv.produced_product_count), 0) as total_production,
        COUNT(DISTINCT pv.job_id) as job_count
      FROM production_value pv
      LEFT JOIN controller c ON pv.controller_id = c.id
      WHERE pv.created_at >= $1
      GROUP BY c.name
      ORDER BY total_production DESC
    `;

    const controllerResult = await dbPool.query(controllerQuery, [todayStart]);

    return {
      totalProductionToday,
      totalProductionYesterday,
      productionDiff,
      productionDiffPercent,
      topJob,
      topJobCount,
      shiftProduction: shiftResult.rows.map((row) => ({
        shiftName: row.shift_name || "Unknown",
        totalProduction: parseInt(row.total_production),
        controllerCount: parseInt(row.controller_count),
      })),
      productionByController: controllerResult.rows.map((row) => ({
        controllerName: row.controller_name || "Unknown",
        totalProduction: parseInt(row.total_production),
        jobCount: parseInt(row.job_count),
      })),
    };
  } catch (error) {
    console.error("Error collecting production data:", error);
    return {
      totalProductionToday: 0,
      totalProductionYesterday: 0,
      productionDiff: 0,
      productionDiffPercent: 0,
      topJob: null,
      topJobCount: 0,
      shiftProduction: [],
      productionByController: [],
    };
  }
}

/**
 * Collect maintenance data
 */
async function collectMaintenanceData(): Promise<MaintenanceData> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check if tables exist
    const maintenanceCheck = await dbPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'maintenance_history'
      );
    `);

    const utilizationCheck = await dbPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'utilization_data'
      );
    `);

    if (!maintenanceCheck.rows[0]?.exists) {
      return {
        recentMaintenance: [],
        upcomingMaintenance: [],
        totalMaintenanceRecords: 0,
        controllersNeedingMaintenance: 0,
      };
    }

    // Recent maintenance
    const recentQuery = `
      SELECT 
        c.name as controller_name,
        mh.maintenance_type,
        mh.maintenance_date,
        mh.servo_hours,
        mh.technician,
        mh.notes
      FROM maintenance_history mh
      LEFT JOIN controller c ON mh.controller_id = c.id
      WHERE mh.maintenance_date >= $1
      ORDER BY mh.maintenance_date DESC
    `;

    const recentResult = await dbPool.query(recentQuery, [thirtyDaysAgo]);

    let upcomingMaintenance: Array<{
      controllerName: string;
      estimatedDate: string;
      currentServoHours: number;
      maintenanceThreshold: number;
      daysUntilMaintenance: number;
    }> = [];

    // Only check upcoming if utilization table exists
    if (utilizationCheck.rows[0]?.exists) {
      // For upcoming maintenance, we need to estimate based on current servo hours
      const upcomingQuery = `
        SELECT 
          c.name as controller_name,
          u.servo_power_time as current_servo_hours
        FROM controller c
        LEFT JOIN LATERAL (
          SELECT servo_power_time
          FROM utilization_data
          WHERE controller_id = c.id
          ORDER BY timestamp DESC
          LIMIT 1
        ) u ON true
        WHERE u.servo_power_time > 0
        ORDER BY c.name
      `;

      const upcomingResult = await dbPool.query(upcomingQuery);

      // Estimate maintenance threshold (e.g., every 2000 hours)
      const maintenanceThreshold = 2000;

      upcomingMaintenance = upcomingResult.rows
        .map((row) => {
          const currentHours = parseFloat(row.current_servo_hours || "0");
          const hoursUntilMaintenance = maintenanceThreshold - (currentHours % maintenanceThreshold);
          const daysUntilMaintenance = Math.floor(hoursUntilMaintenance / 8); // Assuming 8 hours per day

          const estimatedDate = new Date(now);
          estimatedDate.setDate(estimatedDate.getDate() + daysUntilMaintenance);

          return {
            controllerName: row.controller_name,
            estimatedDate: estimatedDate.toISOString(),
            currentServoHours: currentHours,
            maintenanceThreshold,
            daysUntilMaintenance,
          };
        })
        .filter((m) => m.daysUntilMaintenance < 30)
        .sort((a, b) => a.daysUntilMaintenance - b.daysUntilMaintenance)
        .slice(0, 10);
    }

    return {
      recentMaintenance: recentResult.rows.map((row) => ({
        controllerName: row.controller_name || "Unknown",
        maintenanceType: row.maintenance_type || "Unknown",
        maintenanceDate: row.maintenance_date
          ? new Date(row.maintenance_date).toISOString()
          : "Unknown",
        servoHours: parseFloat(row.servo_hours || "0"),
        technician: row.technician || "Unknown",
        notes: row.notes || "No notes",
      })),
      upcomingMaintenance,
      totalMaintenanceRecords: recentResult.rows.length,
      controllersNeedingMaintenance: upcomingMaintenance.length,
    };
  } catch (error) {
    console.error("Error collecting maintenance data:", error);
    return {
      recentMaintenance: [],
      upcomingMaintenance: [],
      totalMaintenanceRecords: 0,
      controllersNeedingMaintenance: 0,
    };
  }
}

/**
 * Collect log data from LOGDATA.DAT files
 */
async function collectLogData(): Promise<LogAnalysis> {
  try {
    // Get all controllers with IP addresses
    const controllersQuery = `
      SELECT id, name, ip_address
      FROM controller
      ORDER BY name
    `;

    const controllersResult = await dbPool.query(controllersQuery);

    const logsByController = [];
    const allTopEvents: Record<string, number> = {};
    const allCriticalEvents: any[] = [];
    let totalLogEntries = 0;

    // Read log files for each controller
    for (const controller of controllersResult.rows) {
      try {
        const logEntries = await readLogDataFile(controller.ip_address);
        const analysis = analyzeLogEntries(logEntries);

        totalLogEntries += analysis.totalEntries;

        // Aggregate event counts
        Object.entries(analysis.eventCounts).forEach(([event, count]) => {
          allTopEvents[event] = (allTopEvents[event] || 0) + count;
        });

        // Add critical events
        analysis.criticalEvents.forEach((event) => {
          allCriticalEvents.push({
            controllerName: controller.name,
            event: event.event || "Unknown",
            date: event.date || "Unknown",
            loginName: event.loginName || "Unknown",
          });
        });

        const lastLogEntry = logEntries[0];

        logsByController.push({
          controllerName: controller.name,
          totalEntries: analysis.totalEntries,
          lastLogDate: lastLogEntry?.date || null,
          criticalCount: analysis.criticalEvents.length,
        });
      } catch (error) {
        console.error(`Error processing logs for ${controller.name}:`, error);
        logsByController.push({
          controllerName: controller.name,
          totalEntries: 0,
          lastLogDate: null,
          criticalCount: 0,
        });
      }
    }

    // Sort and get top events
    const topEvents = Object.entries(allTopEvents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([eventType, count]) => ({
        eventType,
        count,
        percentage: totalLogEntries > 0 ? (count / totalLogEntries) * 100 : 0,
      }));

    // Sort critical events by date (most recent first)
    const criticalEvents = allCriticalEvents.slice(0, 20);

    return {
      totalLogEntries,
      logsByController,
      topEvents,
      criticalEvents,
      eventTypeDistribution: allTopEvents,
    };
  } catch (error) {
    console.error("Error collecting log data:", error);
    return {
      totalLogEntries: 0,
      logsByController: [],
      topEvents: [],
      criticalEvents: [],
      eventTypeDistribution: {},
    };
  }
}


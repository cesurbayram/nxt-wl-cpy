import {
  CreateNotificationRequest,
  NotificationResponse,
  NotificationType,
  NotificationData,
} from "@/types/notification.types";
import { getDataFromStorage } from "@/utils/common/storage";

export class NotificationService {
  private static getCurrentUserId(): string {
    try {
      const userData = getDataFromStorage("user");
      return userData?.id || "system";
    } catch (error) {
      console.error("Error getting user ID:", error);
      return "system";
    }
  }

  private static async createNotification(request: CreateNotificationRequest) {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating notification:", error);

      // Silent fallback - don't break the main flow
      try {
        // Retry once after 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (retryError) {
        console.error("Retry failed:", retryError);
      }

      return null;
    }
  }

  static async notifyMailSent(
    mailJobId: string,
    reportName: string,
    recipient: string
  ) {
    return this.createNotification({
      type: "mail_sent",
      title: "Mail Sent Successfully",
      message: `Report "${reportName}" has been sent to ${recipient}`,
      data: {
        mail_job_id: mailJobId,
        report_name: reportName,
        recipient_email: recipient,
        severity: "success",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyMailFailed(
    mailJobId: string,
    reportName: string,
    recipient: string,
    error: string
  ) {
    return this.createNotification({
      type: "mail_failed",
      title: "Mail Delivery Failed",
      message: `Failed to send report "${reportName}" to ${recipient}. Error: ${error}`,
      data: {
        mail_job_id: mailJobId,
        report_name: reportName,
        recipient_email: recipient,
        severity: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Report Notifications
  static async notifyReportGenerated(
    reportId: string,
    reportName: string,
    format: string
  ) {
    return this.createNotification({
      type: "report_generated",
      title: "Report Generation Started",
      message: `Report "${reportName}" is being generated in ${format.toUpperCase()} format`,
      data: {
        report_id: reportId,
        report_name: reportName,
        report_format: format,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyReportReady(
    reportId: string,
    reportName: string,
    format: string,
    fileName: string
  ) {
    return this.createNotification({
      type: "report_ready",
      title: "Report Ready",
      message: `Report "${reportName}" is ready for download`,
      data: {
        report_id: reportId,
        report_name: reportName,
        report_format: format,
        file_name: fileName,
        download_url: `/api/shift/reports/download/${reportId}`,
        severity: "success",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyReportFailed(
    reportId: string,
    reportName: string,
    error: string
  ) {
    return this.createNotification({
      type: "report_failed",
      title: "Report Generation Failed",
      message: `Failed to generate report "${reportName}". Error: ${error}`,
      data: {
        report_id: reportId,
        report_name: reportName,
        severity: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyMaintenanceScheduled(
    maintenanceId: string,
    controllerName: string,
    maintenanceType: string,
    technician: string,
    maintenanceDate: string
  ) {
    return this.createNotification({
      type: "maintenance_scheduled",
      title: "Maintenance Scheduled",
      message: `${maintenanceType} maintenance scheduled for controller "${controllerName}" on ${new Date(
        maintenanceDate
      ).toLocaleDateString()}`,
      data: {
        maintenance_id: maintenanceId,
        controller_name: controllerName,
        maintenance_type: maintenanceType,
        technician: technician,
        maintenance_date: maintenanceDate,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyMaintenanceCompleted(
    maintenanceId: string,
    controllerName: string,
    maintenanceType: string,
    technician: string,
    maintenanceDate: string,
    notes?: string
  ) {
    return this.createNotification({
      type: "maintenance_completed",
      title: "Maintenance Completed",
      message: `${maintenanceType} maintenance completed for controller "${controllerName}" by ${technician}`,
      data: {
        maintenance_id: maintenanceId,
        controller_name: controllerName,
        maintenance_type: maintenanceType,
        technician: technician,
        maintenance_date: maintenanceDate,
        notes: notes,
        severity: "success",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyMaintenanceOverdue(
    controllerId: string,
    controllerName: string,
    maintenanceType: string,
    daysSinceLastMaintenance: number,
    lastMaintenanceDate: string
  ) {
    return this.createNotification({
      type: "maintenance_overdue",
      title: "Maintenance Overdue",
      message: `${maintenanceType} maintenance for controller "${controllerName}" is overdue (${daysSinceLastMaintenance} days since last maintenance)`,
      data: {
        controller_id: controllerId,
        controller_name: controllerName,
        maintenance_type: maintenanceType,
        days_overdue: daysSinceLastMaintenance,
        last_maintenance_date: lastMaintenanceDate,
        severity: "warning",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyEmployeeAdded(
    employeeId: string,
    employeeName: string,
    employeeCode: string,
    department: string
  ) {
    return this.createNotification({
      type: "employee_added",
      title: "New Employee Added",
      message: `Employee "${employeeName}" (${employeeCode}) has been added to ${department}`,
      data: {
        employee_id: employeeId,
        employee_name: employeeName,
        employee_code: employeeCode,
        department: department,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyEmployeeUpdated(
    employeeId: string,
    employeeName: string,
    employeeCode: string
  ) {
    return this.createNotification({
      type: "employee_updated",
      title: "Employee Updated",
      message: `Employee "${employeeName}" (${employeeCode}) information has been updated`,
      data: {
        employee_id: employeeId,
        employee_name: employeeName,
        employee_code: employeeCode,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyEmployeeDeleted(
    employeeName: string,
    employeeCode: string
  ) {
    return this.createNotification({
      type: "employee_deleted",
      title: "Employee Deleted",
      message: `Employee "${employeeName}" (${employeeCode}) has been deleted`,
      data: {
        employee_name: employeeName,
        employee_code: employeeCode,
        severity: "warning",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyControllerAdded(
    controllerId: string,
    controllerName: string
  ) {
    return this.createNotification({
      type: "controller_added",
      title: "New Controller Added",
      message: `Controller "${controllerName}" has been added to the system`,
      data: {
        controller_id: controllerId,
        controller_name: controllerName,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyAlarmTriggered(
    controllerId: string,
    controllerName: string,
    alarmType: string,
    alarmMessage: string
  ) {
    return this.createNotification({
      type: "alarm_triggered",
      title: "Alarm Triggered",
      message: `${alarmType} alarm triggered on controller "${controllerName}"`,
      data: {
        controller_id: controllerId,
        controller_name: controllerName,
        alarm_type: alarmType,
        alarm_message: alarmMessage,
        severity: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async notifyShiftChanged(shiftName: string) {
    return this.createNotification({
      type: "shift_changed",
      title: "Shift Changed",
      message: `Shift has been changed to "${shiftName}"`,
      data: {
        shift_name: shiftName,
        severity: "info",
        timestamp: new Date().toISOString(),
      },
    });
  }

  static async getNotifications(
    userId?: string,
    unreadOnly: boolean = false,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationResponse> {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      const params = new URLSearchParams({
        user_id: currentUserId,
        unread_only: unreadOnly.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  static async markAsRead(notificationIds?: string[], userId?: string) {
    try {
      const currentUserId = userId || this.getCurrentUserId();
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_read",
          notification_ids: notificationIds,
          user_id: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      return await response.json();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }
}

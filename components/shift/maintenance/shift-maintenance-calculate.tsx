import {
  ControllerForMaintenance,
  ShiftMaintenanceHistory,
} from "@/types/shift-maintenance.types";
import { getMaintenanceIntervals } from "@/utils/common/robot-maintenance-intervals";

export const useMaintenanceCalculations = (
  maintenanceHistory: ShiftMaintenanceHistory[]
) => {
  const getMaintenanceStatus = (controller: ControllerForMaintenance) => {
    const currentHours = controller.servo_power_time || 0;
    const model = controller.model;
    const robotModel = controller.robot_model;

    // Get maintenance intervals based on robot model
    const intervals = getMaintenanceIntervals(robotModel, model);
    const generalHours = intervals.periodicMaintenance;

    console.log("Maintenance Calculation:", {
      controllerId: controller.id,
      controllerName: controller.name,
      robotModel,
      controllerModel: model,
      intervals,
      currentHours,
    });

    const controllerHistory = maintenanceHistory.filter(
      (h) => h.controller_id === controller.id
    );

    const getLastMaintenanceHours = (type: string) => {
      const lastMaintenance = controllerHistory
        .filter((h) => h.maintenance_type.includes(type))
        .sort(
          (a, b) =>
            new Date(b.maintenance_date).getTime() -
            new Date(a.maintenance_date).getTime()
        )[0];
      return lastMaintenance?.servo_hours || 0;
    };

    const getLastMaintenanceDate = (type: string) => {
      const lastMaintenance = controllerHistory
        .filter((h) => h.maintenance_type.includes(type))
        .sort(
          (a, b) =>
            new Date(b.maintenance_date).getTime() -
            new Date(a.maintenance_date).getTime()
        )[0];
      return lastMaintenance
        ? new Date(lastMaintenance.maintenance_date)
        : null;
    };

    const calculateStatus = (
      targetHours: number,
      lastHours: number,
      checkYearLimit = false,
      type?: string
    ) => {
      const hoursSinceLastMaintenance = currentHours - lastHours;
      const remaining = Math.max(0, targetHours - hoursSinceLastMaintenance);
      const warningThreshold = targetHours * 0.9;

      let status = "OK";
      let finalRemaining = remaining;

      if (checkYearLimit && type) {
        const lastMaintenanceDate = getLastMaintenanceDate(type);
        if (lastMaintenanceDate) {
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

          if (lastMaintenanceDate < oneYearAgo) {
            status = "OVERDUE";
            finalRemaining = 0;
          }
        }
      }

      if (hoursSinceLastMaintenance >= targetHours) {
        status = "OVERDUE";
        finalRemaining = 0;
      } else if (hoursSinceLastMaintenance >= warningThreshold) {
        status = status === "OVERDUE" ? "OVERDUE" : "WARNING";
      }

      return {
        remaining: finalRemaining,
        status,
        currentHours,
        hoursSinceLastMaintenance,
      };
    };

    const generalMaintenance = calculateStatus(
      generalHours,
      getLastMaintenanceHours("General Maintenance"),
      true,
      "General Maintenance"
    );

    const timingBeltHistory = controllerHistory.filter(
      (h) => h.maintenance_type === "Timing Belt"
    );
    // Use robot-specific belt interval if available, fallback to 24000 after first maintenance
    const timingBeltHours = timingBeltHistory.length > 0 ? 24000 : generalHours;
    const timingBeltCheck = calculateStatus(
      timingBeltHours,
      getLastMaintenanceHours("Timing Belt")
    );

    const batteryHistory = controllerHistory.filter(
      (h) => h.maintenance_type === "Battery"
    );
    const batteryHours = batteryHistory.length > 0 ? 24000 : generalHours;
    const batteryCheck = calculateStatus(
      batteryHours,
      getLastMaintenanceHours("Battery"),
      true,
      "Battery"
    );

    const flexibleCableHistory = controllerHistory.filter(
      (h) => h.maintenance_type === "Flexible Cable"
    );
    // Use internal cable interval from robot data
    const flexibleCableHours =
      typeof intervals.internalCable === "number"
        ? intervals.internalCable
        : flexibleCableHistory.length > 0
        ? 24000
        : generalHours;
    const flexibleCableCheck = calculateStatus(
      flexibleCableHours,
      getLastMaintenanceHours("Flexible Cable"),
      true,
      "Flexible Cable"
    );

    const overhaulHistory = controllerHistory.filter((h) =>
      h.maintenance_type.includes("Overhaul")
    );
    const hasOverhaulHistory = overhaulHistory.length > 0;
    // Use robot-specific overhaul interval
    const overhaulInterval = intervals.overhaul;

    const getOverhaulStatus = (overhaulType: string) => {
      return calculateStatus(
        overhaulInterval,
        getLastMaintenanceHours(overhaulType),
        !hasOverhaulHistory,
        overhaulType
      );
    };

    return {
      "General Maintenance": {
        ...generalMaintenance,
        name: "General Maintenance",
        description: `Every ${generalHours.toLocaleString()} hours or 1 year`,
        targetHours: generalHours,
      },
      "Timing Belt": {
        ...timingBeltCheck,
        name: "Timing Belt",
        description: "Every 6,000 hours (check) / 24,000 hours (replace)",
        targetHours: timingBeltHours,
      },
      Battery: {
        ...batteryCheck,
        name: "Battery",
        description:
          "Every 6,000 hours (warning) / 24,000 hours (critical) / 1 year",
        targetHours: batteryHours,
      },
      "Flexible Cable": {
        ...flexibleCableCheck,
        name: "Flexible Cable",
        description:
          "Every 6,000 hours (if not replaced) / 24,000 hours (if replaced) / 1 year",
        targetHours: flexibleCableHours,
      },
      "Overhaul - Maintenance": {
        ...getOverhaulStatus("Overhaul - Maintenance"),
        name: "Overhaul - Maintenance",
        description: hasOverhaulHistory
          ? "Every 36,000 hours"
          : "Every 6,000 hours or 1 year (first time)",
        targetHours: overhaulInterval,
      },
      "Overhaul - Belt": {
        ...getOverhaulStatus("Overhaul - Belt"),
        name: "Overhaul - Belt",
        description: hasOverhaulHistory
          ? "Every 36,000 hours"
          : "Every 6,000 hours or 1 year (first time)",
        targetHours: overhaulInterval,
      },
      "Overhaul - Cable": {
        ...getOverhaulStatus("Overhaul - Cable"),
        name: "Overhaul - Cable",
        description: hasOverhaulHistory
          ? "Every 36,000 hours"
          : "Every 6,000 hours or 1 year (first time)",
        targetHours: overhaulInterval,
      },
      "Overhaul - Parts": {
        ...getOverhaulStatus("Overhaul - Parts"),
        name: "Overhaul - Parts",
        description: hasOverhaulHistory
          ? "Every 36,000 hours"
          : "Every 6,000 hours or 1 year (first time)",
        targetHours: overhaulInterval,
      },
    };
  };

  return {
    getMaintenanceStatus,
  };
};

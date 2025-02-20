// services/maintenance/index.ts
import { MaintenancePlan, MaintenanceLog } from "@/types/maintenance.types";

const getMaintenancePlans = async (
  controllerId: string
): Promise<MaintenancePlan[]> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while fetching maintenance plans");

  return apiRes.json();
};

const getMaintenancePlanById = async (
  controllerId: string,
  id: string
): Promise<MaintenancePlan> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while fetching maintenance plan by ID");

  return apiRes.json();
};

const createMaintenancePlan = async (
  controllerId: string,
  values: MaintenancePlan
): Promise<boolean> => {
  // Utilization verilerini al
  const utilizationRes = await fetch(
    `/api/controller/${controllerId}/utilization?timeRange=7d`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!utilizationRes.ok) {
    throw new Error("Failed to fetch utilization data");
  }

  const utilizationData = await utilizationRes.json();
  const currentServoPowerTime = utilizationData[0]?.servo_power_time || 0;

  // Plan oluştur
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "POST",
      body: JSON.stringify({
        ...values,
        servoPowerTime: currentServoPowerTime,
        nextMaintenanceTime: currentServoPowerTime + 12000,
        maintenanceDate: new Date().toISOString(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `Error creating maintenance plan: ${errorData.message || "Unknown error"}`
    );
  }

  return true;
};

const updateMaintenancePlan = async (
  controllerId: string,
  values: MaintenancePlan
): Promise<boolean> => {
  // Güncel utilization verilerini al
  const utilizationRes = await fetch(
    `/api/controller/${controllerId}/utilization?timeRange=7d`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!utilizationRes.ok) {
    throw new Error("Failed to fetch utilization data");
  }

  const utilizationData = await utilizationRes.json();
  const currentServoPowerTime = utilizationData[0]?.servo_power_time || 0;

  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...values,
        servoPowerTime: currentServoPowerTime,
        nextMaintenanceTime: currentServoPowerTime + 12000,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while updating maintenance plan");

  return true;
};

const deleteMaintenancePlan = async (
  controllerId: string,
  id: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while deleting maintenance plan");

  return true;
};

const getMaintenanceLogs = async (
  controllerId: string
): Promise<MaintenanceLog[]> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while fetching maintenance logs");

  return apiRes.json();
};

const getMaintenanceLogById = async (
  controllerId: string,
  id: string
): Promise<MaintenanceLog> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while fetching maintenance log by ID");

  return apiRes.json();
};

const createMaintenanceLog = async (
  controllerId: string,
  logData: Omit<MaintenanceLog, "id" | "created_at">
) => {
  try {
    console.log("Creating log with data:", logData); // Debug için

    const response = await fetch(
      `/api/controller/${controllerId}/maintenance/log`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create maintenance log");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    throw error;
  }
};

const updateMaintenanceLog = async (
  controllerId: string,
  values: MaintenanceLog
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log`,
    {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while updating maintenance log");

  return true;
};

const deleteMaintenanceLog = async (
  controllerId: string,
  id: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log`,
    {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while deleting maintenance log");

  return true;
};

export {
  getMaintenancePlans,
  getMaintenancePlanById,
  createMaintenancePlan,
  updateMaintenancePlan,
  deleteMaintenancePlan,
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};

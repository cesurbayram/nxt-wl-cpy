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

const createMaintenancePlan = async (
  controllerId: string,
  values: MaintenancePlan
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "POST",
      body: JSON.stringify(values),
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

const createMaintenanceLog = async (
  controllerId: string,
  values: MaintenanceLog
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log`,
    {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred while creating maintenance log: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const updateMaintenancePlan = async (
  controllerId: string,
  values: MaintenancePlan
): Promise<boolean> => {
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "PUT",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while updating maintenance plan");

  return true;
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

const deleteMaintenancePlan = async (
  controllerId: string,
  id: string
): Promise<boolean> => {
  const body = { id };
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/plan`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok)
    throw new Error("An error occurred while deleting maintenance plan");

  return true;
};

const deleteMaintenanceLog = async (
  controllerId: string,
  id: string
): Promise<boolean> => {
  const body = { id };
  const apiRes = await fetch(
    `/api/controller/${controllerId}/maintenance/log`,
    {
      method: "DELETE",
      body: JSON.stringify(body),
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
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenancePlan,
  createMaintenanceLog,
  updateMaintenancePlan,
  updateMaintenanceLog,
  deleteMaintenancePlan,
  deleteMaintenanceLog,
};

import {
  ShiftMaintenance,
  ShiftMaintenanceHistory,
  ControllerForMaintenance,
} from "@/types/shift-maintenance.types";

export const getControllersForMaintenance = async (): Promise<
  ControllerForMaintenance[]
> => {
  try {
    const response = await fetch("/api/shift-maintenance/controllers");
    if (!response.ok) {
      throw new Error("Failed to fetch controllers");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching controllers:", error);
    throw error;
  }
};

export const createShiftMaintenance = async (data: {
  controller_id: string;
  maintenance_type: string;
  maintenance_date: string;
  servo_hours?: number;
  technician: string;
  notes?: string;
}) => {
  try {
    const response = await fetch("/api/shift-maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create maintenance");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating maintenance:", error);
    throw error;
  }
};

export const getMaintenanceHistory = async (
  controller_id?: string
): Promise<ShiftMaintenanceHistory[]> => {
  try {
    const url = controller_id
      ? `/api/shift-maintenance/history?controller_id=${controller_id}`
      : "/api/shift-maintenance/history";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch maintenance history");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching maintenance history:", error);
    throw error;
  }
};

export const deleteMaintenanceRecord = async (id: string) => {
  try {
    const response = await fetch(`/api/shift-maintenance/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete maintenance record");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    throw error;
  }
};

export const updateMaintenanceRecord = async (
  id: string,
  data: {
    maintenance_type?: string;
    maintenance_date?: string;
    technician?: string;
    notes?: string;
  }
) => {
  try {
    const response = await fetch(`/api/shift-maintenance/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update maintenance record");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    throw error;
  }
};

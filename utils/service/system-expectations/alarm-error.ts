import { SystemAlarmHistoryItem } from "@/types/alarm-error.types";

export const getSystemAlarmsByType = async (
  controllerId: string,
  type: string
): Promise<SystemAlarmHistoryItem[]> => {
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/alarms/almhist?type=${type}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch system alarms: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching system alarms:", error);
    throw error;
  }
};

export const getSystemAlarmDetail = async (
  controllerId: string,
  alarmCode: string
): Promise<any> => {
  try {
    const response = await fetch(
      `/api/system-expectations/alarm-error-logs/alarm-detail?controllerId=${controllerId}&code=${alarmCode}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch system alarm detail: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching system alarm detail:", error);
    throw error;
  }
};

export const createSystemWorkOrder = async (
  controllerId: string,
  alarmCode: string,
  description: string
): Promise<any> => {
  try {
    const response = await fetch(`/api/system-expectations/work-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        controllerId,
        alarmCode,
        description,
        priority: "HIGH",
        type: "CORRECTIVE",
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create system work order: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating system work order:", error);
    throw error;
  }
};

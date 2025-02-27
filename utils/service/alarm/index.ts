import { Alarm } from "@/types/alarm.types";

const getAlarmsByControllerId = async (
  controllerId: string,
  alarmType: string,
  type?: string
): Promise<Alarm[]> => {
  let url = `/api/controller/${controllerId}/alarms/${alarmType}`;

  if (alarmType === "almhist" && type) {
    url += `?type=${type}`;
  }

  const apiRes = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (apiRes.status === 404) {
    return [];
  }

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch alarms for controllerId: ${alarmType}`);
  }

  const result = await apiRes.json();
  return result;
};

export { getAlarmsByControllerId };

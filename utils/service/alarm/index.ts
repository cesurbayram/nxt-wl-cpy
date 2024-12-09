import { Alarm } from "@/types/alarm.types";

const getAlarmsByControllerId = async (
  controllerId: string,
  alarmType:string
): Promise<Alarm[]> => {
  
  console.log('alarmType', alarmType);

  const apiRes = await fetch(`/api/controller/${controllerId}/alarms/${alarmType}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch alarms for controllerId: ${alarmType}`);
  }

  const result = await apiRes.json();
  return result;
};

export { getAlarmsByControllerId };

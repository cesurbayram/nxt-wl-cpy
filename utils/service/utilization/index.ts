import { UtilizationData } from "@/types/utilization.types";

const getUtilizationData = async (
  controllerId: string,
  timeRange: string,
  interval: string
): Promise<UtilizationData[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/utilization?timeRange=${timeRange}&interval=${interval}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch utilization data");
  }

  const data = await response.json();
  return data;
};

export { getUtilizationData };

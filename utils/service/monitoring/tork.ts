import { TorkData } from "@/types/tork.types";

const getTorkData = async (controllerId: string): Promise<TorkData[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/monitoring/tork`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tork data");
  }

  const data = await response.json();
  return data;
};

const sendTorkCommand = async (controllerId: string): Promise<boolean> => {
  const apiRes = await fetch("http://10.0.110.3:8082/api/tork-socket", {
    method: "POST",
    body: JSON.stringify({ controllerId }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending tork command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};
const clearTorkData = async (controllerId: string): Promise<void> => {
  console.log(`Attempting to clear tork data for controller: ${controllerId}`);
  try {
    const response = await fetch(
      `/api/controller/${controllerId}/monitoring/tork/clear`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Clear tork data failed with status: ${response.status}, error: ${errorText}`
      );
      throw new Error(`Failed to clear tork data: ${errorText}`);
    }

    const result = await response.json();
    console.log("Clear tork data response:", result);
  } catch (error) {
    console.error("Exception clearing tork data:", error);
    throw error;
  }
};

export { getTorkData, sendTorkCommand, clearTorkData };

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
  const apiRes = await fetch("http://localhost:8082/api/tork-socket", {
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

export { getTorkData, sendTorkCommand };

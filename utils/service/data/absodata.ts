import { AbsoData } from "@/types/absodata.types";

const getAbsoData = async (controllerId: string): Promise<AbsoData[]> => {
  const response = await fetch(`/api/controller/${controllerId}/data/absodat`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch abso data");
  }

  const data = await response.json();
  return data;
};

const sendAbsoDataCommand = async (controllerId: string): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/absodata-socket`,
    {
      method: "POST",
      body: JSON.stringify({ controllerId }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending abso command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export { getAbsoData, sendAbsoDataCommand };

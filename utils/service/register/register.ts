import { Register } from "@/types/register.types";

const getRegisterData = async (controllerId: string): Promise<Register[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/register`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch register data");
  }

  const data = await response.json();
  return data;
};

const sendRegisterCommand = async (controllerId: string): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register-socket`,
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
      `An error occurred when sending register command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export { getRegisterData, sendRegisterCommand };


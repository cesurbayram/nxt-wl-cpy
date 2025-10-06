import { GeneralRegister } from "@/types/general-data.types";

const getGeneralRegisterData = async (controllerId: string): Promise<GeneralRegister[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-register`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch general register data");
  }

  const data = await response.json();
  return data;
};

const sendGeneralRegisterCommand = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-register-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: "GeneralRegister",
        data: {
          controllerId,
          GeneralNo: generalNo,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending general register command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const sendGeneralRegisterExitCommand = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-register-exit-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: "GeneralRegisterExit",
        data: {
          controllerId,
          GeneralNo: generalNo,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when sending general register exit command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const createGeneralRegisterRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generalNo: generalNo,
      }),
    }
  );

  if (!response.ok && response.status !== 409) {
    throw new Error("Failed to create general register record");
  }

  return true;
};

const deleteGeneralRegisterRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-register`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generalNo: generalNo,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete general register record");
  }

  return true;
};

export {
  getGeneralRegisterData,
  createGeneralRegisterRecord,
  deleteGeneralRegisterRecord,
  sendGeneralRegisterCommand,
  sendGeneralRegisterExitCommand,
};


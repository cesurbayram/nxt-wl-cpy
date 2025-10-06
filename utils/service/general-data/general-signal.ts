import { GeneralSignal } from "@/types/general-data.types";

const getGeneralSignalData = async (controllerId: string): Promise<GeneralSignal[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-signal`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch general signal data");
  }

  const data = await response.json();
  return data;
};

const sendGeneralSignalCommand = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-signal-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: "GeneralSignal",
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
      `An error occurred when sending general signal command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const sendGeneralSignalExitCommand = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-signal-exit-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: "GeneralSignalExit",
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
      `An error occurred when sending general signal exit command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const createGeneralSignalRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-signal`,
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
    throw new Error("Failed to create general signal record");
  }

  return true;
};

const deleteGeneralSignalRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-signal`,
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
    throw new Error("Failed to delete general signal record");
  }

  return true;
};

export {
  getGeneralSignalData,
  createGeneralSignalRecord,
  deleteGeneralSignalRecord,
  sendGeneralSignalCommand,
  sendGeneralSignalExitCommand,
};


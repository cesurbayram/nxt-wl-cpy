import { GeneralVariable, GeneralVariableType } from "@/types/general-data.types";

const getGeneralVariableData = async (
  controllerId: string,
  variableType: GeneralVariableType
): Promise<GeneralVariable[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-variable?type=${variableType}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch general ${variableType} data`);
  }

  const data = await response.json();
  return data;
};

const sendGeneralVariableCommand = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const typeMap = {
    byte: "GeneralByte",
    int: "GeneralInt", 
    double: "GeneralDouble",
    real: "GeneralReal",
    string: "GeneralString"
  };

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-variable-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: typeMap[variableType],
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
      `An error occurred when sending general ${variableType} command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const sendGeneralVariableExitCommand = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const typeMap = {
    byte: "GeneralByteExit",
    int: "GeneralIntExit",
    double: "GeneralDoubleExit",
    real: "GeneralRealExit", 
    string: "GeneralStringExit"
  };

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/general-variable-exit-socket`,
    {
      method: "POST",
      body: JSON.stringify({
        type: typeMap[variableType],
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
      `An error occurred when sending general ${variableType} exit command: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

const createGeneralVariableRecord = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-variable`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generalNo: generalNo,
        variableType: variableType,
      }),
    }
  );

  if (!response.ok && response.status !== 409) {
    throw new Error("Failed to create general variable record");
  }

  return true;
};

const deleteGeneralVariableRecord = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/general-variable`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generalNo: generalNo,
        variableType: variableType,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete general variable record");
  }

  return true;
};

export {
  getGeneralVariableData,
  createGeneralVariableRecord,
  deleteGeneralVariableRecord,
  sendGeneralVariableCommand,
  sendGeneralVariableExitCommand,
};


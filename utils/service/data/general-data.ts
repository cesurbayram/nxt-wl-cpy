import { GeneralRegister, GeneralSignal, GeneralVariable, GeneralDataType, GeneralVariableType } from "@/types/general-data.types";


const getGeneralRegisterData = async (controllerId: string): Promise<GeneralRegister[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-register`,
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

const getGeneralSignalData = async (controllerId: string): Promise<GeneralSignal[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-signal`,
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

const getGeneralVariableData = async (
  controllerId: string,
  variableType: GeneralVariableType
): Promise<GeneralVariable[]> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-variable?type=${variableType}`,
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


const createGeneralRegisterRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-register`,
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

const createGeneralSignalRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-signal`,
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

const createGeneralVariableRecord = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-variable`,
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


const deleteGeneralRegisterRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-register`,
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

const deleteGeneralSignalRecord = async (
  controllerId: string,
  generalNo: string
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-signal`,
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

const deleteGeneralVariableRecord = async (
  controllerId: string,
  generalNo: string,
  variableType: GeneralVariableType
): Promise<boolean> => {
  const response = await fetch(
    `/api/controller/${controllerId}/data/general-variable`,
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
  getGeneralRegisterData,
  getGeneralSignalData,
  getGeneralVariableData,
  createGeneralRegisterRecord,
  createGeneralSignalRecord,
  createGeneralVariableRecord,
  deleteGeneralRegisterRecord,
  deleteGeneralSignalRecord,
  deleteGeneralVariableRecord,
  sendGeneralRegisterCommand,
  sendGeneralSignalCommand,
  sendGeneralVariableCommand,
  sendGeneralRegisterExitCommand,
  sendGeneralSignalExitCommand,
  sendGeneralVariableExitCommand,
};

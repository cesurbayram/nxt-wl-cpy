import { InputOutput } from "@/types/inputOutput.types";

const getInputOutputType = async (
  controllerId: string,
  inputOutputType: string
): Promise<InputOutput[]> => {
  console.log("inputOutputType", inputOutputType);
  const apiRes = await fetch(
    `/api/controller/${controllerId}/input-output/${inputOutputType}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch I/O data for type: ${inputOutputType}`);
  }

  const result = await apiRes.json();
  return result;
};

const sendInputOutputCommand = async ({
  activeTab,
  controllerId,
}: {
  activeTab: string;
  controllerId: string;
}): Promise<boolean> => {
  const apiRes = await fetch(
    "http://10.0.110.13:8082/api/input-output-socket",
    {
      method: "POST",
      body: JSON.stringify({ activeInputOutput: activeTab, controllerId }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    const errorData = await apiRes.json();
    throw new Error(
      `An error occurred when creating controller: ${
        errorData.message || "Unknown error"
      }`
    );
  }

  return true;
};

export { getInputOutputType, sendInputOutputCommand };

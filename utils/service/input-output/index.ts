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

export { getInputOutputType };

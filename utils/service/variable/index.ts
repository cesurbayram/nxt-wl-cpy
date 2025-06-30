import { Variable } from "@/types/variable.types";

const getVariablesByType = async (
  controllerId: string,
  variableType: string
): Promise<Variable[]> => {
  console.log("variableType", variableType);

  const apiRes = await fetch(
    `/api/controller/${controllerId}/variables/${variableType}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!apiRes.ok) {
    throw new Error(`Failed to fetch variables for type: ${variableType}`);
  }

  const result = await apiRes.json();
  return result;
};

const sendVariableCommand = async ({
  activeTab,
  controllerId,
}: {
  activeTab: string;
  controllerId: string;
}): Promise<boolean> => {
  const apiRes = await fetch(
    "https://savola.fabricademo.com/api/variable-socket",
    {
      method: "POST",
      body: JSON.stringify({ activeVariable: activeTab, controllerId }),
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

export { getVariablesByType, sendVariableCommand };
